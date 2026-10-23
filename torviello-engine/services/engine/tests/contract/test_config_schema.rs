// Copyright (c) 2026 Torviello.
use std::path::{Path, PathBuf};

use torviello_engine::config::{AccessControl, Config};

fn schema_path() -> PathBuf {
    std::fs::canonicalize("../../services/engine/api/contracts/schema.json").expect("schema")
}

fn write_config(root: &Path, body: &str) -> PathBuf {
    let path = root.join("engine.toml");
    std::fs::write(&path, body).expect("config");
    path
}

fn valid_body(schema: &Path, extra: &str) -> String {
    format!(
        r#"
schema = "{}"
host = "127.0.0.1"
port = 8000
require_auth = true
max_body_bytes = 1024
timeout_ms = 1000
model_registry = "registry.toml"
{extra}
"#,
        schema.display()
    )
}

#[test]
fn repository_default_config_is_accepted() {
    let config = Config::from_path(Path::new("../../config/default.toml")).expect("default config");
    assert!(config.auth_enabled);
    assert_eq!(config.database_url, "sqlite://data/engine.db");
    config.validate().expect("default config validates");
}

#[test]
fn oidc_mode_requires_issuer_audience_and_secure_jwks() {
    let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&root).expect("temp");
    let path = write_config(&root, &valid_body(&schema_path(), r#"auth_mode = "oidc""#));
    let config = Config::from_path(&path).expect("schema accepts empty oidc fields");
    assert!(config.validate().is_err());

    let path = write_config(
        &root,
        &valid_body(
            &schema_path(),
            r#"auth_mode = "oidc"
oidc_issuer = "https://issuer.example"
oidc_audience = "torviello-engine"
oidc_jwks_url = "http://issuer.example/jwks""#,
        ),
    );
    let config = Config::from_path(&path).expect("config");
    assert!(config.validate().is_err());
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[test]
fn valid_oidc_config_is_accepted() {
    let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&root).expect("temp");
    let path = write_config(
        &root,
        &valid_body(
            &schema_path(),
            r#"auth_mode = "oidc"
oidc_issuer = "https://issuer.example"
oidc_audience = "torviello-engine"
oidc_jwks_url = "https://issuer.example/jwks""#,
        ),
    );
    let config = Config::from_path(&path).expect("config");
    config.validate().expect("valid oidc");
    assert_eq!(config.auth_mode, torviello_engine::config::AuthMode::Oidc);
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[test]
fn local_mode_rejects_oidc_settings() {
    let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&root).expect("temp");
    let path = write_config(
        &root,
        &valid_body(&schema_path(), r#"oidc_issuer = "https://issuer.example""#),
    );
    let config = Config::from_path(&path).expect("schema accepts local with issuer");
    assert!(config.validate().is_err());
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[test]
fn non_sqlite_database_url_is_rejected() {
    let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&root).expect("temp");
    let path = write_config(
        &root,
        &valid_body(&schema_path(), r#"database_url = "postgres://db/engine""#),
    );
    assert!(Config::from_path(&path).is_err());
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[test]
fn valid_config_is_accepted() {
    let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&root).expect("temp");
    let path = write_config(&root, &valid_body(&schema_path(), ""));
    let config = Config::from_path(&path).expect("valid config");
    assert!(config.auth_enabled);
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[test]
fn config_violating_schema_is_rejected() {
    let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&root).expect("temp");
    let body = format!(
        r#"
schema = "{}"
host = "127.0.0.1"
port = 8000
max_body_bytes = 1024
timeout_ms = 1000
model_registry = "registry.toml"
"#,
        schema_path().display()
    );
    let path = write_config(&root, &body);
    assert!(Config::from_path(&path).is_err());
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[test]
fn auth_cannot_be_disabled_through_the_alias() {
    let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&root).expect("temp");
    let path = write_config(&root, &valid_body(&schema_path(), "auth_enabled = false"));
    assert!(Config::from_path(&path).is_err());
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[test]
fn missing_schema_is_rejected() {
    let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&root).expect("temp");
    let body = format!(
        r#"
schema = "{}"
host = "127.0.0.1"
port = 8000
require_auth = true
max_body_bytes = 1024
timeout_ms = 1000
model_registry = "registry.toml"
"#,
        root.join("missing.json").display()
    );
    let path = write_config(&root, &body);
    assert!(Config::from_path(&path).is_err());
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[test]
fn route_access_policy_defaults_to_private_except_health_and_metrics() {
    let policy = AccessControl::default();
    assert!(!policy.requires_auth("/health"));
    assert!(!policy.requires_auth("/metrics"));
    assert!(!policy.requires_auth("/api/v1/health"));
    assert!(policy.requires_auth("/models"));
    assert!(policy.requires_auth("/classify"));
}

#[test]
fn route_access_policy_can_open_or_close_individual_routes() {
    let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&root).expect("temp");
    let access = r#"
[access_control]
default_public = true
public_routes = ["/models"]
private_routes = ["/classify"]
"#;
    let path = write_config(&root, &valid_body(&schema_path(), access));
    let config = Config::from_path(&path).expect("valid config");
    assert!(!config.access_control.requires_auth("/models"));
    assert!(config.access_control.requires_auth("/classify"));
    assert!(!config.access_control.requires_auth("/system"));
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[test]
fn partial_access_control_keeps_default_public_routes() {
    let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&root).expect("temp");
    let path = write_config(
        &root,
        &valid_body(&schema_path(), "[access_control]\ndefault_public = true"),
    );
    let config = Config::from_path(&path).expect("valid config");
    assert!(!config.access_control.requires_auth("/health"));
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[test]
fn local_mode_rejects_non_loopback_bind() {
    let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&root).expect("temp");
    let body = valid_body(&schema_path(), "").replace("host = \"127.0.0.1\"", "host = \"0.0.0.0\"");
    let path = write_config(&root, &body);
    let config = Config::from_path(&path).expect("schema accepts host");
    assert!(config.validate().is_err());
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[test]
fn local_mode_rejects_every_oidc_field() {
    for extra in [
        "oidc_issuer = \"https://issuer.example\"",
        "oidc_audience = \"torviello-engine\"",
        "oidc_jwks_url = \"https://issuer.example/jwks\"",
    ] {
        let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&root).expect("temp");
        let path = write_config(&root, &valid_body(&schema_path(), extra));
        let config = Config::from_path(&path).expect("schema accepts local oidc field");
        assert!(config.validate().is_err(), "{extra}");
        std::fs::remove_dir_all(root).expect("cleanup");
    }
}

#[test]
fn oidc_url_validation_rejects_spoofed_loopback_and_empty_host() {
    for jwks in [
        "http://127.0.0.1.evil/jwks",
        "http://localhost.evil/jwks",
        "https://",
        "https://user:pass@issuer.example/jwks",
    ] {
        let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&root).expect("temp");
        let extra = format!(
            "auth_mode = \"oidc\"\noidc_issuer = \"https://issuer.example\"\noidc_audience = \"torviello-engine\"\noidc_jwks_url = \"{jwks}\""
        );
        let path = write_config(&root, &valid_body(&schema_path(), &extra));
        let rejected = match Config::from_path(&path) {
            Ok(config) => config.validate().is_err(),
            Err(_) => true,
        };
        assert!(rejected, "{jwks}");
        std::fs::remove_dir_all(root).expect("cleanup");
    }
}

#[test]
fn unsupported_accelerator_fails_clearly() {
    let root = std::env::temp_dir().join(format!("torviello-config-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir_all(&root).expect("temp");
    let path = write_config(
        &root,
        &valid_body(&schema_path(), "[accelerators]\ncuda = true"),
    );
    let config = Config::from_path(&path).expect("schema accepts accelerator");
    assert!(matches!(
        config.validate(),
        Err(torviello_engine::error::AppError::BackendUnavailable)
    ));
    std::fs::remove_dir_all(root).expect("cleanup");
}
