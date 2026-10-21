// Copyright (c) 2026 Torviello.
//! HTTP boundary: health, catalog, model lifecycle, and metrics.
use std::sync::{Arc, Mutex};
use std::time::Instant;

use axum::Router;
use axum::body::{Body, to_bytes};
use axum::extract::{Request, State};
use axum::http::header::{
    ACCESS_CONTROL_ALLOW_HEADERS, ACCESS_CONTROL_ALLOW_METHODS, ACCESS_CONTROL_ALLOW_ORIGIN,
    ACCESS_CONTROL_REQUEST_METHOD, CONTENT_ENCODING, CONTENT_LENGTH, ORIGIN, VARY,
};
use axum::http::{HeaderMap, HeaderName, HeaderValue, Method, StatusCode};
use axum::middleware::{self, Next};
use axum::response::{IntoResponse, Response};
use axum::routing::{delete, get, post};

use crate::acquisition::Acquisition;
use crate::asset::AssetStore;
use crate::auth::{Principal, authenticate};
use crate::config::Config;
use crate::error::{AppError, AppResult};
use crate::model::ModelRegistry;
use crate::runtime::ModelManager;
use crate::security::RateLimiter;

pub mod catalog;
pub mod health;
pub mod metrics;
pub mod models;
pub mod schemas;

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub registry: Arc<ModelRegistry>,
    pub assets: Arc<AssetStore>,
    pub acquisition: Arc<Acquisition>,
    pub models: Arc<ModelManager>,
    pub rate: Arc<Mutex<RateLimiter>>,
    pub started: Instant,
}

pub fn build_state(config: Config) -> AppResult<AppState> {
    let registry = Arc::new(ModelRegistry::from_path(std::path::Path::new(
        &config.model_registry,
    ))?);
    let assets = Arc::new(AssetStore::new(
        std::path::Path::new(&config.model_root),
        config.max_model_bytes,
    )?);
    let acquisition = Arc::new(Acquisition::new(
        &config,
        Arc::clone(&assets),
        Arc::clone(&registry),
    )?);
    let models = Arc::new(ModelManager::new(
        &config,
        Arc::clone(&assets),
        Arc::clone(&registry),
    ));
    let rate = Arc::new(Mutex::new(RateLimiter::new(config.rate_limit_per_minute)));
    Ok(AppState {
        config,
        registry,
        assets,
        acquisition,
        models,
        rate,
        started: Instant::now(),
    })
}

pub fn router(config: &Config) -> Router<AppState> {
    let max_body_bytes = config.max_body_bytes;
    let decompression_max = config.decompression_max_expansion_bytes;
    let cors_origin = config.cors_allowed_origin.clone();
    Router::new()
        .route("/health", get(health::health))
        .route("/health/live", get(health::liveness))
        .route("/health/ready", get(health::readiness))
        .route("/models", get(catalog::list_models))
        .route("/models/{modelId}", get(catalog::get_model))
        .route("/models/{modelId}/download", post(models::download))
        .route("/models/{modelId}/status", get(models::download_status))
        .route(
            "/models/{modelId}/download/progress",
            get(models::download_progress),
        )
        .route("/models/{modelId}/load", post(models::load))
        .route("/models/{modelId}/unload", post(models::unload))
        .route("/metrics", get(metrics::metrics_handler))
        .route("/system", get(not_implemented))
        .route("/system/logs", get(not_implemented).delete(not_implemented))
        .route("/tts", post(not_implemented))
        .route("/tts/stream", post(not_implemented))
        .route("/stt", post(not_implemented))
        .route("/classify", post(not_implemented))
        .route("/detect", post(not_implemented))
        .route("/v1/chat/completions", post(not_implemented))
        .route(
            "/api/v1/models",
            get(catalog::list_models).post(not_implemented),
        )
        .route("/api/v1/models/{modelId}", delete(not_implemented))
        .route("/ws/audio", get(not_implemented))
        .route("/ws/classify", get(not_implemented))
        .route("/ws/detect", get(not_implemented))
        .route("/api/v1/health", get(health::health))
        .route("/api/v1/tts", post(not_implemented))
        .route("/api/v1/tts/stream", post(not_implemented))
        .route("/api/v1/stt", post(not_implemented))
        .route("/api/v1/classify", post(not_implemented))
        .route("/api/v1/detect", post(not_implemented))
        .fallback(not_found)
        .method_not_allowed_fallback(method_not_allowed)
        .layer(middleware::from_fn(move |request, next| {
            enforce_limits(max_body_bytes, decompression_max, request, next)
        }))
        .layer(middleware::from_fn(move |request, next| {
            let origin = cors_origin.clone();
            async move { apply_cors(&origin, request, next).await }
        }))
        .layer(middleware::from_fn(no_store))
}

