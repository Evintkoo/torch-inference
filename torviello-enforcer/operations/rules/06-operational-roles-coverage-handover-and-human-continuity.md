# Operational Roles Coverage Handover and Human Continuity

**Control family:** operations  
**Control document:** OPS-06  
**Requirement trace:** ORG-001, ORG-011, ORG-022–ORG-023, ORG-042, RP-030–RP-034, SO-030–SO-033  
**Status:** Normative project control

## Control objective

Operational resilience depends on people knowing who is on duty, what they may do, how to hand work over, and how the service remains safe when a key person or supplier is unavailable. Coverage must match the service commitment without inventing unsupported staffing promises.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### OPS-06.01 — Each production profile MUST identify service owner, incident…

**Requirement:** Each production profile MUST identify service owner, incident lead, deploy/release authority, security escalation, data/persistence owner, customer communication owner, and backup/delegate as applicable. State whether each function is staffed continuously, during defined hours, or on best-effort basis.

### OPS-06.02 — For supported operational channels, state hours, severity…

**Requirement:** For supported operational channels, state hours, severity classes, response targets, escalation contacts, and fallback when the primary owner is unreachable. Public service promises MUST match actual staffing, monitoring, and recovery capability.

### OPS-06.03 — An operational handover MUST include current service health…

**Requirement:** An operational handover MUST include current service health, open incidents/changes, customer impact, risks, pending actions, access used, deadlines, and next decision. The receiving owner MUST acknowledge material risk and understand their authority.

### OPS-06.04 — Coverage MUST use named identities and pre-authorized delegates…

**Requirement:** Coverage MUST use named identities and pre-authorized delegates with time-bounded access. Never share accounts or keys to cover an absent operator; emergency access uses the security break-glass process and post-use review.

### OPS-06.05 — For critical operations, identify single-person and supplier dependencies…

**Requirement:** For critical operations, identify single-person and supplier dependencies, recovery documentation, alternate contacts, and minimum competent coverage. Exercise absence, simultaneous incident, and unavailability of a key vendor at a frequency proportional to impact.

### OPS-06.06 — Operational processes MUST allow responders to escalate unsafe workload…

**Requirement:** Operational processes MUST allow responders to escalate unsafe workload, conflicting incident tasks, or insufficient authority. Rotate or hand off duties as needed under approved work policies; do not use undocumented availability expectations as a service guarantee.

### OPS-06.07 — Changes to service hours, product scope, team…

**Requirement:** Changes to service hours, product scope, team structure, vendor, incident severity, or recovery process MUST trigger review of roles, contacts, runbooks, training, and support commitments.

## Prohibited conditions

- Do not promise continuous support based on monitoring alone.
- Do not make one person the only holder of critical recovery knowledge or credentials.
- Do not leave an incident active without a named lead and next update/decision owner.

## Decision procedure

For each service profile, compare user impact and recovery objectives against staffing and coverage. If adequate coverage is not funded or available, reduce the service promise or use a tested safe mode and disclose the limit.

## Assessment procedure

### Examine

- Sample a complete instance of the operational roles coverage handover and human continuity workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Simulate handover during an open incident, primary owner absence, simultaneous incident, vendor outage, and expired delegate access. Verify the next owner can act safely and customers receive only supported service expectations.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable OPS-06 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
