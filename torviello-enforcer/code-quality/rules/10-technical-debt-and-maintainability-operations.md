# Technical debt and maintainability operations

**Control family:** code-quality  
**Control document:** CQ-10  
**Requirement trace:** ED-002–ED-005, ED-014, CSC-006–CSC-010  
**Status:** Normative project control

## Control objective

Technical debt is a consciously or accidentally incurred cost that increases future change, failure, or operating risk. It must be visible and managed by impact and evidence, not used as a label for every imperfection or as a substitute for architectural decisions.

## Applicability

This control applies to new and changed code-quality decisions, artifacts, and agent-assisted work. Apply a clause where its stated condition exists. For existing behavior, use the control when that behavior is changed, relied on by a new capability, or assessed for a material risk. Product-specific choices remain governed by approved requirements and decision records.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### CQ-10.01 — A debt item MUST identify the affected component…

**Requirement:** A debt item MUST identify the affected component and users, current consequence, evidence or example, root cause, likelihood/impact, owner, mitigation, and a removal or reassessment trigger. “Refactor later” without a concrete consequence and owner is not an actionable debt record.

### CQ-10.02 — Classify whether an item is a correctness/security defect…

**Requirement:** Classify whether an item is a correctness/security defect, an accepted risk, a compatibility constraint, missing capability, or maintainability debt. Route release-blocking defects through defect/security processes; do not downgrade them by relabeling as debt.

### CQ-10.03 — Compare debt using change frequency, impact, blast…

**Requirement:** Compare debt using change frequency, impact, blast radius, user harm, security exposure, operational toil, incident history, remediation cost, and confidence. Address high-risk debt before adding dependent features; batch low-risk cleanup when it shares a safe change boundary.

### CQ-10.04 — Track trends such as change lead time, review/rework…

**Requirement:** Track trends such as change lead time, review/rework, escaped defects, dependency fan-out, flaky tests, build duration, vulnerability age, incident toil, and exception renewals where useful. Metrics MUST have a defined population and interpretation; do not set individual performance targets from proxy measures.

### CQ-10.05 — Planning MUST account for recurring maintenance, dependency upgrades…

**Requirement:** Planning MUST account for recurring maintenance, dependency upgrades, test reliability, and high-priority debt. The responsible owner MUST make the tradeoff visible when planned work defers a material risk or repeatedly consumes operator time.

### CQ-10.06 — A workaround MUST identify the triggering condition, safe…

**Requirement:** A workaround MUST identify the triggering condition, safe operating envelope, monitoring signal, owner, expiry/review date, and permanent correction path. Reassess it when assumptions change, incidents occur, or its usage expands.

### CQ-10.07 — For recurring or high-impact failures, analyze contributing architecture…

**Requirement:** For recurring or high-impact failures, analyze contributing architecture, review, testing, observability, and operational factors. Correct the system and controls where useful; do not stop at an individual fault or add process steps that do not address the failure mechanism.

### CQ-10.08 — A debt item is complete only when its stated…

**Requirement:** A debt item is complete only when its stated consequence is removed or accepted under an explicit decision, affected tests/controls are updated, and residual risk is recorded. Verify the change in the environments and profiles where the debt existed.

### CQ-10.09 — Owners MUST reassess material debt at planning/release boundaries…

**Requirement:** Owners MUST reassess material debt at planning/release boundaries and after incidents, dependency end-of-life, support changes, or repeated exception renewal. Retire stale items with rationale; keep unresolved high-risk items visible to the release and operational owners.

## Prohibited conditions

- Do not equate every TODO or style disagreement with technical debt.
- Do not let a debt register become a substitute for fixing release-blocking correctness or security defects.
- Do not claim maintainability improved solely because files became shorter or metrics decreased.

## Decision procedure

Sample high, medium, and aged debt items. Verify classification, evidence, ownership, prioritization, mitigation, and closure. Compare selected maintainability signals over time with context and confirm the team did not optimize the metric while worsening change or operational outcomes.

## Assessment procedure

### Examine

- Trace the applicable CQ-10 clauses to the decision owner, chosen design, implementation boundary, and retained evidence. Review both the selected approach and the material alternatives rejected.
- Check the relevant source, configuration, tests, operational procedures, and compatibility obligations; confirm that the rationale matches the implemented behavior.

### Interview

- Ask the accountable owner to explain the decision trigger, constraints, alternatives, failure behavior, and conditions that would cause reconsideration. Confirm the explanation against records and behavior.

### Test

- Execute the document-specific checks in the Decision procedure on the affected revision. Exercise at least one relevant boundary, failure, or change scenario; record expected and actual results.

## Assessment determination

Pass requires each applicable MUST to be met with current evidence and any SHOULD deviation to have a reasoned record. Fail when the selected pattern violates a stated decision criterion, enforcement is bypassable, a required case is unhandled, or evidence is missing/stale. Not applicable requires a stated condition and reviewer rationale.

## Required evidence

- Decision/change record identifying applicable CQ-10 clauses, owner, scope, alternatives, constraints, and reasons.
- Tests, analysis, or operational evidence showing normal, boundary, failure, and change behavior relevant to the decision.
- Approved exception record for any unmet requirement, with scope, risk, compensation, owner, approval, and expiry.

## Exceptions and nonconformance

A MUST deviation requires approval from the accountable engineering or product owner before release. Record affected control IDs and profiles, risk, compensating controls, remediation owner, and review/expiry date. An exception does not amend the rule; recurring exceptions require revising the rule or resolving the underlying decision.

## Reference trail

Source IDs R2,R5,R6 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform the control but do not replace its project-specific requirements.
