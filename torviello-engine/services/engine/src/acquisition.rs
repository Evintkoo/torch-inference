// Copyright (c) 2026 Torviello.
//! Bounded model acquisition jobs for ENG-005.
use std::collections::HashMap;
use std::convert::Infallible;
use std::fs::File;
use std::io::Write;
use std::sync::Arc;
use std::time::Duration;

use axum::response::sse::Event;
use tokio::sync::{Mutex, RwLock, Semaphore, mpsc};
use tokio_stream::Stream;
use tokio_stream::wrappers::ReceiverStream;

use crate::asset::AssetStore;
use crate::config::Config;
use crate::error::{AppError, AppResult};
use crate::model::ModelRegistry;

const PROGRESS_INTERVAL_MS: u64 = 200;
const PROGRESS_CHANNEL_DEPTH: usize = 16;

mod types;
pub use types::{
    DownloadJob, DownloadProgressEvent, DownloadRequest, DownloadState, SourceRequest,
};
use types::{ExpectedDigest, Source};

type JobRef = Arc<RwLock<DownloadJob>>;

pub struct Acquisition {
    store: Arc<AssetStore>,
    registry: Arc<ModelRegistry>,
    jobs: Mutex<HashMap<String, JobRef>>,
    permits: Arc<Semaphore>,
    max_jobs: usize,
    timeout: Duration,
    allowlist: Vec<String>,
    client: reqwest::Client,
}

impl Acquisition {
    pub fn new(
        config: &Config,
        store: Arc<AssetStore>,
        registry: Arc<ModelRegistry>,
    ) -> AppResult<Self> {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_millis(config.download_timeout_ms))
            .redirect(reqwest::redirect::Policy::none())
            .build()
            .map_err(|_| AppError::Internal)?;
        Ok(Self {
            store,
            registry,
            jobs: Mutex::new(HashMap::new()),
            permits: Arc::new(Semaphore::new(config.download_concurrency)),
            max_jobs: config.max_queue_depth,
            timeout: Duration::from_millis(config.download_timeout_ms),
            allowlist: config.model_source_allowlist.clone(),
            client,
        })
    }

    pub async fn start(&self, model_id: &str, request: DownloadRequest) -> AppResult<DownloadJob> {
        let record = self
            .registry
            .find(model_id)
            .ok_or(AppError::ModelNotFound)?
            .clone();
        let expected = expected_digest(&record.content_hash, request.expected_digest.as_ref())?;
        let source = self.validate_source(&request.source)?;

        let mut jobs = self.jobs.lock().await;
        if let Some(existing) = jobs.get(model_id) {
            let current = existing.read().await.clone();
            if !current.state.is_terminal() {
                return Err(AppError::DownloadInProgress);
            }
            if current.state == DownloadState::Ready {
                return Ok(current);
            }
        }
        if self.store.is_ready(model_id) {
            return Ok(installed_job(model_id, self.store.size_bytes(model_id)));
        }
        if jobs.len() >= self.max_jobs {
            prune_terminal(&mut jobs);
            if jobs.len() >= self.max_jobs {
                return Err(AppError::TooManyRequests {
                    retry_after_seconds: 60,
                });
            }
        }
        let job = Arc::new(RwLock::new(DownloadJob {
            task_id: uuid::Uuid::new_v4().to_string(),
            model_id: model_id.to_owned(),
            state: DownloadState::Queued,
            bytes_transferred: 0,
            bytes_total: 0,
            percent: 0.0,
            error_code: None,
            safe_message: None,
            started_at: now_rfc3339(),
            finished_at: None,
        }));
        jobs.insert(model_id.to_owned(), Arc::clone(&job));
        drop(jobs);

        let runtime = JobRuntime {
            store: Arc::clone(&self.store),
            permits: Arc::clone(&self.permits),
            client: self.client.clone(),
            timeout: self.timeout,
        };
        let request = JobRequest {
            model_id: model_id.to_owned(),
            source,
            expected,
        };
        tokio::spawn(async move {
            run_job(runtime, request, job).await;
        });
        let snapshot = self.jobs.lock().await.get(model_id).cloned();
        match snapshot {
            Some(job) => Ok(job.read().await.clone()),
            None => Err(AppError::Internal),
        }
    }

    pub async fn state(&self, model_id: &str) -> Option<DownloadState> {
        let jobs = self.jobs.lock().await;
        match jobs.get(model_id) {
            Some(job) => Some(job.read().await.state),
            None => None,
        }
    }

    pub async fn status(&self, model_id: &str) -> AppResult<DownloadJob> {
        let jobs = self.jobs.lock().await;
        if let Some(job) = jobs.get(model_id) {
            return Ok(job.read().await.clone());
        }
        drop(jobs);
        if self.store.is_ready(model_id) {
            return Ok(installed_job(model_id, self.store.size_bytes(model_id)));
        }
        Err(AppError::ModelNotReady)
    }

    pub async fn progress(
        self: &Arc<Self>,
        model_id: &str,
    ) -> AppResult<impl Stream<Item = Result<Event, Infallible>> + use<>> {
        let job = {
            let jobs = self.jobs.lock().await;
            jobs.get(model_id).cloned()
        };
        let job = job.ok_or(AppError::ModelNotReady)?;
        let (tx, rx) = mpsc::channel(PROGRESS_CHANNEL_DEPTH);
        tokio::spawn(async move {
            let mut last: Option<(DownloadState, u64)> = None;
            loop {
                let snapshot = job.read().await.clone();
                let key = (snapshot.state, snapshot.bytes_transferred);
                if last != Some(key) {
                    let event = progress_event(&snapshot);
                    if tx.send(Ok(event)).await.is_err() {
                        break;
                    }
                    last = Some(key);
                }
                if snapshot.state.is_terminal() {
                    break;
                }
                tokio::time::sleep(Duration::from_millis(PROGRESS_INTERVAL_MS)).await;
            }
        });
        Ok(ReceiverStream::new(rx))
    }

    fn validate_source(&self, source: &SourceRequest) -> AppResult<Source> {
        match source {
            SourceRequest::Local { path } => {
                self.store.validate_local_source(path)?;
                Ok(Source::Local(path.clone()))
            }
            SourceRequest::Https { url } => {
                validate_https(url, &self.allowlist)?;
                Ok(Source::Https(url.clone()))
            }
            SourceRequest::Huggingface { .. } => Err(AppError::InvalidSource),
        }
    }
}

