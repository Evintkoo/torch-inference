# torviello-engine/tests/unit

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Fast, deterministic unit tests.

## Expected contents

Tests for domain rules, application logic, and narrow helpers.

## Validation

Runs without external services or hardware.

## Assurance

This directory is governed by [HPA-4](../../../requirements/assurance-standard.md) and the binary [engine acceptance criteria](../../specifications/acceptance-criteria.md). Its artifacts are acceptance-relevant; absence of evidence is a failure, not a pass.
- **Subject:** unit test evidence.
- **Required evidence:** Unit tests MUST be deterministic, hermetic, and run without network or hardware; domain invariants and error paths MUST be covered.
- **Failure:** A flaky, network-dependent, or invariant-skipping unit test fails acceptance. No waiver or conditional pass is permitted.
- **Status discipline:** do not claim implementation, conformance, or performance until the evidence is retained and reproducible.

## Status

Repository shape only. No artifact, implementation, or evaluation evidence is recorded here yet.
