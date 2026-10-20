# Competence Training Supervision and Delegation

**Control family:** people-and-work  
**Control document:** PPL-02  
**Requirement trace:** ORG-001–ORG-003, ORG-010, ORG-012, SO-001–SO-005, SO-010–SO-014  
**Status:** Normative project control

## Control objective

People may perform work only within their competence, authorization, and supervision. Training and qualification must be specific to the decisions and risks a person is expected to handle, and must be refreshed when systems or duties change.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### PPL-02.01 — For work that can affect security, privacy…

**Requirement:** For work that can affect security, privacy, safety, finances, customer commitments, production availability, model quality, or legal rights, define the knowledge and demonstrated capability required. A credential alone MUST NOT substitute for role-specific competence evidence.

### PPL-02.02 — Before independent performance of a high-risk task…

**Requirement:** Before independent performance of a high-risk task, the person MUST complete relevant instruction and demonstrate the necessary procedure or judgment. Training MUST cover escalation, failure handling, data protection, tool access, and prohibited actions as applicable.

### PPL-02.03 — When a person is learning, working outside routine…

**Requirement:** When a person is learning, working outside routine competence, or handling an unusual high-risk task, assign a qualified reviewer/supervisor, define the allowed scope, and require checkpoints before irreversible or externally visible action.

### PPL-02.04 — Material policy, threat, system, legal…

**Requirement:** Material policy, threat, system, legal, incident, or role changes MUST trigger an assessment of training impact. Retrain or requalify affected roles before they perform newly risky actions independently.

### PPL-02.05 — A person delegating work MUST confirm the recipient’s authority…

**Requirement:** A person delegating work MUST confirm the recipient’s authority, competence, context, access, expected result, deadline, escalation, and review point. Delegation MUST not transfer an obligation the delegator lacks authority to transfer.

### PPL-02.06 — Performance feedback MUST use role-relevant expectations and evidence…

**Requirement:** Performance feedback MUST use role-relevant expectations and evidence, provide a path to improve, and distinguish system/process failures from individual actions. Consequential employment decisions MUST follow the approved, jurisdiction-reviewed people policy.

### PPL-02.07 — Training and qualification evidence MUST record role, subject/version…

**Requirement:** Training and qualification evidence MUST record role, subject/version, completion or assessment result, owner, and refresh trigger. Keep records proportionate and protect them as personnel data.

## Prohibited conditions

- Do not equate tool access, seniority, or self-confidence with competence.
- Do not assign unreviewed high-impact work to a person who lacks demonstrated capability.
- Do not use training completion as proof that the work process or tools are safe.

## Decision procedure

For each role, identify high-impact tasks and required knowledge, decide whether instruction, supervised practice, or independent qualification is needed, then set reassessment triggers based on change and error history. Tailor depth to risk and available evidence.

## Assessment procedure

### Examine

- Sample a complete instance of the competence training supervision and delegation workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Sample a privileged operator, a release approver, a customer support responder, and a new contributor. Verify current role expectations, training evidence, supervision/delegation limits, and reassessment after relevant changes.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable PPL-02 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2,R3 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
