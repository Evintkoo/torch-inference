# torviello-engine/src/application

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Application use cases and orchestration.

## Expected contents

Use-case handlers, ports, and transaction boundaries.

## Validation

Contract and integration tests exercise the use cases.

## Assurance

This directory is governed by [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md) and the binary [engine acceptance criteria](../../specifications/acceptance-criteria.md). Its artifacts are acceptance-relevant; absence of evidence is a failure, not a pass.
- **Subject:** application use cases.
- **Required evidence:** Every use case MUST have success, boundary, invalid-input, cancellation, and dependency-failure tests; idempotency, timeouts, and transaction boundaries MUST be exercised.
- **Failure:** Infrastructure types leaking into use cases, unbounded work, or an untested failure path fails acceptance. No waiver or conditional pass is permitted.
- **Status discipline:** do not claim implementation, conformance, or performance until the evidence is retained and reproducible.

## Status

Repository shape only. No artifact, implementation, or evaluation evidence is recorded here yet.
