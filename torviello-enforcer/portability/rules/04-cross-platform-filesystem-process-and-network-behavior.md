# Cross-platform filesystem, process, and network behavior

**Control family:** portability  
**Control document:** PORT-04  
**Requirement trace:** RP-020–RP-024, RP-030  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **cross-platform filesystem, process, and network behavior** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed portability behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### PORT-04.01 — Filesystem code MUST handle platform path separators, case…

**Requirement:** Filesystem code MUST handle platform path separators, case sensitivity, Unicode normalization, reserved names, maximum path lengths, permissions, atomic rename limits, and removable/network-mounted filesystems where supported.

### PORT-04.02 — User-controlled paths MUST be canonicalized and checked against allowed…

**Requirement:** User-controlled paths MUST be canonicalized and checked against allowed roots after symlink resolution when confinement is required; checks MUST resist time-of-check/time-of-use races.

### PORT-04.03 — Process execution MUST use argument arrays and explicit working…

**Requirement:** Process execution MUST use argument arrays and explicit working directory/environment. Shell interpretation MUST NOT be used for untrusted values; child process handles, exit codes, signals, timeouts, and cleanup MUST be managed on every target.

### PORT-04.04 — Network behavior MUST state proxy support, DNS resolution…

**Requirement:** Network behavior MUST state proxy support, DNS resolution, TLS trust-store source, IPv4/IPv6 behavior, timeout, retry, and offline mode. Optional service discovery MUST degrade safely when outbound access is disabled.

### PORT-04.05 — Package installation MUST account for Windows ACLs, Unix…

**Requirement:** Package installation MUST account for Windows ACLs, Unix ownership/modes, macOS signing/notarization, antivirus quarantine, and platform-specific application data directories as applicable.

### PORT-04.06 — Line endings, locale, timezone, decimal formats…

**Requirement:** Line endings, locale, timezone, decimal formats, and environment variable case sensitivity MUST not alter serialized configuration or protocol behavior.

### PORT-04.07 — Cross-platform tests MUST cover path creation and cleanup…

**Requirement:** Cross-platform tests MUST cover path creation and cleanup, atomic update, Unicode names, process cancellation, permissions, and offline startup on each claimed OS family.

## Prohibited conditions

- Do not assume POSIX path, permission, process-signal, or symlink behavior on all targets.
- Do not store user state beside a read-only application binary unless the platform contract guarantees writability.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to cross-platform filesystem, process, and network behavior. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Run filesystem and lifecycle tests on Windows/macOS/Linux targets, including read-only install location, unusual Unicode path, symlink escape, offline DNS, and interrupted update.
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