struct JobRuntime {
    store: Arc<AssetStore>,
    permits: Arc<Semaphore>,
    client: reqwest::Client,
    timeout: Duration,
}

struct JobRequest {
    model_id: String,
    source: Source,
    expected: String,
}

async fn run_job(runtime: JobRuntime, request: JobRequest, job: JobRef) {
    let Ok(_permit) = runtime.permits.acquire_owned().await else {
        fail(&job, "model.source_unavailable").await;
        return;
    };
    set_state(&job, DownloadState::Downloading).await;
    let task_id = job.read().await.task_id.clone();
    let staged = match request.source {
        Source::Local(path) => runtime.store.copy_local_to_staging(&path, &task_id),
        Source::Https(url) => {
            download_to_staging(
                &runtime.client,
                &runtime.store,
                &url,
                &task_id,
                &job,
                runtime.timeout,
            )
            .await
        }
    };
    let staged = match staged {
        Ok(path) => path,
        Err(error) => {
            fail(&job, error.code()).await;
            return;
        }
    };
    let size = std::fs::metadata(&staged).map_or(0, |metadata| metadata.len());
    {
        let mut current = job.write().await;
        current.state = DownloadState::Verifying;
        current.bytes_total = size;
    }
    match runtime
        .store
        .commit(&staged, &request.model_id, &request.expected)
    {
        Ok(manifest) => {
            let mut current = job.write().await;
            current.state = DownloadState::Ready;
            current.bytes_transferred = manifest.size_bytes;
            current.bytes_total = manifest.size_bytes;
            current.percent = 100.0;
            current.finished_at = Some(now_rfc3339());
        }
        Err(error) => fail(&job, error.code()).await,
    }
}

