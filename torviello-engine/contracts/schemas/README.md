# Contract schemas

Part of **torviello-engine** — Core PyTorch inference runtime.

## Purpose

Generated JSON Schema artifacts for the engine HTTP and event contract.

This directory is governed by [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md); presence of generated artifacts is not evidence of handler behavior or conformance.

## Contents

- `common/` — shared success, metadata, error, status, and HTTP policy artifacts.
- `health/`, `catalog/`, `models/`, `speech/`, `vision/`, `assistant/`, `system/` — reusable component schemas.
- `operations/` — one request/response schema set per OpenAPI operation, grouped by tag.
- Every `*.schema.json` file contains exactly one JSON Schema document.

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

Generated and structurally validated. No handler behavior, producer/consumer agreement, or conformance is claimed.
