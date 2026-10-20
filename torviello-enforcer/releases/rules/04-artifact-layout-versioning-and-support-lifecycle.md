# Artifact layout, versioning, and support lifecycle

**Control family:** releases  
**Control document:** REL-04  
**Requirement trace:** RP-020–RP-024, ED-020–ED-023  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **artifact layout, versioning, and support lifecycle** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed releases behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### REL-04.01 — Each release MUST define product version, artifact names…

**Requirement:** Each release MUST define product version, artifact names, target tuple, package type, feature profile, model/runtime inclusion, and compatibility scope in machine-readable metadata.

### REL-04.02 — Engine-only and full-package artifacts MUST be independently installable…

**Requirement:** Engine-only and full-package artifacts MUST be independently installable and identifiable. They MUST document shared version relationships, allowed mixed versions, service dependencies, and upgrade path.

### REL-04.03 — Package formats MUST follow target ecosystem conventions and define…

**Requirement:** Package formats MUST follow target ecosystem conventions and define install root, writable data paths, executable permissions, service identity, uninstall behavior, and user-owned state preservation.

### REL-04.04 — Release channels MUST state stability and update policy…

**Requirement:** Release channels MUST state stability and update policy. Pre-release, stable, and security-fix channels MUST not overwrite one another’s artifact identities.

### REL-04.05 — Every release MUST state supported prior application/config/schema versions…

**Requirement:** Every release MUST state supported prior application/config/schema versions, upgrade and downgrade behavior, breaking changes, and end-of-support dates where applicable.

### REL-04.06 — Release metadata MUST bind checksums, signatures/provenance, SBOM…

**Requirement:** Release metadata MUST bind checksums, signatures/provenance, SBOM, notices, and artifacts by immutable digest.

### REL-04.07 — Artifact retention MUST preserve the supported versions and recovery…

**Requirement:** Artifact retention MUST preserve the supported versions and recovery artifacts required by the published rollback/security policy.

## Prohibited conditions

- Do not use a moving “latest” alias as the only identity for a released artifact.
- Do not publish the same filename for different bytes or target architectures.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to artifact layout, versioning, and support lifecycle. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Inspect release manifest, install/uninstall packages, artifact immutability, channel promotion, version compatibility, and retained rollback assets.
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
