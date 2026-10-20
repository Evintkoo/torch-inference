# Provider selection, contracts, and risk review

**Control family:** vendor-and-cost  
**Control document:** VEND-04  
**Requirement trace:** PA-001–PA-004, PA-024, RP-021, SO-004, SO-012  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **provider selection, contracts, and risk review** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed vendor-and-cost behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### VEND-04.01 — Before adopting a critical provider, the project MUST…

**Requirement:** Before adopting a critical provider, the project MUST document service purpose, data classes, regions, identity/auth model, retention, subprocessors, service limits, outage history/commitments, price model, support, and termination/export terms.

### VEND-04.02 — Provider review MUST assess security assurance, vulnerability disclosure…

**Requirement:** Provider review MUST assess security assurance, vulnerability disclosure, encryption/key control, auditability, incident notification, backup/recovery, regulatory/jurisdiction exposure, and dependency concentration.

### VEND-04.03 — Integration contracts MUST define API versioning, timeout/retry behavior…

**Requirement:** Integration contracts MUST define API versioning, timeout/retry behavior, idempotency, quotas, error semantics, data deletion, and a tested degraded mode.

### VEND-04.04 — Provider credentials MUST be scoped per service and environment…

**Requirement:** Provider credentials MUST be scoped per service and environment, rotated, monitored, and revocable without disabling unrelated local operation.

### VEND-04.05 — Critical external service dependencies MUST be classified as build-time…

**Requirement:** Critical external service dependencies MUST be classified as build-time, release-time, runtime, update-time, licensing, telemetry, or documentation dependencies and listed in the deployment architecture.

### VEND-04.06 — Provider terms, prices, compatibility, and security…

**Requirement:** Provider terms, prices, compatibility, and security posture MUST be reviewed before production reliance and whenever the provider announces a material change.

### VEND-04.07 — An owner MUST monitor end-of-life, API changes…

**Requirement:** An owner MUST monitor end-of-life, API changes, security advisories, quota changes, billing changes, and incidents for each critical provider.

## Prohibited conditions

- Do not send user or model data to a provider without an approved data flow and user-facing disclosure where required.
- Do not let one provider become an undocumented dependency for local inference.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to provider selection, contracts, and risk review. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Review provider register, data flow, contract limits, secrets scope, outage simulation, and exit/export tests against current terms.
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

Source IDs R1,R2 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