async fn download_to_staging(
    client: &reqwest::Client,
    store: &AssetStore,
    url: &str,
    task_id: &str,
    job: &JobRef,
    timeout: Duration,
) -> AppResult<std::path::PathBuf> {
    let staging = store.staging_path(task_id)?;
    let response = client
        .get(url)
        .timeout(timeout)
        .send()
        .await
        .map_err(|_| AppError::SourceUnavailable)?;
    if !response.status().is_success() {
        return Err(AppError::SourceUnavailable);
    }
    if response
        .content_length()
        .is_some_and(|length| length > store.max_bytes())
    {
        return Err(AppError::ModelTooLarge);
    }
    let mut file = File::create(&staging).map_err(|_| AppError::Internal)?;
    let mut response = response;
    let mut written: u64 = 0;
    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|_| AppError::SourceUnavailable)?
    {
        written = written.saturating_add(u64::try_from(chunk.len()).unwrap_or(u64::MAX));
        if written > store.max_bytes() {
            let _ = std::fs::remove_file(&staging);
            return Err(AppError::ModelTooLarge);
        }
        file.write_all(&chunk).map_err(|_| AppError::Internal)?;
        let mut current = job.write().await;
        current.bytes_transferred = written;
    }
    file.flush().map_err(|_| AppError::Internal)?;
    Ok(staging)
}

fn installed_job(model_id: &str, size: u64) -> DownloadJob {
    let now = now_rfc3339();
    DownloadJob {
        task_id: "installed".to_owned(),
        model_id: model_id.to_owned(),
        state: DownloadState::Ready,
        bytes_transferred: size,
        bytes_total: size,
        percent: 100.0,
        error_code: None,
        safe_message: None,
        started_at: now.clone(),
        finished_at: Some(now),
    }
}

async fn fail(job: &JobRef, code: &'static str) {
    let mut current = job.write().await;
    current.state = DownloadState::Failed;
    current.error_code = Some(code);
    current.safe_message = Some("model acquisition failed");
    current.finished_at = Some(now_rfc3339());
}

async fn set_state(job: &JobRef, state: DownloadState) {
    job.write().await.state = state;
}

fn expected_digest(declared: &str, requested: Option<&ExpectedDigest>) -> AppResult<String> {
    let Some(requested) = requested else {
        return Ok(declared.to_owned());
    };
    if requested.algorithm != "sha256" || requested.value.len() != 64 {
        return Err(AppError::InvalidSource);
    }
    let candidate = format!("sha256:{}", requested.value.to_ascii_lowercase());
    if candidate == declared {
        return Ok(candidate);
    }
    Err(AppError::DigestMismatch)
}

fn validate_https(url: &str, allowlist: &[String]) -> AppResult<()> {
    let parsed = reqwest::Url::parse(url).map_err(|_| AppError::InvalidSource)?;
    if parsed.scheme() != "https"
        || !parsed.username().is_empty()
        || parsed.password().is_some()
        || parsed.port_or_known_default() != Some(443)
    {
        return Err(AppError::InvalidSource);
    }
    let host = parsed.host_str().ok_or(AppError::InvalidSource)?;
    if !allowlist
        .iter()
        .any(|allowed| allowed.eq_ignore_ascii_case(host))
    {
        return Err(AppError::InvalidSource);
    }
    Ok(())
}

fn prune_terminal(jobs: &mut HashMap<String, JobRef>) {
    let terminal: Vec<String> = jobs
        .iter()
        .filter(|(_, job)| {
            job.try_read()
                .is_ok_and(|current| current.state.is_terminal())
        })
        .map(|(id, _)| id.clone())
        .collect();
    if let Some(id) = terminal.first() {
        jobs.remove(id);
    }
}

