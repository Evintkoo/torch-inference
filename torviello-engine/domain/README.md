# torviello-engine/domain

Domain model for the core PyTorch inference runtime.

## Purpose

Establish the business concepts and invariants that specifications, contracts, tests, and evaluations trace back to. The engine domain owns model identity, model assets, backend selection, execution requests, and observable results.

## Contents

- [glossary.md](glossary.md) — ubiquitous language for the engine bounded context.
- [context-map.md](context-map.md) — bounded contexts, relationships, and ownership.
- [entities.md](entities.md) — aggregates, value objects, and relationships.
- [invariants.md](invariants.md) — conditions that hold in every reachable state.
- [lifecycle.md](lifecycle.md) — engine, configuration, model, download, inference, streaming, session, and shutdown lifecycles.
- [events.md](events.md) — domain event vocabulary, payloads, and emission rules.
- [business-rules.md](business-rules.md) — stable rule IDs and invariants.

## Traceability

Every rule in [business-rules.md](business-rules.md) maps to a requirement in `requirements/engine-runtime.md`, a feature in [`../specifications/features/`](../specifications/features/), a check in [`../specifications/checks/`](../specifications/checks/), and an evidence obligation under [HPA-4](../../requirements/assurance-standard.md). A rule without verification is incomplete, not satisfied.

## Ownership

Engine technical owner. Boundary changes with serving or the model registry require a recorded decision.

## Validation

Review the model with the engine specification and the acceptance criteria. Every implemented rule must resolve to a specification, test, and evaluation reference. Run `python3 ../../torviello-enforcer/test_requirement_documents.py` when requirement or check documents change.

## Status

Domain model drafted for the full engine capability set. Model-format and baseline-backend choices remain open in `requirements/open-decisions.md` (OD-001, OD-002).
