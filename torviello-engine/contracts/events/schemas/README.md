# Event schemas

Part of **torviello-engine** — Core PyTorch inference runtime.

## Purpose

Generated JSON Schema for every cataloged domain event.

This directory is governed by [HPA-4](../../../../torviello-enforcer/requirements/assurance-standard.md); presence of generated artifacts is not evidence of handler behavior or conformance.

## Contents

- `configuration/` — 3 events
- `inference/` — 9 events
- `lifecycle/` — 5 events
- `limits/` — 2 events
- `models/` — 11 events
- `operations/` — 6 events
- `security/` — 2 events
- `streaming/` — 9 events

## Generation

Generated JSON Schema files are produced from `contracts/openapi.yaml`, `contracts/events/catalog.yaml`, and `contracts/schemas/common/http-status.yaml`. Run:

```sh
uv run python torviello-engine/contracts/tools/contracts.py generate
```

Do not edit generated `*.schema.json` files directly; `contracts.py check` fails on stale or orphan files.

## Validation

```sh
uv run python torviello-engine/contracts/tools/contracts.py check
uv run pytest -q torviello-enforcer/test_contract_artifacts.py
```

## Status

Generated and structurally validated. No producer emits these events and no consumer validates live payloads.
