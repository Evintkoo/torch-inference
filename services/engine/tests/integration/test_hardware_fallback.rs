// Copyright (c) 2026 Torviello.
//! Boundary checks for inference limits, path confinement, and model integrity.

use std::fs;
use std::path::Path;

use torviello_engine::domain::InferencePolicy;
use torviello_engine::model::{sha256_hex, verify_integrity};
use torviello_engine::security::confine_path;

const SEED: u64 = 42;

#[test]
fn accelerator_fallback_defaults_to_cpu() {
    let config =
        fs::read_to_string("../../config/default.toml").expect("default config must exist");
    assert!(config.contains("accelerator_fallback = \"cpu\""));
    for backend in ["cuda", "metal", "vulkan", "rocm", "coreml", "directml"] {
        assert!(
            config.contains(&format!("{backend} = false")),
            "{backend} must remain disabled unless the matching build feature is selected"
        );
    }
    assert_eq!(SEED, 42);
}

#[test]
fn inference_policy_clamps_batch_requests() {
    let policy = InferencePolicy {
        max_batch_size: 8,
        max_queue_depth: 32,
    };
    assert_eq!(policy.bounded_batch(0), 1);
    assert_eq!(policy.bounded_batch(4), 4);
    assert_eq!(policy.bounded_batch(99), 8);
}

#[test]
fn path_confinement_rejects_parent_traversal() {
    let root = Path::new("/tmp/torviello-models");
    assert!(confine_path(root, Path::new("model/file.bin")).is_ok());
    assert!(confine_path(root, Path::new("../secret")).is_err());
}

#[test]
fn model_integrity_requires_the_exact_digest() {
    let bytes = b"fixture";
    let digest = sha256_hex(bytes);
    assert!(verify_integrity(&digest, bytes).is_ok());
    assert!(verify_integrity(&digest, b"tampered").is_err());
}
