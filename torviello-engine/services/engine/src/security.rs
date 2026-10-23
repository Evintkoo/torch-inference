// Copyright (c) 2026 Torviello.
use std::path::{Component, Path, PathBuf};
use std::time::{Duration, Instant};

use crate::error::{AppError, AppResult};

pub const MAX_BODY_BYTES: usize = 1_048_576;
pub const MAX_FRAME_BYTES: usize = 262_144;
pub const MAX_IDEMPOTENCY_KEY_BYTES: usize = 128;
pub const MAX_PAGE_SIZE: usize = 100;
pub const MAX_DECOMPRESSED_BYTES: usize = 4_194_304;

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
    limit: u32,
    window_start: Instant,
    count: u32,
}

impl RateLimiter {
    #[must_use]
    pub fn new(limit: u32) -> Self {
        Self {
            limit,
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
        if self.count > self.limit {
            return Err(AppError::TooManyRequests {
                retry_after_seconds: 60,
            });
        }
        Ok(())
    }
}

impl Default for RateLimiter {
    fn default() -> Self {
        Self::new(120)
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn page_requests_are_clamped() {
        assert_eq!(PageRequest::bounded(None, 0).page_size, 1);
        assert_eq!(PageRequest::bounded(None, 1000).page_size, MAX_PAGE_SIZE);
        assert_eq!(PageRequest::bounded(Some("a".to_owned()), 7).page_size, 7);
    }

    #[test]
    fn input_sanitizer_bounds_and_trims() {
        assert_eq!(sanitize_input("  value \n").expect("valid"), "value");
        assert!(matches!(
            sanitize_input("bad\0value"),
            Err(AppError::InvalidInput)
        ));
        assert!(matches!(
            sanitize_input(&"x".repeat(MAX_BODY_BYTES + 1)),
            Err(AppError::PayloadTooLarge)
        ));
    }

    #[test]
    fn paths_resolve_within_the_root() {
        let root = Path::new("/srv/models");
        assert_eq!(
            confine_path(root, Path::new("demo/model.pt")).expect("inside"),
            PathBuf::from("/srv/models/demo/model.pt")
        );
        assert!(matches!(
            confine_path(root, Path::new("../escape")),
            Err(AppError::Forbidden)
        ));
    }

    #[test]
    fn rate_limiter_rejects_over_limit_and_resets_window() {
        let mut limiter = RateLimiter::new(1);
        limiter.check().expect("first");
        assert!(matches!(
            limiter.check(),
            Err(AppError::TooManyRequests {
                retry_after_seconds: 60
            })
        ));
        limiter.window_start = Instant::now()
            .checked_sub(Duration::from_secs(61))
            .expect("window");
        limiter.check().expect("new window");
        assert_eq!(limiter.count, 1);
        assert_eq!(RateLimiter::default().limit, 120);
    }

    #[test]
    fn cache_and_transport_policies_are_explicit() {
        assert_eq!(cache_control(true), "no-store, private");
        assert_eq!(cache_control(false), "public, max-age=60");
        assert_eq!(retry_after(30), ("retry-after", "30".to_owned()));
        assert!(decompress_bounded("gzip", MAX_DECOMPRESSED_BYTES).is_ok());
        assert!(matches!(
            decompress_bounded("br", MAX_DECOMPRESSED_BYTES + 1),
            Err(AppError::PayloadTooLarge)
        ));
        assert!(decompress_bounded("identity", usize::MAX).is_ok());
        assert!(cors_policy().contains("TLS 1.3"));
        assert!(transport_security().contains("https required"));
        assert_eq!(websocket_limits(), ("max_frame_bytes", MAX_FRAME_BYTES));
    }

    #[test]
    fn idempotency_keys_are_bounded() {
        assert_eq!(idempotency_key("abc").expect("valid"), "abc");
        assert!(matches!(
            idempotency_key(&"k".repeat(MAX_IDEMPOTENCY_KEY_BYTES + 1)),
            Err(AppError::InvalidInput)
        ));
    }
}
