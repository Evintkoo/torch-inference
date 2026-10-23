# torviello-engine/evaluations/datasets

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Evaluation datasets and workload definitions.

## Expected contents

Versioned inputs, provenance, and usage constraints.

## Validation

Reports identify the dataset version used.

## Assurance

This directory is governed by [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md) and the binary [engine acceptance criteria](../../specifications/acceptance-criteria.md). Its artifacts are acceptance-relevant; absence of evidence is a failure, not a pass.
- **Subject:** evaluation datasets.
- **Required evidence:** Each dataset MUST have provenance, license, checksum, version pin, PII review, and documented preprocessing; reports MUST identify the exact dataset version.
- **Failure:** An unlicensed, unversioned, unchecked, or PII-unsafe dataset fails acceptance. No waiver or conditional pass is permitted.
- **Status discipline:** do not claim implementation, conformance, or performance until the evidence is retained and reproducible.

## Status

Repository shape only. No artifact, implementation, or evaluation evidence is recorded here yet.
