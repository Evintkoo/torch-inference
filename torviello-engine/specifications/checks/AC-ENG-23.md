# AC-ENG-23 — Map failures to one stable error contract

**Check ID:** AC-ENG-23  
**Requirement:** ENG-017  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** All failures use one envelope and a documented status/code mapping, with safe messages, retry guidance when applicable, and consistent request identifiers. AC-ENG-23 verifies ENG-017 and fails when the threshold below is not met.
- **Measurable:** 100% of error responses are RFC 9457 `application/problem+json`; 100% status/code mapping coverage; zero success-shaped failures; zero internal-detail leaks; zero alias drift; 100% request-ID consistency across body, headers, and logs.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-017; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-017 — Map failures to one stable error contract

**Priority:** MUST  
**Requirement document:** [ENG-017](../../../requirements/items/ENG-017.md)

Every failure MUST return one stable error envelope containing a safe code, message, status, and request identifier; status selection MUST distinguish validation, identity, absence, size, capacity, dependency, timeout, and internal failure.

**Acceptance summary:** Invalid input returns 400 with a stable code naming the parameter.

## 2. Observable check

All failures use one envelope and a documented status/code mapping, with safe messages, retry guidance when applicable, and consistent request identifiers.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `error-model.feature`

#### Validation failures return 400

```gherkin
Scenario: Validation failures return 400
    Given a request contains an invalid parameter
    When validation runs
    Then the response is 400 with a stable error code
    And the message identifies the parameter without exposing internals
```

#### Missing resources return 404

```gherkin
Scenario: Missing resources return 404
    Given a request names an unknown model or route parameter
    When the handler resolves it
    Then the response is 404 with error code "resource.not_found"
    And no asynchronous side effect is started
```

#### Payload limits return 413

```gherkin
Scenario: Payload limits return 413
    Given a body or item exceeds its configured limit
    When the request is read
    Then the response is 413 with the affected limit
    And partial work is discarded
```

#### Capacity pressure returns 429 or 503 with retry guidance

```gherkin
Scenario: Capacity pressure returns 429 or 503 with retry guidance
    Given the engine is saturated or a circuit is open
    When the request is rejected
    Then the status is 429 or 503 according to the documented mapping
    And Retry-After is present when retry can succeed
```

#### Dependency timeout returns 504

```gherkin
Scenario: Dependency timeout returns 504
    Given an internal or upstream dependency exceeds its deadline
    When the request completes
    Then the response is 504 with error code "dependency.timeout"
    And the request is not reported as a client error
```

#### Internal failures never leak implementation detail

```gherkin
Scenario: Internal failures never leak implementation detail
    Given an unexpected internal error occurs
    When the error envelope is produced
    Then the body contains code, message, status, and request ID only
    And no stack trace, filesystem path, secret, or dependency host appears
```

#### Every error carries the correlation identifier

