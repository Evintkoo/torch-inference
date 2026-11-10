// Copyright (c) 2026 Torviello.
//! Unit tests for `acquisition` (moved out of acquisition.rs for the CQ-02
//! 500-line bound; ticket 0048). Async acquisition flows live in `download`.

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
        Self::new_with(contents, max_bytes, queue_depth, 2)
    }

    /// `download_concurrency` 0 parks the spawned job on a permit that never
    /// opens, so the job holds a deterministic non-terminal state.
    fn new_with(contents: &[u8], max_bytes: u64, queue_depth: usize, concurrency: usize) -> Self {
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
        config.download_concurrency = concurrency;
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

mod download;
