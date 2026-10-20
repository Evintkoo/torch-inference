# Copyright (c) 2026 Torviello.
"""Unit checks for ENG-001 configuration and secret handling."""

from __future__ import annotations

import os

from torviello_engine.config import load_settings, redact


def test_loopback_default(monkeypatch) -> None:
    monkeypatch.delenv("TORCH_HOST", raising=False)
    assert load_settings().host == "127.0.0.1"


def test_secret_is_redacted() -> None:
    assert redact("value") == "[redacted]"


def test_environment_is_namespaced(monkeypatch) -> None:
    monkeypatch.setenv("TORCH_AUTH_ENABLED", "true")
    assert load_settings().auth_enabled is True
    assert os.environ["TORCH_AUTH_ENABLED"] == "true"
