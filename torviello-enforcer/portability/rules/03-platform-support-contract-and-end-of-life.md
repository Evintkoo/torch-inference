# Platform support contract and end of life

**Control family:** portability  
**Control document:** PORT-03  
**Requirement trace:** RP-010–RP-011, RP-020–RP-024, ED-013  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **platform support contract and end of life** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed portability behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### PORT-03.01 — Every supported target MUST specify OS edition/version, architecture/ABI…

**Requirement:** Every supported target MUST specify OS edition/version, architecture/ABI, CPU baseline and required instruction sets, compiler/toolchain, libc/runtime, service manager, graphics/accelerator prerequisites, and support level.

### PORT-03.02 — Support status MUST distinguish compile-only, build-and-test, release-qualified…

**Requirement:** Support status MUST distinguish compile-only, build-and-test, release-qualified, and best-effort targets. Borrow Rust target tiers as evidence about toolchain support only; they do not prove application support.

### PORT-03.03 — Each advertised target MUST have an owner, CI…

**Requirement:** Each advertised target MUST have an owner, CI or release-qualification evidence, known limitations, minimum resources, install/uninstall process, and end-of-life policy.

### PORT-03.04 — Adding or removing a target MUST assess users affected…

**Requirement:** Adding or removing a target MUST assess users affected, dependency support, artifact signing, update channel, compatibility, security patch availability, and migration path.

### PORT-03.05 — Unsupported host detection MUST fail with actionable diagnostics…

**Requirement:** Unsupported host detection MUST fail with actionable diagnostics or choose a tested portable fallback; it MUST NOT execute binaries built for unsupported ISA or ABI assumptions.

### PORT-03.06 — Platform support claims MUST match downloadable artifacts and published…

**Requirement:** Platform support claims MUST match downloadable artifacts and published documentation at each release. Feature-specific targets MUST be identified rather than implied by a general OS badge.

### PORT-03.07 — End-of-life changes MUST be announced before removal when feasible…

**Requirement:** End-of-life changes MUST be announced before removal when feasible and state the final supported release and security-maintenance period.

## Prohibited conditions

- Do not infer full product support from a compiler target existing or building.
- Do not advertise “any machine” without explicit minimum requirements and tested baseline hardware.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to platform support contract and end of life. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Compare the support matrix to CI jobs, artifact metadata, installer tests, OS libraries, and published download pages; verify unsupported-target failure behavior.
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
