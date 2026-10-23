// Copyright (c) 2026 Torviello.
//! Response shapes shared by the HTTP handlers.
use serde::Serialize;

use crate::model::ModelRecord;
use crate::observability::correlation_id;

#[derive(Debug, Serialize)]
pub struct Envelope<T> {
    pub data: T,
    pub meta: Meta,
}

#[derive(Debug, Serialize)]
pub struct Meta {
    pub latency_ms: u64,
    pub model_id: String,
    pub backend: String,
    pub postprocessing_applied: bool,
    pub postprocess_steps: Vec<String>,
    pub warnings: Vec<String>,
    pub version: String,
    pub request_id: String,
}

#[derive(Debug, Serialize)]
pub struct ModelSummary {
    pub model_id: String,
    pub display_name: String,
    pub task: String,
    pub format: String,
    pub catalog_present: bool,
    pub locally_available: bool,
    pub download_state: String,
    pub load_state: String,
    pub size_bytes: u64,
}

#[derive(Debug, Serialize)]
pub struct ModelDetail {
    #[serde(flatten)]
    pub summary: ModelSummary,
    pub description: String,
    pub version: String,
    pub backend_requirements: Vec<String>,
    pub asset_digest: String,
    pub provenance: Provenance,
}

#[derive(Debug, Serialize)]
pub struct Provenance {
    pub source_scheme: String,
    pub license: String,
}

pub fn envelope<T>(data: T, model_id: &str, backend: &str, warnings: Vec<String>) -> Envelope<T> {
    Envelope {
        data,
        meta: Meta {
            latency_ms: 0,
            model_id: model_id.to_owned(),
            backend: backend.to_owned(),
            postprocessing_applied: false,
            postprocess_steps: Vec::new(),
            warnings,
            version: env!("CARGO_PKG_VERSION").to_owned(),
            request_id: correlation_id(),
        },
    }
}

impl ModelSummary {
    #[must_use]
    pub fn from_record(
        record: &ModelRecord,
        locally_available: bool,
        download_state: &str,
        load_state: &str,
    ) -> Self {
        Self {
            model_id: record.id.clone(),
            display_name: record
                .display_name
                .clone()
                .unwrap_or_else(|| record.id.clone()),
            task: record.task.clone(),
            format: record.format.clone(),
            catalog_present: true,
            locally_available,
            download_state: download_state.to_owned(),
            load_state: load_state.to_owned(),
            size_bytes: record.size_bytes,
        }
    }
}

impl ModelDetail {
    #[must_use]
    pub fn from_record(record: &ModelRecord, summary: ModelSummary) -> Self {
        Self {
            summary,
            description: record.description.clone().unwrap_or_default(),
            version: record.version.clone(),
            backend_requirements: record.backend_requirements.clone(),
            asset_digest: record.content_hash.clone(),
            provenance: Provenance {
                source_scheme: "https".to_owned(),
                license: record
                    .license
                    .clone()
                    .unwrap_or_else(|| "unknown".to_owned()),
            },
        }
    }
}
