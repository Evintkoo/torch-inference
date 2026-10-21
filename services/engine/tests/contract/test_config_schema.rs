// Copyright (c) 2026 Torviello.
use std::path::{Path, PathBuf};

use torviello_engine::config::Config;

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
