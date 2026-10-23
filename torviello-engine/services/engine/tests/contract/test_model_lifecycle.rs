// Copyright (c) 2026 Torviello.
use std::fmt::Write as _;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

use axum::Router;
use axum::body::Body;
use axum::http::{HeaderMap, Method, StatusCode};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use tower::ServiceExt;

use torviello_engine::api::{AppState, build_state, router};
use torviello_engine::config::Config;
use torviello_engine::model::sha256_hex;

const MODEL_BYTES: &[u8] = br#"{"kind":"linear-classifier","input_dim":2,"classes":["alpha","beta"],"weights":[[1.0,0.0],[0.0,1.0]],"bias":[0.0,0.0]}"#;

struct Fixture {
    root: PathBuf,
}

impl Fixture {
    fn new(models: &[&str], max_loaded: usize, corrupt_digest: bool) -> (Self, AppState) {
        let root =
            std::env::temp_dir().join(format!("torviello-lifecycle-{}", uuid::Uuid::new_v4()));
        let model_root = root.join("models");
        std::fs::create_dir_all(model_root.join("seed")).expect("seed dir");
        let mut registry = String::from("# fixture registry\n");
        for name in models {
            std::fs::write(
                model_root.join("seed").join(format!("{name}.json")),
                MODEL_BYTES,
            )
            .expect("seed asset");
            let digest = if corrupt_digest {
                format!("sha256:{}", "0".repeat(64))
            } else {
                sha256_hex(MODEL_BYTES)
            };
            write!(
                registry,
                "[[models]]\nid = \"{name}\"\nversion = \"1.0.0\"\ntask = \"classification\"\nformat = \"torviello-tensor-v1\"\nsize_bytes = {}\ncontent_hash = \"{digest}\"\nsource_url = \"https://models.torviello.local/{name}.json\"\nlicense = \"Apache-2.0\"\n\n",
                MODEL_BYTES.len()
            )
            .expect("registry entry");
        }
        let registry_path = root.join("registry.toml");
        std::fs::write(&registry_path, registry).expect("registry");
        let config = Config {
            host: "127.0.0.1".to_owned(),
            port: 8000,
            auth_enabled: false,
            auth_mode: torviello_engine::config::AuthMode::Local,
            oidc_issuer: String::new(),
            oidc_audience: String::new(),
            oidc_jwks_url: String::new(),
            oidc_clock_skew_seconds: 60,
            max_body_bytes: 1_048_576,
            max_batch_size: 8,
            timeout_ms: 30_000,
            retention_max_age_days: 7,
            max_queue_depth: 32,
            model_registry: registry_path.to_string_lossy().into_owned(),
            database_url: "sqlite://data/engine.db".to_owned(),
            model_root: model_root.to_string_lossy().into_owned(),
            max_model_bytes: 1_073_741_824,
            max_loaded_models: max_loaded,
            download_concurrency: 2,
            download_timeout_ms: 30_000,
            model_source_allowlist: vec!["models.torviello.local".to_owned()],
            max_frame_bytes: 262_144,
            shutdown_timeout_ms: 15_000,
            max_size_bytes: 104_857_600,
            rate_limit_per_minute: 120,
            decompression_max_expansion_bytes: 4_194_304,
            tls_min_version: "1.3".to_owned(),
            cors_allowed_origin: "https://console.torviello.local".to_owned(),
            accelerator_fallback: "cpu".to_owned(),
            accelerators: torviello_engine::config::Accelerators::default(),
            access_control: torviello_engine::config::AccessControl::default(),
        };
        let state = build_state(config).expect("state");
        (Self { root }, state)
    }
}

impl Drop for Fixture {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.root);
    }
}

fn app(state: &AppState) -> Router {
    router(state)
}

async fn send(
    app: &Router,
    method: Method,
    uri: &str,
    body: Option<Value>,
) -> (StatusCode, HeaderMap, Vec<u8>) {
    let request = axum::http::Request::builder()
        .method(method)
        .uri(uri)
        .header("content-type", "application/json")
        .body(body.map_or_else(Body::empty, |value| {
            Body::from(serde_json::to_vec(&value).expect("json"))
        }))
        .expect("request");
    let response = app.clone().oneshot(request).await.expect("response");
    let status = response.status();
    let headers = response.headers().clone();
    let bytes = response
        .into_body()
        .collect()
        .await
        .expect("body")
        .to_bytes()
        .to_vec();
    (status, headers, bytes)
}

async fn json(app: &Router, method: Method, uri: &str, body: Option<Value>) -> (StatusCode, Value) {
    let (status, _, bytes) = send(app, method, uri, body).await;
    let value = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
    (status, value)
}

