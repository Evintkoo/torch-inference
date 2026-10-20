# Optional capabilities and build profiles

**Control family:** architecture  
**Control document:** ARC-02  
**Requirement trace:** PA-010–PA-014, ED-004–ED-005, RP-014–RP-015  
**Status:** Normative project control

## Control objective

These controls govern **optional capabilities and build profiles**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **architecture** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### ARC-02.01 — Make hardware backends and large optional runtimes selectable capabilities

The project MUST make hardware backends and large optional runtimes selectable capabilities. Disabled capabilities MUST NOT pull their runtime dependencies into a minimal profile.

### ARC-02.02 — Use additive Cargo features named after user-visible capabilities

The project MUST use additive Cargo features named after user-visible capabilities and document their dependency effects. It MUST NOT use features that silently change unrelated behavior.

### ARC-02.03 — Publish build profiles for minimal CPU, supported CPU features

The project MUST publish build profiles for minimal CPU, supported CPU features, and each supported accelerator family. The matrix states exact OS, architecture, runtime, driver, and toolchain requirements.

### ARC-02.04 — Each adapter MUST implement the same model lifecycle contract

Each adapter MUST implement the same model lifecycle contract: capability discovery, load, readiness, inference, cancellation, shutdown, and typed failure

### ARC-02.05 — Record architecture decisions for module boundaries, backend interfaces, serialization

The project MUST record architecture decisions for module boundaries, backend interfaces, serialization, persistence, or compatibility, including alternatives and migration cost.

## Prohibited conditions

- The project MUST NOT compile every backend into every artifact by default
- The project MUST NOT claim modularity merely because code is in separate files; verify that dependencies and build graph are independently selectable
- The project MUST NOT rely on undocumented feature unification or target-specific dependency behavior

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

- Build a no-default-feature CPU profile and each supported profile in CI or release qualification. Inspect dependency trees and binary contents to confirm disabled capabilities are absent. Test adapter conformance with the shared contract.
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

Source IDs R1,R2 are listed in [00-references-trails.md](../trails/00-references-trails.md). The project rules above are the required behavior; the references provide the standards basis and verification context.
