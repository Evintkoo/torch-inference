// Copyright (c) 2026 Torviello.
//! Prometheus exposition for ENG-018.
use axum::response::IntoResponse;

use crate::observability::metrics_endpoint;

pub async fn metrics_handler() -> impl IntoResponse {
    metrics_endpoint()
}
