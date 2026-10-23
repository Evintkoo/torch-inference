# AC-ENG-22 — Authenticate and harden the serving edge

**Check ID:** AC-ENG-22  
**Requirement:** ENG-016  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** The default edge is local and safe, protected routes require valid scoped credentials, responses carry security headers, and rate-limit identity follows a trusted-proxy policy. AC-ENG-22 verifies ENG-016 and fails when the threshold below is not met.
- **Measurable:** 100% of applicable ASVS 5.0.0 Level 3 controls pass or hold an approved exception; zero authentication or authorization bypass; 100% TLS 1.3 on non-loopback listeners; zero shared-secret remote profiles; 100% token-attack corpus rejection; 100% security headers.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-016; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-016 — Authenticate and harden the serving edge

**Priority:** MUST  
**Requirement document:** [ENG-016](../../../torviello-enforcer/requirements/items/ENG-016.md)

The engine MUST default to a safe local edge, require valid credentials on protected routes when authentication is enabled, separate administrative authority from inference access, emit security headers, and apply rate limiting with a non-spoofable client identity policy.

**Acceptance summary:** A default local start binds 127.0.0.1 and does not expose unauthenticated mutation routes remotely.

## 2. Observable check

The default edge is local and safe, protected routes require valid scoped credentials, responses carry security headers, and rate-limit identity follows a trusted-proxy policy.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `auth-and-security.feature`

#### Local mode without authentication binds loopback only

```gherkin
Scenario: Local mode without authentication binds loopback only
    Given auth.enabled is false
    When the engine starts
    Then the listener binds 127.0.0.1 by default
    And protected mutation routes remain unavailable from non-loopback clients
```

#### Protected route rejects a missing token

```gherkin
Scenario: Protected route rejects a missing token
    Given auth.enabled is true
    When a client calls a protected route without Authorization
    Then the response is 401 with a WWW-Authenticate challenge
    And no handler executes
```

#### Invalid or expired tokens are rejected

```gherkin
Scenario: Invalid or expired tokens are rejected
    Given a bearer token with a bad signature or past expiry
    When the request is authenticated
    Then the response is 401 with error code "auth.invalid_token"
    And token contents are not logged
```

#### Administrative routes require administrative scope

```gherkin
Scenario: Administrative routes require administrative scope
    Given a valid token without the administrative scope
    When the client mutates the registry
    Then the response is 403 with error code "auth.forbidden"
    And the mutation is not applied
```

#### Security headers are present on every response

```gherkin
Scenario: Security headers are present on every response
    Given any HTTP response
    When headers are inspected
    Then CSP, X-Content-Type-Options, and X-Frame-Options are present
    And they do not allow unsafe inline script by default
```

#### Rate-limit identity cannot be spoofed by arbitrary headers

