# Maintainability and technical debt

**Control family:** code-quality  
**Control document:** CQ-05  
**Requirement trace:** ED-002–ED-005, CSC-006–CSC-010  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **maintainability and technical debt** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed code-quality behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### CQ-05.01 — Production code MUST have one clear owner…

**Requirement:** Production code MUST have one clear owner and a cohesive reason to change. Split files and modules by behavior, interface, or lifecycle boundary; use the 500-line threshold as a review trigger, not as justification for shallow fragments.

### CQ-05.02 — Dead or unreachable production paths MUST be removed unless…

**Requirement:** Dead or unreachable production paths MUST be removed unless a documented supported profile, migration, compatibility guarantee, or generated-code boundary requires them. Every retained conditional path MUST have a consumer and a test or build check.

### CQ-05.03 — Complexity MUST be reduced when it obscures domain behavior…

**Requirement:** Complexity MUST be reduced when it obscures domain behavior or makes failure handling unreviewable. Prefer explicit state transitions and named abstractions over deeply nested branching, unbounded callback chains, and global mutable state.

### CQ-05.04 — Code duplication MUST be consolidated only when behavior…

**Requirement:** Code duplication MUST be consolidated only when behavior and change ownership are genuinely shared. Similar-looking logic with different trust, lifecycle, or policy semantics MUST remain distinct or be parameterized explicitly.

### CQ-05.05 — Performance optimization MUST be attached to the responsible component…

**Requirement:** Performance optimization MUST be attached to the responsible component, supported by a reproducible profile or benchmark, and include correctness and resource tradeoff evidence.

### CQ-05.06 — Technical debt MUST be recorded with impact, affected…

**Requirement:** Technical debt MUST be recorded with impact, affected components, owner, and trigger or target date when it creates reliability, security, compatibility, or delivery risk.

### CQ-05.07 — Runtime diagnostics MUST use shared structured logging; user-facing…

**Requirement:** Runtime diagnostics MUST use shared structured logging; user-facing CLI output and test diagnostics MUST remain intentionally separated from service logs.

## Prohibited conditions

- Do not add catch-all utilities or abstractions without stable callers and named ownership.
- Do not keep code only because it was difficult to write; require a current supported use or remove it.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to maintainability and technical debt. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Review ownership, module graph, file-size exceptions, production dead-code reports, debt register, and benchmark evidence for claimed optimizations.
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

Source IDs R1,R4 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
