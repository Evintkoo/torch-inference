# Data classification, retention, and deletion

**Control family:** persistence  
**Control document:** DATA-03  
**Requirement trace:** RP-032–RP-034, SO-004, SO-021, SO-033  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **data classification, retention, and deletion** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed persistence behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### DATA-03.01 — Every persistent record category MUST identify owner, purpose…

**Requirement:** Every persistent record category MUST identify owner, purpose, sensitivity, source, users/roles allowed to read or mutate, retention trigger, deletion method, backup coverage, and whether it is required for local inference.

### DATA-03.02 — Inference prompts, uploads, outputs, and intermediate…

**Requirement:** Inference prompts, uploads, outputs, and intermediate tensors MUST remain transient by default. Any persistence MUST be an explicit feature with disclosure, scope, retention, access, deletion, backup, and legal basis decisions.

### DATA-03.03 — Deletion MUST cover primary storage, indexes, caches…

**Requirement:** Deletion MUST cover primary storage, indexes, caches, derived records, exports, and backups according to a documented retention schedule; backup copies MUST expire within a stated period or be cryptographically rendered inaccessible.

### DATA-03.04 — Encryption at rest MUST be selected according to data…

**Requirement:** Encryption at rest MUST be selected according to data classification, threat model, deployment capabilities, key ownership, recovery, and performance impact. Key loss and rotation consequences MUST be documented.

### DATA-03.05 — Data export MUST preserve integrity and clearly state schema/version…

**Requirement:** Data export MUST preserve integrity and clearly state schema/version, included record categories, redactions, and re-import compatibility. Export access MUST be authorized and audited when records are sensitive.

### DATA-03.06 — Retention jobs MUST be idempotent, bounded, observable…

**Requirement:** Retention jobs MUST be idempotent, bounded, observable, and safe under restart. Failed deletion MUST be surfaced as an operational/security finding rather than silently retried forever.

### DATA-03.07 — Local no-persistence profiles MUST not initialize a database…

**Requirement:** Local no-persistence profiles MUST not initialize a database or write inference content to disk merely for telemetry or debugging.

## Prohibited conditions

- Do not retain sensitive payloads because they are convenient for reproducing bugs.
- Do not claim deletion until derived copies and backup lifecycle have been considered.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to data classification, retention, and deletion. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Seed marked data through storage, logs, caches, exports, and backups; verify access denial, expiry, deletion, restore semantics, and local no-database behavior.
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
