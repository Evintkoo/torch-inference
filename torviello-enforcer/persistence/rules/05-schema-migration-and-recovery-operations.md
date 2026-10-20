# Schema migration and recovery operations

**Control family:** persistence  
**Control document:** DATA-05  
**Requirement trace:** RP-003, RP-033–RP-034, SO-031–SO-033  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **schema migration and recovery operations** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed persistence behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### DATA-05.01 — Every schema change MUST have a versioned, ordered…

**Requirement:** Every schema change MUST have a versioned, ordered migration and an explicit compatibility window between application and schema versions.

### DATA-05.02 — Migrations MUST be deterministic and safe to resume…

**Requirement:** Migrations MUST be deterministic and safe to resume or fail visibly. Destructive changes MUST use expand/migrate/contract or an equivalent staged strategy when older binaries or rollback can still access the data.

### DATA-05.03 — Before applying a destructive or irreversible migration…

**Requirement:** Before applying a destructive or irreversible migration, the system MUST verify required backup/snapshot evidence or have a tested forward-recovery path; the policy MUST state when maintenance mode is required.

### DATA-05.04 — Migration execution MUST be serialized across instances and protected…

**Requirement:** Migration execution MUST be serialized across instances and protected against concurrent startup. Record migration identity, start/end, result, and failure details without exposing sensitive row content.

### DATA-05.05 — Backup procedures MUST state consistency method, scope…

**Requirement:** Backup procedures MUST state consistency method, scope, encryption, key access, retention, RPO/RTO, storage independence, and version compatibility.

### DATA-05.06 — Restore tests MUST use isolated environments, validate schema…

**Requirement:** Restore tests MUST use isolated environments, validate schema and application startup, verify representative records and constraints, and measure achieved recovery objectives.

### DATA-05.07 — If rollback is impossible, release procedure MUST declare…

**Requirement:** If rollback is impossible, release procedure MUST declare forward-only migration status and provide a tested recovery plan before deployment.

## Prohibited conditions

- Do not delete the only compatible backup before confirming the migrated system is healthy.
- Do not assume copying a live database file produces a consistent backup.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to schema migration and recovery operations. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Upgrade from each supported schema version, interrupt migrations at failure points, restore from backup, and verify compatibility and integrity before serving traffic.
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

Source IDs R1,R3 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
