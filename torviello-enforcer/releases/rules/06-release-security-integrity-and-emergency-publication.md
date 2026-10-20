# Release security, integrity, and emergency publication

**Control family:** releases  
**Control document:** REL-06  
**Requirement trace:** SO-012–SO-014, ED-020–ED-024  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **release security, integrity, and emergency publication** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed releases behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### REL-06.01 — Release credentials MUST be separated from build/test credentials…

**Requirement:** Release credentials MUST be separated from build/test credentials, scoped to the minimum publication action, short-lived where supported, and unavailable to untrusted pull-request code.

### REL-06.02 — Release builds MUST use reviewed, pinned source revisions…

**Requirement:** Release builds MUST use reviewed, pinned source revisions and dependencies; builder identity, parameters, resolved inputs, and artifact digest MUST be captured in provenance.

### REL-06.03 — Provenance and signatures MUST be published with a stable…

**Requirement:** Provenance and signatures MUST be published with a stable mapping to every artifact and verified before installation where the distribution channel supports verification.

### REL-06.04 — SBOMs MUST identify shipped components and versions, include…

**Requirement:** SBOMs MUST identify shipped components and versions, include transitive dependencies and bundled runtime/model assets where tooling supports them, and be reconciled with package contents.

### REL-06.05 — Security release decisions MUST assess exploitability, affected versions/profiles…

**Requirement:** Security release decisions MUST assess exploitability, affected versions/profiles, available mitigations, disclosure timing, patch compatibility, and users unable to update immediately.

### REL-06.06 — Emergency publication MUST use a documented minimal workflow…

**Requirement:** Emergency publication MUST use a documented minimal workflow, independent approval, artifact verification, customer communication, and post-release audit; skipped checks MUST be recorded with owner and follow-up deadline.

### REL-06.07 — Published artifacts, attestations, signatures, and release…

**Requirement:** Published artifacts, attestations, signatures, and release tags MUST be immutable; a corrected build MUST receive a new artifact identity and clear supersession notice.

## Prohibited conditions

- Do not expose signing keys to build steps that execute pull-request or user-controlled code.
- Do not treat a checksum hosted beside an artifact as authenticity proof unless its distribution is independently authenticated.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to release security, integrity, and emergency publication. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Attempt unauthorized publication in a protected workflow test; verify provenance/signature, SBOM-package match, immutable release assets, and emergency audit records.
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
