# Joining Role Change Leave and Separation

**Control family:** people-and-work  
**Control document:** PPL-01  
**Requirement trace:** ORG-001, ORG-010–ORG-011, SO-001–SO-005, SO-010–SO-014  
**Status:** Normative project control

## Control objective

Every person’s organizational relationship and duties must move through controlled entry, change, absence, return, and exit processes. Workforce workflows coordinate identity, authority, access, equipment, knowledge, privacy, and continuity without assuming one employment model or jurisdiction.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### PPL-01.01 — Before an employee, contractor, intern, advisor…

**Requirement:** Before an employee, contractor, intern, advisor, agent operator, or other person begins work, an accountable sponsor MUST define relationship, scope, duration, supervisor, permitted systems/data, confidentiality/IP terms, required screening lawful for the jurisdiction, and end/renewal trigger.

### PPL-01.02 — Before production, source, model, customer-data…

**Requirement:** Before production, source, model, customer-data, administrative, finance, or public-communication access, verify identity through approved means, accept applicable policy/agreements, complete required role training, assign a sponsor, and grant only the approved role set. Exceptions require an owner and expiration.

### PPL-01.03 — A role, team, contract, or project…

**Requirement:** A role, team, contract, or project change MUST trigger review of current entitlements, data access, approvals, delegated authority, equipment, training, and outstanding work. Remove access and authority no longer needed; do not wait for the next periodic review when the change is material.

### PPL-01.04 — For planned or unexpected absence, the manager…

**Requirement:** For planned or unexpected absence, the manager or delegate MUST identify critical duties, authority suspension or delegation, work queues, customer/incident coverage, and return/reassignment steps. Do not share credentials to provide coverage.

### PPL-01.05 — At separation or contract end, a responsible owner…

**Requirement:** At separation or contract end, a responsible owner MUST promptly disable identities, sessions, tokens, keys, devices, recovery methods, admin roles, and external accounts; recover assets; transfer owned work and records; and remove public/financial authority. Timing MUST reflect risk and legal constraints.

### PPL-01.06 — Personnel records, screening results, performance, health…

**Requirement:** Personnel records, screening results, performance, health, and investigation information MUST be limited to an authorized purpose, least-privilege access, approved retention, and applicable law. Security controls MUST NOT become a pretext for collecting unrelated personal information.

### PPL-01.07 — The sponsor or delegate MUST confirm access closure…

**Requirement:** The sponsor or delegate MUST confirm access closure, asset return, knowledge handoff, outstanding commitments, legal holds, and record ownership. Any delayed removal MUST name a risk owner, compensating control, and deadline; overdue items escalate.

## Prohibited conditions

- Do not grant broad access because a person is trusted or because role setup is inconvenient.
- Do not share or transfer a departing person’s credentials to preserve continuity.
- Do not collect or retain sensitive personnel information without a defined lawful purpose and access owner.

## Decision procedure

Classify the role by data sensitivity, system privilege, financial authority, customer contact, code/release influence, and duration. Apply screening, training, approvals, and access proportionately to the actual role and local law; trigger extra review on privileged, sensitive, or emergency access.

## Assessment procedure

### Examine

- Sample a complete instance of the joining role change leave and separation workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Test onboarding, role transfer, unexpected absence, contractor end, and immediate high-risk separation. Reconcile identity provider, repository, cloud, support, signing, finance, and device inventories; verify no live credentials or unowned work remain.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable PPL-01 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