```gherkin
Scenario: Rate-limit identity cannot be spoofed by arbitrary headers
    Given a client supplies a forged forwarding header
    When rate limiting evaluates the request
    Then the identity follows the documented trusted-proxy policy
    And the client cannot reset its budget by changing the header
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| SEC-02 | Identity, authentication, and account lifecycle | [02-identity-authentication-and-account-lifecycle.md](../../../torviello-enforcer/security/rules/02-identity-authentication-and-account-lifecycle.md) |
| SEC-03 | Authorization and administrative access | [03-authorization-and-administrative-access.md](../../../torviello-enforcer/security/rules/03-authorization-and-administrative-access.md) |
| SEC-08 | Network boundaries and transport security | [08-network-boundaries-and-transport-security.md](../../../torviello-enforcer/security/rules/08-network-boundaries-and-transport-security.md) |
| SEC-10 | Secure defaults and abuse resilience | [10-secure-defaults-and-abuse-resilience.md](../../../torviello-enforcer/security/rules/10-secure-defaults-and-abuse-resilience.md) |

#### SEC-02.01 — Define identity requirements before expanding authentication code

The project MUST define identity requirements before expanding authentication code. The project MUST also specify local users, hosted accounts, device enrollment, service identities, engine-to-platform authentication, unauthenticated local mode, and offline behavior.

#### SEC-02.02 — Specify enrollment, login, logout, recovery, session expiry, refresh, revocation

The project MUST specify enrollment, login, logout, recovery, session expiry, refresh, revocation, account deletion, key rotation, and audit events before implementation.

#### SEC-02.03 — Use established password hashing and cryptographic libraries

The project MUST use established password hashing and cryptographic libraries. The project MUST also generate credentials with cryptographically secure randomness; use short-lived scoped tokens and rotateable signing keys.

#### SEC-02.04 — Keep local loopback usage account-free where the product profile

The project MUST keep local loopback usage account-free where the product profile permits it. Network-exposed deployments require an explicit auth policy and safe defaults.

#### SEC-02.05 — Protect credentials in transit with TLS for networked production

The project MUST protect credentials in transit with TLS for networked production deployments. The project MUST also validate production key material at startup and fail closed when required secrets are missing or weak.

#### SEC-03.01 — Apply deny-by-default authorization to every operation and resource

The project MUST apply deny-by-default authorization to every operation and resource. The project MUST also define roles/scopes for inference, model administration, registry changes, user management, billing/licensing, and system configuration.

#### SEC-03.02 — Enforce authorization at the service/domain boundary, not only in

The project MUST enforce authorization at the service/domain boundary, not only in UI controls or route naming. The project MUST also check ownership for object-level access and tenant isolation for hosted deployments.

#### SEC-03.03 — Separate read, create, update, promote, revoke, and delete permissions

The project MUST separate read, create, update, promote, revoke, and delete permissions where impact differs. The project MUST also require stronger controls for high-impact administration when specified by the threat model.

#### SEC-03.04 — Audit privileged actions with actor, target, time, outcome

The project MUST audit privileged actions with actor, target, time, outcome, and correlation context. The project MUST also ensure logs cannot be edited through the same ordinary admin permission.

#### SEC-03.05 — Keep health and metrics routes minimally informative and explicitly

The project MUST keep health and metrics routes minimally informative and explicitly categorized as public, internal, or privileged.

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

#### SEC-10.01 — Every security-relevant setting MUST have a safe default…

**Requirement:** Every security-relevant setting MUST have a safe default for its deployment profile and a validation rule preventing known-dangerous combinations.

#### SEC-10.02 — Authentication MUST be required for remote administrative and persistent…

**Requirement:** Authentication MUST be required for remote administrative and persistent user-data operations. Local account-free operation MUST be restricted to a clearly defined local exposure boundary.

#### SEC-10.03 — Authentication and authorization failures MUST not disclose credential validity…

**Requirement:** Authentication and authorization failures MUST not disclose credential validity, protected object existence, tenant membership, or internal policy details beyond what the caller needs to remediate.

#### SEC-10.04 — Expensive operations MUST enforce per-actor and global resource budgets…

**Requirement:** Expensive operations MUST enforce per-actor and global resource budgets, deadline, queue admission, cancellation, and retry ceilings; budgets MUST apply to preprocessing, model download, inference, and response serialization.

#### SEC-10.05 — Resource exhaustion MUST degrade predictably: reject new work…

**Requirement:** Resource exhaustion MUST degrade predictably: reject new work, protect existing work according to policy, preserve essential health/administrative recovery, and avoid process-wide failure from one request.

#### SEC-10.06 — Abuse detection MUST correlate repeated authentication failures, model-download…

**Requirement:** Abuse detection MUST correlate repeated authentication failures, model-download abuse, sensitive business flow automation, and unusual resource consumption with bounded signals and privacy-safe retention.

#### SEC-10.07 — Security controls MUST fail closed when their required key…

**Requirement:** Security controls MUST fail closed when their required key, policy, validator, or authorization dependency is unavailable; availability exceptions require a named decision and a bounded degraded mode.

## 5. Prohibited conditions

- Do not bind all interfaces with authentication disabled by default.
- Do not accept unsigned, expired, or algorithm-confused tokens.
- Do not treat inference authorization as administrative authorization.
- Do not trust arbitrary client-supplied forwarding headers for identity.
- Do not log tokens, secrets, or credential-bearing headers.

## 6. Procedure

- 1. Start with default local configuration and inspect the bind address and protected routes.
- 2. Enable authentication and exercise missing, invalid, expired, and valid tokens.
- 3. Call an administrative mutation with a non-admin token.
- 4. Inspect headers on success, client-error, and server-error responses.
- 5. Send forged forwarding headers from an untrusted peer and observe rate-limit identity.
- 6. Record configuration, requests, responses, and log redaction.

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

- Bind address and route-protection evidence.
- 401 and 403 responses for the token and scope cases.
- Header inspection across response classes.
- Rate-limit behavior under forged headers.
- Log inspection showing no credential leakage.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- The ASVS Level 3 control record with evidence links.
- The token attack corpus results and key-rotation/revocation records.
- The TLS scan and route-by-scope authorization matrix.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-016](../../../torviello-enforcer/requirements/items/ENG-016.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [auth-and-security.feature](../features/auth-and-security.feature) |
| Rule controls | SEC-02, SEC-03, SEC-08, SEC-10 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
