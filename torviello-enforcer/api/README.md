# api domain

**Development stage:** CDD

This directory contains 5 normative control document(s) and the generated enforcement tests for the **api** domain (API contracts and request handling). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| API-01 | [01-api-contracts-and-schemas.md](rules/01-api-contracts-and-schemas.md) | ED-004, SO-002–SO-005, SO-011, PA-010 | [tests/test_01_api_contracts_and_schemas.py](tests/test_01_api_contracts_and_schemas.py) | API contracts and schemas |
| API-02 | [02-api-input-and-stream-safety.md](rules/02-api-input-and-stream-safety.md) | ED-004, SO-002–SO-005, SO-011, PA-010 | [tests/test_02_api_input_and_stream_safety.py](tests/test_02_api_input_and_stream_safety.py) | API input and stream safety |
| API-03 | [03-http-semantics-and-client-behavior.md](rules/03-http-semantics-and-client-behavior.md) | ED-004, SO-002–SO-005, SO-011 | [tests/test_03_http_semantics_and_client_behavior.py](tests/test_03_http_semantics_and_client_behavior.py) | HTTP semantics and client behavior |
| API-04 | [04-api-inventory-evolution-and-deprecation.md](rules/04-api-inventory-evolution-and-deprecation.md) | ED-004, ED-030, SO-010–SO-011, RP-023 | [tests/test_04_api_inventory_evolution_and_deprecation.py](tests/test_04_api_inventory_evolution_and_deprecation.py) | API inventory, evolution, and deprecation |
| API-05 | [05-api-abuse-and-integrated-service-boundaries.md](rules/05-api-abuse-and-integrated-service-boundaries.md) | SO-003, SO-010–SO-012, SO-032 | [tests/test_05_api_abuse_and_integrated_service_boundaries.py](tests/test_05_api_abuse_and_integrated_service_boundaries.py) | API abuse and integrated-service boundaries |

## Detailed controls

### API-01 — API contracts and schemas

**Objective.** These controls govern **api contracts and schemas**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** ED-004, SO-002–SO-005, SO-011, PA-010

**Normative requirements:**

- **API-01.01 — Maintain a machine-readable OpenAPI description for every public HTTP.** The project MUST maintain a machine-readable OpenAPI description for every public HTTP API. The project MUST also treat it as a reviewed contract that describes paths, methods, schemas, validation constraints, authentication, authorization, status codes, error bodies, pagination, and streaming behavior.
- **API-01.02 — Keep request and response schemas in a dedicated API.** The project MUST keep request and response schemas in a dedicated API schema module. The project MUST also group handlers by user-facing functionality. A handler MAY parse transport input, invoke a domain interface, and serialize a response; it MUST NOT own inference, persistence, registry policy, or cross-service business logic.
- **API-01.03 — Use one stable error envelope.** The project MUST use one stable error envelope. The project MUST also include a safe error code and correlation identifier; return actionable client guidance without leaking stack traces, filesystem paths, secrets, internal service names, or dependency errors.
- **API-01.04 — Define compatibility for every endpoint.** The project MUST define compatibility for every endpoint. Additive changes preserve existing semantics. Breaking changes require an explicit API version/deprecation plan, a migration window, and consumer-facing release notes.
- **API-01.05 — Generate reference documentation from the contract when practical.** The project SHOULD generate reference documentation from the contract when practical. Handwritten endpoint examples MUST be checked against the current contract and implementation.

**Rule document:** [rules/01-api-contracts-and-schemas.md](rules/01-api-contracts-and-schemas.md)

**Enforcement:** [tests/test_01_api_contracts_and_schemas.py](tests/test_01_api_contracts_and_schemas.py)

**Prohibited conditions:**

- The project MUST NOT add undocumented routes or request fields
- The project MUST NOT use loosely typed unbounded JSON when a bounded schema can express the contract
- The project MUST NOT make internal Rust types the accidental public API
- The project MUST NOT silently change status codes, defaults, error meanings, or streaming framing
### API-02 — API input and stream safety

**Objective.** These controls govern **api input and stream safety**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** ED-004, SO-002–SO-005, SO-011, PA-010

**Normative requirements:**

