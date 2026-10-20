# torviello-engine/specifications

Behavior specifications for the engine unit.

## Purpose

Turn the engine domain rules into testable use cases, functional requirements with stable IDs, edge cases, and acceptance criteria before implementation.

Every acceptance check must be **SMART**: specific about the actor, action, and observable outcome; measurable with a numeric threshold or exact state; achievable with a declared evidence method and environment; relevant to a linked requirement and release gate; and time-bound to the revision, measurement window, and re-acceptance trigger. The normative contract is in [`requirements/assurance-standard.md`](../../requirements/assurance-standard.md) §2.1 and [`acceptance-criteria.md`](acceptance-criteria.md) §1.1.

## Contents

### Features

- [features/load-config-and-list-models.feature](features/load-config-and-list-models.feature) — first vertical slice: load TOML configuration and expose configured capabilities.
- [features/configuration.feature](features/configuration.feature) — precedence, validation, secrets, and startup rejection.
- [features/startup-lifecycle.feature](features/startup-lifecycle.feature) — validation, readiness, optional components, drain, and shutdown.
- [features/backend-selection.feature](features/backend-selection.feature) — capability detection, explicit selection, fallback, and observability.
- [features/model-catalog.feature](features/model-catalog.feature) — independent catalog, availability, download, and load state.
- [features/model-acquisition.feature](features/model-acquisition.feature) — bounded downloads, name validation, integrity, atomic activation, cleanup.
- [features/model-loading.feature](features/model-loading.feature) — load, join, unload, eviction, capacity, and reference release.
- [features/inference-envelope.feature](features/inference-envelope.feature) — success attribution, version, request ID, and warnings.
- [features/text-to-speech.feature](features/text-to-speech.feature) — synthesis parameters, audio framing, and streaming.
- [features/speech-to-text.feature](features/speech-to-text.feature) — bounded audio decode, language, transcript, and timing.
- [features/image-classification.feature](features/image-classification.feature) — input order, item bounds, dimensions, and `top_k`.
- [features/object-detection.feature](features/object-detection.feature) — model family validation, thresholds, and stable boxes.
- [features/llm-proxy.feature](features/llm-proxy.feature) — optional upstream, isolation, deadlines, streaming, and readiness.
- [features/realtime-transports.feature](features/realtime-transports.feature) — negotiation, framing, ordering, backpressure, disconnect.
- [features/batching-and-caching.feature](features/batching-and-caching.feature) — cache key completeness, coalescing, isolation, and ordering.
- [features/resilience-and-limits.feature](features/resilience-and-limits.feature) — admission, bounded queues, deadlines, circuit, and bulkhead.
- [features/auth-and-security.feature](features/auth-and-security.feature) — safe defaults, JWT, scopes, trusted proxies, and redaction.
- [features/error-model.feature](features/error-model.feature) — stable codes, status mapping, retryability, and no partial success.
- [features/health-and-metrics.feature](features/health-and-metrics.feature) — distinct probes, subsystem status, bounded labels.
- [features/system-introspection.feature](features/system-introspection.feature) — effective configuration, runtime state, windows, redaction.
- [features/logging-and-correlation.feature](features/logging-and-correlation.feature) — correlation, structure, levels, retention, and redaction.
- [features/api-contract-versioning.feature](features/api-contract-versioning.feature) — contract/router parity, aliases, compatibility.
- [features/concurrency-and-streaming.feature](features/concurrency-and-streaming.feature) — off-reactor execution, cancellation, credits, and release.
- [features/postprocessing-and-sanitization.feature](features/postprocessing-and-sanitization.feature) — sanitize before inference, ordered steps, safe output.
- [features/local-offline-and-boundaries.feature](features/local-offline-and-boundaries.feature) — offline operation, no account, optional upstream, egress.
- [features/registry-administration.feature](features/registry-administration.feature) — authorized, audited, atomic registration and removal.
- [features/platform-and-build-profiles.feature](features/platform-and-build-profiles.feature) — declared providers, optional features, platform limits.

### Acceptance

- [acceptance-criteria.md](acceptance-criteria.md) — check mapping for the first slice and the full capability set.
- [`checks/`](checks/README.md) — one document per check ID in [`acceptance-criteria.md`](acceptance-criteria.md).

### Contracts

- [../contracts/openapi.yaml](../contracts/openapi.yaml) — authoritative HTTP contract.
- [../contracts/api-inventory.md](../contracts/api-inventory.md) — route, auth, limit, and error traceability.
- [../../requirements/assurance-standard.md](../../requirements/assurance-standard.md) — HPA-4 requirement quality and evidence bar.

## Validation

Each requirement ID resolves in [`requirements/engine-runtime.md`](../../requirements/engine-runtime.md). Acceptance checks map to tests in `../tests/` or to a recorded manual check. Run `python3 ../../torviello-enforcer/test_requirement_documents.py` and the engine tests after implementation.

## Status

Requirements, features, acceptance checks, the HTTP contract, and the HPA-4 assurance standard are drafted for the full engine capability set. Implementation, automated tests, formal models, fuzz corpora, and evaluation evidence have not started.
