# Engine domain events

Domain events describe facts that already happened. They support correlation, audit, progress reporting, and evaluation. They are not a command bus and do not replace the synchronous result contract.

## Event envelope

Every event carries:

| Field | Meaning |
|---|---|
| `event_id` | Unique event identifier. |
| `event_type` | Stable name from the vocabulary below. |
| `occurred_at` | RFC 3339 timestamp with timezone. |
| `request_id` | Correlation identifier when the event belongs to a request. |
| `profile_id` | Engine profile that emitted the event. |
| `engine_version` | Build version. |
| `subject` | Model ID, task ID, session ID, or component name. |
| `outcome` | Success, failure, cancelled, or denied where applicable. |
| `error_code` | Stable code for failures; absent on success. |

Events MUST NOT contain prompts, transcripts, audio, images, tokens, credentials, absolute host paths, or raw model inputs. Sizes, counts, durations, and identifiers are permitted.

## Lifecycle events

| Event | Emitted when | Required payload |
|---|---|---|
| `engine.starting` | Validation succeeded and initialization begins. | Profile, version, configuration source. |
| `engine.ready` | Required components are ready. | Selected backend, model count, bind addresses. |
| `engine.degraded` | A required or optional component becomes unavailable. | Component, required flag, error code. |
| `engine.stopping` | Termination signal accepted. | Reason, in-flight count. |
| `engine.stopped` | Process is about to exit. | Drain duration, completed count, cancelled count, forced flag. |

## Configuration events

| Event | Emitted when | Required payload |
|---|---|---|
| `config.loaded` | A candidate is accepted. | Source names, schema version, redacted changed keys. |
| `config.rejected` | Validation fails. | Setting names, error codes, no secret values. |
| `config.reload_rejected` | A reload candidate fails. | Setting names, retained snapshot version. |

## Model and asset events

| Event | Emitted when | Required payload |
|---|---|---|
| `model.registered` | An administrative registration succeeds. | Model ID, actor, descriptor digest. |
| `model.registration_denied` | Authorization or validation fails. | Model ID when known, actor, error code. |
| `model.download_queued` | A download job is accepted. | Task ID, model ID, source scheme. |
| `model.download_progress` | Transfer changes state or interval elapses. | Task ID, bytes, total when known, percent. |
| `model.download_verified` | Integrity verification succeeds. | Task ID, digest algorithm, digest. |
| `model.download_failed` | A job reaches Failed. | Task ID, error code, safe message. |
| `model.activated` | A verified asset becomes available. | Model ID, asset digest, size. |
| `model.loaded` | A slot reaches Ready. | Model ID, backend, device, precision, load duration. |
| `model.load_failed` | A slot reaches Failed. | Model ID, backend, error code. |
| `model.unloaded` | A slot reaches Unloaded. | Model ID, reason, memory freed when known. |
| `model.evicted` | Capacity policy removes a slot. | Model ID, reason, remaining slots. |

## Inference events

| Event | Emitted when | Required payload |
|---|---|---|
| `inference.admitted` | Limits and authentication pass. | Request ID, capability, model ID. |
| `inference.cache_hit` | A valid cached result is returned. | Request ID, model ID, cache key hash, age. |
| `inference.cache_miss` | No valid entry exists. | Request ID, model ID. |
| `inference.coalesced` | A request joins an in-flight execution. | Request ID, leader request ID, model ID. |
| `inference.batched` | A request joins a batch. | Request ID, batch ID, batch size, wait duration. |
| `inference.completed` | A result is produced. | Request ID, model ID, backend, latency, output count or bytes. |
| `inference.failed` | Execution fails. | Request ID, model ID, backend, error code, latency. |
| `inference.cancelled` | The caller disconnects or the deadline expires. | Request ID, model ID, reason. |
| `inference.rejected` | Admission or validation rejects the request. | Request ID when assigned, reason, error code. |

## Streaming and session events

| Event | Emitted when | Required payload |
|---|---|---|
| `stream.opened` | Negotiation succeeds. | Request ID, capability, model ID, framing. |
| `stream.first_frame` | The first data frame is written. | Request ID, time since admission. |
| `stream.completed` | A terminal frame is written. | Request ID, frames, bytes, duration. |
| `stream.failed` | A terminal error is written. | Request ID, error code, frames written. |
| `stream.disconnected` | The client closes the transport. | Request ID, phase, frames written. |
| `session.opened` | A WebSocket session is ready. | Session ID, transport, peer policy identity. |
| `session.configured` | A config or control frame is accepted. | Session ID, capability, model ID. |
| `session.error` | An invalid frame or execution error occurs. | Session ID, error code, frame type. |
| `session.closed` | The session ends. | Session ID, reason, duration, active work cancelled. |

## Security and operations events

| Event | Emitted when | Required payload |
|---|---|---|
| `auth.denied` | A missing or invalid credential is rejected. | Route group, reason code, peer identity when safe. |
| `auth.forbidden` | A valid credential lacks scope. | Actor, action, target, required scope. |
| `ratelimit.rejected` | A client exceeds its budget. | Route group, retry-after, identity source. |
| `limit.rejected` | A body, item, or concurrency limit is exceeded. | Limit name, value, unit, scope. |
| `backend.selected` | Startup selects a provider. | Backend, device, precision, reason. |
| `backend.unavailable` | A requested provider cannot be used. | Backend, reason, fallback permitted flag. |
| `circuit.opened` | Failure threshold is crossed. | Component, failure count, open duration. |
| `circuit.closed` | A probe succeeds. | Component, probe result. |
| `metric.scrape` | Metrics are served. | Status, duration, series count, not label values. |
| `log.accessed` | A diagnostic log is read or cleared. | Actor, file name, action, outcome. |

## Event rules

1. Events are immutable facts. A correction is a new event, not an edit.
2. Event names and required payload fields are part of the contract; additive fields are compatible, removals require a version.
3. Events never carry raw user content or secrets. Redaction happens at emission, not at the sink.
4. A request that is rejected before a request ID is assigned may omit `request_id`; it must still carry the event's own `event_id`.
5. Audit events for registry mutation and diagnostic access are retained according to the operational retention policy and are not deletable through the public API.
6. Progress events are bounded: state changes plus at most one interval event per declared period. A job cannot emit unbounded events.
7. Failure to emit a non-audit event must not change the inference result; failure to emit an audit event for a mutation must fail the mutation or mark it uncommitted.

## Assurance

Governed by [HPA-4](../../torviello-enforcer/requirements/assurance-standard.md) and the [engine acceptance criteria](../specifications/acceptance-criteria.md).
- **Subject:** Domain and integration events.
- **Required evidence:** Every event MUST have a versioned schema, stable name, producer/consumer contract, redaction rule, ordering semantics, and idempotency rule.
- **Failure:** An unversioned event, sensitive payload, undefined ordering, or non-idempotent consumer fails acceptance. No waiver is permitted.
