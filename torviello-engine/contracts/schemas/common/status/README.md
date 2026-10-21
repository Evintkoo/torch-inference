# HTTP status response schemas

Part of **torviello-engine** — Core PyTorch inference runtime.

## Purpose

One JSON Schema per assigned HTTP status code, derived from the approved status policy.

This directory is governed by [HPA-4](../../../../../requirements/assurance-standard.md); presence of generated artifacts is not evidence of handler behavior or conformance.

## Contents

- `<code>.schema.json` — body shape, engine use, trigger, media type, schema, required/optional headers, header rules, cache/retry semantics, body fields, error codes, and examples for one status code.
- No-body statuses use the JSON Schema `null` type; error statuses reference `ErrorEnvelope`; success statuses reference `Envelope`.

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

Generated policy schemas. Header and body expectations are contract metadata; handlers are not yet tested against them.
