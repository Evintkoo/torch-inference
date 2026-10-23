// Copyright (c) 2026 Torviello.
use super::LinearClassifier;
use super::Runtime;
use super::reference::softmax;
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

fn classifier(body: &str, max_bytes: u64) -> Result<LinearClassifier, super::AppError> {
    let path = std::env::temp_dir().join(format!("torviello-linear-{}", uuid::Uuid::new_v4()));
    std::fs::write(&path, body).expect("write");
    let loaded = LinearClassifier::load(Path::new(&path), max_bytes);
    std::fs::remove_file(path).expect("cleanup");
    loaded
}

fn valid_body() -> String {
    r#"{"kind":"linear-classifier","input_dim":2,"classes":["a","b"],"weights":[[1.0,0.0],[0.0,1.0]],"bias":[0.0,0.0]}"#.to_string()
}

#[test]
fn classifier_infers_and_exposes_metadata() {
    let classifier = classifier(&valid_body(), 4_096).expect("load");
    assert_eq!(super::Runtime::format(&classifier), "torviello-tensor-v1");
    assert_eq!(classifier.labels(), ["a", "b"]);
    assert!(classifier.image_spec().is_none());
    let output = classifier
        .infer(super::TensorInput {
            data: &[2.0, 1.0],
            shape: &[1, 2],
        })
        .expect("infer");
    assert_eq!(output.shape, [1, 2]);
    assert!(output.data[0] > output.data[1]);
}

#[test]
fn classifier_rejects_bad_input_shapes_and_values() {
    let classifier = classifier(&valid_body(), 4_096).expect("load");
    assert!(matches!(
        classifier.infer(super::TensorInput {
            data: &[1.0],
            shape: &[1, 2],
        }),
        Err(super::AppError::InvalidInput)
    ));
    assert!(matches!(
        classifier.infer(super::TensorInput {
            data: &[f32::NAN, 1.0],
            shape: &[1, 2],
        }),
        Err(super::AppError::InvalidInput)
    ));
}

#[test]
fn classifier_rejects_invalid_models() {
    let paths = [
        r#"{"kind":"other","input_dim":2,"classes":["a"],"weights":[[1.0,0.0]],"bias":[0.0]}"#.to_owned(),
        r#"{"kind":"linear-classifier","input_dim":0,"classes":["a"],"weights":[],"bias":[0.0]}"#.to_owned(),
        r#"{"kind":"linear-classifier","input_dim":5000,"classes":["a"],"weights":[[1.0]],"bias":[0.0]}"#.to_owned(),
        r#"{"kind":"linear-classifier","input_dim":2,"classes":[],"weights":[],"bias":[]}"#.to_owned(),
        r#"{"kind":"linear-classifier","input_dim":2,"classes":["a"],"weights":[],"bias":[0.0]}"#.to_owned(),
        r#"{"kind":"linear-classifier","input_dim":2,"classes":["a"],"weights":[[1.0,0.0]],"bias":[]}"#.to_owned(),
        r#"{"kind":"linear-classifier","input_dim":3,"classes":["a"],"weights":[[1.0,0.0]],"bias":[0.0]}"#.to_owned(),
        r#"{"kind":"linear-classifier","input_dim":2,"classes":[""],"weights":[[1.0,0.0]],"bias":[0.0]}"#.to_owned(),
        "not-json".to_owned(),
    ];
    for body in paths {
        assert!(classifier(&body, 4_096).is_err(), "{body}");
    }
    let valid = valid_body();
    assert!(matches!(
        classifier(&valid, 1),
        Err(super::AppError::ModelTooLarge)
    ));
    let missing = std::env::temp_dir().join("torviello-missing-model.json");
    assert!(LinearClassifier::load(&missing, 4_096).is_err());
}

#[test]
fn classifier_reports_overflowing_scores() {
    let body = r#"{"kind":"linear-classifier","input_dim":2,"classes":["a"],"weights":[[3e38,3e38]],"bias":[3e38]}"#;
    let classifier = classifier(body, 4_096).expect("load");
    assert!(matches!(
        classifier.infer(super::TensorInput {
            data: &[3e38, 3e38],
            shape: &[1, 2],
        }),
        Err(super::AppError::Internal)
    ));
}

#[test]
fn softmax_handles_empty_and_non_finite_totals() {
    assert_eq!(softmax(&[f32::NEG_INFINITY]), vec![0.0]);
    assert_eq!(softmax(&[f32::NAN]), vec![0.0]);
    assert_eq!(softmax(&[]), Vec::<f32>::new());
}
