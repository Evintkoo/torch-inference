// Copyright (c) 2026 Torviello.
//! Reference linear classifier used for lifecycle and contract tests.
use std::path::Path;

use serde::Deserialize;

use super::{
    AppError, AppResult, MAX_CLASSES, MAX_INPUT_DIM, REFERENCE_FORMAT, Runtime, TensorInput,
    TensorOutput,
};

#[derive(Debug, Deserialize)]
struct TensorModel {
    kind: String,
    input_dim: usize,
    classes: Vec<String>,
    weights: Vec<Vec<f32>>,
    bias: Vec<f32>,
}

#[derive(Debug)]
pub(super) struct LinearClassifier {
    input_dim: usize,
    classes: Vec<String>,
    weights: Vec<Vec<f32>>,
    bias: Vec<f32>,
}

impl LinearClassifier {
    pub(super) fn load(path: &Path, max_bytes: u64) -> AppResult<Self> {
        let metadata = std::fs::metadata(path).map_err(|_| AppError::ModelNotReady)?;
        if metadata.len() > max_bytes {
            return Err(AppError::ModelTooLarge);
        }
        let bytes = std::fs::read(path).map_err(|_| AppError::ModelNotReady)?;
        let model: TensorModel =
            serde_json::from_slice(&bytes).map_err(|_| AppError::BackendUnavailable)?;
        let classes = model.classes.len();
        if model.kind != "linear-classifier"
            || model.input_dim == 0
            || model.input_dim > MAX_INPUT_DIM
            || classes == 0
            || classes > MAX_CLASSES
            || model.weights.len() != classes
            || model.bias.len() != classes
            || model.weights.iter().any(|row| {
                row.len() != model.input_dim || row.iter().any(|value| !value.is_finite())
            })
            || model.bias.iter().any(|value| !value.is_finite())
            || model.classes.iter().any(String::is_empty)
        {
            return Err(AppError::BackendUnavailable);
        }
        Ok(Self {
            input_dim: model.input_dim,
            classes: model.classes,
            weights: model.weights,
            bias: model.bias,
        })
    }
}

impl Runtime for LinearClassifier {
    fn format(&self) -> &'static str {
        REFERENCE_FORMAT
    }

    fn labels(&self) -> &[String] {
        &self.classes
    }

    fn infer(&self, input: TensorInput<'_>) -> AppResult<TensorOutput> {
        let expected: i64 = input.shape.iter().product();
        if expected != i64::try_from(input.data.len()).map_err(|_| AppError::InvalidInput)?
            || input.data.len() != self.input_dim
            || input.data.iter().any(|value| !value.is_finite())
        {
            return Err(AppError::InvalidInput);
        }
        let mut logits = Vec::with_capacity(self.classes.len());
        for (row, bias) in self.weights.iter().zip(&self.bias) {
            let mut score = *bias;
            for (weight, value) in row.iter().zip(input.data) {
                score += weight * value;
            }
            if !score.is_finite() {
                return Err(AppError::Internal);
            }
            logits.push(score);
        }
        let probabilities = softmax(&logits);
        Ok(TensorOutput {
            shape: vec![
                1,
                i64::try_from(probabilities.len()).map_err(|_| AppError::Internal)?,
            ],
            data: probabilities,
        })
    }
}

pub(super) fn softmax(logits: &[f32]) -> Vec<f32> {
    let maximum = logits.iter().copied().fold(f32::NEG_INFINITY, f32::max);
    let exponentials: Vec<f32> = logits.iter().map(|value| (value - maximum).exp()).collect();
    let total: f32 = exponentials.iter().sum();
    if total <= 0.0 || !total.is_finite() {
        return vec![0.0; logits.len()];
    }
    exponentials
        .into_iter()
        .map(|value| value / total)
        .collect()
}
