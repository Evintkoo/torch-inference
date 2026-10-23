// Copyright (c) 2026 Torviello.
use std::io::{Read, Write};
use std::net::TcpListener;

use axum::body::Body;
use axum::http::{Request, StatusCode};
use http_body_util::BodyExt;
use tower::ServiceExt;

use torviello_engine::api::{build_state, router};
use torviello_engine::config::{Accelerators, AccessControl, AuthMode, Config};

const JWKS: &str = include_str!("../fixtures/oidc_jwks.json");
const VALID: &str = include_str!("../fixtures/oidc_valid.jwt");
const EXPIRED: &str = include_str!("../fixtures/oidc_expired.jwt");
const WRONG_AUDIENCE: &str = include_str!("../fixtures/oidc_wrong_audience.jwt");

fn jwks_url() -> String {
    let listener = TcpListener::bind("127.0.0.1:0").expect("listener");
    let address = listener.local_addr().expect("address");
    std::thread::spawn(move || {
        let (mut stream, _) = listener.accept().expect("accept");
        let mut buffer = [0_u8; 4096];
        let _ = stream.read(&mut buffer);
        let response = format!(
            "HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: {}\r\nconnection: close\r\n\r\n{}",
            JWKS.len(),
            JWKS
        );
        stream.write_all(response.as_bytes()).expect("response");
    });
    format!("http://{address}/jwks")
}

fn config(jwks_url: String) -> Config {
    Config {
        host: "127.0.0.1".to_owned(),
        port: 8000,
        auth_enabled: true,
        auth_mode: AuthMode::Oidc,
        oidc_issuer: "https://issuer.example".to_owned(),
        oidc_audience: "torviello-engine".to_owned(),
        oidc_jwks_url: jwks_url,
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

fn app() -> axum::Router {
    let config = config(jwks_url());
    let state = build_state(config.clone()).expect("state");
    router(&state)
}

async fn get(app: &axum::Router, path: &str, token: Option<&str>) -> StatusCode {
    let mut builder = Request::builder().uri(path);
    if let Some(token) = token {
        builder = builder.header("authorization", format!("Bearer {}", token.trim()));
    }
    let response = app
        .clone()
        .oneshot(builder.body(Body::empty()).expect("request"))
        .await
        .expect("response");
    let status = response.status();
    let _ = response.into_body().collect().await;
    status
}

async fn send(app: &axum::Router, method: &str, path: &str, token: Option<&str>) -> StatusCode {
    let mut builder = Request::builder().method(method).uri(path);
    if let Some(token) = token {
        builder = builder.header("authorization", format!("Bearer {}", token.trim()));
    }
    app.clone()
        .oneshot(builder.body(Body::empty()).expect("request"))
        .await
        .expect("response")
        .status()
}

#[tokio::test]
async fn oidc_resource_server_enforces_tokens_and_route_policy() {
    let app = app();

    assert_eq!(get(&app, "/health", None).await, StatusCode::OK);
    assert_eq!(get(&app, "/models", None).await, StatusCode::UNAUTHORIZED);
    assert_eq!(get(&app, "/models", Some(VALID)).await, StatusCode::OK);
    assert_eq!(
        get(&app, "/models", Some(EXPIRED)).await,
        StatusCode::UNAUTHORIZED
    );
    assert_eq!(
        get(&app, "/models", Some(WRONG_AUDIENCE)).await,
        StatusCode::UNAUTHORIZED
    );
    assert_eq!(
        send(&app, "POST", "/models/demo/load", Some(VALID)).await,
        StatusCode::FORBIDDEN
    );
}

#[tokio::test]
async fn oidc_mode_fails_closed_without_a_verifier() {
    let config = config(jwks_url());
    let mut state = build_state(config).expect("state");
    state.oidc = None;
    assert!(matches!(
        torviello_engine::api::authenticate_request(
            &state,
            &axum::http::HeaderMap::new(),
            "/models"
        )
        .await,
        Err(torviello_engine::error::AppError::Unavailable)
    ));
}
