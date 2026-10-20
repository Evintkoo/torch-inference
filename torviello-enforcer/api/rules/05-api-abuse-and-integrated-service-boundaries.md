# API abuse and integrated-service boundaries

**Control family:** api  
**Control document:** API-05  
**Requirement trace:** SO-003, SO-010–SO-012, SO-032  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **api abuse and integrated-service boundaries** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed api behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### API-05.01 — For each endpoint, the project MUST identify object-level…

**Requirement:** For each endpoint, the project MUST identify object-level, property-level, and function-level authorization needs. Authorization MUST be checked for the authenticated actor, target object, requested fields, and operation on every request, including batch and nested-resource operations.

### API-05.02 — Endpoints that trigger costly inference, model installation…

**Requirement:** Endpoints that trigger costly inference, model installation, account creation, license checks, or other business-sensitive flows MUST have threat-informed abuse controls. Apply per-principal and aggregate quotas, concurrency limits, cooldowns, and anomaly handling appropriate to the operation; document safe defaults and administrative overrides.

### API-05.03 — Rate limits MUST account for authenticated and anonymous actors…

**Requirement:** Rate limits MUST account for authenticated and anonymous actors, source-network aggregation, shared credentials, and distributed clients. Do not make IP address the sole identity signal for an authenticated user or disable limits for trusted internal callers by default.

### API-05.04 — When calling external APIs, the caller MUST authenticate…

**Requirement:** When calling external APIs, the caller MUST authenticate the peer, validate TLS, restrict destination and redirect policy, validate response schema and size, set connection and total timeouts, and treat all response data as untrusted.

### API-05.05 — API request processing MUST cap body, header…

**Requirement:** API request processing MUST cap body, header, multipart, nesting, collection, and decompressed sizes before unbounded allocation. Streaming parsers MUST enforce cumulative limits while reading, not only after buffering.

### API-05.06 — Overload behavior MUST be deterministic: reject before accepting…

**Requirement:** Overload behavior MUST be deterministic: reject before accepting unbounded work, return a documented status and retry guidance where appropriate, preserve service health endpoints, and emit bounded-cardinality signals for rejected or queued work.

### API-05.07 — Production API security testing MUST cover BOLA, broken…

**Requirement:** Production API security testing MUST cover BOLA, broken authentication, property authorization, resource consumption, function authorization, sensitive business flows, SSRF, misconfiguration, inventory gaps, and unsafe third-party API consumption where those risks apply.

## Prohibited conditions

- Do not trust API responses because the provider is known or the connection uses TLS.
- Do not reveal whether a protected object exists when authorization requires an indistinguishable response.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to api abuse and integrated-service boundaries. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Test cross-tenant and cross-object access, field over-posting, expensive-flow automation, rate-limit bypass, slow/large bodies, unsafe redirects, malformed peer responses, and dependency outages.
- Exercise negative, boundary, and failure cases identified by the control; record actual versus expected behavior. A skipped required check is not passing evidence.

## Assessment determination

Assess each control ID as **pass**, **fail**, or **not applicable**. Pass requires every applicable MUST to be implemented and supported by current evidence. Fail applies when behavior contradicts a requirement, enforcement is bypassable, evidence is missing/stale, or a required scenario cannot be reproduced. Not applicable requires a condition stated by the requirement and reviewer rationale.

## Required evidence

- Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.

## Exceptions and nonconformance

A deviation from a MUST requirement requires accountable owner approval before release. Record affected control IDs and profiles, risk, compensating measures, remediation owner, and expiry/review date. A SHOULD deviation requires rationale and impact in the change record. An expired or unapproved exception is a nonconformance and MUST block a release when the affected control is release-critical.

## Reference trail

Source IDs R2,R5 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
