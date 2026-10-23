// Copyright (c) 2026 Torviello.
use axum::body::Body;
use axum::http::{Method, Request};
use http_body_util::BodyExt;
use tower::ServiceExt;

use torviello_engine::api::{build_state, router};
use torviello_engine::config::{Accelerators, AccessControl, Config};

fn config(max_body: usize, rate: u32, origin: &str) -> Config {
    Config {
        host: "127.0.0.1".to_owned(),
        port: 8000,
        auth_enabled: false,
        auth_mode: torviello_engine::config::AuthMode::Local,
        oidc_issuer: String::new(),
        oidc_audience: String::new(),
        oidc_jwks_url: String::new(),
        oidc_clock_skew_seconds: 60,
        max_body_bytes: max_body,
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
        rate_limit_per_minute: rate,
        decompression_max_expansion_bytes: 4_194_304,
        tls_min_version: "1.3".to_owned(),
        cors_allowed_origin: origin.to_owned(),
        accelerator_fallback: "cpu".to_owned(),
        accelerators: Accelerators::default(),
        access_control: AccessControl::default(),
    }
}

fn app(max_body: usize, rate: u32, origin: &str) -> axum::Router {
    let config = config(max_body, rate, origin);
    router(&build_state(config).expect("state"))
}

async fn send(
    app: &axum::Router,
    method: Method,
    uri: &str,
    body: Body,
    headers: &[(&str, &str)],
) -> (u16, axum::http::HeaderMap, serde_json::Value) {
    let mut request = Request::builder().method(method).uri(uri);
    for (name, value) in headers {
        request = request.header(*name, *value);
    }
    let response = app
        .clone()
        .oneshot(request.body(body).expect("request"))
        .await
        .expect("response");
    let status = response.status().as_u16();
    let headers = response.headers().clone();
    let bytes = response
        .into_body()
        .collect()
        .await
        .expect("body")
        .to_bytes();
    let value = serde_json::from_slice(&bytes).unwrap_or(serde_json::Value::Null);
    (status, headers, value)
}

#[tokio::test]
async fn oversized_body_is_problem_details() {
    let app = app(64, 1_000, "https://console.torviello.local");
    let (status, headers, value) = send(
        &app,
        Method::POST,
        "/models/demo/download",
        Body::from("x".repeat(65)),
        &[("content-type", "application/json")],
    )
    .await;
    assert_eq!(status, 413);
    assert_eq!(headers["content-type"], "application/problem+json");
    assert_eq!(value["code"], "payload_too_large");
}

#[tokio::test]
async fn missing_content_type_is_problem_details() {
    let app = app(1_024, 1_000, "https://console.torviello.local");
    let (status, headers, value) = send(
        &app,
        Method::POST,
        "/models/demo/download",
        Body::from("{}"),
        &[],
    )
    .await;
    assert_eq!(status, 415);
    assert_eq!(headers["content-type"], "application/problem+json");
    assert_eq!(value["code"], "unsupported_media_type");
}

#[tokio::test]
async fn rate_limit_uses_configured_value() {
    let app = app(1_024, 1, "https://console.torviello.local");
    let (first, _, _) = send(&app, Method::GET, "/models", Body::empty(), &[]).await;
    let (second, headers, value) = send(&app, Method::GET, "/models", Body::empty(), &[]).await;
    assert_eq!(first, 200);
    assert_eq!(second, 429);
    assert!(headers.contains_key("retry-after"));
    assert_eq!(value["code"], "rate_limited");
}

#[tokio::test]
async fn cors_uses_configured_origin() {
    let origin = "https://console.example.test";
    let app = app(1_024, 1_000, origin);
    let (status, headers, _) = send(
        &app,
        Method::GET,
        "/health",
        Body::empty(),
        &[("origin", origin)],
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(headers["access-control-allow-origin"], origin);

    let (status, headers, _) = send(
        &app,
        Method::OPTIONS,
        "/models",
        Body::empty(),
        &[("origin", origin), ("access-control-request-method", "GET")],
    )
    .await;
    assert_eq!(status, 204);
    assert_eq!(headers["access-control-allow-origin"], origin);
}
