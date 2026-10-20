# Work Intake Prioritization and Individual Execution

**Control family:** people-and-work  
**Control document:** PPL-04  
**Requirement trace:** ORG-020, ORG-001–ORG-003, ED-005, ED-011  
**Status:** Normative project control

## Control objective

Every work action must have a clear purpose, owner, authorized scope, completion condition, and escalation path. Teams must balance planned work, incidents, maintenance, learning, and stakeholder commitments without relying on hidden queues or personal memory.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### PPL-04.01 — A request for product, engineering, operations…

**Requirement:** A request for product, engineering, operations, support, research, compliance, or administrative work MUST be captured in an approved system with requester, purpose, affected users, urgency, expected outcome, owner, and relevant evidence. Emergency actions MAY start immediately but MUST be recorded promptly afterward.

### PPL-04.02 — A responsible owner MUST compare user harm/value, security/legal…

**Requirement:** A responsible owner MUST compare user harm/value, security/legal obligations, service impact, dependencies, urgency, effort, opportunity cost, and reversibility. Record deferral rationale for material risks or commitments; do not let loudness, status, or recency alone determine priority.

### PPL-04.03 — Accepted work MUST state outcomes, boundaries, dependencies…

**Requirement:** Accepted work MUST state outcomes, boundaries, dependencies, decision owner, review needs, validation, and closure evidence proportionate to risk. For software feature work, follow the specification → technical requirements → plan → implementation sequence required by project rules; use a proportionate documented path for routine maintenance.

### PPL-04.04 — Team leads SHOULD make active work and blocked work…

**Requirement:** Team leads SHOULD make active work and blocked work visible, limit avoidable concurrent commitments, and identify the decision needed to unblock progress. Do not claim capacity for work without accounting for on-call, review, support, security, and maintenance duties.

### PPL-04.05 — The owner MUST update status when scope, estimate…

**Requirement:** The owner MUST update status when scope, estimate, dependency, risk, or expected delivery changes. A blocked or unsafe task MUST be escalated with the reason, impact, next action, and decision needed; silence MUST NOT be interpreted as acceptance.

### PPL-04.06 — Completion MUST be checked against acceptance evidence by…

**Requirement:** Completion MUST be checked against acceptance evidence by the owner or an appropriate reviewer. Work that affects production, user data, public commitments, money, security, or irreversible state MUST receive independent review/approval where practical.

### PPL-04.07 — When work is complete, cancelled, superseded…

**Requirement:** When work is complete, cancelled, superseded, or transferred, update status, artifacts, owners, follow-up tasks, stakeholders, and any residual risk. Unfinished work MUST not remain hidden in personal notes, private messages, or unowned branches.

## Prohibited conditions

- Do not start material work with no identifiable owner or completion condition.
- Do not silently drop a request that carries security, safety, privacy, legal, or user-impact risk.
- Do not treat a task tracker status as evidence that an outcome was verified.

## Decision procedure

Choose urgency and review depth using impact, reversibility, external commitment, dependency, and risk. Route emergency work through the emergency change path; otherwise ensure prerequisites and decisions are resolved before execution. Escalate priority conflicts to the named accountable owner.

## Assessment procedure

### Examine

- Sample a complete instance of the work intake prioritization and individual execution workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Sample work from request, priority decision, assignment, execution, review, and closure; verify owner, status, user/operational impact, and evidence. Test an urgent task and a blocked cross-team dependency.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable PPL-04 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
