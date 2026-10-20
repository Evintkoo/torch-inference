# Review evidence and change control

**Control family:** change-management  
**Control document:** CHG-03  
**Requirement trace:** ED-011, ED-014, ED-042, CSC-005  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **review evidence and change control** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed change-management behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### CHG-03.01 — Every change MUST identify its intent, affected requirement…

**Requirement:** Every change MUST identify its intent, affected requirement and control IDs, scope, compatibility impact, verification plan, and operational or user-visible consequences. Changes without a requirement ID MUST identify the defect or maintenance objective they satisfy.

### CHG-03.02 — Changes affecting authentication, authorization, parsing, model…

**Requirement:** Changes affecting authentication, authorization, parsing, model loading, data persistence, release automation, cryptographic material, or public contracts MUST receive review by a person with relevant domain responsibility before merge.

### CHG-03.03 — Reviewers MUST assess behavior and evidence, not only…

**Requirement:** Reviewers MUST assess behavior and evidence, not only code style: success and failure paths, trust boundaries, resource bounds, concurrency, diagnostics, migration, backward compatibility, and recovery MUST be checked when applicable.

### CHG-03.04 — Each review MUST be attributable to an authenticated identity…

**Requirement:** Each review MUST be attributable to an authenticated identity and attached to the exact revision being merged. Material revisions after approval MUST invalidate or renew approval for affected areas.

### CHG-03.05 — Generated files, lockfiles, API schemas, database…

**Requirement:** Generated files, lockfiles, API schemas, database migrations, and release metadata MUST be reviewed for semantic impact and provenance. Automated generation MUST NOT be used to bypass review.

### CHG-03.06 — Changes that cannot be independently understood or rolled back…

**Requirement:** Changes that cannot be independently understood or rolled back SHOULD be split along functional boundaries unless splitting would make the intermediate state unsafe or non-buildable.

### CHG-03.07 — The final change record MUST accurately distinguish checks passed…

**Requirement:** The final change record MUST accurately distinguish checks passed, failed, skipped, and not run; include exact commands or CI job links and explain environment-dependent exclusions.

## Prohibited conditions

- Do not approve a change based only on a green status badge when required jobs were skipped or did not cover changed paths.
- Do not merge self-reviewed high-impact changes when independent review is available and required by repository policy.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to review evidence and change control. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Inspect revision-bound approvals, changed requirement/control coverage, required CI results, and migration/release artifacts; perform a seeded review exercise to confirm changed files trigger the right reviewers.
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
