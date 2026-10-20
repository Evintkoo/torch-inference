# Public Statements Product Claims and Marketing Content

**Control family:** stakeholder-relations  
**Control document:** EXT-03  
**Requirement trace:** ORG-030, ORG-002, ORG-021, ORG-040, ED-012, ED-030–ED-033, ED-040–ED-041  
**Status:** Normative project control

## Control objective

External-facing claims shape user decisions and organizational obligations. Product, security, privacy, licensing, performance, accessibility, model, and commercial statements must be accurate, scoped, evidenced, approved, and corrected when they become stale.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### EXT-03.01 — Each public channel and content type MUST have…

**Requirement:** Each public channel and content type MUST have an owner, authorized publisher, subject-matter reviewers, approval path, and correction process. Material claims involving security, privacy, legal rights, license, availability, support, or commercial terms MUST receive relevant specialist review.

### EXT-03.02 — A claim MUST identify the product/profile/version, tested conditions…

**Requirement:** A claim MUST identify the product/profile/version, tested conditions, limitations, date/evidence, and source owner. Performance, accuracy, hardware support, model quality, security, accessibility, privacy, and reliability claims MUST match reproducible evidence and actual supported behavior.

### EXT-03.03 — Reviewers MUST assess likely user interpretation, omitted conditions…

**Requirement:** Reviewers MUST assess likely user interpretation, omitted conditions, comparison baseline, target audience, and whether a prototype or aspiration could be mistaken for a shipped guarantee. Disclaimers MUST not contradict a headline or obscure a material limitation.

### EXT-03.04 — Use of customer names, testimonials, partner marks…

**Requirement:** Use of customer names, testimonials, partner marks, certification symbols, standards references, model/provider names, or endorsements MUST have permission, accurate context, rights review, and current verification. Never imply certification or independent validation that has not occurred.

### EXT-03.05 — Pricing, licensing, warranty, support level…

**Requirement:** Pricing, licensing, warranty, support level, privacy notice, data use, service level, roadmap, and legal terms MUST come from an approved source and authorized owner. Content editors MUST not improvise an enforceable commitment.

### EXT-03.06 — Assign each material page, release note, demo…

**Requirement:** Assign each material page, release note, demo, social post, and sales artifact an owner and review trigger. Update or remove stale claims when the product, model, license, vulnerability status, supported profile, or commitment changes.

### EXT-03.07 — When a published statement is materially false or misleading…

**Requirement:** When a published statement is materially false or misleading, notify the accountable owner, assess affected users and obligations, correct the source and downstream copies, and communicate the correction through a proportionate channel. Preserve evidence of what was changed and when.

### EXT-03.08 — Before publishing, verify rights and approvals for code…

**Requirement:** Before publishing, verify rights and approvals for code, imagery, user stories, screenshots, telemetry, support cases, employee identities, and customer data. Redact secrets and identifying data; use explicit consent and approved retention for testimonials or case studies.

## Prohibited conditions

- Do not state that the product is secure, compliant, certified, private, unbiased, production-ready, or supported without defined scope and evidence.
- Do not present a target feature, benchmark from a different configuration, or supplier statement as a verified product guarantee.
- Do not publish customer or employee information because it is already visible in an internal tool.

## Decision procedure

Classify claim type and risk, locate evidence and scope, identify audience interpretation, route to required subject-matter and legal review, obtain publication approval, and set a revalidation trigger. More consequential claims require stronger evidence and independent review.

## Assessment procedure

### Examine

- Sample a complete instance of the public statements product claims and marketing content workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Audit the website, release notes, demo, performance benchmark, license statement, security page, and social/press content. Trace each material claim to evidence, scope, approval, permissions, owner, review date, and correction route.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable EXT-03 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
