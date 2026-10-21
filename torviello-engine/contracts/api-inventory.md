# API inventory

Human-readable index of the routes in [openapi.yaml](openapi.yaml). The OpenAPI document is authoritative for request and response shape; this table is the review and traceability view.

**Contract shape:** the OpenAPI document includes the canonical routes plus every versioned alias listed below. Standalone JSON Schema artifacts for every component and structured operation are generated under `schemas/`.

**Implementation status:** this table is the full product target. The current scaffold implements `/health`, `/health/live`, `/health/ready`, `/models`, `/models/{modelId}`, `/models/{modelId}/download`, `/models/{modelId}/status`, `/models/{modelId}/download/progress`, `/models/{modelId}/load`, `/models/{modelId}/unload`, and `/metrics`, recorded in [openapi.first-slice.yaml](openapi.first-slice.yaml). The remaining rows are specified but not implemented; no parity claim is made for them.

## Route inventory

| Capability | Method | Canonical path | Auth | Requirement | Check |
|---|---|---|---|---|---|
| Health | GET | `/health` | Public | ENG-018 | AC-ENG-24 |
| Liveness | GET | `/health/live` | Public | ENG-018 | AC-ENG-24 |
| Readiness | GET | `/health/ready` | Public | ENG-018 | AC-ENG-24 |
| System info | GET | `/system` | Protected | ENG-019 | AC-ENG-25 |
| Log view | GET | `/system/logs` | Protected | ENG-020 | AC-ENG-26 |
| Log clear | DELETE | `/system/logs` | Admin | ENG-020, ENG-025 | AC-ENG-26, AC-ENG-31 |
| Catalog list | GET | `/models` | Protected | ENG-004 | AC-ENG-10 |
| Model detail | GET | `/models/{modelId}` | Protected | ENG-004 | AC-ENG-10 |
| Load model | POST | `/models/{modelId}/load` | Protected | ENG-006 | AC-ENG-12 |
| Unload model | POST | `/models/{modelId}/unload` | Protected | ENG-006 | AC-ENG-12 |
| Download model | POST | `/models/{modelId}/download` | Protected | ENG-005 | AC-ENG-11 |
| Download status | GET | `/models/{modelId}/status` | Protected | ENG-005 | AC-ENG-11 |
| Download progress | GET | `/models/{modelId}/download/progress` | Protected | ENG-005 | AC-ENG-11 |
| Speech synthesis | POST | `/tts` | Protected | ENG-008 | AC-ENG-14 |
| Speech stream | POST | `/tts/stream` | Protected | ENG-008, ENG-013 | AC-ENG-14, AC-ENG-19 |
| Transcription | POST | `/stt` | Protected | ENG-009 | AC-ENG-15 |
| Classification | POST | `/classify` | Protected | ENG-010 | AC-ENG-16 |
| Detection | POST | `/detect` | Protected | ENG-011 | AC-ENG-17 |
| Assistant | POST | `/v1/chat/completions` | Protected | ENG-024 | AC-ENG-30 |
| Metrics | GET | `/metrics` | Public | ENG-018 | AC-ENG-24 |
| Register model | POST | `/api/v1/models` | Admin | ENG-025 | AC-ENG-31 |
| Remove model | DELETE | `/api/v1/models/{modelId}` | Admin | ENG-025 | AC-ENG-31 |
| Audio session | GET | `/ws/audio` | Protected | ENG-013 | AC-ENG-19 |
| Classification session | GET | `/ws/classify` | Protected | ENG-013 | AC-ENG-19 |
| Detection session | GET | `/ws/detect` | Protected | ENG-013 | AC-ENG-19 |

## Versioned aliases

The contract requires each alias to resolve to the same handler and preserve status, headers, and body shape.

| Alias | Canonical route |
|---|---|
| `/api/v1/health` | `/health` |
| `/api/v1/models` (GET) | `/models` |
| `/api/v1/tts` | `/tts` |
| `/api/v1/tts/stream` | `/tts/stream` |
| `/api/v1/stt` | `/stt` |
| `/api/v1/classify` | `/classify` |
| `/api/v1/detect` | `/detect` |

`POST` and `DELETE` on `/api/v1/models` are administrative canonical routes, not aliases of the catalog read route.

## Route groups and middleware

Ingress order from outermost to innermost: correlation ID, request logging, authentication, rate limiting, security headers, compression.

| Group | Routes | Authentication | Rate limit identity | Notes |
|---|---|---|---|---|
| Public probes | `/health`, `/health/live`, `/health/ready`, `/metrics` | None | Infrastructure identity or exempt | Must remain available during saturation. |
| Read surfaces | catalog, status, system, logs | Bearer when enabled | Caller identity | Logs require operator or admin scope. |
| Execution surfaces | TTS, STT, classify, detect, assistant | Bearer when enabled | Caller identity | Admission occurs before model dispatch. |
| Session surfaces | WebSocket upgrades | Bearer when enabled | Caller identity | Negotiation applies the same policy as HTTP. |
| Administration | model registration, deletion, log clear | Bearer plus admin scope | Admin identity | Mutation is audited and atomic. |

## Error status mapping

Every error body is an RFC 9457 `application/problem+json` document with `type`, `title`, `status`, `detail`, and `instance`, extended by the stable engine `code`, `category`, `retryable`, `retry_after_ms`, `request_id`, and optional field-level `errors`. Concrete codes are defined in the error model specification; the HTTP status mapping is stable. A response that uses a success envelope for a failure is a contract defect.

| Condition | Status |
|---|---|
| Malformed or missing input, invalid parameter, unsafe name | 400 |
| Missing or invalid credential | 401 |
| Valid credential without scope | 403 |
| Unknown model or resource | 404 |
| State conflict, duplicate descriptor, unload with references | 409 |
| Body, item count, or dimension above limit | 413 |
| Unsupported media or encoding | 415 |
| Rate budget exhausted | 429 |
| Model, backend, or required component unavailable | 503 |
| Execution or upstream deadline expired | 504 |
| Upstream returned an invalid or failed response | 502 |
| Unhandled internal failure | 500 |

## Assurance requirements

- The contract MUST be valid OpenAPI 3.2.1 and pass the project lint ruleset with zero suppressed findings.
- Router parity MUST be bidirectional, and every alias MUST preserve status, headers, and body shape.
- Error responses MUST use RFC 9457 `application/problem+json`; a JSON error envelope is not conformant.
- Remote listeners MUST use TLS 1.3 and asymmetric JWT algorithms under RFC 8725. Shared-secret HS algorithms are permitted only for loopback-only profiles.
- Every change MUST run a breaking-change diff against the released baseline. An unintended removal, type change, or status change fails the gate.
- Evidence follows [HPA-4](../../requirements/assurance-standard.md): contract validation, lint, parity, alias, and diff reports are retained.

## Contract rules

1. Every route in this inventory appears in the OpenAPI document and every OpenAPI path resolves to a handler. Either direction missing is a contract failure.
2. Success responses for capability routes carry the result envelope. Binary audio and event streams carry metadata in headers and terminal events because they cannot carry JSON bodies.
3. Public probes are the only unauthenticated routes besides `/metrics`. Enabling authentication does not make probes require credentials.
4. No route accepts a host path as a model identifier. `{modelId}` matches `^[A-Za-z0-9][A-Za-z0-9._-]*$`.
5. Adding a route requires its requirement, check, OpenAPI entry, inventory row, error mapping, and limit declaration in the same change.