fn progress_event(job: &DownloadJob) -> Event {
    let event_type = match job.state {
        DownloadState::Verifying | DownloadState::Extracting => "model.download_verified",
        DownloadState::Ready => "model.activated",
        DownloadState::Failed | DownloadState::Cancelled => "model.download_failed",
        DownloadState::Queued | DownloadState::Downloading => "model.download_progress",
    };
    let payload = DownloadProgressEvent {
        event_type,
        event_id: uuid::Uuid::new_v4().to_string(),
        occurred_at: now_rfc3339(),
        task_id: job.task_id.clone(),
        model_id: job.model_id.clone(),
        state: job.state,
        bytes_transferred: job.bytes_transferred,
        bytes_total: job.bytes_total,
        error_code: job.error_code,
    };
    match serde_json::to_string(&payload) {
        Ok(data) => Event::default().event(event_type).data(data),
        Err(_) => Event::default().event("model.download_failed"),
    }
}

fn now_rfc3339() -> String {
    time::OffsetDateTime::now_utc()
        .format(&time::format_description::well_known::Rfc3339)
        .unwrap_or_else(|_| "1970-01-01T00:00:00Z".to_owned())
}

#[cfg(test)]
mod tests {
    use super::{
        Acquisition, DownloadState, ExpectedDigest, JobRef, SourceRequest, download_to_staging,
        expected_digest, progress_event, prune_terminal, validate_https,
    };
    use crate::asset::AssetStore;
    use crate::config::{Accelerators, AccessControl, AuthMode, Config};
    use crate::error::AppError;
    use crate::model::{ModelRecord, ModelRegistry, sha256_hex};
    use std::collections::HashMap;
    use std::io::{Read, Write};
    use std::net::TcpListener;
    use std::sync::Arc;
    use tokio::sync::RwLock;

    fn config(root: &str, max_bytes: u64) -> Config {
        Config {
            host: "127.0.0.1".to_owned(),
            port: 8000,
            auth_enabled: true,
            auth_mode: AuthMode::Local,
            oidc_issuer: String::new(),
            oidc_audience: String::new(),
            oidc_jwks_url: String::new(),
            oidc_clock_skew_seconds: 60,
            max_body_bytes: 1024,
            max_batch_size: 8,
            timeout_ms: 1000,
            retention_max_age_days: 7,
            max_queue_depth: 4,
            model_registry: "registry.toml".to_owned(),
            database_url: "sqlite://data/engine.db".to_owned(),
            model_root: root.to_owned(),
            max_model_bytes: max_bytes,
            max_loaded_models: 2,
            download_concurrency: 2,
            download_timeout_ms: 2_000,
            model_source_allowlist: vec!["127.0.0.1".to_owned()],
            max_frame_bytes: 1024,
            shutdown_timeout_ms: 1000,
            max_size_bytes: 1024,
            rate_limit_per_minute: 60,
            decompression_max_expansion_bytes: 1024,
            tls_min_version: "1.3".to_owned(),
            cors_allowed_origin: "https://console.example".to_owned(),
            accelerator_fallback: "cpu".to_owned(),
            accelerators: Accelerators::default(),
            access_control: AccessControl::default(),
        }
    }

    fn record(id: &str, digest: &str) -> ModelRecord {
        ModelRecord {
            id: id.to_owned(),
            version: "1.0.0".to_owned(),
            content_hash: digest.to_owned(),
            source_url: "https://models.example/model.pt".to_owned(),
            display_name: None,
            task: "classification".to_owned(),
            format: "torchscript".to_owned(),
            size_bytes: 0,
            description: None,
            license: None,
            backend_requirements: Vec::new(),
            labels: Vec::new(),
            input_channels: 3,
            input_height: 32,
            input_width: 32,
        }
    }

    struct Fixture {
        root: std::path::PathBuf,
        acquisition: Arc<Acquisition>,
    }

    impl Fixture {
        fn new(contents: &[u8], max_bytes: u64, queue_depth: usize) -> Self {
            let root = std::env::temp_dir().join(format!("torviello-acq-{}", uuid::Uuid::new_v4()));
            std::fs::create_dir_all(&root).expect("temp");
            std::fs::write(root.join("model.bin"), contents).expect("source");
            let digest = sha256_hex(contents);
            let mut registry = ModelRegistry::default();
            let principal = crate::auth::Principal {
                subject: "subject".to_owned(),
                roles: vec!["admin".to_owned()],
                scopes: Vec::new(),
                actor: "operator".to_owned(),
                org_id: None,
                jti: None,
            };
            registry
                .register(&principal, record("demo", &digest))
                .expect("register");
            let mut config = config(root.to_str().expect("utf8"), max_bytes);
            config.max_queue_depth = queue_depth;
            let store = Arc::new(AssetStore::new(&root, max_bytes).expect("store"));
            Self {
                root,
                acquisition: Arc::new(
                    Acquisition::new(&config, store, Arc::new(registry)).expect("acq"),
                ),
            }
        }

