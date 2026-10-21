// Copyright (c) 2026 Torviello.
//! Acquisition request, job, and progress shapes.
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DownloadState {
    Queued,
    Downloading,
    Verifying,
    Extracting,
    Ready,
    Failed,
    Cancelled,
}

impl DownloadState {
    #[must_use]
    pub fn is_terminal(self) -> bool {
        matches!(self, Self::Ready | Self::Failed | Self::Cancelled)
    }

    #[must_use]
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Queued => "queued",
            Self::Downloading => "downloading",
            Self::Verifying => "verifying",
            Self::Extracting => "extracting",
            Self::Ready => "ready",
            Self::Failed => "failed",
            Self::Cancelled => "cancelled",
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct DownloadJob {
    pub task_id: String,
    pub model_id: String,
    pub state: DownloadState,
    pub bytes_transferred: u64,
    pub bytes_total: u64,
    pub percent: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_code: Option<&'static str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub safe_message: Option<&'static str>,
    pub started_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub finished_at: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct DownloadProgressEvent {
    pub event_type: &'static str,
    pub event_id: String,
    pub occurred_at: String,
    pub task_id: String,
    pub model_id: String,
    pub state: DownloadState,
    pub bytes_transferred: u64,
    pub bytes_total: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_code: Option<&'static str>,
}

#[derive(Debug, Deserialize)]
pub struct DownloadRequest {
    pub source: SourceRequest,
    #[serde(default)]
    pub expected_digest: Option<ExpectedDigest>,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "scheme", rename_all = "snake_case")]
pub enum SourceRequest {
    Local {
        path: String,
    },
    Https {
        url: String,
    },
    Huggingface {
        #[serde(default)]
        repository: String,
        #[serde(default)]
        revision: String,
    },
}

#[derive(Debug, Deserialize)]
pub struct ExpectedDigest {
    pub algorithm: String,
    pub value: String,
}

pub(crate) enum Source {
    Local(String),
    Https(String),
}
