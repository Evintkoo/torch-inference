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

// Not named `tests/`: cargo-llvm-cov ignores any `tests/` directory, which
// would count this module differently from auth/tests.rs and config/tests.rs.
#[cfg(test)]
#[path = "acquisition/unit_tests/mod.rs"]
mod tests;
