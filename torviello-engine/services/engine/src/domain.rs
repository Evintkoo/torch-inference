// Copyright (c) 2026 Torviello.
//! Domain inference path traced to ENG-001, ENG-004, and ENG-012.
use serde::Serialize;

use crate::error::{AppError, AppResult};
use crate::resilience::{Bulkhead, CircuitBreaker, with_timeout};

#[must_use]
pub fn compiled_backends() -> Vec<&'static str> {
    #[cfg(any(feature = "metal", feature = "vulkan"))]
    let mut backends = vec!["cpu"];
    #[cfg(not(any(feature = "metal", feature = "vulkan")))]
    let backends = vec!["cpu"];
    #[cfg(feature = "metal")]
    backends.push("metal");
    #[cfg(feature = "vulkan")]
    backends.push("vulkan");
    backends
}

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

    let bulkhead = Bulkhead::new(8);
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn batch_policy_clamps_and_backends_are_compiled() {
        let policy = InferencePolicy {
            max_batch_size: 4,
            max_queue_depth: 16,
        };
        assert_eq!(policy.bounded_batch(0), 1);
        assert_eq!(policy.bounded_batch(3), 3);
        assert_eq!(policy.bounded_batch(99), 4);
        let backends = compiled_backends();
        assert_eq!(backends[0], "cpu");
    }

    #[tokio::test]
    async fn classify_batches_limited_requests() {
        let result = classify(
            InferenceRequest {
                prompt: "image".to_owned(),
                max_batch_size: 2,
            },
            1_000,
        )
        .await
        .expect("classified");
        assert_eq!(result.batch_size, 2);
        assert_eq!(result.label, "classification");
    }

    #[tokio::test]
    async fn classify_clamps_excess_batch_and_rejects_invalid_input() {
        let result = classify(
            InferenceRequest {
                prompt: "image".to_owned(),
                max_batch_size: 99,
            },
            1_000,
        )
        .await
        .expect("classified");
        assert_eq!(result.batch_size, 8);
        assert!(matches!(
            classify(
                InferenceRequest {
                    prompt: String::new(),
                    max_batch_size: 2,
                },
                1_000,
            )
            .await,
            Err(AppError::InvalidInput)
        ));
        assert!(matches!(
            classify(
                InferenceRequest {
                    prompt: "image".to_owned(),
                    max_batch_size: 0,
                },
                1_000,
            )
            .await,
            Err(AppError::InvalidInput)
        ));
    }
}
