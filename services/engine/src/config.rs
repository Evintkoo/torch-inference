// Copyright (c) 2026 Torviello.
use std::collections::BTreeMap;
use std::env;
use std::path::Path;

use serde::Deserialize;

use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Default, Deserialize)]
#[serde(default, deny_unknown_fields)]
#[allow(clippy::struct_excessive_bools)]
pub struct Accelerators {
    pub cuda: bool,
    pub metal: bool,
    pub vulkan: bool,
    pub rocm: bool,
    pub coreml: bool,
    pub directml: bool,
}

impl Accelerators {
    #[must_use]
    pub fn selected(&self) -> Option<&'static str> {
        [
            ("cuda", self.cuda),
            ("metal", self.metal),
            ("vulkan", self.vulkan),
            ("rocm", self.rocm),
            ("coreml", self.coreml),
            ("directml", self.directml),
        ]
        .into_iter()
        .find_map(|(name, enabled)| enabled.then_some(name))
    }

    #[must_use]
    pub fn as_map(&self) -> BTreeMap<&'static str, bool> {
        BTreeMap::from([
            ("cuda", self.cuda),
            ("metal", self.metal),
            ("vulkan", self.vulkan),
            ("rocm", self.rocm),
            ("coreml", self.coreml),
            ("directml", self.directml),
        ])
    }
}

#[derive(Debug, Clone)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub auth_enabled: bool,
    pub max_body_bytes: usize,
    pub max_batch_size: usize,
    pub timeout_ms: u64,
    pub retention_max_age_days: u64,
    pub max_queue_depth: usize,
    pub model_registry: String,
    pub model_root: String,
    pub max_model_bytes: u64,
    pub max_loaded_models: usize,
    pub download_concurrency: usize,
    pub download_timeout_ms: u64,
    pub model_source_allowlist: Vec<String>,
    pub max_frame_bytes: usize,
    pub shutdown_timeout_ms: u64,
    pub max_size_bytes: u64,
    pub rate_limit_per_minute: u32,
    pub decompression_max_expansion_bytes: u64,
    pub tls_min_version: String,
    pub cors_allowed_origin: String,
    pub accelerator_fallback: String,
    pub accelerators: Accelerators,
}

#[derive(Debug, Default, Deserialize)]
#[serde(default, deny_unknown_fields)]
struct FileConfig {
    schema: Option<String>,
    host: Option<String>,
    port: Option<u16>,
    require_auth: Option<bool>,
    auth_enabled: Option<bool>,
    max_body_bytes: Option<usize>,
    max_frame_bytes: Option<usize>,
    max_batch_size: Option<usize>,
    max_queue_depth: Option<usize>,
    timeout_ms: Option<u64>,
    shutdown_timeout_ms: Option<u64>,
    retention_max_age_days: Option<u64>,
    max_size_bytes: Option<u64>,
    rate_limit_per_minute: Option<u32>,
    decompression_max_expansion_bytes: Option<u64>,
    tls_min_version: Option<String>,
    cors_allowed_origin: Option<String>,
    accelerator_fallback: Option<String>,
    accelerators: Option<Accelerators>,
    secrets: Option<toml::Value>,
    model_registry: Option<String>,
    model_root: Option<String>,
    max_model_bytes: Option<u64>,
    max_loaded_models: Option<usize>,
    download_concurrency: Option<usize>,
    download_timeout_ms: Option<u64>,
    model_source_allowlist: Option<Vec<String>>,
}

impl Config {
    /// Load typed TOML, then overlay namespaced environment variables. Secret
    /// values are injected from the environment only.
    pub fn load() -> AppResult<Self> {
        let path = env::var("TORCH_CONFIG").unwrap_or_else(|_| "config/default.toml".to_owned());
        let path_ref = Path::new(&path);
        if path_ref.exists() {
            return Self::from_path(path_ref);
        }
        if env::var("TORCH_CONFIG").is_ok() {
            return Err(AppError::InvalidInput);
        }
        Self::assemble(FileConfig::default())
    }

    /// Load and schema-validate a configuration file, then apply environment
    /// overrides. Schema validation runs before any value is accepted.
    pub fn from_path(path: &Path) -> AppResult<Self> {
        let text = std::fs::read_to_string(path).map_err(|_| AppError::InvalidInput)?;
        validate_against_schema(&text, path)?;
        let file = toml::from_str::<FileConfig>(&text).map_err(|_| AppError::InvalidInput)?;
        Self::assemble(file)
    }

