// Copyright (c) 2026 Torviello.
use std::future::Future;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Duration;

use crate::error::{AppError, AppResult};

#[derive(Debug)]
pub struct Bulkhead {
    capacity: usize,
    in_flight: AtomicUsize,
}

impl Bulkhead {
    #[must_use]
    pub fn new(capacity: usize) -> Self {
        Self {
            capacity,
            in_flight: AtomicUsize::new(0),
        }
    }

    pub fn try_acquire(&self) -> Option<BulkheadPermit<'_>> {
        let mut current = self.in_flight.load(Ordering::Acquire);
        loop {
            if current >= self.capacity {
                return None;
            }
            match self.in_flight.compare_exchange_weak(
                current,
                current + 1,
                Ordering::AcqRel,
                Ordering::Acquire,
            ) {
                Ok(_) => return Some(BulkheadPermit { bulkhead: self }),
                Err(actual) => current = actual,
            }
        }
    }
}

pub struct BulkheadPermit<'a> {
    bulkhead: &'a Bulkhead,
}

impl Drop for BulkheadPermit<'_> {
    fn drop(&mut self) {
        self.bulkhead.in_flight.fetch_sub(1, Ordering::AcqRel);
    }
}

#[derive(Debug)]
pub struct CircuitBreaker {
    failures: u32,
    threshold: u32,
    open: bool,
}

impl CircuitBreaker {
    #[must_use]
    pub fn new(threshold: u32) -> Self {
        Self {
            failures: 0,
            threshold,
            open: false,
        }
    }

    pub async fn call<F, Fut, T>(&mut self, operation: F) -> AppResult<T>
    where
        F: FnMut() -> Fut,
        Fut: Future<Output = AppResult<T>>,
    {
        if self.open {
            return Err(AppError::Unavailable);
        }
        let mut operation = operation;
        match operation().await {
            Ok(value) => {
                self.failures = 0;
                Ok(value)
            }
            Err(error) => {
                self.failures += 1;
                if self.failures >= self.threshold {
                    self.open = true;
                }
                Err(error)
            }
        }
    }
}

#[derive(Debug, Clone)]
pub struct RetryPolicy {
    max_attempts: u32,
}

impl RetryPolicy {
    #[must_use]
    pub fn new(max_attempts: u32) -> Self {
        Self { max_attempts }
    }

    pub async fn run<F, Fut, T>(&self, mut operation: F) -> AppResult<T>
    where
        F: FnMut() -> Fut,
        Fut: Future<Output = AppResult<T>>,
    {
        let mut last = AppError::Unavailable;
        for _ in 0..self.max_attempts {
            match operation().await {
                Ok(value) => return Ok(value),
                Err(error) => last = error,
            }
        }
        Err(last)
    }
}

pub async fn with_timeout<F, T>(future: F, timeout_ms: u64) -> AppResult<T>
where
    F: Future<Output = AppResult<T>>,
{
    match tokio::time::timeout(Duration::from_millis(timeout_ms), future).await {
        Ok(result) => result,
        Err(_) => Err(AppError::Timeout),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn bulkhead_enforces_capacity_and_releases_on_drop() {
        let empty = Bulkhead::new(0);
        assert!(empty.try_acquire().is_none());

        let bulkhead = Bulkhead::new(1);
        {
            let first = bulkhead.try_acquire().expect("first permit");
            assert!(bulkhead.try_acquire().is_none());
            drop(first);
        }
        assert!(bulkhead.try_acquire().is_some());
    }

    #[tokio::test]
    async fn circuit_breaker_opens_after_threshold() {
        let mut breaker = CircuitBreaker::new(2);
        assert!(
            breaker
                .call(|| async { Ok::<_, AppError>(1) })
                .await
                .is_ok()
        );
        assert!(matches!(
            breaker
                .call(|| async { Err::<(), _>(AppError::Timeout) })
                .await,
            Err(AppError::Timeout)
        ));
        assert!(matches!(
            breaker
                .call(|| async { Err::<(), _>(AppError::Timeout) })
                .await,
            Err(AppError::Timeout)
        ));
        assert!(matches!(
            breaker.call(|| async { Ok::<_, AppError>(1) }).await,
            Err(AppError::Unavailable)
        ));
    }

    #[tokio::test]
    async fn circuit_breaker_success_resets_failures() {
        let mut breaker = CircuitBreaker::new(2);
        assert!(
            breaker
                .call(|| async { Err::<(), _>(AppError::Timeout) })
                .await
                .is_err()
        );
        assert!(
            breaker
                .call(|| async { Ok::<_, AppError>(1) })
                .await
                .is_ok()
        );
        assert!(
            breaker
                .call(|| async { Err::<(), _>(AppError::Timeout) })
                .await
                .is_err()
        );
        assert!(
            breaker
                .call(|| async { Ok::<_, AppError>(2) })
                .await
                .is_ok()
        );
    }

    #[tokio::test]
    async fn retry_policy_stops_on_success_or_returns_last_error() {
        let mut calls = 0;
        let policy = RetryPolicy::new(3);
        let value = policy
            .run(|| {
                calls += 1;
                async move { Ok::<_, AppError>(calls) }
            })
            .await
            .expect("success");
        assert_eq!(value, 1);

        let policy = RetryPolicy::new(2);
        let mut calls = 0;
        let error = policy
            .run(|| {
                calls += 1;
                async move {
                    if calls == 1 {
                        Err::<(), _>(AppError::Timeout)
                    } else {
                        Err::<(), _>(AppError::InvalidInput)
                    }
                }
            })
            .await
            .expect_err("failures");
        assert!(matches!(error, AppError::InvalidInput));
        assert_eq!(calls, 2);
    }

    #[tokio::test]
    async fn timeout_wraps_elapsed_and_completed_futures() {
        assert_eq!(
            with_timeout(async { Ok::<_, AppError>(7) }, 1_000)
                .await
                .expect("fast"),
            7
        );
        assert!(matches!(
            with_timeout(
                async {
                    tokio::time::sleep(Duration::from_millis(50)).await;
                    Ok::<_, AppError>(())
                },
                1
            )
            .await,
            Err(AppError::Timeout)
        ));
    }
}
