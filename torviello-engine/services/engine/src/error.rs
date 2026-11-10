// Copyright (c) 2026 Torviello.
use axum::Json;
use axum::http::HeaderValue;
use axum::http::StatusCode;
use axum::http::header::{CONTENT_TYPE, RETRY_AFTER};
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
    #[error("method not allowed")]
    MethodNotAllowed,
    #[error("unsupported media type")]
    UnsupportedMediaType,
    #[error("not implemented")]
    NotImplemented,
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
    #[error("invalid model name")]
    InvalidModelName,
    #[error("invalid model source")]
    InvalidSource,
    #[error("path outside the model root")]
    PathOutsideRoot,
    #[error("model digest mismatch")]
    DigestMismatch,
    #[error("model not found")]
    ModelNotFound,
    #[error("model asset is not ready")]
    ModelNotReady,
    #[error("model is busy")]
    ModelBusy,
    #[error("model capacity exceeded")]
    CapacityExceeded,
    #[error("download already in progress")]
    DownloadInProgress,
    #[error("model backend unavailable")]
    BackendUnavailable,
    #[error("model source unavailable")]
    SourceUnavailable,
    #[error("model artifact too large")]
    ModelTooLarge,
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
            Self::InvalidInput
            | Self::InvalidModelName
            | Self::InvalidSource
            | Self::PathOutsideRoot => 400,
            Self::Unauthorized => 401,
            Self::Forbidden => 403,
            Self::NotFound | Self::ModelNotFound => 404,
            Self::MethodNotAllowed => 405,
            Self::UnsupportedMediaType => 415,
            Self::PayloadTooLarge | Self::ModelTooLarge => 413,
            Self::TooManyRequests { .. } => 429,
            Self::Timeout => 504,
            Self::Unavailable | Self::BackendUnavailable => 503,
            Self::SourceUnavailable => 502,
            Self::NotImplemented => 501,
            Self::Internal => 500,
            Self::DigestMismatch
            | Self::ModelNotReady
            | Self::ModelBusy
            | Self::CapacityExceeded
            | Self::DownloadInProgress => 409,
        }
    }

    #[must_use]
    pub fn code(&self) -> &'static str {
        match self {
            Self::InvalidInput => "invalid_input",
            Self::Unauthorized => "unauthorized",
            Self::Forbidden => "forbidden",
            Self::NotFound => "not_found",
            Self::MethodNotAllowed => "method_not_allowed",
            Self::UnsupportedMediaType => "unsupported_media_type",
            Self::NotImplemented => "not_implemented",
            Self::PayloadTooLarge => "payload_too_large",
            Self::TooManyRequests { .. } => "rate_limited",
            Self::Timeout => "timeout",
            Self::Unavailable => "unavailable",
            Self::Internal => "internal",
            Self::InvalidModelName => "model.invalid_name",
            Self::InvalidSource => "model.invalid_source",
            Self::PathOutsideRoot => "model.path_outside_root",
            Self::DigestMismatch => "model.digest_mismatch",
            Self::ModelNotFound => "model.not_found",
            Self::ModelNotReady => "model.not_ready",
            Self::ModelBusy => "model.busy",
            Self::CapacityExceeded => "model.capacity_exceeded",
            Self::DownloadInProgress => "model.download_in_progress",
            Self::BackendUnavailable => "model.backend_unavailable",
            Self::SourceUnavailable => "model.source_unavailable",
            Self::ModelTooLarge => "model.too_large",
        }
    }

    #[must_use]
    pub fn title(&self) -> &'static str {
        match self {
            Self::InvalidInput => "Invalid input",
            Self::Unauthorized => "Authentication required",
            Self::Forbidden => "Insufficient role",
            Self::NotFound => "Resource not found",
            Self::MethodNotAllowed => "Method not allowed",
            Self::UnsupportedMediaType => "Unsupported media type",
            Self::NotImplemented => "Not implemented",
            Self::PayloadTooLarge => "Payload too large",
            Self::TooManyRequests { .. } => "Rate limit exceeded",
            Self::Timeout => "Request timed out",
            Self::Unavailable => "Service unavailable",
            Self::Internal => "Internal error",
            Self::InvalidModelName => "Invalid model name",
            Self::InvalidSource => "Invalid model source",
            Self::PathOutsideRoot => "Path outside the model root",
            Self::DigestMismatch => "Model digest mismatch",
            Self::ModelNotFound => "Model not found",
            Self::ModelNotReady => "Model asset is not ready",
            Self::ModelBusy => "Model is busy",
            Self::CapacityExceeded => "Model capacity exceeded",
            Self::DownloadInProgress => "Download already in progress",
            Self::BackendUnavailable => "Model backend unavailable",
            Self::SourceUnavailable => "Model source unavailable",
            Self::ModelTooLarge => "Model artifact too large",
        }
    }

    #[must_use]
    pub fn category(&self) -> &'static str {
        match self {
            Self::InvalidInput
            | Self::PayloadTooLarge
            | Self::InvalidModelName
            | Self::InvalidSource
            | Self::PathOutsideRoot
            | Self::ModelTooLarge
            | Self::UnsupportedMediaType => "validation",
            Self::Unauthorized => "authentication",
            Self::Forbidden => "authorization",
            Self::NotFound
            | Self::ModelNotFound
            | Self::MethodNotAllowed
            | Self::NotImplemented => "not_found",
            Self::TooManyRequests { .. } => "limit",
            Self::Timeout | Self::SourceUnavailable => "upstream",
            Self::Unavailable | Self::BackendUnavailable => "unavailable",
            Self::Internal => "internal",
            Self::DigestMismatch
            | Self::ModelNotReady
            | Self::ModelBusy
            | Self::CapacityExceeded
            | Self::DownloadInProgress => "conflict",
        }
    }

    #[must_use]
    pub fn type_uri(&self) -> &'static str {
        match self {
            Self::InvalidInput => "https://torviello.local/problems/invalid-input",
            Self::Unauthorized => "https://torviello.local/problems/unauthorized",
            Self::Forbidden => "https://torviello.local/problems/forbidden",
            Self::NotFound => "https://torviello.local/problems/not-found",
            Self::MethodNotAllowed => "https://torviello.local/problems/method-not-allowed",
            Self::UnsupportedMediaType => "https://torviello.local/problems/unsupported-media-type",
            Self::NotImplemented => "https://torviello.local/problems/not-implemented",
            Self::PayloadTooLarge => "https://torviello.local/problems/payload-too-large",
            Self::TooManyRequests { .. } => "https://torviello.local/problems/rate-limited",
            Self::Timeout => "https://torviello.local/problems/timeout",
            Self::Unavailable => "https://torviello.local/problems/unavailable",
            Self::Internal => "https://torviello.local/problems/internal",
            Self::InvalidModelName => "https://torviello.local/problems/model-invalid-name",
            Self::InvalidSource => "https://torviello.local/problems/model-invalid-source",
            Self::PathOutsideRoot => "https://torviello.local/problems/model-path-outside-root",
            Self::DigestMismatch => "https://torviello.local/problems/model-digest-mismatch",
            Self::ModelNotFound => "https://torviello.local/problems/model-not-found",
            Self::ModelNotReady => "https://torviello.local/problems/model-not-ready",
            Self::ModelBusy => "https://torviello.local/problems/model-busy",
            Self::CapacityExceeded => "https://torviello.local/problems/model-capacity-exceeded",
            Self::DownloadInProgress => {
                "https://torviello.local/problems/model-download-in-progress"
            }
            Self::BackendUnavailable => {
                "https://torviello.local/problems/model-backend-unavailable"
            }
            Self::SourceUnavailable => "https://torviello.local/problems/model-source-unavailable",
            Self::ModelTooLarge => "https://torviello.local/problems/model-too-large",
        }
    }

    #[must_use]
    pub fn retryable(&self) -> bool {
        matches!(
            self,
            Self::TooManyRequests { .. }
                | Self::Timeout
                | Self::Unavailable
                | Self::BackendUnavailable
                | Self::SourceUnavailable
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
        let retry_after = match &self {
            Self::TooManyRequests {
                retry_after_seconds,
            } => Some(*retry_after_seconds),
            _ => None,
        };
        let body = Json(self.envelope(correlation_id()));
        let mut response =
            (status, [(CONTENT_TYPE, "application/problem+json")], body).into_response();
        if let Some(seconds) = retry_after
            && let Ok(value) = HeaderValue::from_str(&seconds.to_string())
        {
            response.headers_mut().insert(RETRY_AFTER, value);
        }
        response
    }
}

