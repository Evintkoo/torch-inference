# AC-ENG-18 — Proxy assistant traffic without inventing compatibility

**Check ID:** AC-ENG-18  
**Requirement:** ENG-012  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Assistant requests are forwarded only when configured, streaming framing is preserved, upstream failures are distinct, and local inference remains independent. AC-ENG-18 verifies ENG-012 and fails when the threshold below is not met.
- **Measurable:** 100% of SSRF, redirect, DNS-rebinding, userinfo, encoded-host, private-address, and unsupported-scheme cases blocked; zero credential disclosure; 100% deadline and bounded-retry enforcement; local readiness unchanged in 100% of upstream failures.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-012; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-012 — Proxy assistant traffic without inventing compatibility

**Priority:** SHOULD  
**Requirement document:** [ENG-012](../../../requirements/items/ENG-012.md)

The optional assistant surface MUST forward declared OpenAI-compatible requests to a configured upstream with bounded bodies and deadlines, preserve streaming framing, distinguish upstream failure from local inference failure, and remain absent or explicitly unconfigured when no upstream exists.

**Acceptance summary:** A healthy upstream chat completion passes through with its status and JSON body.

## 2. Observable check

Assistant requests are forwarded only when configured, streaming framing is preserved, upstream failures are distinct, and local inference remains independent.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `llm-proxy.feature`

#### Chat completion passes through

```gherkin
Scenario: Chat completion passes through
    Given the upstream service is healthy
    When the client posts an OpenAI-compatible chat completion
    Then the response preserves the upstream status and JSON body
    And the request carries a correlation identifier to the upstream
```

#### Streaming completion preserves SSE framing

```gherkin
Scenario: Streaming completion preserves SSE framing
    Given the request sets stream true
    When the upstream emits server-sent events
    Then the proxy forwards events without buffering the full response
    And the stream terminates when the upstream closes
```

#### Upstream unavailability is reported as gateway failure

```gherkin
Scenario: Upstream unavailability is reported as gateway failure
    Given the upstream service is not listening
    When the client calls the assistant route
    Then the response is 503 with error code "upstream.unavailable"
    And the engine remains healthy for local inference
```

#### Oversized proxied bodies are bounded

```gherkin
Scenario: Oversized proxied bodies are bounded
    Given a proxy request exceeds the configured body limit
    When the request is read
    Then the response is 413 with error code "request.too_large"
    And the upstream receives no partial body
```

#### Proxy routes are absent when no upstream is configured

