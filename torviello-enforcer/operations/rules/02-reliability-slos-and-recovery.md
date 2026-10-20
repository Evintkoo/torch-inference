# Reliability objectives and recovery

**Control family:** operations  
**Control document:** OPS-02  
**Requirement trace:** RP-030–RP-031, RP-034, SO-022–SO-024, SO-030–SO-033  
**Status:** Normative project control

## Control objective

These controls govern **reliability objectives and recovery**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **operations** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### OPS-02.01 — Define service-level objectives for availability, latency, and error rate

The project MUST define service-level objectives for availability, latency, and error rate for each production deployment profile. State measurement windows, exclusions, and alert thresholds.

### OPS-02.02 — Bound request concurrency, queues, model downloads, memory, disk

The project MUST bound request concurrency, queues, model downloads, memory, disk, and timeouts. The project MUST also define backpressure and overload responses before exposure to production traffic.

### OPS-02.03 — Changes to configuration, models, and registry state MUST validate

Changes to configuration, models, and registry state MUST validate a candidate before activation and retain a known-good rollback point.

### OPS-02.04 — The project MUST define backup scope, frequency, retention, encryption

For persistent deployments, the project MUST define backup scope, frequency, retention, encryption, access, recovery point objective, and recovery time objective.

### OPS-02.05 — Provide runbooks for the highest-impact failure modes, including model

The project MUST provide runbooks for the highest-impact failure modes, including model unavailable/corrupt, disk full, GPU lost, database unavailable, credentials expired, and upstream outage.

### OPS-02.06 — Verify backup restore and release rollback periodically

The project MUST verify backup restore and release rollback periodically; a backup that has never been restored is unverified.

## Prohibited conditions

- The project MUST NOT define success only as process uptime while users cannot complete inference
- The project MUST NOT retry non-idempotent operations indefinitely
- The project MUST NOT claim self-maintaining service behavior without recovery evidence and alerting for unrecoverable failures

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

- Run representative outage, overload, backup/restore, model rollback, and service upgrade exercises. Record observed recovery time and remaining manual steps.
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
