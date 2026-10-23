# torviello-engine/contracts/events

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Machine-readable event payload schemas.

## Contents

- [catalog.yaml](catalog.yaml) — normative event names, requirements, and payload fields.
- [schemas/](schemas/) — one generated JSON Schema 2020-12 per cataloged event.
- [asyncapi.yaml](asyncapi.yaml) — SSE and WebSocket channels referencing those schemas.
- [../traceability.md](../traceability.md) — feature-to-event mapping.

Schemas are generated; edit `catalog.yaml` and run `uv run python torviello-engine/contracts/tools/contracts.py generate`.

## Validation

```sh
uv run python torviello-engine/contracts/tools/contracts.py check
uv run pytest -q torviello-enforcer/test_contract_artifacts.py
```

Every event documented in `../../domain/events.md` must appear in `catalog.yaml` and have a schema. The schema set validates structurally; producer and consumer agreement is not yet recorded.

## Assurance

This directory is governed by [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md) and the binary [engine acceptance criteria](../../specifications/acceptance-criteria.md). Its artifacts are acceptance-relevant; absence of evidence is a failure, not a pass.
- **Subject:** event contracts.
- **Required evidence:** Event schemas MUST be versioned, validated in CI, backward-compatible under the declared policy, redacted, and aligned with OpenTelemetry 1.44.0 names.
- **Failure:** An unversioned event, a sensitive payload, a breaking change, or an unvalidated schema fails acceptance. No waiver or conditional pass is permitted.
- **Status discipline:** do not claim implementation, conformance, or performance until the evidence is retained and reproducible.

## Status

The catalog and 47 event schemas exist and are structurally validated. No producer emits these events, no consumer validates live payloads, and no compatibility review has approved the field choices.
