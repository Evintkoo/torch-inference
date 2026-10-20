# Engine acceptance checks

One document per check ID (32 total). Each document states the observable check, procedure, pass/fail criteria, evidence, mapped requirement, rule controls, and feature scenarios.

## First slice

- [AC-ENG-01](AC-ENG-01.md) — configuration defaults and catalog capability reporting.
- [AC-ENG-02](AC-ENG-02.md) — configuration file loading and precedence.
- [AC-ENG-03](AC-ENG-03.md) — model listing and state dimensions.
- [AC-ENG-04](AC-ENG-04.md) — capability truthfulness.
- [AC-ENG-05](AC-ENG-05.md) — startup diagnostics.
- [AC-ENG-06](AC-ENG-06.md) — first-slice end-to-end behavior.

## Capability set

- [AC-ENG-07](AC-ENG-07.md) — effective configuration and redaction.
- [AC-ENG-08](AC-ENG-08.md) — startup, readiness, and shutdown stages.
- [AC-ENG-09](AC-ENG-09.md) — backend detection and selection.
- [AC-ENG-10](AC-ENG-10.md) — model identity and catalog truthfulness.
- [AC-ENG-11](AC-ENG-11.md) — acquisition, integrity, and removal.
- [AC-ENG-12](AC-ENG-12.md) — model load lifecycle and capacity.
- [AC-ENG-13](AC-ENG-13.md) — result envelope attribution.
- [AC-ENG-14](AC-ENG-14.md) — speech synthesis and streaming.
- [AC-ENG-15](AC-ENG-15.md) — transcription input bounds and output fields.
- [AC-ENG-16](AC-ENG-16.md) — classification bounds, order, and streaming.
- [AC-ENG-17](AC-ENG-17.md) — detection selection, thresholds, and output.
- [AC-ENG-18](AC-ENG-18.md) — assistant proxy isolation and streaming.
- [AC-ENG-19](AC-ENG-19.md) — realtime session negotiation and cleanup.
- [AC-ENG-20](AC-ENG-20.md) — batching, caching, and coalescing isolation.
- [AC-ENG-21](AC-ENG-21.md) — admission, deadlines, and overload.
- [AC-ENG-22](AC-ENG-22.md) — safe edge defaults, auth, and rate identity.
- [AC-ENG-23](AC-ENG-23.md) — unified error model and status mapping.
- [AC-ENG-24](AC-ENG-24.md) — health, readiness, and bounded metrics.
- [AC-ENG-25](AC-ENG-25.md) — truthful, redacted introspection.
- [AC-ENG-26](AC-ENG-26.md) — correlation, structured logs, and diagnostic access.
- [AC-ENG-27](AC-ENG-27.md) — contract/router parity and aliases.
- [AC-ENG-28](AC-ENG-28.md) — off-reactor work, backpressure, and shutdown.
- [AC-ENG-29](AC-ENG-29.md) — sanitization, ordered postprocessing, determinism.
- [AC-ENG-30](AC-ENG-30.md) — offline local operation and egress boundaries.
- [AC-ENG-31](AC-ENG-31.md) — authorized, audited registry administration.
- [AC-ENG-32](AC-ENG-32.md) — explicit build profiles and platform limits.

The source [acceptance-criteria.md](../acceptance-criteria.md) is authoritative. Each check document links to its requirement under `requirements/items/`, its rule clauses, and its feature scenarios.

## Assurance

This directory is governed by [HPA-4](../../../requirements/assurance-standard.md) and the binary [engine acceptance criteria](../acceptance-criteria.md). Its artifacts are acceptance-relevant; absence of evidence is a failure, not a pass.
- **Subject:** acceptance-check evidence.
- **Required evidence:** Every check MUST retain revision-pinned, reproducible evidence for all universal gates and its numeric threshold; a skipped or stale check is not a pass.
- **Failure:** Any section 4 fatal criterion, missing threshold, or stale evidence fails the check. No waiver or conditional pass is permitted.
- **Status discipline:** do not claim implementation, conformance, or performance until the evidence is retained and reproducible.

## Validation

Run `uv run pytest -q torviello-enforcer/test_requirement_documents.py torviello-enforcer/test_engine_requirement_quality.py torviello-enforcer/test_engine_documentation_assurance.py`. A check document is valid only when it parses, links resolve, its threshold is numeric, and its required evidence is stated.

## Status

All 32 check documents and their HPA-4 gates are specified. No product implementation exists, so no check has execution evidence and no pass is claimed.
