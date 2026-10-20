# Personnel Security and Human Access Lifecycle

**Control family:** security  
**Control document:** SEC-12  
**Requirement trace:** ORG-001, ORG-010–ORG-012, SO-001–SO-005, SO-010–SO-014  
**Status:** Normative project control

## Control objective

Human and agent-operated identities are security principals. Identity proofing, role authorization, training, privileged activity, transfer, emergency access, and separation must follow a traceable lifecycle tied to job function and risk.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### SEC-12.01 — Every person and human-operated agent identity with access…

**Requirement:** Every person and human-operated agent identity with access to organizational systems MUST use an individually attributable account or a controlled service identity with an accountable human owner. Shared accounts are prohibited except for a documented technical necessity with compensating attribution and rotation.

### SEC-12.02 — Access MUST be based on a current role/task need…

**Requirement:** Access MUST be based on a current role/task need, approved by the resource owner, scoped to least privilege, and time-bounded where practical. Authentication strength and screening MUST reflect data sensitivity, privilege, exposure, and applicable law.

### SEC-12.03 — Administrative roles MUST be distinct from everyday accounts where…

**Requirement:** Administrative roles MUST be distinct from everyday accounts where supported, protected by strong authentication, and used only for authorized administrative tasks. High-impact actions MUST be logged and independently approved or reviewed according to risk.

### SEC-12.04 — Access MUST be reviewed at role change, contract…

**Requirement:** Access MUST be reviewed at role change, contract end, incident, privilege elevation, system ownership change, and periodic intervals based on risk. Remove dormant, excessive, orphaned, and conflicting access; record reviewer, scope, decision, and closure.

### SEC-12.05 — Break-glass access MUST have an incident or change reference…

**Requirement:** Break-glass access MUST have an incident or change reference, narrow scope, strong authentication, alerting, expiry, and post-use independent review. Temporary grants MUST expire automatically or have an owner and tested revocation deadline.

### SEC-12.06 — At separation or loss of authorization, disable accounts…

**Requirement:** At separation or loss of authorization, disable accounts, keys, tokens, active sessions, recovery methods, device certificates, signing credentials, and external access within risk-based deadlines. Confirm revocation across federated and supplier systems.

### SEC-12.07 — Passwords, recovery codes, private keys…

**Requirement:** Passwords, recovery codes, private keys, and tokens MUST use approved secret-management and delivery paths. Never send credentials through ordinary chat/email or retain them in handoff, support, or personnel records.

### SEC-12.08 — Identity and privileged activity records MUST allow attribution…

**Requirement:** Identity and privileged activity records MUST allow attribution, preserve integrity, alert on high-risk anomalies, and avoid recording authentication secrets. Investigate unexplained access or failed offboarding through the security incident process.

## Prohibited conditions

- Do not grant access based only on a manager’s informal message when the resource owner’s approval is required.
- Do not leave an identity active because its owner is temporarily absent or the access inventory is unclear.
- Do not bypass access review by using a contractor, personal account, or machine credential without an accountable owner.

## Decision procedure

Classify identity by human/agent use, privilege, data access, external exposure, duration, and separation risk. Select identity proofing, authentication, approval, monitoring, and review cadence proportionate to those properties and applicable constraints.

## Assessment procedure

### Examine

- Sample a complete instance of the personnel security and human access lifecycle workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Test joiner, mover, leaver, break-glass, contractor, and delegated agent scenarios. Verify unique attribution, MFA/role enforcement, approval, automatic expiry, session invalidation, secrets handling, alerting, and access review.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable SEC-12 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
