// Copyright (c) 2026 Torviello.
use std::path::PathBuf;

use axum::body::Body;
use axum::http::{Method, Request};
use http_body_util::BodyExt;
use tower::ServiceExt;

use torviello_engine::api::{AppState, build_state, router};
use torviello_engine::config::{Accelerators, AccessControl, Config};

fn config() -> Config {
    Config {
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
        model_registry: "../../config/model-registry.toml".to_owned(),
        database_url: "sqlite://data/engine.db".to_owned(),
        model_root: "../../models".to_owned(),
        max_model_bytes: 1_073_741_824,
        max_loaded_models: 2,
        download_concurrency: 2,
        download_timeout_ms: 300_000,
        model_source_allowlist: vec!["models.torviello.local".to_owned()],
        max_frame_bytes: 262_144,
        shutdown_timeout_ms: 15_000,
        max_size_bytes: 104_857_600,
        rate_limit_per_minute: 1_000,
        decompression_max_expansion_bytes: 4_194_304,
        tls_min_version: "1.3".to_owned(),
        cors_allowed_origin: "https://console.torviello.local".to_owned(),
        accelerator_fallback: "cpu".to_owned(),
        accelerators: Accelerators::default(),
        access_control: AccessControl::default(),
    }
}

fn state() -> AppState {
    build_state(config()).expect("state must build")
}

fn app() -> axum::Router {
    router(&state())
}

fn contract_path() -> PathBuf {
    PathBuf::from("../../torviello-engine/contracts/openapi.yaml")
}

#[tokio::test]
async fn every_contract_path_is_routed() {
    let document: serde_yaml::Value =
        serde_yaml::from_str(&std::fs::read_to_string(contract_path()).expect("openapi"))
            .expect("yaml");
    let paths = document["paths"].as_mapping().expect("paths").clone();
    assert!(!paths.is_empty());

    let app = app();
    for (raw_path, item) in paths {
        let path = raw_path
            .as_str()
            .expect("path")
            .replace("{modelId}", "demo");
        let methods = item.as_mapping().expect("path item");
        let (method, _) = methods
            .keys()
            .find_map(|key| {
                let value = key.as_str()?;
                let method = match value {
                    "get" => Method::GET,
                    "post" => Method::POST,
                    "delete" => Method::DELETE,
                    "put" => Method::PUT,
                    "patch" => Method::PATCH,
                    _ => return None,
                };
                Some((method, value))
            })
            .expect("operation");

        let request = Request::builder()
            .method(method)
            .uri(&path)
            .header("content-type", "application/json")
            .body(Body::from("{}"))
            .expect("request");
        let response = app.clone().oneshot(request).await.expect("response");
        let status = response.status();
        let bytes = response
            .into_body()
            .collect()
            .await
            .expect("body")
            .to_bytes();
        let body: serde_json::Value = serde_json::from_slice(&bytes).unwrap_or_default();
        assert!(
            status != 404 || body["code"] != "not_found",
            "contract path {path} has no route"
        );
    }
}

#[tokio::test]
async fn unimplemented_routes_return_problem_details() {
    let response = app()
        .oneshot(
            Request::builder()
                .method(Method::POST)
                .uri("/detect")
                .header("content-type", "application/json")
                .body(Body::from("{}"))
                .expect("request"),
        )
        .await
        .expect("response");
    assert_eq!(response.status(), 501);
    assert_eq!(
        response.headers()["content-type"],
        "application/problem+json"
    );
    let body = response
        .into_body()
        .collect()
        .await
        .expect("body")
        .to_bytes();
    let value: serde_json::Value = serde_json::from_slice(&body).expect("problem details");
    assert_eq!(value["code"], "not_implemented");
}
