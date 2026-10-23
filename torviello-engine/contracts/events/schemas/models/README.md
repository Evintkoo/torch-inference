# Models event schemas

Part of **torviello-engine** — Core PyTorch inference runtime.

## Purpose

Generated schemas for models domain events.

This directory is governed by [HPA-4](../../../../../torviello-enforcer/requirements/assurance-standard.md); presence of generated artifacts is not evidence of handler behavior or conformance.

## Contents

- `model.registered` (3 required/optional payload fields)
- `model.registration_denied` (3 required/optional payload fields)
- `model.download_queued` (3 required/optional payload fields)
- `model.download_progress` (4 required/optional payload fields)
- `model.download_verified` (3 required/optional payload fields)
- `model.download_failed` (3 required/optional payload fields)
- `model.activated` (3 required/optional payload fields)
- `model.loaded` (5 required/optional payload fields)
- `model.load_failed` (3 required/optional payload fields)
- `model.unloaded` (3 required/optional payload fields)
- `model.evicted` (3 required/optional payload fields)

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

Generated from the event catalog. Payload fields await producer/consumer approval; no runtime emission exists.
