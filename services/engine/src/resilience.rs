// Copyright (c) 2026 Torviello.
use std::future::Future;
use std::time::Duration;

use crate::error::{AppError, AppResult};

#[derive(Debug)]
pub struct Bulkhead {
    capacity: usize,
    in_flight: usize,
}

impl Bulkhead {
    #[must_use]
    pub fn new(capacity: usize) -> Self {
        Self {
            capacity,
            in_flight: 0,
        }
    }

    pub fn try_acquire(&mut self) -> Option<BulkheadPermit<'_>> {
        if self.in_flight >= self.capacity {
            return None;
        }
        self.in_flight += 1;
        Some(BulkheadPermit { bulkhead: self })
    }
}

pub struct BulkheadPermit<'a> {
    bulkhead: &'a mut Bulkhead,
}

impl Drop for BulkheadPermit<'_> {
    fn drop(&mut self) {
        self.bulkhead.in_flight = self.bulkhead.in_flight.saturating_sub(1);
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
