# Copyright (c) 2026 Torviello.
"""Contract checks for the OpenAPI schema referenced by the engine."""

from __future__ import annotations

from pathlib import Path

CONTRACT = Path("torviello-engine/contracts/openapi.yaml")


def test_contract_exists_and_declares_paths() -> None:
    text = CONTRACT.read_text(encoding="utf-8")
    assert "openapi:" in text
    assert "paths:" in text
    assert "/classify:" in text


def test_contract_exposes_error_envelope() -> None:
    text = CONTRACT.read_text(encoding="utf-8")
    assert "ErrorEnvelope" in text
    assert "application/problem+json" in text
