# torviello-engine/src

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Production implementation for this unit only.

## Expected contents

Source code and the unit's build manifest; no fixtures, benchmarks, or secrets.

## Validation

Builds and passes the unit's required checks.

## Assurance

This directory is governed by [HPA-4](../../requirements/assurance-standard.md) and the binary [engine acceptance criteria](../specifications/acceptance-criteria.md). Its artifacts are acceptance-relevant; absence of evidence is a failure, not a pass.
- **Subject:** source and build artifacts.
- **Required evidence:** Build MUST pass formatting, linting, compilation, and tests with warnings denied; the release artifact MUST have verified SLSA v1.2 Build Level 3 provenance and a signed SBOM.
- **Failure:** A build without reproducible provenance, a signed SBOM, or a clean warning-denied build fails acceptance. No waiver or conditional pass is permitted.
- **Status discipline:** do not claim implementation, conformance, or performance until the evidence is retained and reproducible.

## Status

Repository shape only. No artifact, implementation, or evaluation evidence is recorded here yet.
