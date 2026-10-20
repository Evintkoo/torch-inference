// Copyright (c) 2026 Torviello.
use std::env;
use std::path::Path;

use serde::Deserialize;

use crate::error::{AppError, AppResult};

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
    accelerators: Option<toml::Value>,
    secrets: Option<toml::Value>,
}

impl Config {
    /// Load typed TOML, then overlay namespaced environment variables. Secret
    /// values are injected from the environment only.
    pub fn load() -> AppResult<Self> {
        let path = env::var("TORCH_CONFIG").unwrap_or_else(|_| "config/default.toml".to_owned());
        let path_ref = Path::new(&path);
        let file = if path_ref.exists() {
            let text = std::fs::read_to_string(path_ref).map_err(|_| AppError::InvalidInput)?;
            toml::from_str::<FileConfig>(&text).map_err(|_| AppError::InvalidInput)?
        } else if env::var("TORCH_CONFIG").is_ok() {
            return Err(AppError::InvalidInput);
        } else {
            FileConfig::default()
        };

        let host = env::var("TORCH_HOST")
            .ok()
            .or(file.host)
            .unwrap_or_else(|| "127.0.0.1".to_owned());
        let auth_enabled = env_bool("TORCH_AUTH_ENABLED")?
            .or(file.auth_enabled)
            .unwrap_or(true);
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

        Ok(Self {
            host,
            port,
            auth_enabled,
            max_body_bytes,
            max_batch_size,
            timeout_ms,
            retention_max_age_days,
            max_queue_depth,
        })
    }

    pub fn validate(&self) -> AppResult<()> {
        if self.host.is_empty()
            || self.max_body_bytes == 0
            || self.max_batch_size == 0
            || self.max_queue_depth == 0
            || self.timeout_ms == 0
            || self.retention_max_age_days == 0
        {
            return Err(AppError::InvalidInput);
        }
        Ok(())
    }

    #[must_use]
    pub fn bind_address(&self) -> String {
        format!("{}:{}", self.host, self.port)
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
    use super::Config;

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
        };
        assert!(config.validate().is_err());
    }
}
