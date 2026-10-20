# Coverage, risk analysis, and rule evolution

**Control family:** governance  
**Control document:** GOV-03  
**Requirement trace:** CSC-001, CSC-002, CSC-004, CSC-010, ED-014, ED-042  
**Status:** Normative project control

## Control objective

Coverage must be assessed from system context and change scenarios, not inferred from file counts. The rule set must evolve as product boundaries, failure modes, threat conditions, dependencies, and operational evidence change.

## Applicability

This control applies to new and changed governance decisions, artifacts, and agent-assisted work. Apply a clause where its stated condition exists. For existing behavior, use the control when that behavior is changed, relied on by a new capability, or assessed for a material risk. Product-specific choices remain governed by approved requirements and decision records.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### GOV-03.01 — A domain coverage review MUST identify relevant users…

**Requirement:** A domain coverage review MUST identify relevant users and operators, assets and data, trust boundaries, components and dependencies, deployment profiles, and intended outcomes before deciding which controls apply.

### GOV-03.02 — A coverage review MUST consider governance, recruitment…

**Requirement:** A coverage review MUST consider governance, recruitment and role assignment, work intake, requirements, architecture, implementation, collaboration, procurement, verification, release, installation, operation, customer support, incident response, knowledge transfer, separation, migration, and retirement. Mark each area applicable, not applicable with rationale, or unresolved with owner and next review trigger.

### GOV-03.03 — For each material boundary, consider misuse, invalid…

**Requirement:** For each material boundary, consider misuse, invalid input, resource exhaustion, concurrency, dependency failure, partial completion, restart, upgrade/downgrade, rollback, data loss, compromised credentials/artifacts, and operator error where relevant. Add controls when a credible scenario has no owner, prevention/detection behavior, recovery path, or evidence.

### GOV-03.04 — The review MUST consider likelihood, impact, exposure…

**Requirement:** The review MUST consider likelihood, impact, exposure, reversibility, affected users, data sensitivity, blast radius, detectability, recovery time, and uncertainty. Higher-risk or irreversible outcomes MUST receive stronger prevention, independent review, and direct verification; low-risk choices MAY use proportionate checks with rationale.

### GOV-03.05 — A change MUST be checked against adjacent domains when…

**Requirement:** A change MUST be checked against adjacent domains when it crosses their boundaries—for example API/security, model/persistence, build/release, configuration/operations, or UI/accessibility. Assign one authoritative control owner for shared obligations and cross-reference other documents instead of duplicating conflicting normative text.

### GOV-03.06 — A gap MUST state the affected lifecycle area…

**Requirement:** A gap MUST state the affected lifecycle area, risk/scenario, impacted requirements, owner, interim mitigation, disposition, and review trigger or target. A gap MUST NOT be described as covered merely because a related document exists.

### GOV-03.07 — After a defect, incident, security finding…

**Requirement:** After a defect, incident, security finding, near miss, production rollback, or repeated agent/user confusion, determine whether the root cause was missing, ambiguous, unenforced, or poorly assessed guidance. Update the control, tests, training/agent instructions, or ownership model as appropriate and link the corrective action.

### GOV-03.08 — At least once per major release and when requirements…

**Requirement:** At least once per major release and when requirements or supported profiles change, reassess source versions, assumptions, controls, exceptions, owners, assessment evidence, and applicability. A new version of an external standard triggers impact analysis; it does not automatically change project policy.

### GOV-03.09 — When a rule is obsolete, identify its replacement…

**Requirement:** When a rule is obsolete, identify its replacement or why it no longer applies, check dependent controls and open exceptions, preserve a change record, and remove stale index links. Do not leave abandoned controls appearing current.

### GOV-03.10 — A material domain coverage review MUST dry-run its procedures…

**Requirement:** A material domain coverage review MUST dry-run its procedures against at least one ordinary case and relevant boundary/failure or lifecycle-transition cases. Record the actor, starting inputs, decision points, expected artifacts, observed ambiguities, and pass/fail outcome. A rule document’s existence or a generic “Examine/Interview/Test” section MUST NOT count as proof that a contributor can perform the work. Gaps MUST become owned rule-maintenance or training work with a review trigger.

### GOV-03.11 — Each applicable, not-applicable, or unresolved lifecycle-area disposition…

**Requirement:** Each applicable, not-applicable, or unresolved lifecycle-area disposition in a domain trail MUST link to a dated coverage review record identifying reviewer, scope/profile, rationale, evidence, and next review trigger. Each dry-run MUST identify the procedure revision, participant, starting conditions, expected and actual outputs, result, gaps, owner, and remediation/retest evidence. An unlinked status label or an empty template MUST NOT be represented as completed coverage.

## Prohibited conditions

- Do not claim “all cases” or exhaustive coverage from a finite checklist.
- Do not use a risk score as a substitute for explaining the scenario, impact, and controls.
- Do not let a coverage matrix mark an area complete without evidence or a named control owner.

## Decision procedure

Sample a domain and trace one ordinary change, one adverse scenario, one production/operational scenario, and one lifecycle transition from context through control, owner, verification, and recovery evidence. Dry-run the actual instructions without relying on author explanation. Confirm open gaps and exclusions have rationale and triggers.

## Assessment procedure

### Examine

- Trace the applicable GOV-03 clauses to the decision owner, chosen design, implementation boundary, and retained evidence. Review both the selected approach and the material alternatives rejected.
- Check the relevant source, configuration, tests, operational procedures, and compatibility obligations; confirm that the rationale matches the implemented behavior.

### Interview

- Ask the accountable owner to explain the decision trigger, constraints, alternatives, failure behavior, and conditions that would cause reconsideration. Confirm the explanation against records and behavior.

### Test

- Execute the document-specific checks in the Decision procedure on the affected revision. Exercise at least one relevant boundary, failure, or change scenario; record expected and actual results.

## Assessment determination

Pass requires each applicable MUST to be met with current evidence and any SHOULD deviation to have a reasoned record. Fail when the selected pattern violates a stated decision criterion, enforcement is bypassable, a required case is unhandled, or evidence is missing/stale. Not applicable requires a stated condition and reviewer rationale.

## Required evidence

- Decision/change record identifying applicable GOV-03 clauses, owner, scope, alternatives, constraints, and reasons.
- Tests, analysis, or operational evidence showing normal, boundary, failure, and change behavior relevant to the decision.
- Approved exception record for any unmet requirement, with scope, risk, compensation, owner, approval, and expiry.

## Exceptions and nonconformance

A MUST deviation requires approval from the accountable engineering or product owner before release. Record affected control IDs and profiles, risk, compensating controls, remediation owner, and review/expiry date. An exception does not amend the rule; recurring exceptions require revising the rule or resolving the underlying decision.

## Reference trail

Source IDs R1,R2 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform the control but do not replace its project-specific requirements.
