# Purpose, ownership, and boundaries

**Control family:** directory  
**Control document:** DIR-01  
**Requirement trace:** CSC-001–CSC-004, CSC-010, PA-020–PA-023  
**Status:** Normative project control

## Control objective

These controls govern **purpose, ownership, and boundaries**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **directory** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### DIR-01.01 — Every maintained directory MUST have one clear purpose

Every maintained directory MUST have one clear purpose and an owning subsystem. Its local documentation MUST state what belongs there, public entry points, dependency boundaries, build/run/validation steps, and generated/runtime content.

### DIR-01.02 — Place code and assets with the component that owns

The project MUST place code and assets with the component that owns their lifecycle. Shared code belongs in an explicit shared module with documented consumers and stable interface.

### DIR-01.03 — Create a directory only when it establishes a useful

The project MUST create a directory only when it establishes a useful responsibility, build, test, deployment, or distribution boundary. The project MUST also separate unrelated concerns instead of turning an existing directory into a catch-all.

### DIR-01.04 — Keep production application code under source directories, automated tests

The project MUST keep production application code under source directories, automated tests under their named test categories, and benchmarks under /benchmarks. The project MUST NOT place performance harnesses or non-unit tests in production source.

### DIR-01.05 — Keep Dockerfiles and Compose files under /containers, package/release automation

The project MUST keep Dockerfiles and Compose files under /containers, package/release automation under /packaging, and design tokens/assets under a dedicated design area.

## Prohibited conditions

- The project MUST NOT add root-level files merely because a tool defaults to the repository root
- The project MUST NOT mix build outputs, downloaded models, runtime data, or user configuration into source ownership directories
- The project MUST NOT introduce a directory hierarchy that only mirrors concepts without clarifying ownership

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

- For each new or moved directory, review its purpose, ownership, consumers, and build/test/release references. Update path references and the system map in the same change.
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

Source IDs R1 are listed in [00-references-trails.md](../trails/00-references-trails.md). The project rules above are the required behavior; the references provide the standards basis and verification context.
