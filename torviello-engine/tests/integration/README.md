# torviello-engine/tests/integration

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Integration and end-to-end behavior tests.

## Expected contents

Tests that exercise real adapters, processes, or deployment boundaries.

## Validation

Prerequisites are documented and the environment is reported with results.

## Assurance

This directory is governed by [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md) and the binary [engine acceptance criteria](../../specifications/acceptance-criteria.md). Its artifacts are acceptance-relevant; absence of evidence is a failure, not a pass.
- **Subject:** integration test evidence.
- **Required evidence:** Tests MUST exercise the shipping process with real configuration, failure injection, concurrency, limits, shutdown, and resource-exhaustion scenarios.
- **Failure:** A mock-only happy path, an untested limit, or a leaked process/resource fails acceptance. No waiver or conditional pass is permitted.
- **Status discipline:** do not claim implementation, conformance, or performance until the evidence is retained and reproducible.

## Status

Repository shape only. No artifact, implementation, or evaluation evidence is recorded here yet.
