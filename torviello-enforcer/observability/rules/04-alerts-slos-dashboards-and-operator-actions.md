# Alerts, SLOs, dashboards, and operator actions

**Control family:** observability  
**Control document:** OBS-04  
**Requirement trace:** SO-022–SO-024, RP-030–RP-034  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **alerts, slos, dashboards, and operator actions** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed observability behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### OBS-04.01 — Each production service profile MUST define service indicators…

**Requirement:** Each production service profile MUST define service indicators and objectives for user-visible availability, latency, and correctness or error rate where measurable; state measurement population, window, exclusions, and objective owner.

### OBS-04.02 — Alert thresholds MUST be derived from user impact…

**Requirement:** Alert thresholds MUST be derived from user impact, saturation, error-budget consumption, or recovery failure. Each actionable alert MUST include severity, owner, runbook, expected response, and a test or simulation path.

### OBS-04.03 — Alerts MUST distinguish symptoms requiring immediate intervention from diagnostic…

**Requirement:** Alerts MUST distinguish symptoms requiring immediate intervention from diagnostic conditions suitable for dashboards or tickets. Avoid paging on a single noisy host or raw dependency metric when service behavior remains healthy.

### OBS-04.04 — Dashboards MUST show request traffic, successful and failed…

**Requirement:** Dashboards MUST show request traffic, successful and failed latency distributions, error rate, saturation, queueing, model/backend state, resource utilization, and dependency health for the selected service profile.

### OBS-04.05 — Alert and dashboard queries MUST use bounded labels…

**Requirement:** Alert and dashboard queries MUST use bounded labels and preserve distinctions between failed and successful request latency. Missing telemetry MUST be visible rather than rendered as healthy zero.

### OBS-04.06 — Prometheus scrape and alert configuration MUST be syntax-validated…

**Requirement:** Prometheus scrape and alert configuration MUST be syntax-validated and rule-tested before deployment; scrape timeout MUST not exceed interval and scrape/authentication settings MUST match the exposed target.

### OBS-04.07 — Runbooks MUST explain detection, impact, first safe…

**Requirement:** Runbooks MUST explain detection, impact, first safe action, escalation, rollback/recovery, verification of recovery, and evidence to retain.

## Prohibited conditions

- Do not page on a condition with no owner or safe next action.
- Do not interpret absence of samples as zero errors or full availability.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to alerts, slos, dashboards, and operator actions. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Run rule tests and a controlled alert exercise; verify dashboard panels against service behavior, notification routing, runbook links, and no-data handling.
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
