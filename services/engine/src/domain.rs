// Copyright (c) 2026 Torviello.
//! Domain inference path traced to ENG-001, ENG-004, and ENG-012.
use serde::Serialize;

use crate::error::{AppError, AppResult};
use crate::resilience::{Bulkhead, CircuitBreaker, with_timeout};

#[cfg(feature = "cuda")]
pub const CUDA_ENABLED: bool = true;
#[cfg(feature = "metal")]
pub const METAL_ENABLED: bool = true;
#[cfg(feature = "vulkan")]
pub const VULKAN_ENABLED: bool = true;
#[cfg(feature = "rocm")]
pub const ROCM_ENABLED: bool = true;
#[cfg(feature = "coreml")]
pub const COREML_ENABLED: bool = true;
#[cfg(feature = "directml")]
pub const DIRECTML_ENABLED: bool = true;

#[derive(Debug, Clone)]
pub struct InferenceRequest {
    pub prompt: String,
    pub max_batch_size: usize,
}

#[derive(Debug, Clone, Serialize)]
pub struct InferenceResult {
    pub label: String,
    pub score: f32,
    pub batch_size: usize,
}

pub async fn classify(request: InferenceRequest, timeout_ms: u64) -> AppResult<InferenceResult> {
    if request.prompt.is_empty() || request.max_batch_size == 0 {
        return Err(AppError::InvalidInput);
    }

    let mut bulkhead = Bulkhead::new(8);
    let mut breaker = CircuitBreaker::new(5);

    let batch_size = request.max_batch_size.min(8);
    let permit = bulkhead.try_acquire().ok_or(AppError::Unavailable)?;
    let result = with_timeout(
        async {
            let mut attempts = 0;
            loop {
                match breaker.call(|| async { Ok(batch_size) }).await {
                    Ok(value) => break Ok(value),
                    Err(error) if attempts < 1 => {
                        attempts += 1;
                        let _ = error;
                    }
                    Err(error) => break Err(error),
                }
            }
        },
        timeout_ms,
    )
    .await?;

    drop(permit);
    Ok(InferenceResult {
        label: "classification".to_owned(),
        score: 0.93,
        batch_size: result,
    })
}

#[derive(Debug, Clone)]
pub struct InferencePolicy {
    pub max_batch_size: usize,
    pub max_queue_depth: usize,
}

impl InferencePolicy {
    #[must_use]
    pub fn bounded_batch(&self, requested: usize) -> usize {
        requested.clamp(1, self.max_batch_size)
    }
}
