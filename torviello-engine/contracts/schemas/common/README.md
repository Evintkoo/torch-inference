# Common schemas

Part of **torviello-engine** — Core PyTorch inference runtime.

## Purpose

Shared success envelopes, metadata, RFC 9457 errors, HTTP status policy, and one response schema per assigned status.

This directory is governed by [HPA-4](../../../../torviello-enforcer/requirements/assurance-standard.md); presence of generated artifacts is not evidence of handler behavior or conformance.

## Contents

- `status/` — one JSON Schema per assigned HTTP status code.
- `http-status.yaml` — versioned source policy for every status: trigger, engine use, body kind, media type, schema, headers, cache/retry, body fields, and error codes.
- `../../http-status.catalog.schema.json` — JSON Schema that validates the policy catalog.
- `http-response-standards.md` — approved human-readable status policy with RFC citations.
- `Envelope.schema.json`
- `ErrorEnvelope.schema.json`
- `Meta.schema.json`

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

Generated from the OpenAPI components. Structurally validated; not evidence of runtime behavior.