async fn wait_terminal(app: &Router, model_id: &str) -> Value {
    for _ in 0..100 {
        let (status, body) = json(
            app,
            Method::GET,
            &format!("/models/{model_id}/status"),
            None,
        )
        .await;
        if status == StatusCode::OK {
            let state = body["data"]["state"].as_str().unwrap_or_default();
            if matches!(state, "ready" | "failed" | "cancelled") {
                return body["data"].clone();
            }
        }
        tokio::time::sleep(Duration::from_millis(25)).await;
    }
    panic!("download did not reach a terminal state");
}

#[tokio::test]
async fn local_acquisition_activates_and_loads() {
    let (_fixture, state) = Fixture::new(&["fixture-a"], 2, false);
    let app = app(&state);
    let (status, body) = json(
        &app,
        Method::POST,
        "/models/fixture-a/download",
        Some(json!({"source": {"scheme": "local", "path": "seed/fixture-a.json"}})),
    )
    .await;
    assert_eq!(status, StatusCode::ACCEPTED);
    assert_eq!(body["data"]["model_id"], "fixture-a");

    let job = wait_terminal(&app, "fixture-a").await;
    assert_eq!(job["state"], "ready");
    assert_eq!(job["bytes_transferred"], MODEL_BYTES.len());

    let (_, catalog) = json(&app, Method::GET, "/models/fixture-a", None).await;
    assert_eq!(catalog["data"]["locally_available"], true);
    assert_eq!(catalog["data"]["download_state"], "ready");

    let (status, load) = json(&app, Method::POST, "/models/fixture-a/load", None).await;
    assert_eq!(status, StatusCode::ACCEPTED);
    assert_eq!(load["data"]["state"], "ready");
    assert_eq!(load["data"]["backend"], "cpu");

    let (status, ready) = json(&app, Method::GET, "/health/ready", None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(ready["ready"], true);
    assert_eq!(ready["loaded_models"], 1);

    let (status, unload) = json(&app, Method::POST, "/models/fixture-a/unload", None).await;
    assert_eq!(status, StatusCode::ACCEPTED);
    assert_eq!(unload["data"]["state"], "unloaded");
}

#[tokio::test]
async fn unsafe_sources_are_rejected_without_writes() {
    let (fixture, state) = Fixture::new(&["fixture-a"], 2, false);
    let app = app(&state);

    let (status, body) = json(
        &app,
        Method::POST,
        "/models/fixture-a/download",
        Some(json!({"source": {"scheme": "https", "url": "file:///etc/passwd"}})),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(body["code"], "model.invalid_source");

    let (status, body) = json(
        &app,
        Method::POST,
        "/models/fixture-a/download",
        Some(json!({"source": {"scheme": "local", "path": "../../escape"}})),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(body["code"], "model.path_outside_root");
    let model_dir = fixture.root.join("models").join("fixture-a");
    assert!(!model_dir.exists());
}

#[tokio::test]
async fn digest_mismatch_leaves_asset_unavailable() {
    let (_fixture, state) = Fixture::new(&["fixture-a"], 2, true);
    let app = app(&state);
    json(
        &app,
        Method::POST,
        "/models/fixture-a/download",
        Some(json!({"source": {"scheme": "local", "path": "seed/fixture-a.json"}})),
    )
    .await;
    let job = wait_terminal(&app, "fixture-a").await;
    assert_eq!(job["state"], "failed");
    assert_eq!(job["error_code"], "model.digest_mismatch");

    let (_, catalog) = json(&app, Method::GET, "/models/fixture-a", None).await;
    assert_eq!(catalog["data"]["locally_available"], false);
    let (status, body) = json(&app, Method::POST, "/models/fixture-a/load", None).await;
    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(body["code"], "model.not_ready");
}

#[tokio::test]
async fn unknown_model_is_not_found() {
    let (_fixture, state) = Fixture::new(&["fixture-a"], 2, false);
    let app = app(&state);
    let (status, body) = json(&app, Method::POST, "/models/missing-model/load", None).await;
    assert_eq!(status, StatusCode::NOT_FOUND);
    assert_eq!(body["code"], "model.not_found");
}

#[tokio::test]
async fn capacity_is_enforced() {
    let (_fixture, state) = Fixture::new(&["fixture-a", "fixture-b"], 1, false);
    let app = app(&state);
    for name in ["fixture-a", "fixture-b"] {
        json(
            &app,
            Method::POST,
            &format!("/models/{name}/download"),
            Some(json!({"source": {"scheme": "local", "path": format!("seed/{name}.json")}})),
        )
        .await;
        assert_eq!(wait_terminal(&app, name).await["state"], "ready");
    }
    let (status, _) = json(&app, Method::POST, "/models/fixture-a/load", None).await;
    assert_eq!(status, StatusCode::ACCEPTED);
    let (status, body) = json(&app, Method::POST, "/models/fixture-b/load", None).await;
    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(body["code"], "model.capacity_exceeded");
}

#[tokio::test]
async fn concurrent_loads_converge_on_one_slot() {
    let (_fixture, state) = Fixture::new(&["fixture-a"], 2, false);
    let app = app(&state);
    json(
        &app,
        Method::POST,
        "/models/fixture-a/download",
        Some(json!({"source": {"scheme": "local", "path": "seed/fixture-a.json"}})),
    )
    .await;
    wait_terminal(&app, "fixture-a").await;

    let manager_a = Arc::clone(&state.models);
    let manager_b = Arc::clone(&state.models);
    let (first, second) = tokio::join!(
        tokio::spawn(async move { manager_a.load("fixture-a").await }),
        tokio::spawn(async move { manager_b.load("fixture-a").await })
    );
    let first = first.expect("join").expect("load");
    let second = second.expect("join").expect("load");
    assert_eq!(first.state, second.state);
    assert_eq!(first.loaded_at, second.loaded_at);
}

#[tokio::test]
async fn unload_waits_for_inflight_reference() {
    let (_fixture, state) = Fixture::new(&["fixture-a"], 2, false);
    let app = app(&state);
    json(
        &app,
        Method::POST,
        "/models/fixture-a/download",
        Some(json!({"source": {"scheme": "local", "path": "seed/fixture-a.json"}})),
    )
    .await;
    wait_terminal(&app, "fixture-a").await;
    state.models.load("fixture-a").await.expect("load");

    let guard = state.models.acquire("fixture-a").expect("reference");
    let manager = Arc::clone(&state.models);
    let unload = tokio::spawn(async move { manager.unload("fixture-a").await });
    tokio::time::sleep(Duration::from_millis(50)).await;
    assert!(!unload.is_finished());
    drop(guard);
    let slot = unload.await.expect("join").expect("unload");
    assert_eq!(slot.state, torviello_engine::runtime::LoadState::Unloaded);
}

#[tokio::test]
async fn progress_stream_ends_after_terminal_state() {
    let (_fixture, state) = Fixture::new(&["fixture-a"], 2, false);
    let app = app(&state);
    json(
        &app,
        Method::POST,
        "/models/fixture-a/download",
        Some(json!({"source": {"scheme": "local", "path": "seed/fixture-a.json"}})),
    )
    .await;
    let (status, headers, bytes) = send(
        &app,
        Method::GET,
        "/models/fixture-a/download/progress",
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(
        headers
            .get("content-type")
            .and_then(|value| value.to_str().ok()),
        Some("text/event-stream")
    );
    let text = String::from_utf8(bytes).expect("utf8");
    assert!(text.contains("model.activated"), "{text}");
    assert!(text.contains("\"task_id\""), "{text}");
}

#[cfg(feature = "persistence")]
#[tokio::test]
async fn lifecycle_actions_are_audited() {
    let (fixture, mut state) = Fixture::new(&["fixture-a"], 2, false);
    let url = format!("sqlite://{}/audit.db", fixture.root.display());
    let audit = torviello_engine::persistence::AuditStore::new(url.clone(), 7);
    audit.initialize().await.expect("audit init");
    state.audit = Some(audit);
    let app = app(&state);

    json(
        &app,
        Method::POST,
        "/models/fixture-a/download",
        Some(json!({"source": {"scheme": "local", "path": "seed/fixture-a.json"}})),
    )
    .await;
    wait_terminal(&app, "fixture-a").await;
    json(&app, Method::POST, "/models/fixture-a/load", None).await;
    json(&app, Method::POST, "/models/fixture-a/unload", None).await;

    let pool = torviello_engine::persistence::connect(&url)
        .await
        .expect("connect");
    let rows: Vec<(String, String, String)> =
        sqlx::query_as("SELECT action, actor, model_id FROM audit_event ORDER BY id")
            .fetch_all(&pool)
            .await
            .expect("audit rows");
    assert_eq!(
        rows,
        vec![
            (
                "download".to_owned(),
                "local".to_owned(),
                "fixture-a".to_owned()
            ),
            (
                "load".to_owned(),
                "local".to_owned(),
                "fixture-a".to_owned()
            ),
            (
                "unload".to_owned(),
                "local".to_owned(),
                "fixture-a".to_owned()
            ),
        ]
    );
}
