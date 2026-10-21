# Contract tooling

Part of **torviello-engine** — Core PyTorch inference runtime.

## Purpose

Deterministic generator and staleness checker for the contract schema set.

This directory is governed by [HPA-4](../../../requirements/assurance-standard.md); presence of generated artifacts is not evidence of handler behavior or conformance.

## Contents

- `contracts.py` — CLI: `generate` writes all schemas and AsyncAPI; `check` detects stale, missing, and orphan artifacts and verifies event coverage.
- `status.py` — generates one detailed response schema per assigned HTTP status from `schemas/common/http-status.yaml`, including trigger, content type, schema, header rules, cache/retry, body fields, error codes, and examples.
- `status_tester.py` — validates the status catalog, every generated status schema, every embedded example, and each OpenAPI operation's status usage; prints a human-readable report or `--json` output.

## Generation

Generated JSON Schema files are produced from `contracts/openapi.yaml`, `contracts/events/catalog.yaml`, and `contracts/schemas/common/http-status.yaml`. Run:

```sh
uv run python torviello-engine/contracts/tools/contracts.py generate
```

Do not edit generated `*.schema.json` files directly; `contracts.py check` fails on stale or orphan files.

## Validation

```sh
uv run python torviello-engine/contracts/tools/contracts.py check
uv run python torviello-engine/contracts/tools/status_tester.py
cargo test --locked --test endpoint_usage
uv run ruff check .
```

## Status

Generator and check are implemented; generated artifacts are current. The Operation usage test proves router reachability and response-contract behavior for the exercised requests; it does not prove every error path or payload field.
