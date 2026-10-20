# Cross-Team Coordination Review and Escalation

**Control family:** collaboration-and-communication  
**Control document:** COL-03  
**Requirement trace:** ORG-001–ORG-003, ORG-020–ORG-022, ORG-042, ED-011, ED-014  
**Status:** Normative project control

## Control objective

Work that crosses domain, team, or organizational boundaries must identify interface owners, dependencies, decisions, risks, and review points. A handoff is complete only when the receiving owner can act and the sending owner’s remaining accountability is clear.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### COL-03.01 — A change affecting shared APIs, data, security…

**Requirement:** A change affecting shared APIs, data, security boundaries, deployment, costs, documentation, customer support, legal terms, or release schedules MUST identify impacted owners and required reviews before the commitment becomes difficult to reverse.

### COL-03.02 — Cross-team work MUST define inputs, outputs, responsibility…

**Requirement:** Cross-team work MUST define inputs, outputs, responsibility boundaries, response expectations, version/compatibility, failure escalation, and acceptance evidence. Each team MUST know what it provides, consumes, and owns after handoff.

### COL-03.03 — A dependency MUST have a provider owner, consumer…

**Requirement:** A dependency MUST have a provider owner, consumer owner, expected date/contract, status, failure consequence, and fallback or escalation. Critical-path changes MUST be re-evaluated when assumptions or delivery dates change.

### COL-03.04 — Reviewers MUST identify blocking correctness, safety, privacy…

**Requirement:** Reviewers MUST identify blocking correctness, safety, privacy, security, legal, compatibility, or operability concerns distinctly from recommendations and style preferences. Authors MUST resolve or explicitly document disposition; reviewers MUST not use personal preference as an undisclosed mandatory standard.

### COL-03.05 — Participants MUST state the decision, available evidence…

**Requirement:** Participants MUST state the decision, available evidence, requirements, controls, risks, alternatives, and accountable decider. If evidence is insufficient, define a safe experiment or time-bounded discovery task rather than converting an assumption into policy.

### COL-03.06 — When an owner is unavailable or teams disagree under…

**Requirement:** When an owner is unavailable or teams disagree under a deadline, escalate to the delegated authority and identify what can safely proceed. Do not bypass a required security, privacy, financial, release, or external-commitment approval to preserve schedule.

### COL-03.07 — The coordinating owner MUST confirm the receiver accepted…

**Requirement:** The coordinating owner MUST confirm the receiver accepted the work, documentation and records are updated, remaining risks and actions have owners, and each team knows whether support ends or continues.

## Prohibited conditions

- Do not assume a shared repository, channel, or manager means shared accountability.
- Do not merge unresolved blocking review concerns into a vague “follow up later” without risk approval.
- Do not create hidden inter-team dependencies through undocumented data formats or privileged access.

## Decision procedure

Use a lightweight interface agreement for reversible, low-impact work; use a decision record, threat/privacy review, compatibility plan, or formal approval when data, security, user commitments, money, or rollout risk warrants it. Define the receiving owner and escalation before work begins.

## Assessment procedure

### Examine

- Sample a complete instance of the cross-team coordination review and escalation workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Choose one cross-team change with a delayed dependency or disputed review. Verify impacted roles, contract, decision owner, risk review, status updates, escalation, and closure acknowledgment.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable COL-03 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
