// Copyright (c) 2026 Torviello.
//! Model slot lifecycle for ENG-006 with a CPU reference adapter.
use std::collections::HashMap;
use std::path::Path;
use std::sync::{Arc, Mutex, MutexGuard, PoisonError};
use std::time::Duration;

use serde::{Deserialize, Serialize};

use crate::asset::{AssetStore, digest_file};
use crate::config::Config;
use crate::error::{AppError, AppResult};
use crate::model::ModelRegistry;

/// Reference adapter format. It is a small linear classifier, not `TorchScript`.
pub const REFERENCE_FORMAT: &str = "torviello-tensor-v1";
const MAX_INPUT_DIM: usize = 4_096;
const MAX_CLASSES: usize = 1_024;
const DRAIN_POLL_MS: u64 = 10;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum LoadState {
    Unloaded,
    Queued,
    Loading,
    Ready,
    Draining,
    Failed,
}

impl LoadState {
    #[must_use]
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Unloaded => "unloaded",
            Self::Queued => "queued",
            Self::Loading => "loading",
            Self::Ready => "ready",
            Self::Draining => "draining",
            Self::Failed => "failed",
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct ModelSlot {
    pub model_id: String,
    pub state: LoadState,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub backend: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub device: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub precision: Option<String>,
    pub references: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub loaded_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_code: Option<&'static str>,
}

pub trait Runtime: Send + Sync {
    fn backend(&self) -> &'static str {
        "cpu"
    }

    fn device(&self) -> &'static str {
        "cpu"
    }

    fn format(&self) -> &'static str;

    fn infer(&self, input: &[f32]) -> AppResult<Vec<f32>>;
}

#[derive(Debug, Deserialize)]
struct TensorModel {
    kind: String,
    input_dim: usize,
    classes: Vec<String>,
    weights: Vec<Vec<f32>>,
    bias: Vec<f32>,
}

#[derive(Debug)]
pub struct LinearClassifier {
    input_dim: usize,
    classes: Vec<String>,
    weights: Vec<Vec<f32>>,
    bias: Vec<f32>,
}

impl LinearClassifier {
    fn load(path: &Path, max_bytes: u64) -> AppResult<Self> {
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

    fn infer(&self, input: &[f32]) -> AppResult<Vec<f32>> {
        if input.len() != self.input_dim || input.iter().any(|value| !value.is_finite()) {
            return Err(AppError::InvalidInput);
        }
        let mut logits = Vec::with_capacity(self.classes.len());
        for (row, bias) in self.weights.iter().zip(&self.bias) {
            let mut score = *bias;
            for (weight, value) in row.iter().zip(input) {
                score += weight * value;
            }
            if !score.is_finite() {
                return Err(AppError::Internal);
            }
            logits.push(score);
        }
        Ok(softmax(&logits))
    }
}

fn softmax(logits: &[f32]) -> Vec<f32> {
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

fn load_runtime(format: &str, path: &Path, max_bytes: u64) -> AppResult<Arc<dyn Runtime>> {
    match format {
        REFERENCE_FORMAT => Ok(Arc::new(LinearClassifier::load(path, max_bytes)?)),
        _ => Err(AppError::BackendUnavailable),
    }
}

struct SlotInner {
    state: LoadState,
    runtime: Option<Arc<dyn Runtime>>,
    references: usize,
    loaded_at: Option<String>,
    error_code: Option<&'static str>,
}

struct Slot {
    model_id: String,
    inner: Mutex<SlotInner>,
    load_lock: tokio::sync::Mutex<()>,
}

impl Slot {
    fn new(model_id: &str) -> Self {
        Self {
            model_id: model_id.to_owned(),
            inner: Mutex::new(SlotInner {
                state: LoadState::Unloaded,
                runtime: None,
                references: 0,
                loaded_at: None,
                error_code: None,
            }),
            load_lock: tokio::sync::Mutex::new(()),
        }
    }

    fn lock(&self) -> MutexGuard<'_, SlotInner> {
        self.inner.lock().unwrap_or_else(PoisonError::into_inner)
    }

    fn snapshot(&self) -> ModelSlot {
        let inner = self.lock();
        let backend = inner
            .runtime
            .as_ref()
            .map(|runtime| runtime.backend().to_owned());
        let device = inner
            .runtime
            .as_ref()
            .map(|runtime| runtime.device().to_owned());
        ModelSlot {
            model_id: self.model_id.clone(),
            state: inner.state,
            backend,
            device,
            precision: inner.runtime.as_ref().map(|_| "f32".to_owned()),
            references: inner.references,
            loaded_at: inner.loaded_at.clone(),
            error_code: inner.error_code,
        }
    }

    fn state(&self) -> LoadState {
        self.lock().state
    }

    fn fail(&self, code: &'static str) {
        let mut inner = self.lock();
        inner.state = LoadState::Failed;
        inner.runtime = None;
        inner.error_code = Some(code);
        inner.loaded_at = None;
    }
}

pub struct ModelGuard {
    slot: Arc<Slot>,
    runtime: Arc<dyn Runtime>,
}

impl ModelGuard {
    #[must_use]
    pub fn slot(&self) -> ModelSlot {
        self.slot.snapshot()
    }

