# Secure defaults and abuse resilience

**Control family:** security  
**Control document:** SEC-10  
**Requirement trace:** SO-002–SO-005, SO-010–SO-014, SO-030–SO-032  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **secure defaults and abuse resilience** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed security behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### SEC-10.01 — Every security-relevant setting MUST have a safe default…

**Requirement:** Every security-relevant setting MUST have a safe default for its deployment profile and a validation rule preventing known-dangerous combinations.

### SEC-10.02 — Authentication MUST be required for remote administrative and persistent…

**Requirement:** Authentication MUST be required for remote administrative and persistent user-data operations. Local account-free operation MUST be restricted to a clearly defined local exposure boundary.

### SEC-10.03 — Authentication and authorization failures MUST not disclose credential validity…

**Requirement:** Authentication and authorization failures MUST not disclose credential validity, protected object existence, tenant membership, or internal policy details beyond what the caller needs to remediate.

### SEC-10.04 — Expensive operations MUST enforce per-actor and global resource budgets…

**Requirement:** Expensive operations MUST enforce per-actor and global resource budgets, deadline, queue admission, cancellation, and retry ceilings; budgets MUST apply to preprocessing, model download, inference, and response serialization.

### SEC-10.05 — Resource exhaustion MUST degrade predictably: reject new work…

**Requirement:** Resource exhaustion MUST degrade predictably: reject new work, protect existing work according to policy, preserve essential health/administrative recovery, and avoid process-wide failure from one request.

### SEC-10.06 — Abuse detection MUST correlate repeated authentication failures, model-download…

**Requirement:** Abuse detection MUST correlate repeated authentication failures, model-download abuse, sensitive business flow automation, and unusual resource consumption with bounded signals and privacy-safe retention.

### SEC-10.07 — Security controls MUST fail closed when their required key…

**Requirement:** Security controls MUST fail closed when their required key, policy, validator, or authorization dependency is unavailable; availability exceptions require a named decision and a bounded degraded mode.

## Prohibited conditions

- Do not use permissive defaults for CORS, debug routes, administrative roles, model sources, or remote listeners.
- Do not allow a request to reserve unbounded CPU, memory, disk, accelerator memory, or queue capacity.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to secure defaults and abuse resilience. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Test default installation, dangerous configuration combinations, dependency loss, credential abuse, request floods, queue exhaustion, and recovery after overload.
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
