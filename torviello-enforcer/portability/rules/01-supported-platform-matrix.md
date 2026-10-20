# Supported platform matrix

**Control family:** portability  
**Control document:** PORT-01  
**Requirement trace:** RP-010–RP-015, RP-020, PA-010–PA-011, ED-013  
**Status:** Normative project control

## Control objective

These controls govern **supported platform matrix**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **portability** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### PORT-01.01 — Publish a support matrix for each release: OS/version, architecture

The project MUST publish a support matrix for each release: OS/version, architecture, minimum CPU/instruction set, memory/storage floor, compiler/toolchain, runtime libraries, GPU provider, driver, and model format.

### PORT-01.02 — Support the CPU-only profile as the portable baseline

The project MUST support the CPU-only profile as the portable baseline. Specialized CPU instructions are runtime-detected or excluded from targets that do not guarantee them.

### PORT-01.03 — Claim Windows, macOS, Linux, CUDA, Metal, Vulkan, or AMD

The project MUST claim Windows, macOS, Linux, CUDA, Metal, Vulkan, or AMD support only after building and running a profile-specific smoke test on a representative target.

### PORT-01.04 — State unsupported combinations and degraded behavior clearly

The project MUST state unsupported combinations and degraded behavior clearly. A compiled artifact alone does not establish a supported platform.

### PORT-01.05 — Test both the oldest supported environment and a current

The project MUST test both the oldest supported environment and a current environment on each declared architecture family.

## Prohibited conditions

- The project MUST NOT say “works on any machine” without a support boundary
- The project MUST NOT assume GPU provider APIs or drivers exist on a target OS
- The project MUST NOT ship binaries with undocumented dynamic library requirements

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

- Release qualification records build, startup, health, model load, and representative inference results for every advertised matrix row.
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