    #[allow(clippy::too_many_lines)]
    fn assemble(file: FileConfig) -> AppResult<Self> {
        let host = env::var("TORCH_HOST")
            .ok()
            .or(file.host)
            .unwrap_or_else(|| "127.0.0.1".to_owned());
        if file.require_auth == Some(false) || file.auth_enabled == Some(false) {
            return Err(AppError::InvalidInput);
        }
        if env_bool("TORCH_AUTH_ENABLED")? == Some(false) {
            return Err(AppError::InvalidInput);
        }
        let auth_enabled = true;
        let port = env_parse("TORCH_PORT")?.or(file.port).unwrap_or(8000);
        let max_body_bytes = env_parse("INFERENCE_MAX_BODY_BYTES")?
            .or(file.max_body_bytes)
            .unwrap_or(1_048_576);
        let max_batch_size = env_parse("INFERENCE_MAX_BATCH_SIZE")?
            .or(file.max_batch_size)
            .unwrap_or(8);
        let max_queue_depth = env_parse("INFERENCE_MAX_QUEUE_DEPTH")?
            .or(file.max_queue_depth)
            .unwrap_or(32);
        let timeout_ms = env_parse("INFERENCE_TIMEOUT_MS")?
            .or(file.timeout_ms)
            .unwrap_or(30_000);
        let retention_max_age_days = env_parse("INFERENCE_RETENTION_MAX_AGE_DAYS")?
            .or(file.retention_max_age_days)
            .unwrap_or(7);
        let model_registry = env::var("TORCH_MODEL_REGISTRY")
            .ok()
            .or(file.model_registry)
            .unwrap_or_else(|| "config/model-registry.toml".to_owned());
        let model_root = env::var("TORCH_MODEL_ROOT")
            .ok()
            .or(file.model_root)
            .unwrap_or_else(|| "models".to_owned());
        let max_model_bytes = env_parse("TORCH_MAX_MODEL_BYTES")?
            .or(file.max_model_bytes)
            .unwrap_or(1_073_741_824);
        let max_loaded_models = env_parse("TORCH_MAX_LOADED_MODELS")?
            .or(file.max_loaded_models)
            .unwrap_or(2);
        let download_concurrency = env_parse("TORCH_DOWNLOAD_CONCURRENCY")?
            .or(file.download_concurrency)
            .unwrap_or(2);
        let download_timeout_ms = env_parse("TORCH_DOWNLOAD_TIMEOUT_MS")?
            .or(file.download_timeout_ms)
            .unwrap_or(300_000);
        let model_source_allowlist = env_allowlist("TORCH_MODEL_SOURCE_ALLOWLIST")?
            .or(file.model_source_allowlist)
            .unwrap_or_else(default_allowlist);
        let max_frame_bytes = env_parse("TORCH_MAX_FRAME_BYTES")?
            .or(file.max_frame_bytes)
            .unwrap_or(262_144);
        let shutdown_timeout_ms = env_parse("TORCH_SHUTDOWN_TIMEOUT_MS")?
            .or(file.shutdown_timeout_ms)
            .unwrap_or(15_000);
        let max_size_bytes = env_parse("TORCH_MAX_SIZE_BYTES")?
            .or(file.max_size_bytes)
            .unwrap_or(104_857_600);
        let rate_limit_per_minute = env_parse("TORCH_RATE_LIMIT_PER_MINUTE")?
            .or(file.rate_limit_per_minute)
            .unwrap_or(120);
        let decompression_max_expansion_bytes =
            env_parse("TORCH_DECOMPRESSION_MAX_EXPANSION_BYTES")?
                .or(file.decompression_max_expansion_bytes)
                .unwrap_or(4_194_304);
        let tls_min_version = env::var("TORCH_TLS_MIN_VERSION")
            .ok()
            .or(file.tls_min_version)
            .unwrap_or_else(|| "1.3".to_owned());
        let cors_allowed_origin = env::var("TORCH_CORS_ALLOWED_ORIGIN")
            .ok()
            .or(file.cors_allowed_origin)
            .unwrap_or_else(|| "https://console.torviello.local".to_owned());
        let accelerator_fallback = env::var("TORCH_ACCELERATOR_FALLBACK")
            .ok()
            .or(file.accelerator_fallback)
            .unwrap_or_else(|| "cpu".to_owned());
        let accelerators = file.accelerators.unwrap_or_default();

        Ok(Self {
            host,
            port,
            auth_enabled,
            max_body_bytes,
            max_batch_size,
            timeout_ms,
            retention_max_age_days,
            max_queue_depth,
            model_registry,
            model_root,
            max_model_bytes,
            max_loaded_models,
            download_concurrency,
            download_timeout_ms,
            model_source_allowlist,
            max_frame_bytes,
            shutdown_timeout_ms,
            max_size_bytes,
            rate_limit_per_minute,
            decompression_max_expansion_bytes,
            tls_min_version,
            cors_allowed_origin,
            accelerator_fallback,
            accelerators,
        })
    }

