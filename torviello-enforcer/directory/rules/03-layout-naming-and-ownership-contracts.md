# Layout, naming, and ownership contracts

**Control family:** directory  
**Control document:** DIR-03  
**Requirement trace:** CSC-001–CSC-004, PA-020–PA-024  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **layout, naming, and ownership contracts** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed directory behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### DIR-03.01 — Every maintained directory MUST have one primary responsibility…

**Requirement:** Every maintained directory MUST have one primary responsibility and an accountable owning subsystem. The owner MUST define allowed contents, public entry points, dependencies, generated content, and lifecycle.

### DIR-03.02 — Directory and file names MUST be stable, searchable…

**Requirement:** Directory and file names MUST be stable, searchable, language-appropriate, and consistent with the repository convention. Names MUST NOT encode temporary status, personal ownership, or implementation details likely to change independently of the content.

### DIR-03.03 — Each boundary MUST correspond to a real ownership…

**Requirement:** Each boundary MUST correspond to a real ownership, build, test, deployment, or distribution concern. Create a new module when it reduces coupling or provides independent selection; do not create levels of nesting that merely repeat product names.

### DIR-03.04 — Public interfaces and shared assets MUST have one authoritative…

**Requirement:** Public interfaces and shared assets MUST have one authoritative location. Compatibility aliases or duplicate copies MUST identify their source of truth, synchronization mechanism, and planned removal condition.

### DIR-03.05 — Directory-level docs MUST distinguish source, generated output…

**Requirement:** Directory-level docs MUST distinguish source, generated output, runtime data, fixtures, vendored code, and user-owned data. Build and cleanup tools MUST not delete user-owned or checked-in source data.

### DIR-03.06 — Cross-cutting implementation MUST remain with the owning domain…

**Requirement:** Cross-cutting implementation MUST remain with the owning domain or a clearly owned shared interface; do not create a generic “optimization”, “misc”, or “common” directory without explicit scope and consumers.

## Prohibited conditions

- Do not place credentials, local state, caches, or generated artifacts in source-owned directories without a defined reason and cleanup policy.
- Do not create an empty placeholder directory merely to satisfy a naming template.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to layout, naming, and ownership contracts. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Review ownership and path layout against build targets, test discovery, package contents, and cleanup scripts; verify no duplicate source of truth exists.
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