```gherkin
Scenario: Every error carries the correlation identifier
    Given any failed request
    When the response is inspected
    Then the request ID matches the log record
    And the identifier is safe to display to the caller
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| API-01 | API contracts and schemas | [01-api-contracts-and-schemas.md](../../../torviello-enforcer/api/rules/01-api-contracts-and-schemas.md) |
| API-03 | HTTP semantics and client behavior | [03-http-semantics-and-client-behavior.md](../../../torviello-enforcer/api/rules/03-http-semantics-and-client-behavior.md) |
| ARC-04 | Boundaries, failures, and resource ownership | [04-boundaries-failures-and-resource-ownership.md](../../../torviello-enforcer/architecture/rules/04-boundaries-failures-and-resource-ownership.md) |

#### API-01.01 — Maintain a machine-readable OpenAPI description for every public HTTP

The project MUST maintain a machine-readable OpenAPI description for every public HTTP API. The project MUST also treat it as a reviewed contract that describes paths, methods, schemas, validation constraints, authentication, authorization, status codes, error bodies, pagination, and streaming behavior.

#### API-01.02 — Keep request and response schemas in a dedicated API

The project MUST keep request and response schemas in a dedicated API schema module. The project MUST also group handlers by user-facing functionality. A handler MAY parse transport input, invoke a domain interface, and serialize a response; it MUST NOT own inference, persistence, registry policy, or cross-service business logic.

#### API-01.03 — Use one stable error envelope

The project MUST use one stable error envelope. The project MUST also include a safe error code and correlation identifier; return actionable client guidance without leaking stack traces, filesystem paths, secrets, internal service names, or dependency errors.

#### API-01.04 — Define compatibility for every endpoint

The project MUST define compatibility for every endpoint. Additive changes preserve existing semantics. Breaking changes require an explicit API version/deprecation plan, a migration window, and consumer-facing release notes.

#### API-01.05 — Generate reference documentation from the contract when practical

The project SHOULD generate reference documentation from the contract when practical. Handwritten endpoint examples MUST be checked against the current contract and implementation.

#### API-03.01 — The API MUST use HTTP methods and status codes…

**Requirement:** The API MUST use HTTP methods and status codes according to their defined semantics; a response status MUST accurately report whether the requested operation completed, was accepted for asynchronous processing, failed validation, lacked authorization, or failed in the service.

#### API-03.02 — An operation that can be retried MUST define idempotency…

**Requirement:** An operation that can be retried MUST define idempotency behavior. For non-idempotent writes, the API MUST accept a caller-supplied idempotency key or provide another documented deduplication mechanism, scope the key to the authenticated principal and operation, retain it for a documented period, and return the original outcome for a duplicate request.

#### API-03.03 — Retries MUST be safe under the endpoint contract…

**Requirement:** Retries MUST be safe under the endpoint contract. Clients MUST NOT blindly retry non-idempotent requests; servers MUST bound retryable work and expose Retry-After only when the service can honor the stated delay.

#### API-03.04 — Pagination MUST use stable ordering and bounded page size…

**Requirement:** Pagination MUST use stable ordering and bounded page size. Cursor-based pagination SHOULD be used when concurrent inserts or deletes can make offset pagination skip or repeat records; cursors MUST be opaque, integrity-protected when they encode state, and scoped to the caller and query.

#### API-03.05 — Long-running inference and model-management operations MUST define synchronous versus…

**Requirement:** Long-running inference and model-management operations MUST define synchronous versus asynchronous behavior, request identity, status transitions, result expiry, cancellation, and duplicate-submission handling.

#### API-03.06 — HTTP caching MUST be explicit for authenticated, user-specific…

**Requirement:** HTTP caching MUST be explicit for authenticated, user-specific, model, and administrative responses. Responses containing secrets or sensitive inference data MUST use no-store or an approved stricter policy; shared caches MUST NOT reuse them across principals.

#### API-03.07 — Content negotiation and compression MUST have explicit supported media…

**Requirement:** Content negotiation and compression MUST have explicit supported media types and size limits. The service MUST reject unsupported request and response encodings safely and MUST NOT allow compressed-size limits to be bypassed by decompression expansion.

#### ARC-04.01 — Every module boundary MUST define the data it accepts…

**Requirement:** Every module boundary MUST define the data it accepts and returns, validation responsibility, error vocabulary, cancellation behavior, resource ownership, concurrency expectations, and lifecycle transitions.

#### ARC-04.02 — Dependencies MUST point toward stable abstractions. Dependency cycles…

**Requirement:** Dependencies MUST point toward stable abstractions. Dependency cycles MUST be prevented in the build graph or detected by an automated architecture check; shared modules MUST NOT import feature-specific policy or implementation details.

#### ARC-04.03 — A module MUST own or explicitly borrow every long-lived…

**Requirement:** A module MUST own or explicitly borrow every long-lived resource it creates, including threads, GPU contexts, memory pools, files, sockets, database connections, and child processes. Ownership and shutdown ordering MUST be explicit.

#### ARC-04.04 — Cross-module errors MUST preserve actionable internal context while mapping…

**Requirement:** Cross-module errors MUST preserve actionable internal context while mapping to a stable boundary error. A caller MUST be able to distinguish retryable, permanent, cancelled, unsupported, invalid-input, and resource-exhaustion outcomes where behavior differs.

#### ARC-04.05 — Failure propagation MUST be bounded. Define which failures…

**Requirement:** Failure propagation MUST be bounded. Define which failures are isolated to a request, module, model, process, or deployment; avoid cascading retries; and ensure cleanup runs on cancellation, timeout, partial initialization, and shutdown.

#### ARC-04.06 — Optional capability adapters MUST be conformant to shared lifecycle…

**Requirement:** Optional capability adapters MUST be conformant to shared lifecycle and error contracts. Capability discovery MUST not load the capability merely to determine whether it exists.

#### ARC-04.07 — Asynchronous boundaries MUST document queue ownership, backpressure…

**Requirement:** Asynchronous boundaries MUST document queue ownership, backpressure, ordering guarantees, delivery semantics, timeout budget, cancellation propagation, and behavior when the consumer disappears.

## 5. Prohibited conditions

- Do not return a success-shaped body with an error field.
- Do not expose backend or dependency error text directly.
- Do not use 500 for validation, absence, size, or capacity failures.
- Do not omit the request identifier from an error.
- Do not change a code or status meaning in a compatible release.

## 6. Procedure

- 1. Trigger each failure class through the public API.
- 2. Capture status, error code, message, headers, and request ID.
- 3. Inspect messages for paths, secrets, stack traces, and dependency names.
- 4. Compare the error contract across HTTP and WebSocket paths.
- 5. Force an internal failure and confirm no partial success data.
- 6. Record requests, responses, and log correlation.

## 7. Pass criteria

- The observable check in section 2 is satisfied through the shipping engine.
- Every applicable obligation in section 4 is met, including limits, failure behavior, and observability.
- Every feature scenario in section 3 is covered by an automated test or a recorded manual check.
- No prohibited condition in section 5 occurs.
- The result is reproducible from the recorded procedure and evidence.

- **HPA-4 gate:** every universal gate in [`acceptance-criteria.md`](../acceptance-criteria.md) section 2, the check-specific threshold in section 3, all section 9 evidence, and zero section 4 failure criteria MUST pass.
- The result MUST be reproducible on 3 independent runs against the shipping artifact; a skipped, stale, or summary-only result is not a pass.

## 8. Fail criteria

- Any one failure criterion in [`acceptance-criteria.md`](../acceptance-criteria.md) section 4 occurs.
- Any universal gate, check-specific threshold, or section 9 evidence requirement is unmet, missing, stale, or below threshold.
- The result is partial, conditional, non-reproducible, or depends on an unapproved exception.

- The observable result is absent, contradictory, or not reproducible.
- The check passes only through a debug path, test double, or non-shipping configuration.
- A required negative, boundary, or failure case is untested, skipped, or bypassed.
- A prohibited condition occurs.
- Evidence is stale or the implementation changed without re-running the check.
- An exception is unapproved, expired, or missing compensating measures.

- Highest-standard assurance evidence is missing, stale, or below the recorded threshold.

## 9. Required evidence

- A response matrix covering 400, 401, 403, 404, 413, 429, 503, and 504.
- Code stability across equivalent cases.
- Redaction inspection of error messages.
- Correlation consistency between body, header, and log.
- Absence of partial success fields on failure.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../requirements/assurance-standard.md), this check additionally requires:

- The failure matrix with status, code, category, retryability, and request ID.
- Schema-validation results for every error response.
- The redaction inspection and alias-equivalence report.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-017](../../../requirements/items/ENG-017.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [error-model.feature](../features/error-model.feature) |
| Rule controls | API-01, API-03, ARC-04 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
