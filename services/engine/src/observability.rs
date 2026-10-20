// Copyright (c) 2026 Torviello.
use std::sync::OnceLock;

use opentelemetry::propagation::TextMapPropagator;
use opentelemetry_sdk::propagation::TraceContextPropagator;
use prometheus::{Encoder, TextEncoder};
use tracing::info;
use uuid::Uuid;

pub const RETENTION_MAX_AGE_DAYS: u64 = 7;
pub const RETENTION_MAX_SIZE_BYTES: u64 = 104_857_600;

static REGISTRY: OnceLock<prometheus::Registry> = OnceLock::new();

#[must_use]
pub fn correlation_id() -> String {
    Uuid::new_v4().to_string()
}

#[must_use]
pub fn trace_context() -> impl TextMapPropagator {
    TraceContextPropagator::new()
}

pub fn record_startup(version: &str) {
    info!(
        event = "startup",
        version,
        correlation_id = %correlation_id(),
        "engine started"
    );
}

#[must_use]
pub fn redact_secret(value: &str) -> String {
    if value.is_empty() {
        return String::new();
    }
    "[redacted]".to_owned()
}

pub fn metrics_endpoint() -> String {
    let registry = REGISTRY.get_or_init(prometheus::Registry::new);
    let encoder = TextEncoder::new();
    let mut output = Vec::new();
    if encoder.encode(&registry.gather(), &mut output).is_err() {
        return String::new();
    }
    String::from_utf8(output).unwrap_or_default()
}

#[must_use]
pub fn retention_policy() -> (&'static str, u64, u64) {
    (
        "max_age_days",
        RETENTION_MAX_AGE_DAYS,
        RETENTION_MAX_SIZE_BYTES,
    )
}

#[must_use]
pub fn rotate_logs() -> bool {
    RETENTION_MAX_AGE_DAYS > 0 && RETENTION_MAX_SIZE_BYTES > 0
}