    pub fn infer(&self, input: &[f32]) -> AppResult<Vec<f32>> {
        self.runtime.infer(input)
    }
}

impl Drop for ModelGuard {
    fn drop(&mut self) {
        let mut inner = self.slot.lock();
        inner.references = inner.references.saturating_sub(1);
    }
}

pub struct ModelManager {
    slots: Mutex<HashMap<String, Arc<Slot>>>,
    assets: Arc<AssetStore>,
    registry: Arc<ModelRegistry>,
    max_loaded: usize,
    drain_timeout: Duration,
}

impl ModelManager {
    #[must_use]
    pub fn new(config: &Config, assets: Arc<AssetStore>, registry: Arc<ModelRegistry>) -> Self {
        let slots = registry
            .all()
            .iter()
            .map(|record| (record.id.clone(), Arc::new(Slot::new(&record.id))))
            .collect();
        Self {
            slots: Mutex::new(slots),
            assets,
            registry,
            max_loaded: config.max_loaded_models,
            drain_timeout: Duration::from_millis(config.download_timeout_ms),
        }
    }

    fn slots(&self) -> MutexGuard<'_, HashMap<String, Arc<Slot>>> {
        self.slots.lock().unwrap_or_else(PoisonError::into_inner)
    }

    fn slot(&self, model_id: &str) -> AppResult<Arc<Slot>> {
        crate::model::validate_model_id(model_id)?;
        self.slots()
            .get(model_id)
            .cloned()
            .ok_or(AppError::ModelNotFound)
    }

    pub fn slot_state(&self, model_id: &str) -> AppResult<ModelSlot> {
        Ok(self.slot(model_id)?.snapshot())
    }

    pub fn loaded_models(&self) -> usize {
        self.slots()
            .values()
            .filter(|slot| slot.state() == LoadState::Ready)
            .count()
    }

    pub async fn load(&self, model_id: &str) -> AppResult<ModelSlot> {
        let slot = self.slot(model_id)?;
        {
            let mut inner = slot.lock();
            if inner.state == LoadState::Unloaded {
                inner.state = LoadState::Queued;
            }
        }
        let _load = slot.load_lock.lock().await;
        if slot.state() == LoadState::Ready {
            return Ok(slot.snapshot());
        }
        if self.max_loaded > 0 && self.loaded_models() >= self.max_loaded {
            slot.fail("model.capacity_exceeded");
            return Err(AppError::CapacityExceeded);
        }
        let (path, manifest) = match self.assets.ready_asset(model_id) {
            Ok(asset) => asset,
            Err(error) => {
                slot.fail(error.code());
                return Err(error);
            }
        };
        let record = self
            .registry
            .find(model_id)
            .ok_or(AppError::ModelNotFound)?
            .clone();
        {
            let mut inner = slot.lock();
            inner.state = LoadState::Loading;
            inner.error_code = None;
        }
        let format = record.format;
        let max_bytes = self.assets.max_bytes();
        let loaded = tokio::task::spawn_blocking(move || -> AppResult<Arc<dyn Runtime>> {
            let (digest, _) = digest_file(&path)?;
            if digest != manifest.digest {
                return Err(AppError::DigestMismatch);
            }
            load_runtime(&format, &path, max_bytes)
        })
        .await
        .map_err(|_| AppError::Internal)?;
        match loaded {
            Ok(runtime) => {
                let mut inner = slot.lock();
                inner.state = LoadState::Ready;
                inner.runtime = Some(runtime);
                inner.loaded_at = Some(now_rfc3339());
                drop(inner);
                Ok(slot.snapshot())
            }
            Err(error) => {
                slot.fail(error.code());
                Err(error)
            }
        }
    }

    pub async fn unload(&self, model_id: &str) -> AppResult<ModelSlot> {
        let slot = self.slot(model_id)?;
        let _load = slot.load_lock.lock().await;
        match slot.state() {
            LoadState::Unloaded => return Ok(slot.snapshot()),
            LoadState::Ready => {}
            LoadState::Failed => {
                slot.fail(slot.snapshot().error_code.unwrap_or("model.not_ready"));
                return Ok(slot.snapshot());
            }
            LoadState::Queued | LoadState::Loading | LoadState::Draining => {
                return Err(AppError::ModelBusy);
            }
        }
        slot.lock().state = LoadState::Draining;
        let deadline = tokio::time::Instant::now() + self.drain_timeout;
        loop {
            if slot.lock().references == 0 {
                break;
            }
            if tokio::time::Instant::now() >= deadline {
                slot.lock().state = LoadState::Ready;
                return Err(AppError::ModelBusy);
            }
            tokio::time::sleep(Duration::from_millis(DRAIN_POLL_MS)).await;
        }
        let mut inner = slot.lock();
        inner.runtime = None;
        inner.state = LoadState::Unloaded;
        inner.loaded_at = None;
        drop(inner);
        Ok(slot.snapshot())
    }

    pub fn acquire(&self, model_id: &str) -> AppResult<ModelGuard> {
        let slot = self.slot(model_id)?;
        let mut inner = slot.lock();
        if inner.state != LoadState::Ready {
            return Err(AppError::ModelNotReady);
        }
        let runtime = inner.runtime.clone().ok_or(AppError::ModelNotReady)?;
        inner.references = inner.references.saturating_add(1);
        drop(inner);
        Ok(ModelGuard { slot, runtime })
    }
}

fn now_rfc3339() -> String {
    time::OffsetDateTime::now_utc()
        .format(&time::format_description::well_known::Rfc3339)
        .unwrap_or_else(|_| "1970-01-01T00:00:00Z".to_owned())
}

#[cfg(test)]
mod tests {
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
}
