# Compliance Risk and Obligation Management

**Control family:** organization  
**Control document:** ORG-03  
**Requirement trace:** ORG-040–ORG-042, SO-014, ED-014  
**Status:** Normative project control

## Control objective

Organizational decisions must account for applicable law, contract, policy, security, safety, privacy, and product risk. Owners must identify obligations and uncertainty early, seek qualified advice where needed, and turn findings into controlled, verifiable actions.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### ORG-03.01 — For each product/service activity and operating jurisdiction…

**Requirement:** For each product/service activity and operating jurisdiction, an assigned owner MUST identify relevant legal, regulatory, contractual, license, privacy, accessibility, security, safety, and customer obligations. Record source, scope, applicability rationale, control owner, evidence, review trigger, and qualified adviser where interpretation is uncertain.

### ORG-03.02 — Employees and agents MUST NOT make authoritative legal conclusions…

**Requirement:** Employees and agents MUST NOT make authoritative legal conclusions from a general rule, internet summary, or model output. When a decision affects employment, privacy, data residency, export controls, consumer rights, intellectual property, licensing, breach notification, or regulated use, route it to qualified counsel or an authorized specialist before commitment.

### ORG-03.03 — A risk review MUST identify asset/person/stakeholder, threat…

**Requirement:** A risk review MUST identify asset/person/stakeholder, threat or failure scenario, likelihood and impact, exposure, existing safeguards, residual risk, treatment owner, approval authority, and review trigger. The depth of review MUST reflect harm, irreversibility, scale, and uncertainty.

### ORG-03.04 — For each material risk, the owner MUST choose…

**Requirement:** For each material risk, the owner MUST choose avoid, reduce, transfer, or accept; state why, due date, interim safeguards, monitoring, and evidence. Risk acceptance MUST be explicit, time-bounded or trigger-bounded, and authorized by the owner accountable for the affected impact.

### ORG-03.05 — A material change in jurisdiction, data use…

**Requirement:** A material change in jurisdiction, data use, product purpose, supplier, public claim, contract, deployment model, or user population MUST trigger an obligation and risk impact review before the change is made effective.

### ORG-03.06 — A material incident, complaint, audit finding…

**Requirement:** A material incident, complaint, audit finding, near miss, or repeated exception MUST be analyzed for process, authority, competence, incentive, tooling, and control causes. Corrective actions MUST identify owners, dates, control updates, effectiveness checks, and residual risks.

### ORG-03.07 — Compliance, risk, investigation, and corrective-action records…

**Requirement:** Compliance, risk, investigation, and corrective-action records MUST have restricted access, retention and deletion rules, integrity protection proportionate to their importance, and a legal-hold process. Personal data in those records MUST be minimized and handled under the approved privacy policy.

## Prohibited conditions

- Do not treat absence of a known regulation or complaint as evidence that an activity is compliant or safe.
- Do not accept material residual risk on behalf of a user, customer, or data subject without authority.
- Do not publish legal or compliance claims without evidence, scope, and qualified review when required.

## Decision procedure

Determine applicability by activity and jurisdiction; identify uncertainty and who can resolve it; classify risk by impact and reversibility; then assign treatment and authority. Use regulatory, contractual, and operational change triggers to determine when reassessment is mandatory.

## Assessment procedure

### Examine

- Sample a complete instance of the compliance risk and obligation management workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Sample one obligation, one accepted risk, and one corrective action. Confirm scope, owner, advice/escalation, approval authority, interim control, due/review date, and effectiveness evidence.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable ORG-03 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2,R3 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