        fn local() -> SourceRequest {
            SourceRequest::Local {
                path: "model.bin".to_owned(),
            }
        }

        async fn wait(&self, model_id: &str) -> super::DownloadJob {
            for _ in 0..200 {
                let job = self.acquisition.status(model_id).await.expect("status");
                if job.state.is_terminal() {
                    return job;
                }
                tokio::time::sleep(std::time::Duration::from_millis(10)).await;
            }
            panic!("download did not finish");
        }
    }

    impl Drop for Fixture {
        fn drop(&mut self) {
            let _ = std::fs::remove_dir_all(&self.root);
        }
    }

    #[test]
    fn terminal_states_close_progress() {
        assert!(DownloadState::Ready.is_terminal());
        assert!(DownloadState::Failed.is_terminal());
        assert!(!DownloadState::Downloading.is_terminal());
    }

    #[test]
    fn non_https_or_unlisted_hosts_are_rejected() {
        let allowlist = vec!["models.torviello.local".to_owned()];
        assert!(validate_https("file:///etc/passwd", &allowlist).is_err());
        assert!(validate_https("http://models.torviello.local/a", &allowlist).is_err());
        assert!(validate_https("https://evil.example/a", &allowlist).is_err());
        assert!(validate_https("https://models.torviello.local/a", &allowlist).is_ok());
    }

    #[test]
    fn conflicting_client_digest_is_rejected() {
        let digest = format!("sha256:{}", "a".repeat(64));
        let request = ExpectedDigest {
            algorithm: "sha256".to_owned(),
            value: "b".repeat(64),
        };
        assert!(expected_digest(&digest, Some(&request)).is_err());
        let matching = ExpectedDigest {
            algorithm: "sha256".to_owned(),
            value: "a".repeat(64),
        };
        assert!(expected_digest(&digest, Some(&matching)).is_ok());
        assert!(expected_digest(&digest, None).is_ok());
        assert!(matches!(
            expected_digest(
                &digest,
                Some(&ExpectedDigest {
                    algorithm: "sha512".to_owned(),
                    value: "a".repeat(64),
                })
            ),
            Err(AppError::InvalidSource)
        ));
        assert!(matches!(
            expected_digest(
                &digest,
                Some(&ExpectedDigest {
                    algorithm: "sha256".to_owned(),
                    value: "short".to_owned(),
                })
            ),
            Err(AppError::InvalidSource)
        ));
        let uppercase = ExpectedDigest {
            algorithm: "sha256".to_owned(),
            value: "A".repeat(64),
        };
        assert!(expected_digest(&digest, Some(&uppercase)).is_ok());
    }

    #[test]
    fn https_sources_require_no_credentials_and_port_443() {
        let allowlist = vec!["models.example".to_owned()];
        for bad in [
            "https://user@models.example/model",
            "https://user:pass@models.example/model",
            "https://models.example:8443/model",
            "ftp://models.example/model",
            "https://other.example/model",
            "not a url",
        ] {
            assert!(validate_https(bad, &allowlist).is_err(), "{bad}");
        }
        assert!(validate_https("https://MODELS.EXAMPLE/model", &allowlist).is_ok());
    }

