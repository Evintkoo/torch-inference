# torviello-engine/tests/contract

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Contract tests for interfaces and events.

## Expected contents

Consumer and provider checks against the approved schemas.

## Validation

Both sides validate against the same contract version.

## Assurance

This directory is governed by [HPA-4](../../../requirements/assurance-standard.md) and the binary [engine acceptance criteria](../../specifications/acceptance-criteria.md). Its artifacts are acceptance-relevant; absence of evidence is a failure, not a pass.
- **Subject:** contract test evidence.
- **Required evidence:** Tests MUST validate OpenAPI 3.2.1, RFC 9457 `application/problem+json`, auth/TLS policy, event schemas, and backward-compatibility promises.
- **Failure:** A schema drift, an unvalidated error shape, or a compatibility break fails acceptance. No waiver or conditional pass is permitted.
- **Status discipline:** do not claim implementation, conformance, or performance until the evidence is retained and reproducible.

## Status

Repository shape only. No artifact, implementation, or evaluation evidence is recorded here yet.
