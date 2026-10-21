# torviello-engine

Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Layout

- `domain/` — domain model, invariants, lifecycles, events, and ownership.
- `specifications/` — use cases, requirement IDs, and acceptance criteria.
- `contracts/` — machine-readable interfaces and event schemas.
- `src/` — reserved production location; the current scaffold lives in `../services/engine`.
- `tests/` — reserved for engine tests; the current scaffold tests live in `../services/engine/tests`.
- `evaluations/` — plans, datasets, reports, and release decisions.

## Scope

The engine serves local inference across speech synthesis, speech transcription, image classification, object detection, generic tensors, and an optional assistant proxy. It owns model identity, the model lifecycle, backend selection, admission and limits, result attribution, and redaction. It does not require an account, control plane, or outbound network after required assets are prepared.

## Requirements and contracts

- Requirements: [`../requirements/engine-runtime.md`](../requirements/engine-runtime.md) (`ENG-001`…`ENG-026`).
- Acceptance checks: [`specifications/acceptance-criteria.md`](specifications/acceptance-criteria.md) (`AC-ENG-07`…`AC-ENG-32`).
- HTTP target contract: [`contracts/openapi.yaml`](contracts/openapi.yaml) and [`contracts/api-inventory.md`](contracts/api-inventory.md).
- Implemented subset: [`contracts/openapi.first-slice.yaml`](contracts/openapi.first-slice.yaml) (health, catalog, acquisition, load lifecycle, classification, metrics).
- Domain rules: [`domain/business-rules.md`](domain/business-rules.md) (`ENG-RULE-001`…`ENG-RULE-042`).
- Evaluation plan: [`evaluations/engine-capability-evaluation.md`](evaluations/engine-capability-evaluation.md) (gates E1–E8).
- Assurance standard: [`../requirements/assurance-standard.md`](../requirements/assurance-standard.md) (HPA-4).

## Validation

Run the repository checks from the root:

```sh
uv sync --locked
uv run pytest
cargo test --workspace --locked
npm ci && npm run build && npm test
```

The scaffold evidence is not evaluation evidence. Record evaluation evidence in `evaluations/` after the required models, datasets, and harness exist. Follow `GOV-06` through `GOV-10` in `../torviello-enforcer/governance/`.

## Status

Domain model, full capability requirements, features, acceptance checks, the HTTP contract, and the HPA-4 assurance standard are drafted.

A non-production scaffold exists under [`../services/engine`](../services/engine) and [`../web`](../web). It has a buildable Rust API shell, HS256 authentication, configuration validation, RFC 9457 errors, and unit/contract/integration tests, plus a React console shell. It **does** implement a validated model catalog, confined local acquisition with digest verification, acquisition job status and SSE progress, and a load lifecycle with single-flight initialization, reference-aware unload, and a capacity policy. The bundled `engine-demo-tensor` asset uses a reference CPU linear-classifier adapter (`torviello-tensor-v1`), and `engine-demo-torchscript` executes a traced image classifier through TorchScript on CPU when built with the `torchscript` feature. `POST /classify` returns ordered top-k results for that fixture. It does **not** implement remote Hugging Face acquisition, managed-asset deletion, the remaining inference routes, persistence, OpenTelemetry export, WebSocket transport, or the full 22-path canonical contract (23 canonical operations, 32 with aliases). It has no formal model, fuzz corpus, provenance attestation, or evaluation evidence. Passing scaffold tests is not product conformance.