    #[test]
    fn states_have_wire_names_and_progress_events() {
        let states = [
            (DownloadState::Queued, "queued", "model.download_progress"),
            (
                DownloadState::Downloading,
                "downloading",
                "model.download_progress",
            ),
            (
                DownloadState::Verifying,
                "verifying",
                "model.download_verified",
            ),
            (
                DownloadState::Extracting,
                "extracting",
                "model.download_verified",
            ),
            (DownloadState::Ready, "ready", "model.activated"),
            (DownloadState::Failed, "failed", "model.download_failed"),
            (
                DownloadState::Cancelled,
                "cancelled",
                "model.download_failed",
            ),
        ];
        for (state, name, event_type) in states {
            assert_eq!(state.as_str(), name);
            let job = super::installed_job("demo", 3);
            let mut job = job;
            job.state = state;
            job.error_code = (state == DownloadState::Failed).then_some("code");
            let event = progress_event(&job);
            assert!(format!("{event:?}").contains(event_type));
        }
    }

    #[tokio::test]
    async fn local_acquisition_reaches_ready_and_status_reports_it() {
        let fixture = Fixture::new(b"model bytes", 1024, 4);
        assert_eq!(fixture.acquisition.state("demo").await, None);
        let started = fixture
            .acquisition
            .start(
                "demo",
                super::DownloadRequest {
                    source: Fixture::local(),
                    expected_digest: None,
                },
            )
            .await
            .expect("start");
        assert!(!started.state.is_terminal() || started.state == DownloadState::Ready);
        let done = fixture.wait("demo").await;
        assert_eq!(done.state, DownloadState::Ready);
        assert!((done.percent - 100.0).abs() < f64::EPSILON);
        assert_eq!(done.bytes_total, 11);

        assert!(fixture.acquisition.status("missing").await.is_err());

        let again = fixture
            .acquisition
            .start(
                "demo",
                super::DownloadRequest {
                    source: Fixture::local(),
                    expected_digest: None,
                },
            )
            .await
            .expect("idempotent");
        assert_eq!(again.state, DownloadState::Ready);
    }

    #[tokio::test]
    async fn local_acquisition_rejects_bad_sources_and_digests() {
        let fixture = Fixture::new(b"model bytes", 1024, 4);
        assert!(matches!(
            fixture
                .acquisition
                .start(
                    "missing",
                    super::DownloadRequest {
                        source: Fixture::local(),
                        expected_digest: None
                    }
                )
                .await,
            Err(AppError::ModelNotFound)
        ));
        assert!(matches!(
            fixture
                .acquisition
                .start(
                    "demo",
                    super::DownloadRequest {
                        source: SourceRequest::Huggingface {
                            repository: "org/model".to_owned(),
                            revision: "main".to_owned(),
                        },
                        expected_digest: None,
                    },
                )
                .await,
            Err(AppError::InvalidSource)
        ));
        assert!(matches!(
            fixture
                .acquisition
                .start(
                    "demo",
                    super::DownloadRequest {
                        source: SourceRequest::Local {
                            path: "../escape".to_owned(),
                        },
                        expected_digest: None,
                    },
                )
                .await,
            Err(AppError::PathOutsideRoot)
        ));
        assert!(matches!(
            fixture
                .acquisition
                .start(
                    "demo",
                    super::DownloadRequest {
                        source: Fixture::local(),
                        expected_digest: Some(ExpectedDigest {
                            algorithm: "sha256".to_owned(),
                            value: "b".repeat(64),
                        }),
                    },
                )
                .await,
            Err(AppError::DigestMismatch)
        ));
    }

    #[tokio::test]
    async fn queue_limits_and_oversized_sources_fail() {
        let fixture = Fixture::new(b"model bytes", 1024, 0);
        assert!(matches!(
            fixture
                .acquisition
                .start(
                    "demo",
                    super::DownloadRequest {
                        source: Fixture::local(),
                        expected_digest: None
                    }
                )
                .await,
            Err(AppError::TooManyRequests { .. })
        ));

        let fixture = Fixture::new(b"model bytes", 4, 4);
        assert!(matches!(
            fixture
                .acquisition
                .start(
                    "demo",
                    super::DownloadRequest {
                        source: Fixture::local(),
                        expected_digest: None
                    }
                )
                .await,
            Err(AppError::ModelTooLarge)
        ));
    }