```gherkin
Scenario: Proxy routes are absent when no upstream is configured
    Given no LLM upstream is configured
    When a client calls an assistant route
    Then the response is 404 with error code "upstream.not_configured"
    And no outbound connection is attempted
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| API-05 | API abuse and integrated-service boundaries | [05-api-abuse-and-integrated-service-boundaries.md](../../../torviello-enforcer/api/rules/05-api-abuse-and-integrated-service-boundaries.md) |
| API-03 | HTTP semantics and client behavior | [03-http-semantics-and-client-behavior.md](../../../torviello-enforcer/api/rules/03-http-semantics-and-client-behavior.md) |
| SEC-08 | Network boundaries and transport security | [08-network-boundaries-and-transport-security.md](../../../torviello-enforcer/security/rules/08-network-boundaries-and-transport-security.md) |

#### API-05.01 — For each endpoint, the project MUST identify object-level…

**Requirement:** For each endpoint, the project MUST identify object-level, property-level, and function-level authorization needs. Authorization MUST be checked for the authenticated actor, target object, requested fields, and operation on every request, including batch and nested-resource operations.

#### API-05.02 — Endpoints that trigger costly inference, model installation…

**Requirement:** Endpoints that trigger costly inference, model installation, account creation, license checks, or other business-sensitive flows MUST have threat-informed abuse controls. Apply per-principal and aggregate quotas, concurrency limits, cooldowns, and anomaly handling appropriate to the operation; document safe defaults and administrative overrides.

#### API-05.03 — Rate limits MUST account for authenticated and anonymous actors…

**Requirement:** Rate limits MUST account for authenticated and anonymous actors, source-network aggregation, shared credentials, and distributed clients. Do not make IP address the sole identity signal for an authenticated user or disable limits for trusted internal callers by default.

#### API-05.04 — When calling external APIs, the caller MUST authenticate…

**Requirement:** When calling external APIs, the caller MUST authenticate the peer, validate TLS, restrict destination and redirect policy, validate response schema and size, set connection and total timeouts, and treat all response data as untrusted.

#### API-05.05 — API request processing MUST cap body, header…

**Requirement:** API request processing MUST cap body, header, multipart, nesting, collection, and decompressed sizes before unbounded allocation. Streaming parsers MUST enforce cumulative limits while reading, not only after buffering.

#### API-05.06 — Overload behavior MUST be deterministic: reject before accepting…

**Requirement:** Overload behavior MUST be deterministic: reject before accepting unbounded work, return a documented status and retry guidance where appropriate, preserve service health endpoints, and emit bounded-cardinality signals for rejected or queued work.

#### API-05.07 — Production API security testing MUST cover BOLA, broken…

**Requirement:** Production API security testing MUST cover BOLA, broken authentication, property authorization, resource consumption, function authorization, sensitive business flows, SSRF, misconfiguration, inventory gaps, and unsafe third-party API consumption where those risks apply.

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

#### SEC-08.01 — Every listener MUST declare intended interface, audience…

**Requirement:** Every listener MUST declare intended interface, audience, authentication policy, TLS termination point, proxy trust, allowed origins, and firewall assumptions for each deployment profile.

#### SEC-08.02 — Loopback-only local mode MUST bind to loopback and MUST…

**Requirement:** Loopback-only local mode MUST bind to loopback and MUST reject or clearly warn when configuration exposes it to a non-loopback interface without an explicit network-exposure policy.

#### SEC-08.03 — Production network traffic carrying credentials, user data…

**Requirement:** Production network traffic carrying credentials, user data, model metadata with access impact, or administrative changes MUST use authenticated TLS with validated peer identity and supported protocol/cipher policy.

#### SEC-08.04 — Proxy-derived identity and forwarding headers MUST be trusted only…

**Requirement:** Proxy-derived identity and forwarding headers MUST be trusted only from configured proxy hops. The service MUST ignore spoofed forwarded headers from direct clients.

#### SEC-08.05 — CORS MUST use explicit origins, methods, headers…

**Requirement:** CORS MUST use explicit origins, methods, headers, and credential policy. Wildcard origins MUST NOT be combined with credentials; browser security headers and cache policy MUST match the UI/API threat model.

#### SEC-08.06 — Outbound connections MUST use destination allowlists where feasible…

**Requirement:** Outbound connections MUST use destination allowlists where feasible, validate DNS results and redirects, block prohibited address ranges, and revalidate after redirect or DNS change to resist SSRF and rebinding.

#### SEC-08.07 — DNS, proxy, TLS, certificate-expiry…

**Requirement:** DNS, proxy, TLS, certificate-expiry, and upstream timeout failures MUST be observable and fail safely without falling back to plaintext or an untrusted endpoint.

## 5. Prohibited conditions

- Do not claim OpenAI compatibility for routes the proxy cannot forward.
- Do not require the assistant upstream for engine readiness.
- Do not buffer an unbounded upstream stream in memory.
- Do not expose upstream credentials or internal hostnames in responses.
- Do not log prompt or completion content.

## 6. Procedure

- 1. Start a stub upstream and send a non-streaming and a streaming completion.
- 2. Stop the upstream and repeat, then run a local inference request.
- 3. Remove the upstream configuration and call the assistant route.
- 4. Send an oversized body and inspect the upstream request log.
- 5. Inspect correlation and redaction in local logs.
- 6. Record configuration, requests, responses, and upstream observations.

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

- Pass-through status and body for non-streaming and streaming requests.
- Upstream failure response and local inference health during the failure.
- Unconfigured response with no outbound connection.
- Body-limit rejection before forwarding.
- Redacted log records with correlation identifiers.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../requirements/assurance-standard.md), this check additionally requires:

- The SSRF and redirect test report with blocked destinations.
- The upstream chaos matrix and local readiness timeline.
- Header and artifact inspection showing no credential disclosure.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-012](../../../requirements/items/ENG-012.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [llm-proxy.feature](../features/llm-proxy.feature) |
| Rule controls | API-05, API-03, SEC-08 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
