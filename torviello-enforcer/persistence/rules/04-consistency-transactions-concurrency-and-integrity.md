# Consistency, transactions, concurrency, and integrity

**Control family:** persistence  
**Control document:** DATA-04  
**Requirement trace:** RP-032–RP-034, SO-031, SO-033  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **consistency, transactions, concurrency, and integrity** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed persistence behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### DATA-04.01 — Each persistent operation MUST state its atomicity and consistency…

**Requirement:** Each persistent operation MUST state its atomicity and consistency requirement, transaction boundary, conflict behavior, and retry semantics. Multi-record invariants MUST be enforced in the database transaction or a documented equivalent.

### DATA-04.02 — Concurrent writes MUST have explicit isolation/version semantics. Lost…

**Requirement:** Concurrent writes MUST have explicit isolation/version semantics. Lost updates MUST be prevented with transactions, compare-and-swap/version columns, or another verified mechanism where last-write-wins is not acceptable.

### DATA-04.03 — Constraints that protect ownership, uniqueness, referential integrity…

**Requirement:** Constraints that protect ownership, uniqueness, referential integrity, and valid state MUST be enforced at the durable boundary, not only by request validation.

### DATA-04.04 — Idempotent writes MUST define duplicate identity and retention…

**Requirement:** Idempotent writes MUST define duplicate identity and retention; non-idempotent operations MUST use transactionally recorded deduplication state before retry is allowed.

### DATA-04.05 — Database connection pools, lock waits, statement execution…

**Requirement:** Database connection pools, lock waits, statement execution, and retries MUST be bounded. Deadlocks and busy/serialization failures MUST be classified and retried only when the transaction is safe to replay.

### DATA-04.06 — Registry/config changes MUST validate a candidate, persist it…

**Requirement:** Registry/config changes MUST validate a candidate, persist it with an immutable version or audit record, and publish it atomically; readers MUST observe a complete prior or new version, never a partial mixture.

### DATA-04.07 — Integrity checks MUST detect corruption, schema mismatch…

**Requirement:** Integrity checks MUST detect corruption, schema mismatch, missing required indexes/constraints, and failed migrations before the service reports persistence readiness.

## Prohibited conditions

- Do not hold transactions open across long model inference or unbounded network operations.
- Do not treat successful in-memory mutation as durable commit when the contract promises persistence.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to consistency, transactions, concurrency, and integrity. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Run concurrent update, duplicate retry, crash-at-commit, lock/busy, corruption, and partial registry publication tests for each selected datastore.
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
