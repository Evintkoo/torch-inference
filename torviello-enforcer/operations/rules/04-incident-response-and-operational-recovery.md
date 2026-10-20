# Incident response and operational recovery

**Control family:** operations  
**Control document:** OPS-04  
**Requirement trace:** SO-013, SO-030–SO-033, RP-030–RP-034  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **incident response and operational recovery** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed operations behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### OPS-04.01 — Operational incidents MUST have severity levels based on user…

**Requirement:** Operational incidents MUST have severity levels based on user impact, data/security impact, service degradation, and recovery urgency, with an incident lead and escalation path.

### OPS-04.02 — Runbooks MUST cover model corruption/unavailability, accelerator loss…

**Requirement:** Runbooks MUST cover model corruption/unavailability, accelerator loss, resource exhaustion, disk full, persistence failure, credential/key expiry, unsafe update, telemetry outage, and upstream outage for profiles where each dependency exists.

### OPS-04.03 — Incident procedures MUST preserve evidence, protect user data…

**Requirement:** Incident procedures MUST preserve evidence, protect user data, bound destructive remediation, and distinguish containment from full recovery. Security incidents MUST follow private evidence handling and coordinated disclosure policy.

### OPS-04.04 — Recovery procedures MUST state safe ordering for service…

**Requirement:** Recovery procedures MUST state safe ordering for service, database, registry, model artifacts, credentials, and dependent services; include integrity checks before restoring traffic.

### OPS-04.05 — Backups and rollback artifacts MUST be isolated from…

**Requirement:** Backups and rollback artifacts MUST be isolated from the failure mode they mitigate, access-controlled, integrity-checked, and available for the required recovery objective.

### OPS-04.06 — Each production release MUST provide a tested rollback path…

**Requirement:** Each production release MUST provide a tested rollback path for binaries, configuration/schema, model registry, and compatible model assets, or document why rollback is unsafe and define forward recovery.

### OPS-04.07 — After a material incident, the owner MUST record…

**Requirement:** After a material incident, the owner MUST record timeline, impact, detection, contributing conditions, recovery actions, and corrective items without blame; corrective actions MUST have owners and verification.

## Prohibited conditions

- Do not declare recovery complete until readiness and representative user transactions have been verified.
- Do not restore untrusted backups or model artifacts without integrity and version checks.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to incident response and operational recovery. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Run tabletop scenarios and at least one restore/rollback exercise; measure recovery time, data loss against objective, required human steps, and evidence integrity.
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

Source IDs R1,R3 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