#[cfg(test)]
mod tests {
    use axum::http::header::CONTENT_TYPE;
    use axum::response::IntoResponse;

    use super::AppError;

    #[test]
    fn internal_error_is_rfc_9457_problem_details() {
        let response = AppError::Internal.into_response();
        assert_eq!(response.status().as_u16(), 500);
        assert_eq!(response.headers()[CONTENT_TYPE], "application/problem+json");
    }

    #[test]
    fn every_error_maps_to_a_stable_problem_contract() {
        let errors = [
            AppError::InvalidInput,
            AppError::Unauthorized,
            AppError::Forbidden,
            AppError::NotFound,
            AppError::MethodNotAllowed,
            AppError::UnsupportedMediaType,
            AppError::NotImplemented,
            AppError::PayloadTooLarge,
            AppError::TooManyRequests {
                retry_after_seconds: 30,
            },
            AppError::Timeout,
            AppError::Unavailable,
            AppError::Internal,
            AppError::InvalidModelName,
            AppError::InvalidSource,
            AppError::PathOutsideRoot,
            AppError::DigestMismatch,
            AppError::ModelNotFound,
            AppError::ModelNotReady,
            AppError::ModelBusy,
            AppError::CapacityExceeded,
            AppError::DownloadInProgress,
            AppError::BackendUnavailable,
            AppError::SourceUnavailable,
            AppError::ModelTooLarge,
        ];
        for error in errors {
            let envelope = error.envelope("request-1");
            assert_eq!(envelope.status, error.status());
            assert_eq!(envelope.code, error.code());
            assert_eq!(envelope.title, error.title());
            assert_eq!(envelope.category, error.category());
            assert_eq!(envelope.type_uri, error.type_uri());
            assert_eq!(envelope.retryable, error.retryable());
            assert_eq!(envelope.instance, "urn:torviello:request:request-1");
            assert_ne!(envelope.detail, "");
            assert!(!error.into_response().status().is_success());
        }
        let limited = AppError::TooManyRequests {
            retry_after_seconds: 30,
        };
        let envelope = limited.envelope("request-2");
        assert_eq!(envelope.retry_after_ms, Some(30_000));
        assert!(envelope.retryable);
        let response = limited.into_response();
        assert_eq!(response.headers()["retry-after"], "30");
        assert_eq!(AppError::Timeout.envelope("x").retry_after_ms, None);
    }
}
