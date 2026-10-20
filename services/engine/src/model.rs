// Copyright (c) 2026 Torviello.
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::auth::Principal;
use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelRecord {
    pub id: String,
    pub version: String,
    pub content_hash: String,
    pub source_url: String,
}

#[derive(Debug, Default)]
pub struct ModelRegistry {
    models: Vec<ModelRecord>,
}

#[derive(Debug, Clone, Serialize)]
pub struct AuditEvent {
    pub action: String,
    pub actor: String,
    pub model_id: String,
}

impl ModelRegistry {
    pub fn register(
        &mut self,
        principal: &Principal,
        record: ModelRecord,
    ) -> AppResult<AuditEvent> {
        if !record.source_url.starts_with("https://") {
            return Err(AppError::InvalidInput);
        }
        self.models.push(record.clone());
        Ok(AuditEvent {
            action: "register".to_owned(),
            actor: principal.actor.clone(),
            model_id: record.id,
        })
    }

    pub fn update(&mut self, principal: &Principal, record: ModelRecord) -> AppResult<AuditEvent> {
        let Some(existing) = self.models.iter_mut().find(|item| item.id == record.id) else {
            return Err(AppError::NotFound);
        };
        *existing = record.clone();
        Ok(AuditEvent {
            action: "update".to_owned(),
            actor: principal.actor.clone(),
            model_id: record.id,
        })
    }

    pub fn delete(&mut self, principal: &Principal, id: &str) -> AppResult<AuditEvent> {
        let before = self.models.len();
        self.models.retain(|item| item.id != id);
        if self.models.len() == before {
            return Err(AppError::NotFound);
        }
        Ok(AuditEvent {
            action: "delete".to_owned(),
            actor: principal.actor.clone(),
            model_id: id.to_owned(),
        })
    }

    #[must_use]
    pub fn find(&self, id: &str) -> Option<&ModelRecord> {
        self.models.iter().find(|item| item.id == id)
    }
}

#[must_use]
pub fn sha256_hex(bytes: &[u8]) -> String {
    let digest = Sha256::digest(bytes);
    format!("sha256:{digest:x}")
}

pub fn verify_integrity(expected: &str, bytes: &[u8]) -> AppResult<()> {
    if expected != sha256_hex(bytes) {
        return Err(AppError::Forbidden);
    }
    Ok(())
}

pub fn download_url(url: &str) -> AppResult<&str> {
    if url.starts_with("https://") {
        return Ok(url);
    }
    Err(AppError::InvalidInput)
}

#[must_use]
pub fn activation_requires_checksum(record: &ModelRecord) -> bool {
    record.content_hash.starts_with("sha256:")
}
