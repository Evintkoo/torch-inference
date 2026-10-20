// Copyright (c) 2026 Torviello.
//! Torviello Engine runtime. Implements ENG-001 through ENG-026.
//! Delivery traceability: ED-001, ED-004, ED-012, and ED-020.

pub mod api;
pub mod auth;
pub mod config;
pub mod domain;
pub mod error;
pub mod model;
pub mod observability;
pub mod persistence;
pub mod resilience;
pub mod security;

pub use error::{AppError, AppResult, ErrorEnvelope};

/// Build the HTTP surface. Every registered path is declared in
/// `torviello-engine/contracts/openapi.yaml`.
pub fn router() -> axum::Router<api::AppState> {
    api::router()
}
