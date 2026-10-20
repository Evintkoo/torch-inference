# Emergency changes and risk acceptance

**Control family:** change-management  
**Control document:** CHG-04  
**Requirement trace:** ED-014, ED-042, SO-013, SO-031  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **emergency changes and risk acceptance** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed change-management behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### CHG-04.01 — Emergency changes MUST be limited to restoring service…

**Requirement:** Emergency changes MUST be limited to restoring service, containing an active security risk, or preventing imminent data loss. The incident or risk identifier, affected scope, owner, and reason MUST be recorded before or during the change.

### CHG-04.02 — An emergency change MUST use the smallest viable patch…

**Requirement:** An emergency change MUST use the smallest viable patch, retain required independent review where practicable, run focused regression and security checks, and record any check that could not run before deployment.

### CHG-04.03 — Every emergency change MUST receive a retrospective review within…

**Requirement:** Every emergency change MUST receive a retrospective review within the project-defined response window. The review MUST assess why normal planning was bypassed, validate the deployed diff, add missing tests/documentation, and close or assign follow-up risks.

### CHG-04.04 — Risk acceptance MUST name an accountable owner with authority…

**Requirement:** Risk acceptance MUST name an accountable owner with authority over the affected product or system, describe threat/scenario and impact, define compensating controls, name a remediation owner, set an expiry, and specify what event triggers earlier re-review.

### CHG-04.05 — Exceptions MUST be scoped to exact controls, services…

**Requirement:** Exceptions MUST be scoped to exact controls, services, packages, versions, and environments. A general waiver MUST NOT silently cover future changes or newly discovered risks.

### CHG-04.06 — Expired or materially invalidated exceptions MUST be treated as…

**Requirement:** Expired or materially invalidated exceptions MUST be treated as nonconformances. CI or release review MUST surface them before the affected artifact is promoted.

### CHG-04.07 — High-severity security defects MUST follow the private reporting…

**Requirement:** High-severity security defects MUST follow the private reporting, triage, patch, coordinated disclosure, and supported-version processes defined by the security policy.

## Prohibited conditions

- Do not use emergency status to bypass planning for schedule convenience.
- Do not close an exception by deleting its record; record remediation evidence and the date it ceased to apply.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to emergency changes and risk acceptance. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Sample emergency changes and exceptions; verify timestamps, owner authority, containment, retrospective actions, expiry enforcement, and patch evidence.
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

Source IDs R1 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
