# Feature specification and requirements

**Control family:** change-management  
**Control document:** CHG-01  
**Requirement trace:** ED-011, ED-042, CSC-005, PDL-001–PDL-008, PDL-013–PDL-014
**Status:** Normative project control

## Control objective

These controls govern **feature specification and requirements**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

For full discovery, requirement-quality, alternatives, experiment, acceptance, and traceability procedures, apply the cross-cutting [product discovery and delivery lifecycle](../../product-discovery-and-delivery/trails/00-references-trails.md). This document retains change-specific controls; it does not replace those lifecycle controls.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **change-management** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### CHG-01.01 — Start feature work with a specification that states

The project MUST start feature work with a specification that states the user or operational problem, intended outcomes, scope, exclusions, constraints, affected product profiles, and measurable acceptance criteria.

### CHG-01.02 — Trace each requirement to a stable ID in requirements/

The project MUST trace each requirement to a stable ID in requirements/. Identify which IDs are addressed, deferred, or out of scope. The project MUST also record unresolved product, legal, security, and architecture decisions rather than guessing them in code.

### CHG-01.03 — Describe public interface changes, data flows, trust boundaries, compatibility

The project MUST describe public interface changes, data flows, trust boundaries, compatibility, migration, and rollback needs before implementation.

### CHG-01.04 — Keep plans in the repository's agreed private planning location

The project MUST keep plans in the repository's agreed private planning location and do not publish them when repository policy says plans remain local. The specification and requirement IDs MAY still be referenced in review metadata without exposing private plan content.

## Prohibited conditions

- The project MUST NOT start broad features from a prompt alone when they change user behavior, architecture, security, data, or release packaging
- The project MUST NOT convert an open question into a requirement without an owner decision
- The project MUST NOT make an implementation plan substitute for product acceptance criteria

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

- Before implementation, reviewers can identify the problem, affected requirement IDs, acceptance evidence, risks, and unresolved decisions from the approved artifacts.
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
