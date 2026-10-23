# Engine context map

## Bounded contexts

| Context | Responsibility | Owns |
|---|---|---|
| Engine Core | Loads models and executes inference behind stable interfaces. | Model identity, slot lifecycle, request/result types, execution policy. |
| Model Assets | Discovers, verifies, stores, and administers model assets. | Descriptors, digests, acquisition jobs, catalog projections, audit records. |
| Configuration | Resolves and validates TOML configuration and profiles. | Schema, precedence, cross-field validation, startup snapshot. |
| Execution Backends | Detects and selects CPU or accelerator providers. | Capability probes, device and precision selection, fallback policy. |
| Serving Edge | Exposes engine capabilities over the external contract. | Routes, transport mapping, request IDs, error mapping, middleware order. |
| Inference Capabilities | Defines capability-specific input, output, limits, and postprocessing. | TTS, STT, classification, detection, chat, and generic tensor semantics. |
| Realtime Transport | Negotiates and sustains streaming and WebSocket sessions. | Framing, session state, buffer bounds, cancellation. |
| Observability | Reports health, metrics, logs, and runtime introspection. | Probe semantics, metric vocabulary, log schema, sampling windows. |

## Relationships

- **Engine Core → Configuration:** consumes one immutable validated snapshot; does not parse raw files or environment variables.
- **Engine Core → Model Assets:** resolves a verified model by ID; does not read arbitrary paths.
- **Engine Core → Execution Backends:** selects an available backend explicitly; keeps provider-specific types behind an adapter.
- **Inference Capabilities → Engine Core:** declares capability input validation, limits, and postprocessing; does not own loading or scheduling.
- **Serving Edge → Engine Core and Inference Capabilities:** maps contract requests to use cases; does not own model, backend, or capability rules.
- **Realtime Transport → Inference Capabilities:** reuses the same limits and execution path as request/response; does not create a second inference implementation.
- **Observability → all contexts:** consumes events and attribution; must not require access to raw payloads.
- **Model Assets ← Registry Administration (Serving Edge):** administrative mutation is authorized and audited before it changes the catalog.

## Context boundaries

| Boundary | Rule |
|---|---|
| Transport to Engine Core | Requests cross as validated domain values, never as HTTP, Actix, or multipart types. |
| Engine Core to Backend | Provider handles do not appear in domain models, results, or cached values. |
| Engine Core to Cache and Batching | Cached and batched values are owned per caller and attributed; no shared mutable result objects. |
| Capability to Postprocessing | Postprocessing consumes declared result fields, not raw tensors or provider handles. |
| Engine to Upstream Assistant | The upstream client is optional and isolated; its availability cannot change readiness for local inference. |
| Local to Hosted | Hosted mode may add administration and remote configuration downstream; local mode must remain complete without it. |

## Ownership boundaries

The engine technical owner owns Engine Core, Execution Backends, and Inference Capabilities. The serving owner owns the Serving Edge and Realtime Transport. The platform owner owns Hosted Mode. The registry owner owns administrative admission and audit retention. Changes to model identity, error vocabulary, envelope shape, or event names require all affected owners and a recorded decision.

## Change rules

1. A new capability enters through the capability context and declares its limits, output attribution, and postprocessing before it enters the contract.
2. A new backend enters through Execution Backends and must be observable in diagnostics before it can be selected.
3. A new transport enters through Serving Edge or Realtime Transport and must reuse capability validation rather than fork it.
4. Cross-context changes update the context map, the affected requirements, the contract, and the evaluation together.

## Assurance

Governed by [HPA-4](../../torviello-enforcer/requirements/assurance-standard.md) and the [engine acceptance criteria](../specifications/acceptance-criteria.md).
- **Subject:** Bounded-context boundaries.
- **Required evidence:** Context boundaries MUST be explicit, dependency direction MUST be acyclic, and every cross-context interaction MUST name its contract and owner.
- **Failure:** An implicit boundary, a dependency cycle, or an unowned cross-context interaction fails acceptance. No waiver is permitted.
