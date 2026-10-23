# torviello-engine/evaluations/reports

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Dated evaluation reports and release decisions.

## Expected contents

Reports with command, scope, environment, metrics, and per-threshold outcomes.

## Validation

A named owner records the decision; unmet thresholds block release.

## Assurance

This directory is governed by [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md) and the binary [engine acceptance criteria](../../specifications/acceptance-criteria.md). Its artifacts are acceptance-relevant; absence of evidence is a failure, not a pass.
- **Subject:** evaluation reports.
- **Required evidence:** Reports MUST be reproducible from pinned inputs, record all thresholds and observations, include failures and confidence intervals, and be integrity-protected.
- **Failure:** A cherry-picked, non-reproducible, unsigned, or threshold-free report fails acceptance. No waiver or conditional pass is permitted.
- **Status discipline:** do not claim implementation, conformance, or performance until the evidence is retained and reproducible.

## Status

Repository shape only. No artifact, implementation, or evaluation evidence is recorded here yet.