- **API-02.01 — Treat every request field, header, URL, filename, archive entry.** The project MUST treat every request field, header, URL, filename, archive entry, image, audio stream, and model input as untrusted. Parse into validated domain types before expensive work.
- **API-02.02 — Bound request bytes, multipart part count, image dimensions, audio.** The project MUST bound request bytes, multipart part count, image dimensions, audio duration, decompressed size, queue wait, inference time, concurrent work, and response size. Limits MUST be configurable within safe hard bounds.
- **API-02.03 — Reject invalid content types, unsupported encodings, malformed multipart boundaries.** The project MUST reject invalid content types, unsupported encodings, malformed multipart boundaries, path traversal, unexpected archive paths, and values outside schema constraints with safe client errors.
- **API-02.04 — Apply authentication and authorization to each operation.** The project MUST apply authentication and authorization to each operation. Health endpoints disclose only their intended readiness state; administrative operations require explicit roles/scopes.
- **API-02.05 — Streaming routes MUST define cancellation, client disconnect handling, backpressure.** Streaming routes MUST define cancellation, client disconnect handling, backpressure, timeout, partial result, and cleanup behavior. The project MUST NOT retain unbounded output in memory for a slow consumer.
- **API-02.06 — Use rate limits and concurrency controls at the API.** The project MUST use rate limits and concurrency controls at the API boundary for expensive or abuse-sensitive operations. The project MUST also return a documented overload response and expose a bounded metric.

**Rule document:** [rules/02-api-input-and-stream-safety.md](rules/02-api-input-and-stream-safety.md)

**Enforcement:** [tests/test_02_api_input_and_stream_safety.py](tests/test_02_api_input_and_stream_safety.py)

**Prohibited conditions:**

- The project MUST NOT trust client-supplied paths, model IDs, callback URLs, MIME types, dimensions, or content lengths
- The project MUST NOT pass arbitrary user URLs to a downloader or inference service without SSRF-safe destination policy
- The project MUST NOT return a success response before an operation is durable or active when the contract promises completion
- The project MUST NOT log raw prompts, uploads, authorization headers, or full inference payloads by default
### API-03 — HTTP semantics and client behavior

**Objective.** This control defines the intended outcome for **http semantics and client behavior** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-004, SO-002–SO-005, SO-011

**Normative requirements:**

- **API-03.01 — The API MUST use HTTP methods and status codes….** **Requirement:** The API MUST use HTTP methods and status codes according to their defined semantics; a response status MUST accurately report whether the requested operation completed, was accepted for asynchronous processing, failed validation, lacked authorization, or failed in the service.
- **API-03.02 — An operation that can be retried MUST define idempotency….** **Requirement:** An operation that can be retried MUST define idempotency behavior. For non-idempotent writes, the API MUST accept a caller-supplied idempotency key or provide another documented deduplication mechanism, scope the key to the authenticated principal and operation, retain it for a documented period, and return the original outcome for a duplicate request.
- **API-03.03 — Retries MUST be safe under the endpoint contract….** **Requirement:** Retries MUST be safe under the endpoint contract. Clients MUST NOT blindly retry non-idempotent requests; servers MUST bound retryable work and expose Retry-After only when the service can honor the stated delay.
- **API-03.04 — Pagination MUST use stable ordering and bounded page size….** **Requirement:** Pagination MUST use stable ordering and bounded page size. Cursor-based pagination SHOULD be used when concurrent inserts or deletes can make offset pagination skip or repeat records; cursors MUST be opaque, integrity-protected when they encode state, and scoped to the caller and query.
- **API-03.05 — Long-running inference and model-management operations MUST define synchronous versus….** **Requirement:** Long-running inference and model-management operations MUST define synchronous versus asynchronous behavior, request identity, status transitions, result expiry, cancellation, and duplicate-submission handling.
- **API-03.06 — HTTP caching MUST be explicit for authenticated, user-specific….** **Requirement:** HTTP caching MUST be explicit for authenticated, user-specific, model, and administrative responses. Responses containing secrets or sensitive inference data MUST use no-store or an approved stricter policy; shared caches MUST NOT reuse them across principals.
- **API-03.07 — Content negotiation and compression MUST have explicit supported media….** **Requirement:** Content negotiation and compression MUST have explicit supported media types and size limits. The service MUST reject unsupported request and response encodings safely and MUST NOT allow compressed-size limits to be bypassed by decompression expansion.

**Rule document:** [rules/03-http-semantics-and-client-behavior.md](rules/03-http-semantics-and-client-behavior.md)

**Enforcement:** [tests/test_03_http_semantics_and_client_behavior.py](tests/test_03_http_semantics_and_client_behavior.py)

**Prohibited conditions:**

- Do not make a completed operation appear pending or a failed operation appear successful.
- Do not use unsafe retries or cache directives that can replay or disclose user-specific results.
### API-04 — API inventory, evolution, and deprecation

**Objective.** This control defines the intended outcome for **api inventory, evolution, and deprecation** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-004, ED-030, SO-010–SO-011, RP-023

**Normative requirements:**

