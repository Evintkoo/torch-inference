# Software and model supply chain

**Control family:** security  
**Control document:** SEC-06  
**Requirement trace:** SO-001–SO-005, SO-010–SO-014, SO-031, RP-031  
**Status:** Normative project control

## Control objective

These controls govern **software and model supply chain**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **security** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### SEC-06.01 — Pin and review build dependencies and release inputs

The project MUST pin and review build dependencies and release inputs. The project MUST also generate an SBOM and preserve provenance for every release.

### SEC-06.02 — Scan dependencies, source, secrets, containers, and model artifacts

The project MUST scan dependencies, source, secrets, containers, and model artifacts. Triage findings using exploitability and deployment context; block unsafe releases under the documented severity gate.

### SEC-06.03 — Download models only from configured trusted sources

The project MUST download models only from configured trusted sources. The project MUST also verify digest/signature and license/source metadata before installation or activation.

### SEC-06.04 — Preserve model and software version identity

The project MUST preserve model and software version identity. Updates are atomic and have a rollback path; failed verification never replaces a known-good artifact.

### SEC-06.05 — Review build workflows and credentials as production security boundaries

The project MUST review build workflows and credentials as production security boundaries. The project MUST also use least privilege and short-lived credentials for release automation.

## Prohibited conditions

- The project MUST NOT assume a public package or model host guarantees artifact integrity or license rights
- The project MUST NOT release unsigned/unverifiable artifacts when the distribution channel supports verification
- The project MUST NOT load partial, corrupt, or unreviewed model artifacts

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

- Release gates verify dependency inventory, SBOM, provenance, artifact hashes/signatures, model metadata/licenses, and rollback behavior.
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

Source IDs R2,R3 are listed in [00-references-trails.md](../trails/00-references-trails.md). The project rules above are the required behavior; the references provide the standards basis and verification context.
