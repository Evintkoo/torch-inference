# System context and architecture views

**Control family:** architecture  
**Control document:** ARC-03  
**Requirement trace:** PA-013–PA-014, ED-005  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **system context and architecture views** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed architecture behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### ARC-03.01 — The maintained system blueprint MUST identify system purpose…

**Requirement:** The maintained system blueprint MUST identify system purpose, primary user and operator concerns, system boundary, external actors, adjacent systems, trust boundaries, and deployment contexts.

### ARC-03.02 — Architecture views MUST be selected to answer named stakeholder…

**Requirement:** Architecture views MUST be selected to answer named stakeholder concerns rather than drawn only to show code folders. At minimum, the blueprint MUST show runtime components and communication, data ownership and persistence, deployment/package profiles, external dependencies, and security trust boundaries.

### ARC-03.03 — Each view MUST identify its scope, notation…

**Requirement:** Each view MUST identify its scope, notation or legend, last reviewed revision, and source of truth. A diagram that is partly generated MUST state which parts are generated and which require human review.

### ARC-03.04 — Architecture changes MUST update affected views in the same…

**Requirement:** Architecture changes MUST update affected views in the same change or record why the view remains accurate. Reviewers MUST be able to trace a runtime component to its owning module, configuration, data stores, and external interfaces.

### ARC-03.05 — Architecture constraints and quality attributes MUST be written as…

**Requirement:** Architecture constraints and quality attributes MUST be written as measurable scenarios that state stimulus, environment, affected component, response, and measure (for example, offline start after assets are installed, or model-load failure preserving readiness semantics).

### ARC-03.06 — Alternative designs for material decisions MUST be compared against…

**Requirement:** Alternative designs for material decisions MUST be compared against requirements, operational burden, failure behavior, portability, security, build impact, and migration cost; record the selected option and rejected alternatives.

## Prohibited conditions

- Do not treat a canvas or component diagram as a complete system description when data, deployment, trust, or external-service views are missing.
- Do not keep architecture drawings whose displayed boundaries contradict the shipped build or runtime graph.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to system context and architecture views. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Review the blueprint against executable configuration, package contents, service topology, and actual call/data-flow paths; check that each stated stakeholder concern has a corresponding view or explicit deferral.
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

Source IDs R3 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
