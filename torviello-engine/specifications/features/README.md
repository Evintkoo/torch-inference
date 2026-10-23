# Engine feature specifications

Executable or reviewable scenarios that specify observable engine behavior.

## Contents

- `load-config-and-list-models.feature` — first vertical slice for configuration loading and capability reporting.
- `configuration.feature` — configuration precedence, validation, secrets, and startup rejection.
- `startup-lifecycle.feature` — startup, readiness, degradation, drain, and shutdown.
- `backend-selection.feature` — backend capability detection, selection, fallback, and observability.
- `model-catalog.feature` — independent catalog presence, availability, download, and load state.
- `model-acquisition.feature` — bounded acquisition, path safety, integrity, activation, and cleanup.
- `model-loading.feature` — single initialization, joining, unload, eviction, capacity, and reference release.
- `inference-envelope.feature` — success attribution, version, request ID, and warnings.
- `text-to-speech.feature` — synthesis validation, audio framing, and stream termination.
- `speech-to-text.feature` — bounded audio handling, language, transcript, and timing.
- `image-classification.feature` — order preservation, item and dimension bounds, and `top_k`.
- `object-detection.feature` — model family, thresholds, and stable output fields.
- `llm-proxy.feature` — optional upstream, credential isolation, deadlines, streaming, and readiness.
- `realtime-transports.feature` — negotiation, framing, ordering, backpressure, and disconnect.
- `batching-and-caching.feature` — cache key completeness, coalescing, caller isolation, and ordering.
- `resilience-and-limits.feature` — admission, bounded queues, deadlines, circuit, and bulkhead.
- `auth-and-security.feature` — safe defaults, JWT, scopes, trusted proxies, and redaction.
- `error-model.feature` — stable codes, status mapping, retryability, and no partial success.
- `health-and-metrics.feature` — probe separation, subsystem status, and bounded labels.
- `system-introspection.feature` — effective configuration, runtime state, windows, and redaction.
- `logging-and-correlation.feature` — correlation, structure, levels, retention, and redaction.
- `api-contract-versioning.feature` — contract/router parity, aliases, and compatibility.
- `concurrency-and-streaming.feature` — off-reactor execution, cancellation, credits, and release.
- `postprocessing-and-sanitization.feature` — sanitize before inference, ordered steps, and safe output.
- `local-offline-and-boundaries.feature` — offline operation, no account, optional upstream, and egress.
- `registry-administration.feature` — authorized, audited, atomic registration and removal.
- `platform-and-build-profiles.feature` — declared providers, optional features, and platform limits.

## Conventions

- Put requirement IDs in the feature tags and scenario text.
- Use Given/When/Then with observable outcomes.
- Keep scenarios free of implementation detail that belongs in contracts or design.
- Every engine capability feature maps to exactly one requirement in `requirements/engine-runtime.md` and one assessment in `../acceptance-criteria.md`. The first-slice feature maps its source requirements and `AC-ENG-06`.
- A scenario that cannot be observed through the contract, logs, metrics, events, or a recorded manual procedure is not a valid acceptance scenario.
- Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), every feature MUST include at least one negative, boundary, or failure scenario in addition to its success paths.

## Validation

Run `uv run pytest -q torviello-enforcer/test_requirement_documents.py torviello-enforcer/test_engine_requirement_quality.py torviello-enforcer/test_engine_documentation_assurance.py`. Every feature MUST remain tag-traceable to exactly one engine requirement, reference one acceptance check, and include at least one negative, boundary, or failure scenario.

## Status

All 27 feature files are specified and `@HPA-4` tagged. Scaffold tests cover parts of `load-config-and-list-models`, `model-acquisition`, `model-loading`, and `health-and-metrics`, but no Gherkin step definitions or HPA-4 evaluation evidence exist, so no feature is claimed as passing.
