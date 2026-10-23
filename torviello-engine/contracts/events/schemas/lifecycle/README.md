# Lifecycle event schemas

Part of **torviello-engine** — Core PyTorch inference runtime.

## Purpose

Generated schemas for lifecycle domain events.

This directory is governed by [HPA-4](../../../../../torviello-enforcer/requirements/assurance-standard.md); presence of generated artifacts is not evidence of handler behavior or conformance.

## Contents

- `engine.starting` (1 required/optional payload fields)
- `engine.ready` (3 required/optional payload fields)
- `engine.degraded` (3 required/optional payload fields)
- `engine.stopping` (2 required/optional payload fields)
- `engine.stopped` (4 required/optional payload fields)

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
