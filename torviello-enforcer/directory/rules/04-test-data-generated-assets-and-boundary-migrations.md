# Test data, generated assets, and boundary migrations

**Control family:** directory  
**Control document:** DIR-04  
**Requirement trace:** CSC-003–CSC-010, PA-020–PA-024  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **test data, generated assets, and boundary migrations** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed directory behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### DIR-04.01 — Production source, unit tests, integration tests…

**Requirement:** Production source, unit tests, integration tests, end-to-end tests, benchmarks, fixtures, model assets, docs source, design assets, containers, and generated outputs MUST have distinct discoverable homes consistent with their lifecycle and execution needs.

### DIR-04.02 — Fixtures MUST be deterministic, licensed for the intended…

**Requirement:** Fixtures MUST be deterministic, licensed for the intended use, free of production secrets and personal data, and small enough for routine checks unless an explicit large-data test is separately gated.

### DIR-04.03 — Generated files MUST identify their generator and regeneration command…

**Requirement:** Generated files MUST identify their generator and regeneration command. Hand edits to generated files MUST either be prohibited or reconciled to the source generator before merge.

### DIR-04.04 — Large models, datasets, videos, and benchmark…

**Requirement:** Large models, datasets, videos, and benchmark corpora MUST use an approved external artifact or local cache strategy with immutable identifiers, size, license, and checksum recorded; Git history MUST not become an unbounded binary store.

### DIR-04.05 — Boundary migrations MUST update imports, build scripts…

**Requirement:** Boundary migrations MUST update imports, build scripts, CI, package manifests, documentation links, and release automation in the same planned change. Compatibility shims MUST have an owner and removal condition.

### DIR-04.06 — Cleanup, formatting, and code-generation commands MUST be…

**Requirement:** Cleanup, formatting, and code-generation commands MUST be scoped so they cannot recursively delete or rewrite user data, unrelated products, vendored sources, or manually maintained artifacts.

### DIR-04.07 — New directories MUST receive purpose and agent guidance required…

**Requirement:** New directories MUST receive purpose and agent guidance required by CSC-001/002 unless the directory is a documented rules-domain exception; do not create empty files without useful local content.

## Prohibited conditions

- Do not put integration or performance tests under production source to simplify discovery.
- Do not move files without updating every workflow and consumer that names the old path.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to test data, generated assets, and boundary migrations. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Run clean-checkout builds and tests after path migrations; compare package manifests, generated outputs, fixture licenses, and cleanup behavior.
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
