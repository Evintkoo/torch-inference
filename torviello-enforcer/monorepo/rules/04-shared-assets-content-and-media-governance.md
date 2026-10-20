# Shared assets, content, and media governance

**Control family:** monorepo  
**Control document:** MON-04  
**Requirement trace:** PA-024, PA-030–PA-032, ED-030–ED-033  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **shared assets, content, and media governance** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed monorepo behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### MON-04.01 — Landing pages, documentation, demos, and marketing…

**Requirement:** Landing pages, documentation, demos, and marketing media MUST have named owners, source directories, build entry points, licensing records, and release lifecycle independent of engine runtime artifacts.

### MON-04.02 — Product media MUST be stored and versioned separately from…

**Requirement:** Product media MUST be stored and versioned separately from executable runtime assets unless a documented product use requires bundling. Media build tooling MUST not enter the inference package dependency graph.

### MON-04.03 — Content that names a release, endpoint, UI…

**Requirement:** Content that names a release, endpoint, UI behavior, or performance claim MUST identify its source artifact and release version so stale content can be detected.

### MON-04.04 — Demo pipelines MUST use synthetic or explicitly approved data…

**Requirement:** Demo pipelines MUST use synthetic or explicitly approved data and reproducible model/runtime versions. They MUST not publish credentials, private user data, internal endpoints, or unsupported behavior.

### MON-04.05 — Shared design tokens and components MUST be consumed through…

**Requirement:** Shared design tokens and components MUST be consumed through a defined package or source interface; independent applications MUST have a compatibility and versioning policy for those assets.

### MON-04.06 — Published docs/media MUST retain required attribution, model notices…

**Requirement:** Published docs/media MUST retain required attribution, model notices, font/image licenses, and accessibility alternatives in both source and rendered output.

### MON-04.07 — External hosting failure MUST not prevent a clean local…

**Requirement:** External hosting failure MUST not prevent a clean local engine build or local documentation preview when the relevant assets are already present.

## Prohibited conditions

- Do not package marketing/demo tooling into the backend-only engine.
- Do not treat a public media URL as proof of redistribution rights.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to shared assets, content, and media governance. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Inspect package contents and dependency graphs; rebuild docs/media locally; validate data provenance, versioned claims, notices, and accessibility output.
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
