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
    use super::{
        ModelRecord, ModelRegistry, activation_requires_checksum, download_url, sha256_hex,
        valid_model_id, valid_sha256, validate_model_id, verify_integrity,
    };
    use crate::auth::Principal;
    use crate::error::AppError;
    use std::path::Path;

    fn principal() -> Principal {
        Principal {
            subject: "subject".to_owned(),
            roles: vec!["admin".to_owned()],
            scopes: Vec::new(),
            actor: "operator".to_owned(),
            org_id: None,
            jti: None,
        }
    }

    fn record(id: &str) -> ModelRecord {
        ModelRecord {
            id: id.to_owned(),
            version: "1.0.0".to_owned(),
            content_hash: format!("sha256:{}", "a".repeat(64)),
            source_url: "https://models.example/model.pt".to_owned(),
            display_name: None,
            task: "classification".to_owned(),
            format: "torchscript".to_owned(),
            size_bytes: 1,
            description: None,
            license: None,
            backend_requirements: Vec::new(),
            labels: vec!["demo".to_owned()],
            input_channels: 3,
            input_height: 224,
            input_width: 224,
        }
    }

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

    #[test]
    fn registry_crud_emits_audit_events() {
        let mut registry = ModelRegistry::default();
        let created = registry
            .register(&principal(), record("demo"))
            .expect("register");
        assert_eq!(created.action, "register");
        assert_eq!(created.actor, "operator");
        assert_eq!(registry.all().len(), 1);
        assert_eq!(registry.find("demo").expect("found").version, "1.0.0");

        let mut updated = record("demo");
        updated.version = "2.0.0".to_owned();
        let event = registry.update(&principal(), updated).expect("update");
        assert_eq!(event.action, "update");
        assert_eq!(registry.find("demo").expect("found").version, "2.0.0");

        let event = registry.delete(&principal(), "demo").expect("delete");
        assert_eq!(event.action, "delete");
        assert!(registry.is_empty());
    }

    #[test]
    fn registry_rejects_duplicates_and_missing_records() {
        let mut registry = ModelRegistry::default();
        registry
            .register(&principal(), record("demo"))
            .expect("register");
        assert!(matches!(
            registry.register(&principal(), record("demo")),
            Err(AppError::InvalidInput)
        ));
        assert!(matches!(
            registry.update(&principal(), record("missing")),
            Err(AppError::NotFound)
        ));
        assert!(matches!(
            registry.delete(&principal(), "missing"),
            Err(AppError::NotFound)
        ));
    }

    #[test]
    fn registry_validation_covers_bounds_and_duplicates() {
        let mut registry = ModelRegistry::default();

        let mut invalid = record("demo");
        invalid.content_hash = "sha256:short".to_owned();
        assert!(matches!(
            registry.register(&principal(), invalid),
            Err(AppError::InvalidInput)
        ));

        let mut invalid = record("demo");
        invalid.input_channels = 0;
        assert!(matches!(
            registry.register(&principal(), invalid),
            Err(AppError::InvalidInput)
        ));

        let mut invalid = record("demo");
        invalid.input_height = 0;
        assert!(matches!(
            registry.register(&principal(), invalid),
            Err(AppError::InvalidInput)
        ));

        let mut invalid = record("demo");
        invalid.input_width = 4097;
        assert!(matches!(
            registry.register(&principal(), invalid),
            Err(AppError::InvalidInput)
        ));

        let mut invalid = record("demo");
        invalid.labels = vec!["demo".to_owned(), "demo".to_owned()];
        assert!(matches!(
            registry.register(&principal(), invalid),
            Err(AppError::InvalidInput)
        ));

        let mut invalid = record("demo");
        invalid.labels = vec![String::new()];
        assert!(matches!(
            registry.register(&principal(), invalid),
            Err(AppError::InvalidInput)
        ));

        let mut invalid = record("demo");
        invalid.labels = (0..1025).map(|index| format!("l{index}")).collect();
        assert!(matches!(
            registry.register(&principal(), invalid),
            Err(AppError::InvalidInput)
        ));

        let mut invalid = record("demo");
        invalid.source_url = "http://models.example/model.pt".to_owned();
        assert!(matches!(
            registry.register(&principal(), invalid),
            Err(AppError::InvalidInput)
        ));
    }

    #[test]
    fn registry_file_loads_defaults_and_rejects_duplicates() {
        let root = std::env::temp_dir().join(format!("torviello-model-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&root).expect("temp");
        let path = root.join("registry.toml");
        std::fs::write(
            &path,
            format!(
                r#"
[[models]]
id = "demo"
version = "1.0.0"
content_hash = "sha256:{}"
source_url = "https://models.example/model.pt"
"#,
                "a".repeat(64)
            ),
        )
        .expect("write");
        let registry = ModelRegistry::from_path(&path).expect("load");
        let model = registry.find("demo").expect("model");
        assert_eq!(model.task, "classification");
        assert_eq!(model.format, "torchscript");
        assert_eq!(model.input_channels, 3);
        assert_eq!(model.input_height, 32);
        assert_eq!(model.input_width, 32);

        std::fs::write(
            &path,
            format!(
                r#"
[[models]]
id = "demo"
version = "1.0.0"
content_hash = "sha256:{digest}"
source_url = "https://models.example/model.pt"

[[models]]
id = "demo"
version = "2.0.0"
content_hash = "sha256:{digest}"
source_url = "https://models.example/model.pt"
"#,
                digest = "a".repeat(64)
            ),
        )
        .expect("write");
        assert!(matches!(
            ModelRegistry::from_path(&path),
            Err(AppError::InvalidInput)
        ));
        std::fs::remove_dir_all(root).expect("cleanup");
    }

    #[test]
    fn registry_missing_or_malformed_files_fail() {
        assert!(matches!(
            ModelRegistry::from_path(Path::new("/does/not/exist.toml")),
            Err(AppError::InvalidInput)
        ));
        let root = std::env::temp_dir().join(format!("torviello-model-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&root).expect("temp");
        let path = root.join("registry.toml");
        std::fs::write(&path, "not = [valid").expect("write");
        assert!(matches!(
            ModelRegistry::from_path(&path),
            Err(AppError::InvalidInput)
        ));
        std::fs::remove_dir_all(root).expect("cleanup");
    }

    #[test]
    fn model_ids_uuids_and_integrity_are_bounded() {
        assert!(validate_model_id("demo-1").is_ok());
        assert!(matches!(
            validate_model_id(""),
            Err(AppError::InvalidModelName)
        ));
        assert!(matches!(
            validate_model_id(&"a".repeat(129)),
            Err(AppError::InvalidModelName)
        ));
        assert!(matches!(
            validate_model_id("-demo"),
            Err(AppError::InvalidModelName)
        ));
        assert!(download_url("https://models.example/a.pt").is_ok());
        assert!(matches!(
            download_url("http://models.example/a.pt"),
            Err(AppError::InvalidInput)
        ));
        let digest = sha256_hex(b"model");
        verify_integrity(&digest, b"model").expect("match");
        assert!(matches!(
            verify_integrity(&digest, b"other"),
            Err(AppError::Forbidden)
        ));
        assert!(activation_requires_checksum(&record("demo")));
        let mut unsigned = record("demo");
        unsigned.content_hash = "sumhash:abc".to_owned();
        assert!(!activation_requires_checksum(&unsigned));
    }
}
