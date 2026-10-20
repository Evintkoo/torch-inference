# Customer User and Community Support Operations

**Control family:** stakeholder-relations  
**Control document:** EXT-01  
**Requirement trace:** ORG-030–ORG-032, PA-001–PA-004, SO-002–SO-005, SO-030–SO-033  
**Status:** Normative project control

## Control objective

Every user-facing request must reach an authorized and competent responder, receive an accurate acknowledgment, and be resolved, escalated, or explicitly bounded. Support must protect user privacy and feed product, security, accessibility, and reliability learning back to owners.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### EXT-01.01 — For each supported product profile, state supported audiences…

**Requirement:** For each supported product profile, state supported audiences, support channel, hours/response expectations, languages/accessibility options as applicable, supported versions, escalation boundaries, and what the channel cannot provide. Do not imply 24/7 or guaranteed response absent an approved staffed commitment.

### EXT-01.02 — A support owner MUST capture a case identifier…

**Requirement:** A support owner MUST capture a case identifier, minimal contact/context, product/version/profile, impact, urgency, category, consent/data handling where relevant, owner, status, and next update. Classify security, privacy, safety, accessibility, billing, data-loss, outage, and ordinary usage cases distinctly.

### EXT-01.03 — The responder MUST confirm receipt, explain next steps…

**Requirement:** The responder MUST confirm receipt, explain next steps and realistic response timing, and avoid promises beyond authority. If the issue is urgent or outside support competence, route it to the designated incident, privacy, security, legal, or product owner.

### EXT-01.04 — Request only the diagnostic information needed; prefer synthetic…

**Requirement:** Request only the diagnostic information needed; prefer synthetic or redacted data. Provide a secure transfer path for necessary sensitive files, restrict case access, set retention, and never ask users to send passwords, private keys, or unnecessary inference content.

### EXT-01.05 — Support responses MUST distinguish verified facts, hypotheses…

**Requirement:** Support responses MUST distinguish verified facts, hypotheses, workarounds, and commitments; explain limitations plainly; preserve user dignity; and provide accessible alternatives where a product barrier blocks use.

### EXT-01.06 — The case owner MUST record diagnosis, workaround/fix…

**Requirement:** The case owner MUST record diagnosis, workaround/fix, affected versions, user communication, residual risk, escalation, and closure. For unresolved issues, state owner, next update, and safe workaround; closure MUST NOT mean merely that a ticket was transferred.

### EXT-01.07 — Repeated complaints, confusing behavior, support workarounds…

**Requirement:** Repeated complaints, confusing behavior, support workarounds, accessibility barriers, unsafe use, and common failures MUST be summarized for accountable product and engineering owners. Convert recurring risks into requirements, defects, documentation, controls, or product decisions with traceable follow-up.

### EXT-01.08 — Support measures MAY include response and resolution times…

**Requirement:** Support measures MAY include response and resolution times, backlog age, reopen rate, user impact, and satisfaction, but MUST be interpreted with case complexity, safety, fairness, and quality. Do not reward fast closure at the expense of accurate diagnosis or user outcome.

## Prohibited conditions

- Do not close a case solely because ownership was transferred.
- Do not request secrets, unrestricted production access, or real user data when safer diagnostic evidence is sufficient.
- Do not make a support promise or product roadmap commitment without the authorized owner.

## Decision procedure

Prioritize by immediate harm, security/privacy exposure, service scope, data loss, accessibility barrier, and number of affected users. Select the response owner and update cadence based on impact and support commitment; preserve security incident reporting timelines and privacy obligations.

## Assessment procedure

### Examine

- Sample a complete instance of the customer user and community support operations workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Exercise a normal usage question, outage, data-loss concern, vulnerability report, and accessibility complaint. Verify intake, classification, secure handling, routing, acknowledgment, case owner, customer updates, escalation, and learning closure.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable EXT-01 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2,R3 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
