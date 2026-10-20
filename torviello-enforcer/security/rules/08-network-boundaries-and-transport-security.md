# Network boundaries and transport security

**Control family:** security  
**Control document:** SEC-08  
**Requirement trace:** SO-002–SO-004, SO-010–SO-012  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **network boundaries and transport security** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed security behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### SEC-08.01 — Every listener MUST declare intended interface, audience…

**Requirement:** Every listener MUST declare intended interface, audience, authentication policy, TLS termination point, proxy trust, allowed origins, and firewall assumptions for each deployment profile.

### SEC-08.02 — Loopback-only local mode MUST bind to loopback and MUST…

**Requirement:** Loopback-only local mode MUST bind to loopback and MUST reject or clearly warn when configuration exposes it to a non-loopback interface without an explicit network-exposure policy.

### SEC-08.03 — Production network traffic carrying credentials, user data…

**Requirement:** Production network traffic carrying credentials, user data, model metadata with access impact, or administrative changes MUST use authenticated TLS with validated peer identity and supported protocol/cipher policy.

### SEC-08.04 — Proxy-derived identity and forwarding headers MUST be trusted only…

**Requirement:** Proxy-derived identity and forwarding headers MUST be trusted only from configured proxy hops. The service MUST ignore spoofed forwarded headers from direct clients.

### SEC-08.05 — CORS MUST use explicit origins, methods, headers…

**Requirement:** CORS MUST use explicit origins, methods, headers, and credential policy. Wildcard origins MUST NOT be combined with credentials; browser security headers and cache policy MUST match the UI/API threat model.

### SEC-08.06 — Outbound connections MUST use destination allowlists where feasible…

**Requirement:** Outbound connections MUST use destination allowlists where feasible, validate DNS results and redirects, block prohibited address ranges, and revalidate after redirect or DNS change to resist SSRF and rebinding.

### SEC-08.07 — DNS, proxy, TLS, certificate-expiry…

**Requirement:** DNS, proxy, TLS, certificate-expiry, and upstream timeout failures MUST be observable and fail safely without falling back to plaintext or an untrusted endpoint.

## Prohibited conditions

- Do not treat network location or private IP range as proof of caller identity.
- Do not expose metrics, debug, profiling, or admin routes publicly by default.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to network boundaries and transport security. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Test interface binding, spoofed proxy headers, TLS certificate and expiry failures, CORS preflight, redirect-to-private targets, DNS rebinding cases, and plaintext downgrade attempts.
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

Source IDs R1,R2,R5 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
