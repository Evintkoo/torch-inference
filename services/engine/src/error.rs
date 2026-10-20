// Copyright (c) 2026 Torviello.
use axum::Json;
use axum::http::StatusCode;
use axum::http::header::CONTENT_TYPE;
use axum::response::{IntoResponse, Response};
use serde::Serialize;

use crate::observability::correlation_id;

pub type AppResult<T> = Result<T, AppError>;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("invalid input")]
    InvalidInput,
    #[error("authentication required")]
    Unauthorized,
    #[error("insufficient role")]
    Forbidden,
    #[error("not found")]
    NotFound,
    #[error("payload too large")]
    PayloadTooLarge,
    #[error("too many requests")]
    TooManyRequests { retry_after_seconds: u64 },
    #[error("upstream timeout")]
    Timeout,
    #[error("dependency unavailable")]
    Unavailable,
    #[error("internal error")]
    Internal,
}

#[derive(Debug, Serialize)]
pub struct ErrorEnvelope {
    #[serde(rename = "type")]
    pub type_uri: &'static str,
    pub title: &'static str,
    pub status: u16,
    pub code: &'static str,
    pub category: &'static str,
    pub detail: String,
    pub instance: String,
    pub retryable: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub retry_after_ms: Option<u64>,
    pub request_id: String,
}

impl AppError {
    #[must_use]
    pub fn status(&self) -> u16 {
        match self {
            Self::InvalidInput => 400,
            Self::Unauthorized => 401,
            Self::Forbidden => 403,
            Self::NotFound => 404,
            Self::PayloadTooLarge => 413,
            Self::TooManyRequests { .. } => 429,
            Self::Timeout => 504,
            Self::Unavailable => 503,
            Self::Internal => 500,
        }
    }

    #[must_use]
    pub fn code(&self) -> &'static str {
        match self {
            Self::InvalidInput => "invalid_input",
            Self::Unauthorized => "unauthorized",
            Self::Forbidden => "forbidden",
            Self::NotFound => "not_found",
            Self::PayloadTooLarge => "payload_too_large",
            Self::TooManyRequests { .. } => "rate_limited",
            Self::Timeout => "timeout",
            Self::Unavailable => "unavailable",
            Self::Internal => "internal",
        }
    }

    #[must_use]
    pub fn title(&self) -> &'static str {
        match self {
            Self::InvalidInput => "Invalid input",
            Self::Unauthorized => "Authentication required",
            Self::Forbidden => "Insufficient role",
            Self::NotFound => "Resource not found",
            Self::PayloadTooLarge => "Payload too large",
            Self::TooManyRequests { .. } => "Rate limit exceeded",
            Self::Timeout => "Request timed out",
            Self::Unavailable => "Service unavailable",
            Self::Internal => "Internal error",
        }
    }

    #[must_use]
    pub fn category(&self) -> &'static str {
        match self {
            Self::InvalidInput | Self::PayloadTooLarge => "validation",
            Self::Unauthorized => "authentication",
            Self::Forbidden => "authorization",
            Self::NotFound => "not_found",
            Self::TooManyRequests { .. } => "limit",
            Self::Timeout => "upstream",
            Self::Unavailable => "unavailable",
            Self::Internal => "internal",
        }
    }

    #[must_use]
    pub fn type_uri(&self) -> &'static str {
        match self {
            Self::InvalidInput => "https://torviello.local/problems/invalid-input",
            Self::Unauthorized => "https://torviello.local/problems/unauthorized",
            Self::Forbidden => "https://torviello.local/problems/forbidden",
            Self::NotFound => "https://torviello.local/problems/not-found",
            Self::PayloadTooLarge => "https://torviello.local/problems/payload-too-large",
            Self::TooManyRequests { .. } => "https://torviello.local/problems/rate-limited",
            Self::Timeout => "https://torviello.local/problems/timeout",
            Self::Unavailable => "https://torviello.local/problems/unavailable",
            Self::Internal => "https://torviello.local/problems/internal",
        }
    }

    #[must_use]
    pub fn retryable(&self) -> bool {
        matches!(
            self,
            Self::TooManyRequests { .. } | Self::Timeout | Self::Unavailable
        )
    }

    pub fn envelope(&self, request_id: impl Into<String>) -> ErrorEnvelope {
        let retry_after_ms = match self {
            Self::TooManyRequests {
                retry_after_seconds,
            } => Some(retry_after_seconds * 1_000),
            _ => None,
        };
        let request_id = request_id.into();
        ErrorEnvelope {
            type_uri: self.type_uri(),
            title: self.title(),
            status: self.status(),
            code: self.code(),
            category: self.category(),
            detail: self.to_string(),
            instance: format!("urn:torviello:request:{request_id}"),
            retryable: self.retryable(),
            retry_after_ms,
            request_id,
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status =
            StatusCode::from_u16(self.status()).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);
        let body = Json(self.envelope(correlation_id()));
        (status, [(CONTENT_TYPE, "application/problem+json")], body).into_response()
    }
}
