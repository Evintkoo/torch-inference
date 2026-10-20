# Spending Procurement and Organizational Commitments

**Control family:** organization  
**Control document:** ORG-04  
**Requirement trace:** ORG-044, ORG-002–ORG-003, ORG-033, PA-001–PA-004  
**Status:** Normative project control

## Control objective

People must not create financial, contractual, data, service, or operational commitments without an authorized sponsor and a review proportionate to lifecycle cost and risk. Procurement and commitments include subscriptions, infrastructure, software, datasets, models, contractors, marketing, public promises, and renewals.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### ORG-04.01 — The accountable business owner MUST define spending and commitment…

**Requirement:** The accountable business owner MUST define spending and commitment classes, approval limits, budget authority, required finance/legal/security/privacy/procurement review, evidence, and renewal authority. Thresholds MUST consider total lifecycle cost, data access, lock-in, user impact, and exit cost rather than initial price alone.

### ORG-04.02 — Before a material purchase or external commitment…

**Requirement:** Before a material purchase or external commitment, the sponsor MUST state the business/user need, expected outcome, constraints, alternatives including no purchase, evaluation criteria, full cost, risks, and measurable acceptance conditions. Selection rationale MUST be retained.

### ORG-04.03 — Before granting a supplier or contractor sensitive information…

**Requirement:** Before granting a supplier or contractor sensitive information, production access, code contribution, model/data access, or operational responsibility, review capability, security/privacy controls, licensing, subcontractors, continuity, incident duties, data return/deletion, and termination rights as applicable.

### ORG-04.04 — Only designated roles MAY sign agreements, accept terms…

**Requirement:** Only designated roles MAY sign agreements, accept terms, quote prices, promise features or service levels, or represent a roadmap as committed. Review obligations, implied warranties, data rights, support burden, accessibility, export/retention, indemnity, renewal, and termination before acceptance.

### ORG-04.05 — A service or commitment owner MUST track usage…

**Requirement:** A service or commitment owner MUST track usage, total spend, renewals, budget thresholds, owner, business value, and cost anomalies. Unused or over-provisioned resources MUST be removed or justified; cost-saving actions MUST be checked for security, reliability, and user impact.

### ORG-04.06 — Material scope, price, data, access…

**Requirement:** Material scope, price, data, access, subprocessor, support, jurisdiction, or contract changes MUST trigger reassessment and approval before taking effect. Renewal decisions MUST compare current value and alternatives and include a tested exit or export path when lock-in risk is material.

### ORG-04.07 — At contract or project end, revoke access…

**Requirement:** At contract or project end, revoke access, return or delete information, recover assets, stop recurring charges, retain required records, transfer ownership, and verify closure. Record any retained data or continuing duty and its owner.

## Prohibited conditions

- Do not use a personal account, card, or unapproved free tier to bypass procurement, security, licensing, or data review.
- Do not permit the same person to create and approve a material purchase without a documented compensating review.
- Do not make a public or customer commitment based only on an internal proposal or prototype.

## Decision procedure

Classify the commitment by financial value, recurring cost, data sensitivity, access privilege, external dependency, customer promise, reversibility, and jurisdiction. Route review to the necessary functional owners; select the least-cost option only when it also satisfies the required safety, quality, lifecycle, and exit criteria.

## Assessment procedure

### Examine

- Sample a complete instance of the spending procurement and organizational commitments workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Walk through a low-risk subscription, a production SaaS provider, a contractor with repository access, and a customer-facing SLA. Verify thresholds, due diligence, approvals, spend monitoring, renewal trigger, and exit completion evidence.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable ORG-04 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
