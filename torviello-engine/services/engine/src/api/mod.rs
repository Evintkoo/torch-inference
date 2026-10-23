// Copyright (c) 2026 Torviello.
//! HTTP boundary: health, catalog, model lifecycle, and metrics.
use std::sync::{Arc, Mutex};
use std::time::Instant;

use axum::Router;
use axum::body::{Body, to_bytes};
use axum::extract::{MatchedPath, Request, State};
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
use crate::auth::{OidcSettings, OidcVerifier, Principal, authenticate, authorize};
use crate::config::Config;
use crate::error::{AppError, AppResult};
use crate::model::ModelRegistry;
use crate::observability::{correlation_id, request_finished, request_started};
use crate::runtime::ModelManager;
use crate::security::RateLimiter;

pub mod catalog;
pub mod classify;
pub mod docs;
pub mod health;
pub mod metrics;
pub mod models;
pub mod schemas;

#[derive(Clone, Debug)]
pub struct RequestContext {
    pub principal: Option<Principal>,
    pub request_id: String,
}

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub registry: Arc<ModelRegistry>,
    pub assets: Arc<AssetStore>,
    pub acquisition: Arc<Acquisition>,
    pub models: Arc<ModelManager>,
    pub rate: Arc<Mutex<RateLimiter>>,
    pub oidc: Option<Arc<OidcVerifier>>,
    #[cfg(feature = "persistence")]
    pub audit: Option<crate::persistence::AuditStore>,
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
    let oidc = if config.auth_mode == crate::config::AuthMode::Oidc {
        Some(Arc::new(OidcVerifier::new(OidcSettings {
            issuer: config.oidc_issuer.clone(),
            audience: config.oidc_audience.clone(),
            jwks_url: config.oidc_jwks_url.clone(),
            clock_skew_seconds: config.oidc_clock_skew_seconds,
        })?))
    } else {
        None
    };
    Ok(AppState {
        config,
        registry,
        assets,
        acquisition,
        models,
        rate,
        oidc,
        #[cfg(feature = "persistence")]
        audit: None,
        started: Instant::now(),
    })
}

pub fn router(state: &AppState) -> Router {
    let config = &state.config;
    let max_body_bytes = config.max_body_bytes;
    let decompression_max = config.decompression_max_expansion_bytes;
    let cors_origin = config.cors_allowed_origin.clone();
    let router: Router<AppState> = Router::new()
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
        .route("/docs", get(docs::scalar))
        .route("/openapi.yaml", get(docs::openapi))
        .route("/assets/scalar.js", get(docs::scalar_js))
        .route("/system", get(not_implemented))
        .route("/system/logs", get(not_implemented).delete(not_implemented))
        .route("/tts", post(not_implemented))
        .route("/tts/stream", post(not_implemented))
        .route("/stt", post(not_implemented))
        .route("/classify", post(classify::classify))
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
        .route("/api/v1/classify", post(classify::classify))
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
        .layer(middleware::from_fn(record_metrics));
    router
        .with_state(state.clone())
        .layer(middleware::from_fn_with_state(
            state.clone(),
            authorize_request,
        ))
}

async fn record_metrics(request: Request, next: Next) -> Response {
    let method = request.method().as_str().to_owned();
    let path = request.extensions().get::<MatchedPath>().map_or_else(
        || "unmatched".to_owned(),
        |matched| matched.as_str().to_owned(),
    );
    request_started();
    let started = Instant::now();
    let response = next.run(request).await;
    request_finished(
        &method,
        &path,
        response.status().as_u16(),
        started.elapsed().as_secs_f64(),
    );
    response
}

async fn not_implemented() -> AppError {
    AppError::NotImplemented
}

