// Copyright (c) 2026 Torviello.
use std::env;
use std::path::Path;

use serde::Deserialize;

use crate::error::{AppError, AppResult};

mod access;

pub use access::{Accelerators, AccessControl, AuthMode};

#[derive(Debug, Clone)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub auth_enabled: bool,
    pub auth_mode: AuthMode,
    pub oidc_issuer: String,
    pub oidc_audience: String,
    pub oidc_jwks_url: String,
    pub oidc_clock_skew_seconds: u64,
    pub max_body_bytes: usize,
    pub max_batch_size: usize,
    pub timeout_ms: u64,
    pub retention_max_age_days: u64,
    pub max_queue_depth: usize,
    pub model_registry: String,
    pub database_url: String,
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
    pub access_control: AccessControl,
}

#[derive(Debug, Default, Deserialize)]
#[serde(default, deny_unknown_fields)]
struct FileConfig {
    schema: Option<String>,
    host: Option<String>,
    port: Option<u16>,
    require_auth: Option<bool>,
    auth_enabled: Option<bool>,
    auth_mode: Option<AuthMode>,
    oidc_issuer: Option<String>,
    oidc_audience: Option<String>,
    oidc_jwks_url: Option<String>,
    oidc_clock_skew_seconds: Option<u64>,
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
    access_control: Option<AccessControl>,
    secrets: Option<toml::Value>,
    model_registry: Option<String>,
    database_url: Option<String>,
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
        let path = env::var("TORCH_CONFIG")
            .unwrap_or_else(|_| "torviello-engine/config/default.toml".to_owned());
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
        let auth_mode = env_parse("TORCH_AUTH_MODE")?
            .or(file.auth_mode)
            .unwrap_or_default();
        let oidc_issuer = env::var("TORCH_OIDC_ISSUER")
            .ok()
            .or(file.oidc_issuer)
            .unwrap_or_default();
        let oidc_audience = env::var("TORCH_OIDC_AUDIENCE")
            .ok()
            .or(file.oidc_audience)
            .unwrap_or_default();
        let oidc_jwks_url = env::var("TORCH_OIDC_JWKS_URL")
            .ok()
            .or(file.oidc_jwks_url)
            .unwrap_or_default();
        let oidc_clock_skew_seconds = env_parse("TORCH_OIDC_CLOCK_SKEW_SECONDS")?
            .or(file.oidc_clock_skew_seconds)
            .unwrap_or(60);
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
            .unwrap_or_else(|| "torviello-engine/config/model-registry.toml".to_owned());
        let database_url = env::var("TORCH_DATABASE_URL")
            .ok()
            .or(file.database_url)
            .unwrap_or_else(|| "sqlite://data/engine.db".to_owned());
        let model_root = env::var("TORCH_MODEL_ROOT")
            .ok()
            .or(file.model_root)
            .unwrap_or_else(|| "torviello-engine/models".to_owned());
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
        let access_control = file.access_control.unwrap_or_default();

        Ok(Self {
            host,
            port,
            auth_enabled,
            auth_mode,
            oidc_issuer,
            oidc_audience,
            oidc_jwks_url,
            oidc_clock_skew_seconds,
            max_body_bytes,
            max_batch_size,
            timeout_ms,
            retention_max_age_days,
            max_queue_depth,
            model_registry,
            database_url,
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
            access_control,
        })
    }

    /// A zero `max_loaded_models` explicitly disables the capacity limit.
    pub fn validate(&self) -> AppResult<()> {
        let oidc = self.auth_mode == AuthMode::Oidc;
        if oidc
            && (self.oidc_issuer.is_empty()
                || !secure_url(&self.oidc_issuer)
                || self.oidc_audience.is_empty()
                || !secure_url(&self.oidc_jwks_url)
                || self.oidc_clock_skew_seconds > 300)
        {
            return Err(AppError::InvalidInput);
        }
        if !oidc
            && (!self.oidc_issuer.is_empty()
                || !self.oidc_audience.is_empty()
                || !self.oidc_jwks_url.is_empty())
        {
            return Err(AppError::InvalidInput);
        }
        if self.auth_mode == AuthMode::Local && !is_loopback_host(&self.host) {
            return Err(AppError::InvalidInput);
        }
        if self.accelerators.metal && !cfg!(all(target_os = "macos", feature = "metal")) {
            return Err(AppError::BackendUnavailable);
        }
        if self.host.is_empty()
            || self.max_body_bytes == 0
            || self.max_batch_size == 0
            || self.max_queue_depth == 0
            || self.timeout_ms == 0
            || self.retention_max_age_days == 0
            || self.model_registry.is_empty()
            || !self.database_url.starts_with("sqlite:")
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
            || self
                .access_control
                .public_routes
                .iter()
                .chain(&self.access_control.private_routes)
                .any(|route| !route.starts_with('/'))
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

fn secure_url(value: &str) -> bool {
    let Ok(url) = reqwest::Url::parse(value) else {
        return false;
    };
    if !url.username().is_empty()
        || url.password().is_some()
        || url.fragment().is_some()
        || url.cannot_be_a_base()
    {
        return false;
    }
    match url.scheme() {
        "https" => url.host_str().is_some_and(|host| !host.is_empty()),
        "http" => url.host_str().is_some_and(is_loopback_host),
        _ => false,
    }
}

fn is_loopback_host(host: &str) -> bool {
    matches!(host, "localhost" | "127.0.0.1" | "::1" | "[::1]")
}

fn validate_against_schema(text: &str, path: &Path) -> AppResult<()> {
    let raw: toml::Value = toml::from_str(text).map_err(|_| AppError::InvalidInput)?;
    let schema_ref = raw
        .get("schema")
        .and_then(toml::Value::as_str)
        .ok_or(AppError::InvalidInput)?;
    // Walk the ancestors of the canonical config path: a relative spelling
    // such as `../../config/default.toml` has ancestors that never reach the
    // directory the schema path is relative to.
    let config_path = path.canonicalize().unwrap_or_else(|_| path.to_path_buf());
    let schema_path = std::iter::once(Path::new(schema_ref).to_path_buf())
        .chain(
            config_path
                .ancestors()
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
        Ok(value) => parse_bool(&value),
        Err(_) => Ok(None),
    }
}

/// The accepted boolean grammar for env overrides; split from `env_bool` so
/// tests can exercise it without mutating process state (`set_var` is not
/// callable from safe code in edition 2024, and the workspace forbids
/// unsafety).
fn parse_bool(value: &str) -> AppResult<Option<bool>> {
    match value {
        "true" => Ok(Some(true)),
        "false" => Ok(Some(false)),
        _ => Err(AppError::InvalidInput),
    }
}

fn env_allowlist(name: &str) -> AppResult<Option<Vec<String>>> {
    match env::var(name) {
        Ok(value) => parse_allowlist(&value),
        Err(_) => Ok(None),
    }
}

/// Comma-separated allowlist parsing; split from `env_allowlist` for the same
/// reason as `parse_bool`.
fn parse_allowlist(value: &str) -> AppResult<Option<Vec<String>>> {
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
        Ok(value) => parse_value(&value).map(Some),
        Err(_) => Ok(None),
    }
}

/// `FromStr` parsing with the config error mapping; split from `env_parse` for
/// the same reason as `parse_bool`.
fn parse_value<T: std::str::FromStr>(value: &str) -> AppResult<T> {
    value.parse().map_err(|_| AppError::InvalidInput)
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
mod tests;
