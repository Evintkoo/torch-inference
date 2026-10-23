// Copyright (c) 2026 Torviello.
use axum::body::Body;
use axum::http::{HeaderMap, Method};
use http_body_util::BodyExt;
use tower::ServiceExt;

use torviello_engine::api::{AppState, build_state, router};
use torviello_engine::config::Config;

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
        rate_limit_per_minute: 120,
        decompression_max_expansion_bytes: 4_194_304,
        tls_min_version: "1.3".to_owned(),
        cors_allowed_origin: "https://console.torviello.local".to_owned(),
        accelerator_fallback: "cpu".to_owned(),
        accelerators: torviello_engine::config::Accelerators::default(),
        access_control: torviello_engine::config::AccessControl::default(),
    }
}

fn state() -> AppState {
    build_state(config()).expect("state must build")
}

async fn request(method: Method, uri: &str) -> (u16, HeaderMap, serde_json::Value) {
    let response = router(&state())
        .oneshot(
            axum::http::Request::builder()
                .method(method)
                .uri(uri)
                .body(Body::empty())
                .expect("request"),
        )
        .await
        .expect("router response");
    let status = response.status().as_u16();
    let headers = response.headers().clone();
    let bytes = response
        .into_body()
        .collect()
        .await
        .expect("body")
        .to_bytes();
    let body = serde_json::from_slice(&bytes).unwrap_or(serde_json::Value::Null);
    (status, headers, body)
}

async fn get(uri: &str) -> (u16, serde_json::Value) {
    let response = router(&state())
        .oneshot(
            axum::http::Request::builder()
                .uri(uri)
                .body(Body::empty())
                .expect("request"),
        )
        .await
        .expect("router response");
    let status = response.status().as_u16();
    let bytes = response
        .into_body()
        .collect()
        .await
        .expect("body")
        .to_bytes();
    let body = serde_json::from_slice(&bytes).unwrap_or(serde_json::Value::Null);
    (status, body)
}

#[tokio::test]
async fn unknown_route_returns_problem_details() {
    let (status, headers, body) = request(Method::GET, "/not-a-route").await;
    assert_eq!(status, 404);
    assert_eq!(headers["content-type"], "application/problem+json");
    assert_eq!(body["code"], "not_found");
    assert_eq!(body["status"], 404);
    assert!(
        body["request_id"]
            .as_str()
            .is_some_and(|value| !value.is_empty())
    );
}

#[tokio::test]
async fn wrong_method_returns_problem_details_and_allow() {
    let (status, headers, body) = request(Method::POST, "/health/live").await;
    assert_eq!(status, 405);
    assert_eq!(headers["content-type"], "application/problem+json");
    assert!(headers.contains_key("allow"));
    assert_eq!(body["code"], "method_not_allowed");
    assert_eq!(body["status"], 405);
}

#[tokio::test]
async fn liveness_matches_contract() {
    let (status, body) = get("/health/live").await;
    assert_eq!(status, 200);
    assert_eq!(body["status"], "alive");
}

#[tokio::test]
async fn catalog_lists_configured_models() {
    let (status, body) = get("/models").await;
    assert_eq!(status, 200);
    assert_eq!(body["data"].as_array().expect("data array").len(), 4);
    assert_eq!(body["data"][0]["model_id"], "engine-demo-classifier");
    assert_eq!(body["data"][0]["locally_available"], false);
    assert_eq!(body["data"][3]["model_id"], "engine-demo-torchscript");
    assert_eq!(body["data"][3]["locally_available"], true);
    assert_eq!(body["meta"]["warnings"][0], "catalog_only");
}

#[tokio::test]
async fn missing_model_returns_problem() {
    let (status, body) = get(&format!("/models/{}", "not-found")).await;
    assert_eq!(status, 404);
    assert_eq!(body["code"], "model.not_found");
}

#[tokio::test]
async fn readiness_is_blocked_without_a_loaded_model() {
    let (status, body) = get("/health/ready").await;
    assert_eq!(status, 503);
    assert_eq!(body["ready"], false);
    assert!(
        body["pending"]
            .as_array()
            .expect("pending")
            .iter()
            .any(|item| item == "model_load")
    );
}

#[tokio::test]
async fn health_reports_degraded_until_inference_is_loaded() {
    let (status, body) = get("/health").await;
    assert_eq!(status, 200);
    assert_eq!(body["status"], "degraded");
    assert!(body["uptime_ms"].is_number());
}

#[tokio::test]
async fn serves_embedded_scalar_api_reference() {
    for (uri, expected_type) in [
        ("/docs", "text/html"),
        ("/openapi.yaml", "application/yaml"),
        ("/assets/scalar.js", "text/javascript"),
    ] {
        let response = router(&state())
            .oneshot(
                axum::http::Request::builder()
                    .method(Method::GET)
                    .uri(uri)
                    .body(Body::empty())
                    .expect("request"),
            )
            .await
            .expect("response");
        assert_eq!(response.status(), 200, "{uri}");
        let content_type = response
            .headers()
            .get("content-type")
            .and_then(|value| value.to_str().ok())
            .unwrap_or_default();
        assert!(
            content_type.starts_with(expected_type),
            "{uri}: {content_type}"
        );
    }
}

#[tokio::test]
async fn private_policy_protects_health_metrics_and_docs() {
    let mut private = config();
    private.auth_enabled = true;
    private.access_control.default_public = false;
    private.access_control.public_routes.clear();
    let state = build_state(private).expect("state");
    let app = router(&state);
    for uri in [
        "/health",
        "/health/live",
        "/health/ready",
        "/metrics",
        "/docs",
        "/openapi.yaml",
        "/assets/scalar.js",
    ] {
        let response = app
            .clone()
            .oneshot(
                axum::http::Request::builder()
                    .uri(uri)
                    .body(Body::empty())
                    .expect("request"),
            )
            .await
            .expect("response");
        assert_eq!(response.status(), 401, "{uri}");
    }
}

#[tokio::test]
async fn route_access_policy_is_enforced_per_route() {
    let mut private = config();
    private.auth_enabled = true;
    private.access_control.default_public = false;
    private.access_control.public_routes = vec!["/health".to_owned()];
    let state = build_state(private).expect("state");
    let app = router(&state);
    for (uri, expected) in [("/health", 200), ("/models", 401)] {
        let response = app
            .clone()
            .oneshot(
                axum::http::Request::builder()
                    .method(Method::GET)
                    .uri(uri)
                    .body(Body::empty())
                    .expect("request"),
            )
            .await
            .expect("response");
        assert_eq!(response.status().as_u16(), expected, "{uri}");
    }

    let mut open = config();
    open.auth_enabled = true;
    open.access_control.default_public = true;
    let state = build_state(open).expect("state");
    let app = router(&state);
    let response = app
        .oneshot(
            axum::http::Request::builder()
                .method(Method::GET)
                .uri("/models")
                .body(Body::empty())
                .expect("request"),
        )
        .await
        .expect("response");
    assert_eq!(response.status(), 200);
}