async fn authorize_request(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Response {
    if let Err(error) = state
        .rate
        .lock()
        .map_err(|_| AppError::Internal)
        .and_then(|mut limiter| limiter.check())
    {
        return error.into_response();
    }
    let path = request.extensions().get::<MatchedPath>().map_or_else(
        || "unmatched".to_owned(),
        |matched| matched.as_str().to_owned(),
    );
    let principal = match authenticate_request(&state, request.headers(), &path).await {
        Ok(principal) => principal,
        Err(error) => return error.into_response(),
    };
    if let Some(principal) = &principal {
        let (role, scope) = required_access(request.method(), &path);
        if let Err(error) = authorize(principal, role, scope) {
            return error.into_response();
        }
    }
    let request_id = correlation_id();
    request.extensions_mut().insert(RequestContext {
        principal,
        request_id: request_id.clone(),
    });
    let mut response = next.run(request).await;
    if let Ok(value) = HeaderValue::from_str(&request_id) {
        response
            .headers_mut()
            .insert(HeaderName::from_static("x-request-id"), value);
    }
    response
}

fn required_access(method: &Method, path: &str) -> (&'static str, &'static str) {
    if path.starts_with("/system") {
        return ("admin", "engine.admin");
    }
    if method == Method::POST
        && (path.ends_with("/download") || path.ends_with("/load") || path.ends_with("/unload"))
    {
        return ("operator", "engine.models.write");
    }
    ("inference", "engine.inference")
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
    let cacheable = request
        .extensions()
        .get::<MatchedPath>()
        .is_some_and(|matched| {
            matches!(
                matched.as_str(),
                "/docs" | "/openapi.yaml" | "/assets/scalar.js"
            )
        });
    let mut response = next.run(request).await;
    if !cacheable {
        response.headers_mut().insert(
            HeaderName::from_static("cache-control"),
            HeaderValue::from_static("no-store"),
        );
    }
    response
}

pub const API_DEPRECATION_POLICY: &str =
    "deprecation notice at least one minor release before sunset; sunset date in the contract";

pub async fn begin_audit(
    state: &AppState,
    context: &RequestContext,
    action: &str,
    model_id: &str,
) -> AppResult<Option<i64>> {
    #[cfg(feature = "persistence")]
    if let Some(audit) = &state.audit {
        let actor = context
            .principal
            .as_ref()
            .map_or("local", |principal| principal.actor.as_str());
        let org_id = context
            .principal
            .as_ref()
            .and_then(|principal| principal.org_id.as_deref());
        let jti = context
            .principal
            .as_ref()
            .and_then(|principal| principal.jti.as_deref());
        return audit
            .begin(crate::persistence::AuditBegin {
                action,
                actor,
                model_id,
                request_id: &context.request_id,
                org_id,
                jti,
            })
            .await
            .map(Some);
    }
    #[cfg(not(feature = "persistence"))]
    let _ = (state, context, action, model_id);
    Ok(None)
}

pub async fn finish_audit(state: &AppState, id: Option<i64>, error: Option<&AppError>) {
    #[cfg(feature = "persistence")]
    if let (Some(audit), Some(id)) = (&state.audit, id)
        && let Err(audit_error) = audit.finish(id, error.map(AppError::code)).await
    {
        tracing::error!(
            event = "audit_completion_failed",
            audit_id = id,
            error = %audit_error,
            "audit outcome could not be recorded"
        );
    }
    #[cfg(not(feature = "persistence"))]
    let _ = (state, id, error);
}

pub async fn authenticate_request(
    state: &AppState,
    headers: &HeaderMap,
    route: &str,
) -> AppResult<Option<Principal>> {
    if !state.config.auth_enabled || !state.config.access_control.requires_auth(route) {
        return Ok(None);
    }
    match state.config.auth_mode {
        crate::config::AuthMode::Oidc => state
            .oidc
            .as_ref()
            .ok_or(AppError::Unavailable)?
            .verify_headers(headers)
            .await
            .map(Some),
        crate::config::AuthMode::Local => authenticate(headers).map(Some),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn required_access_matches_route_semantics() {
        assert_eq!(
            required_access(&Method::GET, "/system/status"),
            ("admin", "engine.admin")
        );
        assert_eq!(
            required_access(&Method::POST, "/models/demo/load"),
            ("operator", "engine.models.write")
        );
        assert_eq!(
            required_access(&Method::POST, "/models/demo/download"),
            ("operator", "engine.models.write")
        );
        assert_eq!(
            required_access(&Method::POST, "/models/demo/unload"),
            ("operator", "engine.models.write")
        );
        assert_eq!(
            required_access(&Method::POST, "/classify"),
            ("inference", "engine.inference")
        );
        assert_eq!(
            required_access(&Method::GET, "/models"),
            ("inference", "engine.inference")
        );
    }
}
