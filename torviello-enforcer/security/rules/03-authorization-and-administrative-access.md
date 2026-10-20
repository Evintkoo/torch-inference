# Authorization and administrative access

**Control family:** security  
**Control document:** SEC-03  
**Requirement trace:** SO-001–SO-005, SO-010–SO-014, SO-031, RP-031  
**Status:** Normative project control

## Control objective

These controls govern **authorization and administrative access**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **security** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### SEC-03.01 — Apply deny-by-default authorization to every operation and resource

The project MUST apply deny-by-default authorization to every operation and resource. The project MUST also define roles/scopes for inference, model administration, registry changes, user management, billing/licensing, and system configuration.

### SEC-03.02 — Enforce authorization at the service/domain boundary, not only in

The project MUST enforce authorization at the service/domain boundary, not only in UI controls or route naming. The project MUST also check ownership for object-level access and tenant isolation for hosted deployments.

### SEC-03.03 — Separate read, create, update, promote, revoke, and delete permissions

The project MUST separate read, create, update, promote, revoke, and delete permissions where impact differs. The project MUST also require stronger controls for high-impact administration when specified by the threat model.

### SEC-03.04 — Audit privileged actions with actor, target, time, outcome

The project MUST audit privileged actions with actor, target, time, outcome, and correlation context. The project MUST also ensure logs cannot be edited through the same ordinary admin permission.

### SEC-03.05 — Keep health and metrics routes minimally informative and explicitly

The project MUST keep health and metrics routes minimally informative and explicitly categorized as public, internal, or privileged.

## Prohibited conditions

- The project MUST NOT treat authentication as authorization
- The project MUST NOT rely on hidden buttons, unguessable IDs, or client-side checks to protect data
- The project MUST NOT use wildcard CORS or permissive default roles for production exposure

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

- Test allowed and denied operations for every role, object ownership, tenant separation, revoked identities, and privileged audit completeness.
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

Source IDs R1,R3 are listed in [00-references-trails.md](../trails/00-references-trails.md). The project rules above are the required behavior; the references provide the standards basis and verification context.
