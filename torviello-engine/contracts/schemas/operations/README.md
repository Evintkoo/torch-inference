# Operation schemas

Part of **torviello-engine** — Core PyTorch inference runtime.

## Purpose

Generated request and response schemas for every OpenAPI operation, grouped by tag domain.

This directory is governed by [HPA-4](../../../../torviello-enforcer/requirements/assurance-standard.md); presence of generated artifacts is not evidence of handler behavior or conformance.

## Contents

- `administration/` — 3 operations: `clearSystemLogs`, `registerModel`, `deleteModel`
- `assistant/` — 1 operations: `createChatCompletion`
- `catalog/` — 3 operations: `listModels`, `getModel`, `listModelsAlias`
- `health/` — 4 operations: `getHealth`, `getLiveness`, `getReadiness`, `getHealthAlias`
- `models/` — 5 operations: `loadModel`, `unloadModel`, `downloadModel`, `getDownloadStatus`, `streamDownloadProgress`
- `observability/` — 3 operations: `getSystemInfo`, `getSystemLogs`, `getMetrics`
- `speech/` — 7 operations: `synthesizeSpeech`, `streamSpeech`, `transcribeSpeech`, `audioWebSocket`, `synthesizeSpeechAlias`, `streamSpeechAlias`, `transcribeSpeechAlias`
- `vision/` — 6 operations: `classifyImages`, `detectObjects`, `classifyWebSocket`, `detectWebSocket`, `classifyImagesAlias`, `detectObjectsAlias`

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

Generated for all 32 operations, including aliases. Every contract path is routed; 13 operations are implemented and 19 return `501 not_implemented`.
