# torviello-engine/evaluations

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Evaluation plans, metrics, datasets, reports, and release decisions.

## Contents

- [engine-capability-evaluation.md](engine-capability-evaluation.md) — gates E1–E8, [HPA-4](../../torviello-enforcer/requirements/assurance-standard.md) assurance gates A1–A11, workloads, thresholds, procedure, evidence layout, and per-requirement coverage.

## Expected contents

A plan with measurable thresholds, a dated report, and finding-to-stage routing. A report is stored under `evaluations/<YYYY-MM-DD>-<gate>/` with retained measurements and a redaction report.

## Validation

Every critical requirement resolves to recorded evaluation evidence. A plan, a green build, or a passing unit test is not evidence. Run the evaluation procedure against a frozen build and record skipped workloads and exceptions.

## Status

Evaluation plan drafted for the full engine capability set and the HPA-4 assurance gates. No evaluation run or report exists yet.
