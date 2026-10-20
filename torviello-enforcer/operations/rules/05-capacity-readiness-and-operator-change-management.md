# Capacity, readiness, and operator change management

**Control family:** operations  
**Control document:** OPS-05  
**Requirement trace:** RP-030–RP-034, SO-022, SO-030–SO-032  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **capacity, readiness, and operator change management** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed operations behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### OPS-05.01 — Each production profile MUST state capacity assumptions for concurrent…

**Requirement:** Each production profile MUST state capacity assumptions for concurrent requests, model count, model sizes, queue depth, memory, CPU, accelerator memory, disk, network, and startup time.

### OPS-05.02 — Admission control MUST reject or defer work before resource…

**Requirement:** Admission control MUST reject or defer work before resource exhaustion. Queue capacity, fairness, request deadline, cancellation, overload response, and recovery behavior MUST be explicit and observable.

### OPS-05.03 — Readiness MUST reflect ability to serve the configured profile…

**Requirement:** Readiness MUST reflect ability to serve the configured profile, including required models and data stores. Liveness MUST remain independent from optional providers so transient optional failure does not trigger restart storms.

### OPS-05.04 — Operator changes to configuration, models, registry…

**Requirement:** Operator changes to configuration, models, registry, credentials, or deployment topology MUST be attributable, validated before activation, auditable, and reversible where possible.

### OPS-05.05 — Capacity alerts MUST warn before service objectives are breached…

**Requirement:** Capacity alerts MUST warn before service objectives are breached and identify the constrained resource and safe mitigation; capacity plans MUST consider burst load, cold starts, fragmentation, and model replacement overlap.

### OPS-05.06 — Operational toil MUST be measured where repeated manual repair…

**Requirement:** Operational toil MUST be measured where repeated manual repair occurs; recurring recovery actions SHOULD be automated only after failure modes and guardrails are understood.

### OPS-05.07 — Profile changes that alter network exposure, persistence…

**Requirement:** Profile changes that alter network exposure, persistence, auth, telemetry, or resource ceilings MUST undergo a risk review and restart/reload qualification.

## Prohibited conditions

- Do not report readiness solely because the process is alive.
- Do not automatically retry unbounded queued work after overload recovery.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to capacity, readiness, and operator change management. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Load and fault-test each declared profile; verify admission limits, health semantics, restart policy, operator audit, capacity alerts, and rollback of configuration/model changes.
- Exercise negative, boundary, and failure cases identified by the control; record actual versus expected behavior. A skipped required check is not passing evidence.

## Assessment determination

Assess each control ID as **pass**, **fail**, or **not applicable**. Pass requires every applicable MUST to be implemented and supported by current evidence. Fail applies when behavior contradicts a requirement, enforcement is bypassable, evidence is missing/stale, or a required scenario cannot be reproduced. Not applicable requires a condition stated by the requirement and reviewer rationale.

## Required evidence

- Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.

## Exceptions and nonconformance

A deviation from a MUST requirement requires accountable owner approval before release. Record affected control IDs and profiles, risk, compensating measures, remediation owner, and expiry/review date. A SHOULD deviation requires rationale and impact in the change record. An expired or unapproved exception is a nonconformance and MUST block a release when the affected control is release-critical.

## Reference trail

Source IDs R1,R2 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
