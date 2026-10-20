# torviello-engine/contracts/events

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Machine-readable event payload schemas.

## Expected contents

Event schema files with version and compatibility notes.

## Validation

Consumers and producers validate against the same schema.

## Assurance

This directory is governed by [HPA-4](../../../requirements/assurance-standard.md) and the binary [engine acceptance criteria](../../specifications/acceptance-criteria.md). Its artifacts are acceptance-relevant; absence of evidence is a failure, not a pass.
- **Subject:** event contracts.
- **Required evidence:** Event schemas MUST be versioned, validated in CI, backward-compatible under the declared policy, redacted, and aligned with OpenTelemetry 1.44.0 names.
- **Failure:** An unversioned event, a sensitive payload, a breaking change, or an unvalidated schema fails acceptance. No waiver or conditional pass is permitted.
- **Status discipline:** do not claim implementation, conformance, or performance until the evidence is retained and reproducible.

## Status

Repository shape only. No artifact, implementation, or evaluation evidence is recorded here yet.