    #[tokio::test]
    async fn progress_stream_emits_and_closes_after_terminal_state() {
        use tokio_stream::StreamExt;

        let fixture = Fixture::new(b"model bytes", 1024, 4);
        let stream = fixture.acquisition.progress("demo").await;
        assert!(stream.is_err());
        fixture
            .acquisition
            .start(
                "demo",
                super::DownloadRequest {
                    source: Fixture::local(),
                    expected_digest: None,
                },
            )
            .await
            .expect("start");
        let mut stream = fixture.acquisition.progress("demo").await.expect("stream");
        let mut count = 0;
        while let Some(event) = stream.next().await {
            assert!(event.is_ok());
            count += 1;
        }
        assert!(count >= 1);
    }

    fn serve(body: &'static [u8], status: &'static str) -> String {
        let listener = TcpListener::bind("127.0.0.1:0").expect("listener");
        let address = listener.local_addr().expect("address");
        std::thread::spawn(move || {
            let (mut stream, _) = listener.accept().expect("accept");
            let mut buffer = [0_u8; 4096];
            let _ = stream.read(&mut buffer);
            let _ = write!(
                stream,
                "HTTP/1.1 {status}\r\ncontent-type: application/octet-stream\r\ncontent-length: {}\r\nconnection: close\r\n\r\n",
                body.len()
            );
            let _ = stream.write_all(body);
        });
        format!("http://{address}/model.bin")
    }

    fn job() -> JobRef {
        Arc::new(RwLock::new(super::installed_job("demo", 0)))
    }

    #[tokio::test]
    async fn streamed_download_writes_progress_and_rejects_failures() {
        let root = std::env::temp_dir().join(format!("torviello-dl-{}", uuid::Uuid::new_v4()));
        let store = AssetStore::new(&root, 16).expect("store");
        let client = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .build()
            .expect("client");

        let url = serve(b"hello", "200 OK");
        let staged = download_to_staging(
            &client,
            &store,
            &url,
            "task-1",
            &job(),
            std::time::Duration::from_secs(2),
        )
        .await
        .expect("download");
        assert_eq!(std::fs::read(&staged).expect("bytes"), b"hello");

        let url = serve(b"failed", "500 Internal Server Error");
        assert!(matches!(
            download_to_staging(
                &client,
                &store,
                &url,
                "task-2",
                &job(),
                std::time::Duration::from_secs(2)
            )
            .await,
            Err(AppError::SourceUnavailable)
        ));

        let url = serve(&[b'x'; 17], "200 OK");
        assert!(matches!(
            download_to_staging(
                &client,
                &store,
                &url,
                "task-3",
                &job(),
                std::time::Duration::from_secs(2)
            )
            .await,
            Err(AppError::ModelTooLarge)
        ));

        assert!(matches!(
            download_to_staging(
                &client,
                &store,
                "http://127.0.0.1:1/model",
                "task-4",
                &job(),
                std::time::Duration::from_millis(20)
            )
            .await,
            Err(AppError::SourceUnavailable)
        ));
        assert!(
            download_to_staging(
                &client,
                &store,
                &url,
                "../bad",
                &job(),
                std::time::Duration::from_secs(2)
            )
            .await
            .is_err()
        );
        std::fs::remove_dir_all(root).expect("cleanup");
    }

    #[tokio::test]
    async fn installed_assets_are_reported_without_a_job() {
        let fixture = Fixture::new(b"model bytes", 1024, 4);
        let digest = sha256_hex(b"model bytes");
        let staging = fixture
            .acquisition
            .store
            .copy_local_to_staging("model.bin", "installed-task")
            .expect("staging");
        fixture
            .acquisition
            .store
            .commit(&staging, "demo", &digest)
            .expect("commit");
        let job = fixture.acquisition.status("demo").await.expect("installed");
        assert_eq!(job.task_id, "installed");
        assert_eq!(job.state, DownloadState::Ready);
    }

    #[test]
    fn terminal_jobs_are_pruned_at_capacity() {
        let mut jobs = HashMap::new();
        jobs.insert(
            "done".to_owned(),
            Arc::new(RwLock::new(super::installed_job("done", 1))),
        );
        prune_terminal(&mut jobs);
        assert!(jobs.is_empty());
    }
}
