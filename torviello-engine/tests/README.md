# torviello-engine/tests

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Unit, contract, and integration tests for this unit.

## Expected contents

Independently selectable test categories with documented prerequisites:

- **Unit** — domain values, lifecycle transitions, limits, cache keys, error mapping, and redaction.
- **Contract** — OpenAPI document validity, router parity, alias equivalence, status codes, and envelope shape.
- **Integration** — configuration to readiness, model acquisition to load, capability execution, streaming, cancellation, and shutdown.
- **Concurrency** — coalescing and batching isolation, reference release under cancellation, and saturation behavior.
- **Platform** — build-profile capability truthfulness and unsupported-target failure.

## Traceability

Tests name the acceptance check they satisfy (`AC-ENG-01`…`AC-ENG-32`) and the requirement (`ENG-001`…`ENG-026`). A check backed by a manual procedure states the recorded evidence location instead. Tests must not encode weaker limits than the requirement or the contract. Under [HPA-4](../../torviello-enforcer/requirements/assurance-standard.md), security and correctness-critical tests MUST include negative, boundary, and failure cases; untrusted parsers require fuzz corpora; lifecycle and concurrency invariants require formal or Loom-derived tests; and critical modules must meet the coverage and mutation floors.

## Validation

Each category runs independently and records the command and result. Run the contract and requirement checks before claiming a capability is complete:

```
python3 ../torviello-enforcer/test_requirement_documents.py
```

## Status

Repository shape only. No implementation, test, or evaluation evidence is recorded here yet.
