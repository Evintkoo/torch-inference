# Functional Roles Accountability and Decision Rights

**Control family:** organization  
**Control document:** ORG-01  
**Requirement trace:** ORG-001–ORG-003, PA-010–PA-014, SO-001–SO-005, SO-010–SO-014  
**Status:** Normative project control

## Control objective

People must know which outcomes they own, what authority they can exercise, who must review a decision, and who accepts residual risk. Clear authority is required for routine work, exceptions, emergencies, external commitments, and succession.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### ORG-01.01 — The organization MUST maintain a current map of functions…

**Requirement:** The organization MUST maintain a current map of functions that perform product, engineering, security, privacy, legal/compliance coordination, finance/procurement, people operations, release, operations, support, and external communications as applicable. For each material workflow, identify one accountable owner, responsible performer(s), required consulted roles, informed parties, and delegate/escalation path; do not require a dedicated job title for every function.

### ORG-01.02 — For architecture, security/privacy risk, release, data…

**Requirement:** For architecture, security/privacy risk, release, data use, spending, contracts, customer promises, public claims, policy exceptions, and incident disclosure, define who proposes, reviews, approves, executes, and verifies the decision. Set thresholds using impact, irreversibility, exposure, cost, and affected parties; high-impact decisions MUST receive independent review where practical.

### ORG-01.03 — A delegation MUST state scope, limits, start/end…

**Requirement:** A delegation MUST state scope, limits, start/end, records required, subdelegation rules, and conditions for escalation. The delegator remains accountable unless the governing policy explicitly transfers accountability; informal availability or seniority MUST NOT be treated as unlimited authority.

### ORG-01.04 — Where one person can initiate, approve, execute…

**Requirement:** Where one person can initiate, approve, execute, and attest to the same high-impact transaction, the workflow MUST use independent approval, automated safeguards, retrospective review, or another documented compensating control. Apply separation proportionate to actual fraud, error, privacy, security, and release risk.

### ORG-01.05 — When schedule, cost, quality, security…

**Requirement:** When schedule, cost, quality, security, privacy, accessibility, and customer impact conflict, the decision record MUST state the tradeoff, evidence, affected stakeholders, residual risk, accountable approver, and rejected alternatives. The most senior person’s preference alone is not a substitute for the required decision evidence.

### ORG-01.06 — Every material responsibility MUST have an escalation route…

**Requirement:** Every material responsibility MUST have an escalation route for blocked decisions, unavailable owners, suspected wrongdoing, unsafe instructions, or urgent user impact. The route MUST include a delegate or coverage procedure; an unresolved escalation MUST not be silently treated as approval.

### ORG-01.07 — Role changes, departures, new products, new…

**Requirement:** Role changes, departures, new products, new jurisdictions, material incidents, and changed risk MUST trigger review of affected authority, access, approval thresholds, and succession. Remove stale owner names and privileges promptly.

## Prohibited conditions

- Do not infer authority from job title, tenure, chat participation, or access to a tool.
- Do not allow a person to approve their own material exception without a documented independent compensating review.
- Do not leave a critical function ownerless because the organization is small.

## Decision procedure

For a sample decision, identify proposer, accountable owner, reviewer, approver, executor, and verifier. Compare the decision class and risk against approval thresholds; test absent-owner and emergency escalation. If one person fills multiple roles, demonstrate the compensating control and its evidence.

## Assessment procedure

### Examine

- Sample a complete instance of the functional roles accountability and decision rights workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Trace one routine and one high-impact decision from request to closure; test delegated authority expiry and unavailable-owner escalation. Verify no unauthorized person can approve, merge, publish, spend, disclose, or accept risk through role or tool permissions.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable ORG-01 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
