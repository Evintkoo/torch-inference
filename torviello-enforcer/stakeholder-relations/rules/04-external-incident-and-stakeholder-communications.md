# External Incident and Stakeholder Communications

**Control family:** stakeholder-relations  
**Control document:** EXT-04  
**Requirement trace:** ORG-030–ORG-032, ORG-040–ORG-042, SO-004, SO-012–SO-014, SO-030–SO-033  
**Status:** Normative project control

## Control objective

External incident communications must be coordinated, truthful, timely, privacy-preserving, and consistent with legal, contractual, and user-safety obligations. Technical investigation, customer service, legal review, and public communication must have distinct responsibilities that coordinate under one incident authority.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### EXT-04.01 — Each supported service profile MUST identify who declares…

**Requirement:** Each supported service profile MUST identify who declares an incident, approves customer notices, handles media/regulator contact, prepares technical facts, and tracks affected users. Include deputies and a channel to reach them outside ordinary work hours where the service promise requires it.

### EXT-04.02 — For suspected security, privacy, safety, data…

**Requirement:** For suspected security, privacy, safety, data loss, or widespread availability incidents, the incident lead MUST identify affected products, users, data, jurisdictions, contracts, evidence, and potential notification deadlines. Route to qualified counsel/privacy/security owners immediately; do not wait for full root-cause certainty to begin obligation assessment.

### EXT-04.03 — Every update MUST distinguish confirmed facts, active investigation…

**Requirement:** Every update MUST distinguish confirmed facts, active investigation, unknowns, user actions, containment, support path, next update, and timestamp. Do not speculate about cause, scope, attribution, or resolution; correct earlier statements when evidence changes.

### EXT-04.04 — Notices MUST avoid exposing credentials, exploit detail that…

**Requirement:** Notices MUST avoid exposing credentials, exploit detail that increases harm, personal data of other people, confidential customer information, or evidence that would compromise response. Provide specific mitigations users can safely follow and an accessible contact route.

### EXT-04.05 — Use approved channels to reach directly affected customers…

**Requirement:** Use approved channels to reach directly affected customers, public users, partners, regulators, and internal responders as applicable. Maintain a canonical notice; ensure support, status page, account contacts, and public statements do not contradict it.

### EXT-04.06 — The incident lead MUST set the next update time…

**Requirement:** The incident lead MUST set the next update time based on impact and obligations even if investigation is ongoing. Closure communication MUST state resolved status, remaining risk, user action, remediation/support path, and where a later post-incident report will appear.

### EXT-04.07 — After incident closure, assess timeliness, accuracy…

**Requirement:** After incident closure, assess timeliness, accuracy, audience reach, accessibility, privacy, support readiness, and approval bottlenecks. Correct any affected claim and update contact lists, playbooks, training, controls, and contracts.

## Prohibited conditions

- Do not delay legally required or user-protective notice solely to achieve certainty or reputational convenience.
- Do not publish unverified root-cause or scope statements.
- Do not let marketing or sales approval replace incident, privacy, security, or legal authority.

## Decision procedure

Use impact, data type, jurisdiction, contract, user safety, exploitability, and certainty to choose audience, timing, channel, and level of detail. Qualified legal/privacy/security owners determine applicable duties; the incident lead coordinates timing and facts without overruling those duties.

## Assessment procedure

### Examine

- Sample a complete instance of the external incident and stakeholder communications workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Simulate a service outage, confirmed data exposure, suspected vulnerability with uncertain scope, and a false initial report. Verify notification assessment, decision authority, update cadence, factual accuracy, audience reach, support preparation, and correction handling.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable EXT-04 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2,R3 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
