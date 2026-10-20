# torviello-engine/src/infrastructure

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Adapters for external systems and runtime concerns.

## Expected contents

Configuration, persistence, transport, observability, and backend adapters.

## Validation

Adapter behavior is verified without leaking infrastructure types into the domain.

## Assurance

This directory is governed by [HPA-4](../../../requirements/assurance-standard.md) and the binary [engine acceptance criteria](../../specifications/acceptance-criteria.md). Its artifacts are acceptance-relevant; absence of evidence is a failure, not a pass.
- **Subject:** infrastructure adapters.
- **Required evidence:** Adapters MUST pass contract tests against the real external boundary, including timeout, retry, cancellation, malformed-response, and resource-exhaustion cases.
- **Failure:** An untested adapter failure mode, an unbounded retry, or a contract mismatch fails acceptance. No waiver or conditional pass is permitted.
- **Status discipline:** do not claim implementation, conformance, or performance until the evidence is retained and reproducible.

## Status

Repository shape only. No artifact, implementation, or evaluation evidence is recorded here yet.
