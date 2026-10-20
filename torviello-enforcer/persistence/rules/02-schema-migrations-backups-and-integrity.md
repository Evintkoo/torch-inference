# Schema migrations, backups, and integrity

**Control family:** persistence  
**Control document:** DATA-02  
**Requirement trace:** RP-032–RP-034, SO-033  
**Status:** Normative project control

## Control objective

These controls govern **schema migrations, backups, and integrity**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **persistence** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### DATA-02.01 — Version every persistent schema

The project MUST version every persistent schema. Migrations are deterministic, ordered, repeatable only when explicitly safe, and validated before they affect production data.

### DATA-02.02 — Use transactions or an equivalent safe migration strategy

The project MUST use transactions or an equivalent safe migration strategy. The project MUST also preserve constraints and invariants. The project MUST also define forward-recovery or rollback behavior for partially applied changes.

### DATA-02.03 — Encrypt sensitive data in transit and at rest according

The project MUST encrypt sensitive data in transit and at rest according to the deployment threat model. The project MUST also enforce ownership and authorization at every read/write boundary.

### DATA-02.04 — Document backup scope, frequency, retention, encryption, access control, recovery

The project MUST document backup scope, frequency, retention, encryption, access control, recovery point, and recovery time objectives. The project MUST also test restoration from backup before production readiness.

### DATA-02.05 — Define deletion and retention behavior for accounts, credentials, audit

The project MUST define deletion and retention behavior for accounts, credentials, audit data, registry records, and user data. Propagate deletion to replicas and backups according to approved retention rules.

### DATA-02.06 — Monitor database health, saturation, connection pools, migration status

The project MUST monitor database health, saturation, connection pools, migration status, and backup freshness without exposing row contents or secrets.

## Prohibited conditions

- The project MUST NOT run destructive migrations without a backup and recovery plan
- The project MUST NOT claim backup readiness based solely on successful backup creation
- The project MUST NOT log SQL parameters or row contents when they can contain secrets or personal data

## Implementation guidance

Implementation MUST satisfy the applicable requirements above at the boundary where the risk or behavior is introduced. A wrapper, UI-only check, documentation statement, or downstream compensating check does not satisfy a requirement when the rule requires enforcement at a lower or authoritative boundary. Keep implementation choices consistent with the domain sources in the reference trail; document approved deviations instead of silently weakening the control.

## Assessment procedure

Assess both design and operation. Use the methods below as appropriate to the control and retain enough context for another reviewer to reproduce the determination.

### Examine

- Inspect the relevant specification, source, configuration, dependency/build metadata, tests, and operational documentation to confirm the requirement is addressed at the stated boundary.
- Confirm the change is traceable to the requirement IDs listed above and that any conditions, limits, defaults, failure behavior, and exceptions are explicit.

### Interview

- When a requirement depends on an operational role or manual procedure, interview the accountable owner and confirm the described procedure matches the approved documentation and observed practice. An interview alone does not establish effectiveness when implementation or behavior can be examined or tested.

### Test

- Test upgrade from supported prior schemas, interrupted migration, constraint violations, restore, deletion, and concurrent access at expected scale.
- Exercise at least one negative or failure case for each security, compatibility, resource, or reliability boundary affected by the change; confirm the observed result matches the contract and does not bypass the control.
- Record the command or procedure, tested revision and environment, result, and any limitation. A skipped check is not passing evidence.

## Assessment determination

A control document passes only when every applicable MUST requirement is implemented and supported by current evidence, each applicable SHOULD deviation has a documented rationale, and no unapproved or expired exception remains. A requirement fails when implementation is absent, behavior contradicts the requirement, evidence is missing or stale, or the assessment cannot reproduce the claimed result. Record **pass**, **fail**, or **not applicable** per control ID; “not applicable” requires a stated condition and reviewer rationale.

## Required evidence

- A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.

## Exceptions and nonconformance

A deviation from a MUST requirement requires explicit approval from the accountable product or engineering owner before release. The exception record MUST identify affected controls, scope, risk, compensating measures, remediation owner, and expiry or review date. A SHOULD deviation MUST include a rationale and impact in the change record. Unapproved or expired deviations are nonconformances and MUST block the affected release when the requirement is release-critical.

## Reference trail

Source IDs R1,R2 are listed in [00-references-trails.md](../trails/00-references-trails.md). The project rules above are the required behavior; the references provide the standards basis and verification context.
