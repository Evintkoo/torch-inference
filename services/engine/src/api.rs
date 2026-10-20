// Copyright (c) 2026 Torviello.
//! HTTP boundary for ENG-002, ENG-005, and ENG-020; ED-004 and ED-012.
use axum::Router;
use axum::extract::ws::WebSocketUpgrade;
use axum::extract::{DefaultBodyLimit, Json, State};
use axum::http::Method;
use axum::http::{HeaderMap, HeaderValue, StatusCode};
use axum::response::IntoResponse;
use axum::routing::{get, post};
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;

use crate::auth::{authenticate, require_role};
use crate::config::Config;
use crate::domain::{InferenceRequest, InferenceResult, classify};
use crate::error::{AppError, AppResult, ErrorEnvelope};
use crate::observability::{correlation_id, metrics_endpoint};
use crate::security::{MAX_FRAME_BYTES, MAX_IDEMPOTENCY_KEY_BYTES, sanitize_input};

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
}

#[derive(Debug, Deserialize)]
pub struct ClassifyBody {
    pub input: String,
}

#[derive(Debug, Serialize)]
pub struct ClassifyResponse {
    pub result: InferenceResult,
}

pub fn router() -> Router<AppState> {
    let cors = CorsLayer::new()
        .allow_origin(HeaderValue::from_static("https://console.torviello.local"))
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([
            axum::http::header::AUTHORIZATION,
            axum::http::header::CONTENT_TYPE,
            axum::http::HeaderName::from_static("idempotency-key"),
        ]);
    Router::new()
        .route("/health", get(health))
        .route("/classify", post(classify_handler))
        .route("/metrics", get(metrics_handler))
        .layer(DefaultBodyLimit::max(MAX_BODY_BYTES))
        .layer(cors)
}

const MAX_BODY_BYTES: usize = 1_048_576;

pub const API_DEPRECATION_POLICY: &str =
    "deprecation notice at least one minor release before sunset; sunset date in the contract";

async fn classify_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(body): Json<ClassifyBody>,
) -> AppResult<impl IntoResponse> {
    let principal = authenticate(&headers)?;
    require_role(&principal, "inference")?;
    require_idempotency(&headers)?;

    let input = sanitize_input(&body.input)?;
    let request = InferenceRequest {
        prompt: input,
        max_batch_size: state.config.max_batch_size,
    };
    let result = classify(request, state.config.timeout_ms).await?;
    let mut response = Json(ClassifyResponse { result }).into_response();
    response
        .headers_mut()
        .insert("cache-control", HeaderValue::from_static("no-store"));
    Ok(response)
}

fn require_idempotency(headers: &HeaderMap) -> AppResult<()> {
    let Some(value) = headers.get("idempotency-key") else {
        return Ok(());
    };
    if value.len() > MAX_IDEMPOTENCY_KEY_BYTES {
        return Err(AppError::InvalidInput);
    }
    Ok(())
}

async fn health(State(state): State<AppState>) -> impl IntoResponse {
    let ready = state.config.validate().is_ok();
    let body = serde_json::json!({
        "status": if ready { "ok" } else { "degraded" },
        "liveness": true,
        "readiness": ready,
        "version": env!("CARGO_PKG_VERSION"),
        "request_id": correlation_id(),
    });
    (StatusCode::OK, Json(body))
}

async fn metrics_handler() -> impl IntoResponse {
    metrics_endpoint()
}

pub fn websocket(upgrade: WebSocketUpgrade, State(_state): State<AppState>) -> impl IntoResponse {
    upgrade
        .max_frame_size(MAX_FRAME_BYTES)
        .max_message_size(MAX_FRAME_BYTES)
        .on_upgrade(|_socket| async {})
}

pub fn oversized_body_response() -> (StatusCode, Json<ErrorEnvelope>) {
    (
        StatusCode::PAYLOAD_TOO_LARGE,
        Json(AppError::PayloadTooLarge.envelope(correlation_id())),
    )
}
