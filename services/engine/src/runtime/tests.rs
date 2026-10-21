// Copyright (c) 2026 Torviello.
use super::{LinearClassifier, softmax};
use std::path::Path;

#[test]
fn softmax_is_normalized_and_stable() {
    let values = softmax(&[1.0, 1.0]);
    assert!((values[0] - 0.5).abs() < f32::EPSILON);
    assert!((values.iter().sum::<f32>() - 1.0).abs() < 1e-6);
}

#[test]
fn malformed_model_is_rejected() {
    let path = std::env::temp_dir().join(format!("torviello-model-{}", uuid::Uuid::new_v4()));
    std::fs::write(&path, b"{\"kind\":\"other\"}").expect("write");
    assert!(LinearClassifier::load(Path::new(&path), 1_024).is_err());
}
