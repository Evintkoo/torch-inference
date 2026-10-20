# Copyright (c) 2026 Torviello.
"""Configuration overlay used by the Python verification harness."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    host: str
    port: int
    auth_enabled: bool
    max_body_bytes: int
    timeout_ms: int


def load_settings() -> Settings:
    """Read namespaced environment variables, never committed secrets."""
    return Settings(
        host=os.getenv("TORCH_HOST", "127.0.0.1"),
        port=int(os.getenv("TORCH_PORT", "8000")),
        auth_enabled=os.getenv("TORCH_AUTH_ENABLED", "true") == "true",
        max_body_bytes=int(os.getenv("INFERENCE_MAX_BODY_BYTES", "1048576")),
        timeout_ms=int(os.getenv("INFERENCE_TIMEOUT_MS", "30000")),
    )


def redact(value: str) -> str:
    """Redact a secret before it reaches diagnostics."""
    return "[redacted]" if value else ""