async fn not_implemented(State(state): State<AppState>, headers: HeaderMap) -> AppResult<AppError> {
    authenticate_if_enabled(&state, &headers)?;
    Ok(AppError::NotImplemented)
}

async fn enforce_limits(
    max_body_bytes: usize,
    decompression_max: u64,
    request: Request,
    next: Next,
) -> Response {
    if let Some(encoding) = request.headers().get(CONTENT_ENCODING) {
        let encoding = encoding.to_str().unwrap_or_default();
        if matches!(encoding, "gzip" | "br" | "deflate")
            && request
                .headers()
                .get(CONTENT_LENGTH)
                .and_then(|value| value.to_str().ok())
                .and_then(|value| value.parse::<u64>().ok())
                .is_some_and(|length| length > decompression_max)
        {
            return AppError::PayloadTooLarge.into_response();
        }
    }

    let (parts, body) = request.into_parts();
    let Ok(bytes) = to_bytes(body, max_body_bytes).await else {
        return AppError::PayloadTooLarge.into_response();
    };
    next.run(Request::from_parts(parts, Body::from(bytes)))
        .await
}

async fn apply_cors(cors_origin: &str, request: Request, next: Next) -> Response {
    let origin = request
        .headers()
        .get(ORIGIN)
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned);
    let preflight = request.method() == Method::OPTIONS
        && request
            .headers()
            .contains_key(ACCESS_CONTROL_REQUEST_METHOD);
    let mut response = if preflight {
        StatusCode::NO_CONTENT.into_response()
    } else {
        next.run(request).await
    };
    if origin.as_deref() == Some(cors_origin) {
        if let Ok(value) = HeaderValue::from_str(cors_origin) {
            response
                .headers_mut()
                .insert(ACCESS_CONTROL_ALLOW_ORIGIN, value);
        }
        response.headers_mut().insert(
            ACCESS_CONTROL_ALLOW_METHODS,
            HeaderValue::from_static("GET, POST, DELETE"),
        );
        response.headers_mut().insert(
            ACCESS_CONTROL_ALLOW_HEADERS,
            HeaderValue::from_static("authorization, content-type, idempotency-key"),
        );
        response
            .headers_mut()
            .append(VARY, HeaderValue::from_static("Origin"));
    }
    response
}

async fn not_found() -> AppError {
    AppError::NotFound
}

async fn method_not_allowed() -> AppError {
    AppError::MethodNotAllowed
}

async fn no_store(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await;
    response.headers_mut().insert(
        HeaderName::from_static("cache-control"),
        HeaderValue::from_static("no-store"),
    );
    response
}

pub const API_DEPRECATION_POLICY: &str =
    "deprecation notice at least one minor release before sunset; sunset date in the contract";

pub fn authenticate_if_enabled(
    state: &AppState,
    headers: &HeaderMap,
) -> AppResult<Option<Principal>> {
    state.rate.lock().map_err(|_| AppError::Internal)?.check()?;
    if state.config.auth_enabled {
        return authenticate(headers).map(Some);
    }
    Ok(None)
}
