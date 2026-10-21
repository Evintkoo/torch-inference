# Repository history and plan retention

**Control family:** change-management  
**Control document:** CHG-05  
**Requirement trace:** ED-042, PA-024  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **repository history and plan retention** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed change-management behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### CHG-05.01 — Feature development MUST follow the sequence specification, technical…

**Requirement:** Feature development MUST follow the sequence specification, technical requirements, plan, implementation, and acceptance evidence. The required depth MAY scale with change risk, but the intent, acceptance criteria, and verification MUST remain explicit.

### CHG-05.02 — Plans designated private by project policy MUST remain outside…

**Requirement:** Plans designated private by project policy MUST remain outside published Git history and release artifacts. The project MUST define where such plans live, how they are named, how long they are retained, and how reviewers can verify completion without publishing sensitive planning material.

### CHG-05.03 — Commits and change descriptions MUST state what changed…

**Requirement:** Commits and change descriptions MUST state what changed and why, identify linked requirements or issues, and avoid credentials, personal data, customer payloads, and confidential operational details.

### CHG-05.04 — History rewriting MUST be restricted to branches where it…

**Requirement:** History rewriting MUST be restricted to branches where it cannot invalidate reviewed or released source identities. Released tags and signed provenance MUST remain immutable; corrections MUST create a new version or attestation.

### CHG-05.05 — When a plan changes materially, the change MUST…

**Requirement:** When a plan changes materially, the change MUST update the specification or decision record so the accepted implementation can be compared to the approved intent.

### CHG-05.06 — Repository policy MUST distinguish review artifacts that are retained…

**Requirement:** Repository policy MUST distinguish review artifacts that are retained (specification, decision, test evidence, release notes) from local transient artifacts (private plans, scratch files, generated caches).

### CHG-05.07 — Completed work MUST be committed before handoff…

**Requirement:** Completed, verified work MUST be committed to version control before it is handed off, released, or reported complete. The history MUST provide a revertible revision for each coherent change, and the reported evidence MUST identify the committed revision. A task MUST NOT leave its only copy of completed work as uncommitted changes. Work-in-progress MAY remain uncommitted only while it is explicitly owned and identified as incomplete. Credentials, personal data, build outputs, and generated caches MUST NOT be committed. Pushing or publishing the revision remains subject to explicit authorization.

## Prohibited conditions

- Do not publish a private plan merely because a local planning file was accidentally included in a commit; remove it before release and assess exposure.
- Do not use mutable tags or rewritten release history as the mechanism for correcting a published artifact.
- Reporting work complete while task-owned changes remain uncommitted and no approved retention exception exists.
- Committing credentials, personal data, build outputs, or generated caches to create a rollback point.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to repository history and plan retention. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Inspect clean and published Git history, release archives, and change records for private-plan leakage, stable source identities, and completed traceability. Confirm the reported revision contains the completed work and that the worktree is clean apart from explicitly owned work-in-progress.
- Exercise negative, boundary, and failure cases identified by the control; record actual versus expected behavior. A skipped required check is not passing evidence.

## Assessment determination

Assess each control ID as **pass**, **fail**, or **not applicable**. Pass requires every applicable MUST to be implemented and supported by current evidence, including a revertible committed revision for completed work. Fail applies when behavior contradicts a requirement, enforcement is bypassable, evidence is missing/stale, completed work exists only as uncommitted changes, or a required scenario cannot be reproduced. Not applicable requires a condition stated by the requirement and reviewer rationale.

## Required evidence

- Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- Commit hash and clean worktree status for the reported revision.
- Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.

## Exceptions and nonconformance

A deviation from a MUST requirement requires accountable owner approval before release. Record affected control IDs and profiles, risk, compensating measures, remediation owner, and expiry/review date. A SHOULD deviation requires rationale and impact in the change record. An expired or unapproved exception is a nonconformance and MUST block a release when the affected control is release-critical.

## Reference trail

Source IDs R1 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
