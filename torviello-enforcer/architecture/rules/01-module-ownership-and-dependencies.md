# Module ownership and dependencies

**Control family:** architecture  
**Control document:** ARC-01  
**Requirement trace:** PA-010–PA-014, ED-004–ED-005, RP-014–RP-015  
**Status:** Normative project control

## Control objective

These controls govern **module ownership and dependencies**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **architecture** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### ARC-01.01 — Give each production module one primary responsibility, a named

The project MUST give each production module one primary responsibility, a named owner, a small public interface, and explicit inputs, outputs, errors, and lifecycle.

### ARC-01.02 — Keep dependency direction toward stable abstractions

The project MUST keep dependency direction toward stable abstractions. Feature modules MAY depend on shared platform interfaces; shared infrastructure MUST NOT depend on concrete feature implementations.

### ARC-01.03 — Keep another module's internals private

The project MUST keep another module's internals private. Cross-module work uses a documented interface or event contract rather than reaching into private state or creating circular dependencies.

### ARC-01.04 — Place API transport, domain logic, model execution, persistence

The project MUST place API transport, domain logic, model execution, persistence, and presentation in separate layers. The project MUST also keep benchmark and test code outside production modules.

### ARC-01.05 — The project MUST document which capabilities are optional, which

For each module, the project MUST document which capabilities are optional, which resources it owns, which configuration it reads, and what readiness means.

### ARC-01.06 — Update the system blueprint and dependency map when runtime

The project MUST update the system blueprint and dependency map when runtime boundaries, services, trust zones, persistence, or external dependencies change.

## Prohibited conditions

- The project MUST NOT create catch-all common, utils, helpers, or optimization modules without a defined owner and stable callers
- The project MUST NOT place performance tuning in an unrelated central file; keep it with the component whose behavior it changes
- The project MUST NOT share mutable state across services without an explicit consistency and ownership model

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

- Review the module graph for cycles and hidden reach-through. For a new capability, show the public interface, ownership, dependency direction, and architecture diagram update.
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

Source IDs R2 are listed in [00-references-trails.md](../trails/00-references-trails.md). The project rules above are the required behavior; the references provide the standards basis and verification context.
