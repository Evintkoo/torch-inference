# Copyright (c) 2026 Torviello.
"""Shared error contract for the verification harness."""

from __future__ import annotations


class EngineError(Exception):
    """Base class for engine verification errors."""

    code = "internal"

    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


class InvalidInputError(EngineError):
    code = "invalid_input"


class PayloadTooLargeError(EngineError):
    code = "payload_too_large"
