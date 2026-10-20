# Stack selection and production limits

**Control family:** vendor-and-cost  
**Control document:** VEND-01  
**Requirement trace:** PA-001–PA-004, PA-024, RP-020–RP-024, ED-020–ED-024  
**Status:** Normative project control

## Control objective

These controls govern **stack selection and production limits**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **vendor-and-cost** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### VEND-01.01 — Prefer open standards, open source, and self-hostable tools when

The project SHOULD prefer open standards, open source, and self-hostable tools when they meet support, security, privacy, reliability, and maintenance requirements.

### VEND-01.02 — Before adopting a hosted or commercial dependency, record purpose

Before adopting a hosted or commercial dependency, the project MUST record purpose, owner, data handled, security controls, uptime/dependency effects, current plan limits, cost, billing risk, region/account dependency, and exit path..

### VEND-01.03 — Verify current free-tier limits and terms before relying on

The project MUST verify current free-tier limits and terms before relying on them. A free tier is not a production capacity guarantee; document a paid, self-hosted, or migration path before usage can hit its limits.

### VEND-01.04 — Include recurring costs such as domains, bandwidth, storage, certificates

The project MUST include recurring costs such as domains, bandwidth, storage, certificates, CI, model hosting, monitoring retention, and support in deployment planning.

### VEND-01.05 — Keep offline build and local operation possible without

The project MUST keep offline build and local operation possible without a specific hosted Git, CI, registry, or telemetry provider where the selected product profile requires offline support.

## Prohibited conditions

- The project MUST NOT promise unlimited/free capacity based on marketing pages or trial terms
- The project MUST NOT send user or model data to a third party without a documented, approved data flow
- The project MUST NOT make a single external provider a hidden dependency for local inference

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

- Recheck provider terms, quota, cost, privacy, recovery, and export before production release and whenever pricing/terms MAY change.
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
