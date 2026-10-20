# Install, upgrade, migration, and rollback

**Control family:** releases  
**Control document:** REL-05  
**Requirement trace:** RP-021–RP-024, RP-030–RP-034, SO-031  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **install, upgrade, migration, and rollback** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed releases behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### REL-05.01 — Installers MUST verify package identity and integrity before executing…

**Requirement:** Installers MUST verify package identity and integrity before executing privileged operations and MUST explain requested privileges and network access.

### REL-05.02 — Upgrade MUST stage new binaries and configuration, validate…

**Requirement:** Upgrade MUST stage new binaries and configuration, validate prerequisites and migrations, switch active versions atomically where feasible, and retain the previous known-good state until health verification passes.

### REL-05.03 — Configuration and database migrations MUST be versioned, backed…

**Requirement:** Configuration and database migrations MUST be versioned, backed up when destructive, observable, and compatible with the rollback policy. If downgrade is unsupported, the installer MUST block it before modifying state and explain forward recovery.

### REL-05.04 — Model assets MUST be versioned independently from binaries when…

**Requirement:** Model assets MUST be versioned independently from binaries when their size or lifecycle warrants it; model rollback MUST verify compatibility with the target runtime version.

### REL-05.05 — Interrupted installation, power loss, disk full…

**Requirement:** Interrupted installation, power loss, disk full, permission failure, failed signature, failed migration, and first-start failure MUST leave a recoverable state and preserve user data.

### REL-05.06 — Rollback MUST verify artifact integrity, restore compatible configuration/registry…

**Requirement:** Rollback MUST verify artifact integrity, restore compatible configuration/registry, and confirm readiness before returning traffic. Rollback MUST not reuse compromised signing keys or vulnerable artifacts without explicit risk approval.

### REL-05.07 — Users and operators MUST receive a release summary describing…

**Requirement:** Users and operators MUST receive a release summary describing required actions, data/schema changes, compatibility, and rollback limitations before upgrade.

## Prohibited conditions

- Do not overwrite active binaries or user configuration before candidate validation.
- Do not automatically retry a destructive migration after an ambiguous partial failure without checking its state.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to install, upgrade, migration, and rollback. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Exercise fresh install, each supported upgrade path, interrupted upgrade, failed migration, model rollback, and downgrade rejection on representative profiles.
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
