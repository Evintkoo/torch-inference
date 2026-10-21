// Copyright (c) 2026 Torviello.
use std::path::Path;

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::auth::Principal;
use crate::error::{AppError, AppResult};

const MAX_MODEL_ID_BYTES: usize = 128;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelRecord {
    pub id: String,
    pub version: String,
    pub content_hash: String,
    pub source_url: String,
    #[serde(default)]
    pub display_name: Option<String>,
    #[serde(default = "default_task")]
    pub task: String,
    #[serde(default = "default_format")]
    pub format: String,
    #[serde(default)]
    pub size_bytes: u64,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub license: Option<String>,
    #[serde(default)]
    pub backend_requirements: Vec<String>,
    #[serde(default)]
    pub labels: Vec<String>,
    #[serde(default = "default_input_channels")]
    pub input_channels: u32,
    #[serde(default = "default_input_height")]
    pub input_height: u32,
    #[serde(default = "default_input_width")]
    pub input_width: u32,
}

#[derive(Debug, Clone, Default)]
pub struct ModelRegistry {
    models: Vec<ModelRecord>,
}

#[derive(Debug, Clone, Deserialize)]
struct RegistryFile {
    #[serde(default)]
    models: Vec<ModelRecord>,
}

#[derive(Debug, Clone, Serialize)]
pub struct AuditEvent {
    pub action: String,
    pub actor: String,
    pub model_id: String,
}

impl ModelRegistry {
    pub fn from_path(path: &Path) -> AppResult<Self> {
        let text = std::fs::read_to_string(path).map_err(|_| AppError::InvalidInput)?;
        let file: RegistryFile = toml::from_str(&text).map_err(|_| AppError::InvalidInput)?;
        let mut registry = Self::default();
        for record in file.models {
            Self::validate(&record)?;
            if registry.find(&record.id).is_some() {
                return Err(AppError::InvalidInput);
            }
            registry.models.push(record);
        }
        Ok(registry)
    }

    pub fn register(
        &mut self,
        principal: &Principal,
        record: ModelRecord,
    ) -> AppResult<AuditEvent> {
        Self::validate(&record)?;
        if self.find(&record.id).is_some() {
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
        Self::validate(&record)?;
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

    #[must_use]
    pub fn all(&self) -> &[ModelRecord] {
        &self.models
    }

    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.models.is_empty()
    }

    fn validate(record: &ModelRecord) -> AppResult<()> {
        if !valid_model_id(&record.id)
            || record.version.is_empty()
            || record.task.is_empty()
            || record.format.is_empty()
            || !valid_sha256(&record.content_hash)
            || !record.source_url.starts_with("https://")
            || !(1..=4).contains(&record.input_channels)
            || !(1..=4096).contains(&record.input_height)
            || !(1..=4096).contains(&record.input_width)
            || record.labels.len() > 1024
            || record.labels.iter().any(String::is_empty)
        {
            return Err(AppError::InvalidInput);
        }
        if record
            .labels
            .iter()
            .collect::<std::collections::BTreeSet<_>>()
            .len()
            != record.labels.len()
        {
            return Err(AppError::InvalidInput);
        }
        Ok(())
    }
}

fn default_task() -> String {
    "classification".to_owned()
}

fn default_format() -> String {
    "torchscript".to_owned()
}

fn default_input_channels() -> u32 {
    3
}

fn default_input_height() -> u32 {
    32
}

fn default_input_width() -> u32 {
    32
}

pub fn validate_model_id(id: &str) -> AppResult<()> {
    if valid_model_id(id) {
        return Ok(());
    }
    Err(AppError::InvalidModelName)
}

fn valid_model_id(id: &str) -> bool {
    !id.is_empty()
        && id.len() <= MAX_MODEL_ID_BYTES
        && id
            .bytes()
            .next()
            .is_some_and(|byte| byte.is_ascii_alphanumeric())
        && id
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || matches!(byte, b'.' | b'_' | b'-'))
}

fn valid_sha256(value: &str) -> bool {
    value.strip_prefix("sha256:").is_some_and(|digest| {
        digest.len() == 64 && digest.bytes().all(|byte| byte.is_ascii_hexdigit())
    })
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

#[cfg(test)]
mod tests {
    use super::{ModelRegistry, valid_model_id, valid_sha256};

    #[test]
    fn rejects_traversal_and_short_digests() {
        assert!(!valid_model_id("../model"));
        assert!(!valid_model_id("model/name"));
        assert!(valid_model_id("engine-demo-classifier"));
        assert!(!valid_sha256("sha256:abc"));
        assert!(valid_sha256(&format!("sha256:{}", "a".repeat(64))));
    }

    #[test]
    fn empty_registry_has_no_models() {
        assert!(ModelRegistry::default().is_empty());
    }
}
