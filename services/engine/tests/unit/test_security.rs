// Copyright (c) 2026 Torviello.
use proptest::prelude::*;
use torviello_engine::security::{MAX_BODY_BYTES, sanitize_input};

#[test]
fn payload_limit_is_bounded() {
    let oversized = "a".repeat(MAX_BODY_BYTES + 1);
    assert!(sanitize_input(&oversized).is_err());
}

#[test]
fn nul_byte_is_rejected() {
    assert!(sanitize_input("a\0b").is_err());
}

proptest! {
    #[test]
    fn sanitizer_never_returns_nul(value in ".{0,128}") {
        if let Ok(clean) = sanitize_input(&value) {
            prop_assert!(!clean.contains('\0'));
        }
    }
}