    /// A zero `max_loaded_models` explicitly disables the capacity limit.
    pub fn validate(&self) -> AppResult<()> {
        if self.host.is_empty()
            || self.max_body_bytes == 0
            || self.max_batch_size == 0
            || self.max_queue_depth == 0
            || self.timeout_ms == 0
            || self.retention_max_age_days == 0
            || self.model_registry.is_empty()
            || self.model_root.is_empty()
            || self.max_model_bytes == 0
            || self.download_concurrency == 0
            || self.download_timeout_ms == 0
            || self.model_source_allowlist.is_empty()
            || self
                .model_source_allowlist
                .iter()
                .any(|host| host.is_empty() || host.contains('/'))
            || self.max_frame_bytes == 0
            || self.shutdown_timeout_ms == 0
            || self.max_size_bytes == 0
            || self.rate_limit_per_minute == 0
            || self.decompression_max_expansion_bytes == 0
            || self.tls_min_version != "1.3"
            || self.cors_allowed_origin.is_empty()
            || self.accelerator_fallback != "cpu"
        {
            return Err(AppError::InvalidInput);
        }
        let compiled = crate::domain::compiled_backends();
        for (name, enabled) in self.accelerators.as_map() {
            if enabled && !compiled.contains(&name) {
                return Err(AppError::BackendUnavailable);
            }
        }
        Ok(())
    }

    #[must_use]
    pub fn selected_backend(&self) -> &'static str {
        self.accelerators.selected().unwrap_or("cpu")
    }

    #[must_use]
    pub fn bind_address(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }
}

fn validate_against_schema(text: &str, path: &Path) -> AppResult<()> {
    let raw: toml::Value = toml::from_str(text).map_err(|_| AppError::InvalidInput)?;
    let schema_ref = raw
        .get("schema")
        .and_then(toml::Value::as_str)
        .ok_or(AppError::InvalidInput)?;
    let schema_path = std::iter::once(Path::new(schema_ref).to_path_buf())
        .chain(
            path.ancestors()
                .skip(1)
                .map(|ancestor| ancestor.join(schema_ref)),
        )
        .find(|candidate| candidate.exists())
        .ok_or(AppError::InvalidInput)?;
    let schema_text = std::fs::read_to_string(&schema_path).map_err(|_| AppError::InvalidInput)?;
    let schema: serde_json::Value =
        serde_json::from_str(&schema_text).map_err(|_| AppError::InvalidInput)?;
    let instance = serde_json::to_value(&raw).map_err(|_| AppError::InvalidInput)?;
    let validator = jsonschema::validator_for(&schema).map_err(|_| AppError::InvalidInput)?;
    if validator.is_valid(&instance) {
        Ok(())
    } else {
        Err(AppError::InvalidInput)
    }
}

fn env_bool(name: &str) -> AppResult<Option<bool>> {
    match env::var(name) {
        Ok(value) if value == "true" => Ok(Some(true)),
        Ok(value) if value == "false" => Ok(Some(false)),
        Ok(_) => Err(AppError::InvalidInput),
        Err(_) => Ok(None),
    }
}

fn env_allowlist(name: &str) -> AppResult<Option<Vec<String>>> {
    match env::var(name) {
        Ok(value) => {
            let hosts: Vec<String> = value
                .split(',')
                .map(str::trim)
                .filter(|entry| !entry.is_empty())
                .map(str::to_owned)
                .collect();
            if hosts.is_empty() {
                return Err(AppError::InvalidInput);
            }
            Ok(Some(hosts))
        }
        Err(_) => Ok(None),
    }
}

fn default_allowlist() -> Vec<String> {
    vec![
        "huggingface.co".to_owned(),
        "cdn-lfs.huggingface.co".to_owned(),
        "models.torviello.local".to_owned(),
    ]
}

fn env_parse<T>(name: &str) -> AppResult<Option<T>>
where
    T: std::str::FromStr,
{
    match env::var(name) {
        Ok(value) => value.parse().map(Some).map_err(|_| AppError::InvalidInput),
        Err(_) => Ok(None),
    }
}

pub fn reload_config() -> AppResult<Config> {
    let next = Config::load()?;
    next.validate()?;
    Ok(next)
}

pub fn install_sighup_handler() -> AppResult<()> {
    // Reload remains supervisor-driven until the engine owns a running state.
    Ok(())
}

pub fn watch_config() -> AppResult<()> {
    reload_config().map(|_| ())
}

#[cfg(test)]
mod tests {
    use super::{Accelerators, Config};

    #[test]
    fn rejects_empty_limits() {
        let config = Config {
            host: String::new(),
            port: 0,
            auth_enabled: true,
            max_body_bytes: 0,
            max_batch_size: 0,
            timeout_ms: 0,
            retention_max_age_days: 0,
            max_queue_depth: 0,
            model_registry: String::new(),
            model_root: String::new(),
            max_model_bytes: 0,
            max_loaded_models: 0,
            download_concurrency: 0,
            download_timeout_ms: 0,
            model_source_allowlist: Vec::new(),
            max_frame_bytes: 0,
            shutdown_timeout_ms: 0,
            max_size_bytes: 0,
            rate_limit_per_minute: 0,
            decompression_max_expansion_bytes: 0,
            tls_min_version: String::new(),
            cors_allowed_origin: String::new(),
            accelerator_fallback: String::new(),
            accelerators: Accelerators::default(),
        };
        assert!(config.validate().is_err());
    }
}