- **API-04.01 — The project MUST maintain an inventory of every externally….** **Requirement:** The project MUST maintain an inventory of every externally reachable API surface, including engine HTTP routes, admin routes, health/metrics endpoints, callbacks, internal service APIs exposed through a gateway, and protocol versions. Each entry MUST identify owner, audience, exposure, auth policy, lifecycle state, and contract location.
- **API-04.02 — Production API changes MUST be classified as compatible….** **Requirement:** Production API changes MUST be classified as compatible, conditionally compatible, or breaking against the published contract and known consumers. Reviewers MUST examine field requiredness, defaults, enum expansion, response shape, status codes, ordering, pagination, streaming framing, and authorization changes.
- **API-04.03 — Breaking changes MUST use a versioning and migration policy….** **Requirement:** Breaking changes MUST use a versioning and migration policy chosen for the product (URI, media type, or another explicit scheme), with a published compatibility window, migration guidance, sunset date, and owner. Deprecation notices MUST be observable before removal.
- **API-04.04 — Every deployed version MUST be discoverable by operators….** **Requirement:** Every deployed version MUST be discoverable by operators. Remove unsupported versions from the deployment inventory only after traffic and consumer evidence show that the deprecation window has completed.
- **API-04.05 — Debug, experimental, and internal endpoints MUST be….** **Requirement:** Debug, experimental, and internal endpoints MUST be excluded from production packages or protected by an explicit access policy. Their presence and exposure MUST be checked in release qualification.
- **API-04.06 — OpenAPI contracts MUST be reviewed in the same change….** **Requirement:** OpenAPI contracts MUST be reviewed in the same change as implementation. Generated schemas MUST be reproducible; generated diffs MUST not hide semantic changes in hand-maintained descriptions or security declarations.

**Rule document:** [rules/04-api-inventory-evolution-and-deprecation.md](rules/04-api-inventory-evolution-and-deprecation.md)

**Enforcement:** [tests/test_04_api_inventory_evolution_and_deprecation.py](tests/test_04_api_inventory_evolution_and_deprecation.py)

**Prohibited conditions:**

- Do not rely on undocumented consumers or guess that an additive-looking change is compatible.
- Do not leave obsolete or debug endpoints reachable without an owner, expiry, and access policy.
### API-05 — API abuse and integrated-service boundaries

**Objective.** This control defines the intended outcome for **api abuse and integrated-service boundaries** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** SO-003, SO-010–SO-012, SO-032

**Normative requirements:**

- **API-05.01 — For each endpoint, the project MUST identify object-level….** **Requirement:** For each endpoint, the project MUST identify object-level, property-level, and function-level authorization needs. Authorization MUST be checked for the authenticated actor, target object, requested fields, and operation on every request, including batch and nested-resource operations.
- **API-05.02 — Endpoints that trigger costly inference, model installation….** **Requirement:** Endpoints that trigger costly inference, model installation, account creation, license checks, or other business-sensitive flows MUST have threat-informed abuse controls. Apply per-principal and aggregate quotas, concurrency limits, cooldowns, and anomaly handling appropriate to the operation; document safe defaults and administrative overrides.
- **API-05.03 — Rate limits MUST account for authenticated and anonymous actors….** **Requirement:** Rate limits MUST account for authenticated and anonymous actors, source-network aggregation, shared credentials, and distributed clients. Do not make IP address the sole identity signal for an authenticated user or disable limits for trusted internal callers by default.
- **API-05.04 — When calling external APIs, the caller MUST authenticate….** **Requirement:** When calling external APIs, the caller MUST authenticate the peer, validate TLS, restrict destination and redirect policy, validate response schema and size, set connection and total timeouts, and treat all response data as untrusted.
- **API-05.05 — API request processing MUST cap body, header….** **Requirement:** API request processing MUST cap body, header, multipart, nesting, collection, and decompressed sizes before unbounded allocation. Streaming parsers MUST enforce cumulative limits while reading, not only after buffering.
- **API-05.06 — Overload behavior MUST be deterministic: reject before accepting….** **Requirement:** Overload behavior MUST be deterministic: reject before accepting unbounded work, return a documented status and retry guidance where appropriate, preserve service health endpoints, and emit bounded-cardinality signals for rejected or queued work.
- **API-05.07 — Production API security testing MUST cover BOLA, broken….** **Requirement:** Production API security testing MUST cover BOLA, broken authentication, property authorization, resource consumption, function authorization, sensitive business flows, SSRF, misconfiguration, inventory gaps, and unsafe third-party API consumption where those risks apply.

**Rule document:** [rules/05-api-abuse-and-integrated-service-boundaries.md](rules/05-api-abuse-and-integrated-service-boundaries.md)

**Enforcement:** [tests/test_05_api_abuse_and_integrated_service_boundaries.py](tests/test_05_api_abuse_and_integrated_service_boundaries.py)

**Prohibited conditions:**

- Do not trust API responses because the provider is known or the connection uses TLS.
- Do not reveal whether a protected object exists when authorization requires an indistinguishable response.

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/api
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
