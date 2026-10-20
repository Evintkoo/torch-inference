// Copyright (c) 2026 Torviello.
use std::path::{Component, Path, PathBuf};
use std::time::{Duration, Instant};

use crate::error::{AppError, AppResult};

pub const MAX_BODY_BYTES: usize = 1_048_576;
pub const MAX_FRAME_BYTES: usize = 262_144;
pub const MAX_IDEMPOTENCY_KEY_BYTES: usize = 128;
pub const MAX_PAGE_SIZE: usize = 100;
pub const MAX_DECOMPRESSED_BYTES: usize = 4_194_304;
pub const RATE_LIMIT_PER_MINUTE: u32 = 120;

#[derive(Debug, Clone)]
pub struct PageRequest {
    pub cursor: Option<String>,
    pub page_size: usize,
}

impl PageRequest {
    #[must_use]
    pub fn bounded(cursor: Option<String>, requested: usize) -> Self {
        Self {
            cursor,
            page_size: requested.clamp(1, MAX_PAGE_SIZE),
        }
    }
}

pub fn sanitize_input(input: &str) -> AppResult<String> {
    if input.len() > MAX_BODY_BYTES {
        return Err(AppError::PayloadTooLarge);
    }
    if input.contains('\0') {
        return Err(AppError::InvalidInput);
    }
    Ok(input.trim().to_owned())
}

pub fn confine_path(root: &Path, requested: &Path) -> AppResult<PathBuf> {
    if requested
        .components()
        .any(|part| matches!(part, Component::ParentDir))
    {
        return Err(AppError::Forbidden);
    }
    let joined = root.join(requested);
    if !joined.starts_with(root) {
        return Err(AppError::Forbidden);
    }
    Ok(joined)
}

#[derive(Debug)]
pub struct RateLimiter {
    window_start: Instant,
    count: u32,
}

impl RateLimiter {
    #[must_use]
    pub fn new() -> Self {
        Self {
            window_start: Instant::now(),
            count: 0,
        }
    }

    pub fn check(&mut self) -> AppResult<()> {
        if self.window_start.elapsed() >= Duration::from_mins(1) {
            self.window_start = Instant::now();
            self.count = 0;
        }
        self.count += 1;
        if self.count > RATE_LIMIT_PER_MINUTE {
            return Err(AppError::TooManyRequests {
                retry_after_seconds: 60,
            });
        }
        Ok(())
    }
}

impl Default for RateLimiter {
    fn default() -> Self {
        Self::new()
    }
}

#[must_use]
pub fn cache_control(is_sensitive: bool) -> &'static str {
    if is_sensitive {
        "no-store, private"
    } else {
        "public, max-age=60"
    }
}

#[must_use]
pub fn retry_after(seconds: u64) -> (&'static str, String) {
    ("retry-after", seconds.to_string())
}

pub fn decompress_bounded(content_encoding: &str, size: usize) -> AppResult<()> {
    let is_compressed = matches!(content_encoding, "gzip" | "br" | "deflate");
    if is_compressed && size > MAX_DECOMPRESSED_BYTES {
        return Err(AppError::PayloadTooLarge);
    }
    Ok(())
}

#[must_use]
pub fn cors_policy() -> &'static str {
    "allowed_origin: https://console.torviello.local; reverse_proxy terminates TLS 1.3"
}

#[must_use]
pub fn transport_security() -> &'static str {
    "https required for remote profiles; certificate pinning is optional"
}

#[must_use]
pub fn websocket_limits() -> (&'static str, usize) {
    ("max_frame_bytes", MAX_FRAME_BYTES)
}

pub fn idempotency_key(value: &str) -> AppResult<&str> {
    if value.len() > MAX_IDEMPOTENCY_KEY_BYTES {
        return Err(AppError::InvalidInput);
    }
    Ok(value)
}
