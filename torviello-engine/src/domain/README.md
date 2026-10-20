# torviello-engine/src/domain

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Domain rules and types for this unit.

## Expected contents

Entities, value objects, invariants, and domain services.

## Validation

Unit tests cover invariants and rejection paths.

## Assurance

This directory is governed by [HPA-4](../../../requirements/assurance-standard.md) and the binary [engine acceptance criteria](../../specifications/acceptance-criteria.md). Its artifacts are acceptance-relevant; absence of evidence is a failure, not a pass.
- **Subject:** domain types and invariants.
- **Required evidence:** Invariants MUST have executable property tests and rejection-path tests; domain code MUST be independent of transport, database, and ML provider types.
- **Failure:** An unenforced invariant, a provider type in the domain, or a nondeterministic domain test fails acceptance. No waiver or conditional pass is permitted.
- **Status discipline:** do not claim implementation, conformance, or performance until the evidence is retained and reproducible.

## Status

Repository shape only. No artifact, implementation, or evaluation evidence is recorded here yet.
