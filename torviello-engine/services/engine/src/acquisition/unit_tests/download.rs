// Copyright (c) 2026 Torviello.
//! Async acquisition, progress-stream, and streamed-download tests.

use super::*;

#[tokio::test]
async fn local_acquisition_reaches_ready_and_status_reports_it() {
    let fixture = Fixture::new(b"model bytes", 1024, 4);
    assert_eq!(fixture.acquisition.state("demo").await, None);
    let started = fixture
        .acquisition
        .start(
            "demo",
            crate::acquisition::DownloadRequest {
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
            crate::acquisition::DownloadRequest {
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
                crate::acquisition::DownloadRequest {
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
                crate::acquisition::DownloadRequest {
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
                crate::acquisition::DownloadRequest {
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
                crate::acquisition::DownloadRequest {
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
                crate::acquisition::DownloadRequest {
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
                crate::acquisition::DownloadRequest {
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
            crate::acquisition::DownloadRequest {
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
    Arc::new(RwLock::new(crate::acquisition::installed_job("demo", 0)))
}

/// Serve a body with no content-length header (close-delimited), so the
/// client cannot pre-check the declared size and must rely on the
/// accumulated-bytes bound.
fn serve_untagged(body: &'static [u8]) -> String {
    let listener = TcpListener::bind("127.0.0.1:0").expect("listener");
    let address = listener.local_addr().expect("address");
    std::thread::spawn(move || {
        let (mut stream, _) = listener.accept().expect("accept");
        let mut buffer = [0_u8; 4096];
        let _ = stream.read(&mut buffer);
        let _ = write!(
            stream,
            "HTTP/1.1 200 OK\r\ncontent-type: application/octet-stream\r\nconnection: close\r\n\r\n"
        );
        let _ = stream.write_all(body);
    });
    format!("http://{address}/model.bin")
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

#[tokio::test]
async fn start_reports_download_in_progress_while_a_job_is_running() {
    // download_concurrency 0 parks the spawned job on a permit that never
    // opens, so the second start takes the in-progress branch
    // deterministically instead of racing a fast local copy.
    let fixture = Fixture::new_with(b"model bytes", 1024, 4, 0);
    let request = || crate::acquisition::DownloadRequest {
        source: Fixture::local(),
        expected_digest: None,
    };
    let first = fixture
        .acquisition
        .start("demo", request())
        .await
        .expect("first start");
    assert_eq!(first.state, DownloadState::Queued);
    assert_eq!(
        fixture.acquisition.state("demo").await,
        Some(DownloadState::Queued)
    );
    assert!(matches!(
        fixture.acquisition.start("demo", request()).await,
        Err(AppError::DownloadInProgress)
    ));
}

#[tokio::test]
async fn start_reports_installed_assets_without_redownloading() {
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
    let job = fixture
        .acquisition
        .start(
            "demo",
            crate::acquisition::DownloadRequest {
                source: Fixture::local(),
                expected_digest: None,
            },
        )
        .await
        .expect("start on an installed asset");
    assert_eq!(job.task_id, "installed");
    assert_eq!(job.state, DownloadState::Ready);
}

#[tokio::test]
async fn chunked_oversized_downloads_are_rejected_and_staging_removed() {
    // No content-length header means the declared-size precheck cannot fire;
    // the accumulated-bytes bound must still reject the transfer and remove
    // the staging file (defense in depth against a lying server).
    let root = std::env::temp_dir().join(format!("torviello-dl-{}", uuid::Uuid::new_v4()));
    let store = AssetStore::new(&root, 16).expect("store");
    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .expect("client");
    let url = serve_untagged(&[b'x'; 17]);
    let task_id = "task-chunked";
    assert!(matches!(
        download_to_staging(
            &client,
            &store,
            &url,
            task_id,
            &job(),
            std::time::Duration::from_secs(2)
        )
        .await,
        Err(AppError::ModelTooLarge)
    ));
    assert!(!store.staging_path(task_id).expect("staging path").exists());
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[tokio::test]
async fn commit_detects_a_tampered_source_and_capacity_prunes_it() {
    // The registry declares the digest of "model bytes"; a source with
    // different bytes must fail the job at commit time even when the client
    // sends no expected digest, and the failed terminal job must be pruned
    // at capacity so the retried start proceeds instead of bouncing.
    let fixture = Fixture::new_with(b"model bytes", 1024, 1, 2);
    std::fs::write(fixture.root.join("tampered.bin"), b"tampered bytes").expect("write");
    fixture
        .acquisition
        .start(
            "demo",
            crate::acquisition::DownloadRequest {
                source: SourceRequest::Local {
                    path: "tampered.bin".to_owned(),
                },
                expected_digest: None,
            },
        )
        .await
        .expect("start");
    let failed = fixture.wait("demo").await;
    assert_eq!(failed.state, DownloadState::Failed);
    assert_eq!(failed.error_code, Some("model.digest_mismatch"));

    let retried = fixture
        .acquisition
        .start(
            "demo",
            crate::acquisition::DownloadRequest {
                source: Fixture::local(),
                expected_digest: None,
            },
        )
        .await
        .expect("retried start prunes the failed job");
    assert!(matches!(
        retried.state,
        DownloadState::Queued | DownloadState::Downloading | DownloadState::Ready
    ));
}

#[test]
fn terminal_jobs_are_pruned_at_capacity() {
    let mut jobs = HashMap::new();
    jobs.insert(
        "done".to_owned(),
        Arc::new(RwLock::new(crate::acquisition::installed_job("done", 1))),
    );
    prune_terminal(&mut jobs);
    assert!(jobs.is_empty());
}

#[test]
fn prune_terminal_leaves_live_jobs() {
    let mut jobs = HashMap::new();
    let mut queued = crate::acquisition::installed_job("demo", 0);
    queued.state = DownloadState::Queued;
    jobs.insert("demo".to_owned(), Arc::new(RwLock::new(queued)));
    prune_terminal(&mut jobs);
    assert!(jobs.contains_key("demo"));
}
