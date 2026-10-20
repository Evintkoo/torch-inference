# Rust API safety, errors, and unsafe code

**Control family:** code-quality  
**Control document:** CQ-03  
**Requirement trace:** ED-001–ED-005  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **rust api safety, errors, and unsafe code** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed code-quality behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### CQ-03.01 — Public Rust APIs MUST use types that make invalid…

**Requirement:** Public Rust APIs MUST use types that make invalid states difficult to represent, validate untrusted inputs at construction boundaries, and document invariants that callers MUST uphold.

### CQ-03.02 — Public types and functions MUST define ownership, borrowing…

**Requirement:** Public types and functions MUST define ownership, borrowing, thread-safety, cancellation, error, and resource-lifetime expectations. Implement standard traits and conversion patterns where they preserve the abstraction and expected semantics.

### CQ-03.03 — Every unsafe block MUST have a local safety comment…

**Requirement:** Every unsafe block MUST have a local safety comment identifying the invariant relied upon and how it is upheld. Unsafe code MUST be minimized, encapsulated behind a safe interface, and reviewed by a qualified reviewer.

### CQ-03.04 — FFI and backend boundaries MUST validate pointer, buffer…

**Requirement:** FFI and backend boundaries MUST validate pointer, buffer length, alignment, ownership, ABI, thread-safety, and error contracts before converting data into safe Rust abstractions.

### CQ-03.05 — Production code MUST use typed errors that preserve source…

**Requirement:** Production code MUST use typed errors that preserve source context internally and define stable conversion at process, API, CLI, and module boundaries. Error types MUST distinguish invalid input, unsupported capability, unavailable resources, cancellation, and internal faults when callers respond differently.

### CQ-03.06 — Concurrency code MUST document shared-state synchronization and poison/recovery behavior…

**Requirement:** Concurrency code MUST document shared-state synchronization and poison/recovery behavior. Use atomics, locks, channels, or ownership transfer only where their consistency and cancellation semantics are understood.

### CQ-03.07 — Public API changes MUST be checked for source compatibility…

**Requirement:** Public API changes MUST be checked for source compatibility, semver impact, and feature interactions before publication.

## Prohibited conditions

- Do not add unsafe code to avoid an otherwise manageable ownership or allocation design without measured justification.
- Do not discard error causes with generic strings or silently convert failure into a default value.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to rust api safety, errors, and unsafe code. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Run formatting, Clippy, tests, documentation tests, Miri or sanitizers where applicable, and review every unsafe/FFI change against its stated invariants.
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
