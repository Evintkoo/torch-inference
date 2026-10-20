# Model provenance, installation, and update trust

**Control family:** models  
**Control document:** MOD-06  
**Requirement trace:** SO-012, RP-012, RP-031  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **model provenance, installation, and update trust** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed models behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### MOD-06.01 — Model manifests MUST bind publisher identity, immutable model/version…

**Requirement:** Model manifests MUST bind publisher identity, immutable model/version identity, file list, size, cryptographic digest, license, compatibility metadata, and any signature or attestation to the exact bytes installed.

### MOD-06.02 — Downloaded model files MUST be written to an isolated…

**Requirement:** Downloaded model files MUST be written to an isolated temporary location, size-limited during transfer, verified before activation, and atomically moved into the immutable content-addressed store only after complete validation.

### MOD-06.03 — Archive extraction MUST reject path traversal, absolute paths…

**Requirement:** Archive extraction MUST reject path traversal, absolute paths, duplicate/conflicting paths, symlink escape, excessive file count, excessive expansion, and special device files.

### MOD-06.04 — Update trust MUST define trusted roots, key rotation…

**Requirement:** Update trust MUST define trusted roots, key rotation, expiration, rollback/freeze/mix-and-match defenses, metadata freshness, and recovery when signing keys are suspected compromised; use TUF or an equivalent reviewed update framework for remote catalogs.

### MOD-06.05 — Failed network, signature, digest, license…

**Requirement:** Failed network, signature, digest, license, compatibility, disk-write, or activation checks MUST preserve the last known-good model and leave a diagnosable failure record.

### MOD-06.06 — Local/offline installation MUST have an import path that verifies…

**Requirement:** Local/offline installation MUST have an import path that verifies the same identity, integrity, license, and compatibility data as remote installation.

### MOD-06.07 — Model deletion MUST distinguish user-owned, shared, active…

**Requirement:** Model deletion MUST distinguish user-owned, shared, active, cached, and system-provided assets; active references MUST be released safely before bytes are removed.

## Prohibited conditions

- Do not overwrite model bytes in place while retaining the same identifier or digest.
- Do not activate an artifact merely because its download completed successfully.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to model provenance, installation, and update trust. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Test tampered, truncated, stale, replayed, incompatible, path-hostile, oversized, and offline-imported packages; verify atomic update and restoration of the prior model.
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

Source IDs R3,R6 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
