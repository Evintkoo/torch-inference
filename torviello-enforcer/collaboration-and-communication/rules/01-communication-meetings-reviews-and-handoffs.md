# Communication Meetings Reviews and Handoffs

**Control family:** collaboration-and-communication  
**Control document:** COL-01  
**Requirement trace:** ORG-020, ORG-022, ORG-024, ORG-001, ED-011  
**Status:** Normative project control

## Control objective

Communication must preserve context, ownership, confidentiality, and actionability across people, teams, time zones, and tools. Synchronous conversations are for interaction; authoritative decisions and commitments must remain findable after participants leave.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### COL-01.01 — The sender MUST use an approved channel appropriate…

**Requirement:** The sender MUST use an approved channel appropriate to urgency, audience, confidentiality, retention, accessibility, and audit needs. Sensitive information MUST use an access-controlled approved system; urgent incidents MUST use the defined escalation route rather than waiting for ordinary asynchronous response.

### COL-01.02 — A work or decision request MUST state context…

**Requirement:** A work or decision request MUST state context, desired outcome, owner/recipient, decision deadline, impact of delay, supporting links, and response needed. If the recipient lacks authority or context, they MUST redirect or escalate rather than implying approval.

### COL-01.03 — A meeting MUST have a clear purpose, expected…

**Requirement:** A meeting MUST have a clear purpose, expected decision/output, necessary participants, and accessible material. The facilitator MUST distinguish information sharing, consultation, decision, and approval; attendance or silence MUST NOT be treated as consent.

### COL-01.04 — A meeting or review that changes scope, risk…

**Requirement:** A meeting or review that changes scope, risk acceptance, product behavior, resource commitment, external messaging, or ownership MUST record decision, rationale, approver, dissent/conditions where material, action owner, and due/review date in the authoritative record.

### COL-01.05 — A handoff MUST include current state, owner…

**Requirement:** A handoff MUST include current state, owner, context, links/artifacts, user impact, dependencies, deadlines, risks, pending decisions, and next action. High-risk handoffs MUST be explicitly accepted; define escalation if acknowledgment does not arrive.

### COL-01.06 — Teams MUST provide enough written context and reasonable response…

**Requirement:** Teams MUST provide enough written context and reasonable response expectations for people not present in a live meeting. Critical decisions MUST not be made solely in a private channel inaccessible to impacted owners or reviewers.

### COL-01.07 — When owners disagree, restate the decision to be…

**Requirement:** When owners disagree, restate the decision to be made, evidence and constraints, applicable control, options, and accountable decision-maker. Preserve respectful conduct; escalate unresolved high-impact conflicts to the named authority and record the result.

### COL-01.08 — Recipients MUST respect channel membership and classification, verify…

**Requirement:** Recipients MUST respect channel membership and classification, verify recipients before sending sensitive material, and correct misdelivery through the incident process. Forwarding, screenshots, transcripts, recordings, or AI summaries MUST follow the applicable consent, privacy, retention, and access rules.

## Prohibited conditions

- Do not treat a reaction, meeting attendance, or lack of response as formal approval.
- Do not store the only copy of a business-critical decision in personal chat or email.
- Do not include sensitive personnel, customer, or security details in broad channels.

## Decision procedure

Choose synchronous vs asynchronous communication by urgency, ambiguity, interaction needed, time-zone impact, accessibility, and sensitivity. Define which channel is authoritative for action, decision, and evidence; use a live call only when its value outweighs interruption and recordkeeping cost.

## Assessment procedure

### Examine

- Sample a complete instance of the communication meetings reviews and handoffs workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Reconstruct a decision and operational handoff from the systems used. Verify the decision authority, consulted owners, action assignment, acknowledgment, sensitivity restrictions, and ability for an absent teammate to continue.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable COL-01 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2,R3 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
