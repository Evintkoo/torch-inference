// Copyright (c) 2026 Torviello.
//! Verifies that the packaged service emits one JSON startup record.

use std::fs;
use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};

#[test]
fn startup_emits_structured_json_with_correlation_id() {
    let config = fs::canonicalize("../../config/default.toml").expect("config must exist");
    let registry =
        fs::canonicalize("../../config/model-registry.toml").expect("registry must exist");
    let models = std::env::temp_dir().join(format!("torviello-logging-{}", std::process::id()));
    fs::create_dir_all(&models).expect("model root must be creatable");

    let mut child = Command::new(env!("CARGO_BIN_EXE_torviello-engine"))
        .env("TORCH_CONFIG", &config)
        .env("TORCH_MODEL_REGISTRY", &registry)
        .env("TORCH_MODEL_ROOT", &models)
        .env("TORCH_HOST", "127.0.0.1")
        .env("TORCH_PORT", "0")
        .env("TORCH_AUTH_JWT_SECRET", "0123456789abcdef0123456789abcdef")
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
        .spawn()
        .expect("engine must start");

    let stdout = child.stdout.take().expect("stdout must be piped");
    let mut line = String::new();
    BufReader::new(stdout)
        .read_line(&mut line)
        .expect("startup record must be readable");

    let _ = child.kill();
    let _ = child.wait();
    let _ = fs::remove_dir_all(&models);

    let record: serde_json::Value =
        serde_json::from_str(line.trim()).expect("startup record must be JSON");
    assert_eq!(record["fields"]["event"], "startup");
    assert_eq!(record["fields"]["version"], env!("CARGO_PKG_VERSION"));
    assert_eq!(record["level"], "INFO");
    let correlation = record["fields"]["correlation_id"]
        .as_str()
        .expect("correlation_id must be a string");
    assert_eq!(correlation.len(), 36);
}
