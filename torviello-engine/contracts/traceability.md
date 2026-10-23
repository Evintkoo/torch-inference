# Specification-to-contract traceability

Every engine feature specification maps to machine-readable contract elements. This artifact is governed by [HPA-4](../../torviello-enforcer/requirements/assurance-standard.md): its mapping is acceptance-relevant, and presence alone is not conformance evidence. The Markdown feature files and acceptance checks remain the normative behavior source; the OpenAPI, AsyncAPI, and JSON Schema artifacts are the machine-readable projection that tests and implementations consume.

| Feature | Requirement | Acceptance | HTTP operations | Events | Schema artifacts |
|---|---|---|---|---|---|
| `load-config-and-list-models` | PA-002, RP-001, RP-002, RP-014, ED-011 | AC-ENG-06 | `getHealth`, `listModels`, `getModel` | `config.loaded` | `HealthSnapshot`, `ModelSummary`, `ModelDetail`, configuration schema |
| `configuration` | ENG-001 | AC-ENG-07 | — | `config.loaded`, `config.rejected`, `config.reload_rejected` | configuration schema |
| `startup-lifecycle` | ENG-002 | AC-ENG-08 | `getLiveness`, `getReadiness` | `engine.starting`, `engine.ready`, `engine.degraded`, `engine.stopping`, `engine.stopped` | `Liveness`, `Readiness` |
| `backend-selection` | ENG-003 | AC-ENG-09 | `getHealth`, `getReadiness` | `backend.selected`, `backend.unavailable` | `HealthSnapshot`, `Readiness` |
| `model-catalog` | ENG-004 | AC-ENG-10 | `listModels`, `getModel` | `model.activated` | `ModelSummary`, `ModelDetail` |
| `model-acquisition` | ENG-005 | AC-ENG-11 | `downloadModel`, `getDownloadStatus`, `streamDownloadProgress` | `model.download_queued`, `model.download_progress`, `model.download_verified`, `model.download_failed`, `model.activated` | `DownloadRequest`, `DownloadJob`, `DownloadProgressEvent` |
| `model-loading` | ENG-006 | AC-ENG-12 | `loadModel`, `unloadModel` | `model.loaded`, `model.load_failed`, `model.unloaded`, `model.evicted` | `ModelSlot` |
| `inference-envelope` | ENG-007 | AC-ENG-13 | capability operations | `inference.completed`, `inference.failed` | `Envelope`, `Meta` |
| `text-to-speech` | ENG-008 | AC-ENG-14 | `synthesizeSpeech`, `streamSpeech` | `stream.opened`, `stream.completed`, `stream.failed` | `TtsRequest`, AsyncAPI `ttsStream` |
| `speech-to-text` | ENG-009 | AC-ENG-15 | `transcribeSpeech` | `inference.completed`, `inference.failed` | `SttRequest`, `Transcript` |
| `image-classification` | ENG-010 | AC-ENG-16 | `classifyImages`, `classifyWebSocket` | `inference.batched`, `inference.completed` | `ClassifyRequest`, `Classification` |
| `object-detection` | ENG-011 | AC-ENG-17 | `detectObjects`, `detectWebSocket` | `inference.batched`, `inference.completed` | `DetectRequest`, `DetectionResult` |
| `llm-proxy` | ENG-012 | AC-ENG-18 | `createChatCompletion` | `inference.completed`, `inference.failed`, `inference.cancelled` | `ChatRequest`, `ChatResponse`, `ChatStreamEvent` |
| `realtime-transports` | ENG-013 | AC-ENG-19 | WebSocket upgrades, SSE operations | `stream.*`, `session.*` | AsyncAPI channels, `ChatStreamEvent`, `DownloadProgressEvent` |
| `batching-and-caching` | ENG-014 | AC-ENG-20 | capability operations | `inference.cache_hit`, `inference.cache_miss`, `inference.coalesced`, `inference.batched` | `Envelope`, `Meta` |
| `resilience-and-limits` | ENG-015 | AC-ENG-21 | capability operations | `inference.rejected`, `ratelimit.rejected`, `limit.rejected`, `circuit.opened`, `circuit.closed` | `ErrorEnvelope` |
| `auth-and-security` | ENG-016 | AC-ENG-22 | protected operations | `auth.denied`, `auth.forbidden` | `bearerAuth`, `ErrorEnvelope` |
| `error-model` | ENG-017 | AC-ENG-23 | every operation | `inference.failed`, `inference.rejected` | `ErrorEnvelope`, per-operation problem responses |
| `health-and-metrics` | ENG-018 | AC-ENG-24 | `getHealth`, `getLiveness`, `getReadiness`, `getMetrics` | `metric.scrape` | `HealthSnapshot`, `Liveness`, `Readiness` |
| `system-introspection` | ENG-019 | AC-ENG-25 | `getSystemInfo`, `getSystemLogs`, `clearSystemLogs` | `log.accessed` | `SystemInfo`, `LogView` |
| `logging-and-correlation` | ENG-020 | AC-ENG-26 | every operation | `log.accessed` | `Meta`, `ErrorEnvelope.request_id` |
| `api-contract-versioning` | ENG-021 | AC-ENG-27 | every operation and alias | — | all schemas, AsyncAPI document |
| `concurrency-and-streaming` | ENG-022 | AC-ENG-28 | SSE and WebSocket operations | `stream.*`, `inference.cancelled` | AsyncAPI channels |
| `postprocessing-and-sanitization` | ENG-023 | AC-ENG-29 | capability operations | — | `Meta.postprocess_steps`, `Meta.warnings` |
| `local-offline-and-boundaries` | ENG-024 | AC-ENG-30 | all operations | `auth.denied` | OpenAPI servers, configuration schema |
| `registry-administration` | ENG-025 | AC-ENG-31 | `registerModel`, `deleteModel` | `model.registered`, `model.registration_denied` | `ModelRegistration`, `ModelDetail` |
| `platform-and-build-profiles` | ENG-026 | AC-ENG-32 | `getHealth`, `getReadiness` | `backend.selected`, `backend.unavailable` | configuration schema, `HealthSnapshot` |

## Coverage rules

1. Every file in `../specifications/features/` MUST appear in this table.
2. Every HTTP operation referenced here MUST exist in `openapi.yaml`; every operation schema is generated under `schemas/operations/`.
3. Every event referenced here MUST exist in `events/catalog.yaml` and `events/schemas/`.
4. A feature with no HTTP surface MUST map to at least one event, transport, or configuration schema.
5. Adding a feature or operation requires its mapping row in the same change.
6. This table does not claim implementation. It records the contract surface that tests must exercise before acceptance.
