# Artifact integrity, provenance, and SBOM

**Control family:** releases  
**Control document:** REL-02  
**Requirement trace:** RP-020–RP-024, ED-020–ED-024, SO-012, SO-031  
**Status:** Normative project control

## Control objective

These controls govern **artifact integrity, provenance, and sbom**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **releases** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### REL-02.01 — Publish a cryptographic checksum for every release artifact

The project MUST publish a cryptographic checksum for every release artifact. Sign artifacts where the target platform/distribution supports an established signing process.

### REL-02.02 — Publish a machine-readable SBOM covering shipped binaries, containers, dependencies

The project MUST publish a machine-readable SBOM covering shipped binaries, containers, dependencies, and bundled model/runtime assets where supported. The project MUST also include human-readable third-party notices.

### REL-02.03 — Preserve build provenance that identifies source revision, builder, build

The project MUST preserve build provenance that identifies source revision, builder, build process, and resolved inputs. The project MUST also adopt the highest practical SLSA Build track level for the selected build platform; state the level and verification method without overstating assurance.

### REL-02.04 — Verify provenance, checksums, signatures, and package identity before installation

The project MUST verify provenance, checksums, signatures, and package identity before installation where the distribution channel supports verification.

### REL-02.05 — Build containers from maintained, pinned base images, use

The project SHOULD build containers from maintained, pinned base images, use a .dockerignore, minimize unnecessary packages, run non-root where practical, and rebuild regularly for security updates.

## Prohibited conditions

- The project MUST NOT treat a checksum hosted next to an unauthenticated artifact as proof of publisher identity
- The project MUST NOT claim a SLSA level without satisfying and verifying the versioned level requirements
- The project MUST NOT omit SBOM or notices from a smaller artifact when it still contains third-party components

## Implementation guidance

Implementation MUST satisfy the applicable requirements above at the boundary where the risk or behavior is introduced. A wrapper, UI-only check, documentation statement, or downstream compensating check does not satisfy a requirement when the rule requires enforcement at a lower or authoritative boundary. Keep implementation choices consistent with the domain sources in the reference trail; document approved deviations instead of silently weakening the control.

## Assessment procedure

Assess both design and operation. Use the methods below as appropriate to the control and retain enough context for another reviewer to reproduce the determination.

### Examine

- Inspect the relevant specification, source, configuration, dependency/build metadata, tests, and operational documentation to confirm the requirement is addressed at the stated boundary.
- Confirm the change is traceable to the requirement IDs listed above and that any conditions, limits, defaults, failure behavior, and exceptions are explicit.

### Interview

- When a requirement depends on an operational role or manual procedure, interview the accountable owner and confirm the described procedure matches the approved documentation and observed practice. An interview alone does not establish effectiveness when implementation or behavior can be examined or tested.

### Test

- Release verification checks artifact digests, signature/provenance policy, SBOM presence, container configuration, and that the manifest matches the published files.
- Exercise at least one negative or failure case for each security, compatibility, resource, or reliability boundary affected by the change; confirm the observed result matches the contract and does not bypass the control.
- Record the command or procedure, tested revision and environment, result, and any limitation. A skipped check is not passing evidence.

## Assessment determination

A control document passes only when every applicable MUST requirement is implemented and supported by current evidence, each applicable SHOULD deviation has a documented rationale, and no unapproved or expired exception remains. A requirement fails when implementation is absent, behavior contradicts the requirement, evidence is missing or stale, or the assessment cannot reproduce the claimed result. Record **pass**, **fail**, or **not applicable** per control ID; “not applicable” requires a stated condition and reviewer rationale.

## Required evidence

- A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.

## Exceptions and nonconformance

A deviation from a MUST requirement requires explicit approval from the accountable product or engineering owner before release. The exception record MUST identify affected controls, scope, risk, compensating measures, remediation owner, and expiry or review date. A SHOULD deviation MUST include a rationale and impact in the change record. Unapproved or expired deviations are nonconformances and MUST block the affected release when the requirement is release-critical.

## Reference trail

Source IDs R1,R2,R3 are listed in [00-references-trails.md](../trails/00-references-trails.md). The project rules above are the required behavior; the references provide the standards basis and verification context.
