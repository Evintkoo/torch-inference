# AC-ENG-13 — Attach one inference envelope to every successful result

**Check ID:** AC-ENG-13  
**Requirement:** ENG-007  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Every successful inference returns the same envelope with attributable model, backend, latency, engine version, postprocessing state, warnings, and request ID. AC-ENG-13 verifies ENG-007 and fails when the threshold below is not met.
- **Measurable:** 100% of success responses validate against the envelope schema; 100% contain model, backend, latency, version, postprocessing state, warnings, and request ID; zero attribution mismatches; zero partial success bodies.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-007; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-007 — Attach one inference envelope to every successful result

**Priority:** MUST  
**Requirement document:** [ENG-007](../../../torviello-enforcer/requirements/items/ENG-007.md)

Every successful inference response MUST use one envelope that carries the result, the model ID actually used, the selected backend or engine, latency, engine version, postprocessing state, warnings, and the request correlation identifier.

**Acceptance summary:** A successful classification response contains data and meta with all required fields.

## 2. Observable check

Every successful inference returns the same envelope with attributable model, backend, latency, engine version, postprocessing state, warnings, and request ID.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `inference-envelope.feature`

#### Successful inference returns result metadata

```gherkin
Scenario: Successful inference returns result metadata
    Given classification succeeds for one image
    When the client receives the response
    Then the body contains "data" and "meta"
    And meta reports model ID, latency in milliseconds, engine version, and request ID
    And meta reports whether postprocessing ran
```

#### Request identifier matches the transport correlation

```gherkin
Scenario: Request identifier matches the transport correlation
    Given a client sends correlation ID "req-123"
    When inference succeeds
    Then meta.request_id is "req-123"
    And the same identifier appears in the response header and log record
```

#### Postprocessing can be skipped explicitly

```gherkin
Scenario: Postprocessing can be skipped explicitly
    Given a request sets skip_postprocess to true
    When inference succeeds
    Then meta.postprocessing_applied is false
    And meta.postprocess_steps is empty
```

#### Postprocessing warnings are preserved

```gherkin
Scenario: Postprocessing warnings are preserved
    Given postprocessing clamps an out-of-range probability
    When inference succeeds
    Then the result is returned
    And meta.warnings names the applied correction
```

#### Failure does not produce a partial success envelope

```gherkin
Scenario: Failure does not produce a partial success envelope
    Given the backend fails after dispatch
    When the request completes
    Then the response uses the error envelope and a non-2xx status
    And no "data" field suggests successful inference
```

#### Latency is measured around execution

```gherkin
Scenario: Latency is measured around execution
    Given a backend call takes at least 10 milliseconds
    When the response is produced
    Then meta.latency_ms is greater than or equal to the measured backend duration
    And it excludes client transfer time
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| API-01 | API contracts and schemas | [01-api-contracts-and-schemas.md](../../../torviello-enforcer/api/rules/01-api-contracts-and-schemas.md) |
| API-03 | HTTP semantics and client behavior | [03-http-semantics-and-client-behavior.md](../../../torviello-enforcer/api/rules/03-http-semantics-and-client-behavior.md) |
| OBS-01 | Secure structured logging and traces | [01-secure-structured-logging-and-traces.md](../../../torviello-enforcer/observability/rules/01-secure-structured-logging-and-traces.md) |

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

#### OBS-01.01 — Emit structured runtime logs through the shared logging system

The project MUST emit structured runtime logs through the shared logging system. The project MUST also include timestamp, severity, service identity, event name, and correlation/trace context where available.

#### OBS-01.02 — Record operational and security events consistently: startup/shutdown, authentication

The project MUST record operational and security events consistently: startup/shutdown, authentication and authorization outcomes, configuration changes, model installation/promotion, dependency failures, and request outcomes.

#### OBS-01.03 — Log passwords, tokens, API keys, private keys, database credentials

The project MUST NOT log passwords, tokens, API keys, private keys, database credentials, full prompts, raw uploads, or unnecessary personal data. It MUST redact secrets at boundaries and sanitize untrusted values against log injection.

#### OBS-01.04 — Bound log volume and retention

The project MUST bound log volume and retention. The project MUST also use rotation or external collection without allowing disk exhaustion to interfere with application state.

#### OBS-01.05 — Use OpenTelemetry semantic conventions for HTTP, service identity, exceptions

The project MUST use OpenTelemetry semantic conventions for HTTP, service identity, exceptions, and resources. Propagate trace context across trusted service boundaries; never treat correlation identifiers as identity or authorization.

#### OBS-01.06 — Make telemetry export explicitly configurable and off by default

The project SHOULD make telemetry export explicitly configurable and off by default in local/offline profiles. The project MUST also document all exported fields and endpoints.

## 5. Prohibited conditions

- Do not return bare results for one capability and an envelope for another.
- Do not report the requested model when a different fallback model executed.
- Do not include stack traces or internal dependency names in meta.
- Do not emit a success envelope for a failed inference.
- Do not omit the request identifier from either the envelope or the logs.

## 6. Procedure

- 1. Run a successful inference for each capability and compare envelope fields.
- 2. Send a known correlation header and verify envelope, header, and log consistency.
- 3. Run with postprocessing enabled, skipped, and warning-producing.
- 4. Force a backend failure and inspect the response shape.
- 5. Measure a padded backend delay and compare reported latency.
- 6. Record capability, request, and observed metadata.

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

- Envelope samples for each inference capability.
- Correlation consistency across envelope, header, and log.
- Postprocessing variants and warning output.
- Failure response showing the error envelope.
- Latency comparison against a controlled delay.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- The schema-validation report across all capability routes.
- The envelope property-test and mutation reports.
- Attribution reconciliation between response, log, and execution record.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- AC-ENG-05 — see [AC-ENG-05](AC-ENG-05.md)

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-007](../../../torviello-enforcer/requirements/items/ENG-007.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [inference-envelope.feature](../features/inference-envelope.feature) |
| Rule controls | API-01, API-03, OBS-01 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
