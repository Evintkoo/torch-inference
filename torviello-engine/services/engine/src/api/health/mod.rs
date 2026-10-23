// Copyright (c) 2026 Torviello.
//! Health, liveness, and readiness probes for ENG-018.
use axum::Json;
use axum::extract::State;
use axum::http::HeaderValue;
use axum::http::StatusCode;
use axum::http::header::RETRY_AFTER;
use axum::response::IntoResponse;
use serde_json::json;

use crate::api::AppState;
use crate::observability::correlation_id;

pub async fn health(State(state): State<AppState>) -> impl IntoResponse {
    let (ready, pending, failed) = readiness_state(&state).await;
    let status = if ready { "ok" } else { "degraded" };
    let mut inference = json!({
        "name": "inference",
        "status": if ready { "ok" } else { "unavailable" },
        "required": true,
    });
    if !ready {
        inference["error_code"] = json!("NO_LOADED_MODEL");
    }
    let body = json!({
        "status": status,
        "uptime_ms": uptime_ms(&state),
        "version": env!("CARGO_PKG_VERSION"),
        "subsystems": [
            {"name": "configuration", "status": "ok", "required": true},
            {"name": "catalog", "status": "ok", "required": true},
            inference
        ],
        "pending": pending,
        "failed": failed,
        "request_id": correlation_id(),
    });
    (StatusCode::OK, Json(body))
}

pub async fn liveness() -> impl IntoResponse {
    (StatusCode::OK, Json(json!({"status": "alive"})))
}

pub async fn readiness(State(state): State<AppState>) -> impl IntoResponse {
    let (ready, pending, failed) = readiness_state(&state).await;
    let status = if ready {
        StatusCode::OK
    } else {
        StatusCode::SERVICE_UNAVAILABLE
    };
    let body = json!({
        "ready": ready,
        "pending": pending,
        "failed": failed,
        "backend": state.models.loaded_backend().unwrap_or_else(|| "none".to_owned()),
        "loaded_models": state.models.loaded_models(),
        "request_id": correlation_id(),
    });
    let mut response = (status, Json(body)).into_response();
    if !ready {
        response
            .headers_mut()
            .insert(RETRY_AFTER, HeaderValue::from_static("5"));
    }
    response
}

async fn readiness_state(state: &AppState) -> (bool, Vec<&'static str>, Vec<&'static str>) {
    if state.config.validate().is_err() {
        return (false, Vec::new(), vec!["configuration"]);
    }
    #[cfg(feature = "persistence")]
    if let Some(audit) = &state.audit
        && audit.ping().await.is_err()
    {
        return (false, Vec::new(), vec!["audit_store"]);
    }
    if state.registry.is_empty() {
        return (false, vec!["model_catalog"], Vec::new());
    }
    if state.models.loaded_models() > 0 {
        return (true, Vec::new(), Vec::new());
    }
    let has_asset = state
        .registry
        .all()
        .iter()
        .any(|record| state.assets.is_ready(&record.id));
    if has_asset {
        (false, vec!["model_load"], Vec::new())
    } else {
        (false, vec!["model_assets"], Vec::new())
    }
}

fn uptime_ms(state: &AppState) -> u64 {
    u64::try_from(state.started.elapsed().as_millis()).unwrap_or(u64::MAX)
}
