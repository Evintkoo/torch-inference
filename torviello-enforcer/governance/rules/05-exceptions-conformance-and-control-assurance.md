# Exceptions, conformance, and control assurance

**Control family:** governance  
**Control document:** GOV-05  
**Requirement trace:** CSC-002, CSC-005, CSC-006, CSC-010, ED-014, ED-042  
**Status:** Normative project control

## Control objective

Conformance must be an evidence-based determination for a defined scope and revision. Exceptions must expose risk and ownership while preserving the control’s intent and preventing temporary deviations from becoming invisible permanent policy.

## Applicability

This control applies to new and changed governance decisions, artifacts, and agent-assisted work. Apply a clause where its stated condition exists. For existing behavior, use the control when that behavior is changed, relied on by a new capability, or assessed for a material risk. Product-specific choices remain governed by approved requirements and decision records.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### GOV-05.01 — Before relying on a control or passing a release…

**Requirement:** Before relying on a control or passing a release gate, the accountable change owner MUST record each relevant clause as applicable, not applicable, or unresolved, with the component, profile, revision, environment, boundary, rationale, decision owner, and supporting evidence/profile mapping. “Where applicable,” “material,” “production,” and similar qualifiers MUST be resolved against observable facts; a contributor MUST NOT exempt their own work by assertion alone. Unresolved applicability MUST be escalated and MUST block a high-impact or release-critical action until the accountable risk owner resolves it. A domain-level statement MUST NOT imply every clause or deployment profile was assessed.

### GOV-05.02 — Assessors MUST examine artifacts and evidence, interview accountable…

**Requirement:** Assessors MUST examine artifacts and evidence, interview accountable owners when role/process behavior matters, and test executable behavior where feasible. Record sampling and limitations; interview or document presence alone MUST NOT prove implementation effectiveness.

### GOV-05.03 — Each applicable control MUST receive pass, fail…

**Requirement:** Each applicable control MUST receive pass, fail, or not applicable with clause-level rationale where only part of a document applies. Missing evidence, stale evidence, an untested critical boundary, or unapproved behavior MUST be reported as a failure or explicit assessment limitation, never silently treated as a pass.

### GOV-05.04 — An exception MUST identify the affected clauses and profiles…

**Requirement:** An exception MUST identify the affected clauses and profiles, business/technical reason, risk and impacted parties, compensating controls, acceptance authority, remediation owner, expiry/review date, and verification plan. The approver MUST have authority over the affected risk.

### GOV-05.05 — Exceptions MUST be narrow, time-bounded, discoverable from…

**Requirement:** Exceptions MUST be narrow, time-bounded, discoverable from the control trail, and reviewed on material change or incident. Multiple similar exceptions MUST trigger review of the underlying rule, architecture, or decision rather than indefinite renewal.

### GOV-05.06 — An exception MAY authorize a defined deviation; it…

**Requirement:** An exception MAY authorize a defined deviation; it MUST NOT authorize false test results, concealment of a defect, weakening unrelated clauses, or bypass of system/user/platform safety constraints.

### GOV-05.07 — A failed assessment MUST identify severity, affected release…

**Requirement:** A failed assessment MUST identify severity, affected release or profile, containment decision, owner, corrective action, target, and retest evidence. Release-blocking status MUST follow the applicable risk and release controls.

### GOV-05.08 — Conformance evidence MUST be refreshed after changes that affect…

**Requirement:** Conformance evidence MUST be refreshed after changes that affect a control’s boundary, threat model, implementation, data, dependency, deployment profile, or operating procedure. A previous pass MUST NOT be carried forward without checking whether its evidence remains representative.

### GOV-05.09 — The accountable change owner MUST record every material conformance…

**Requirement:** The accountable change owner MUST record every material conformance assessment and every approved or pending exception in `governance/assurance-register.md` or its successor named there. The entry MUST include the fields defined by that register and link to detailed evidence in the authoritative work record. A ticket, chat, or private note alone is not discoverable control evidence. An exception is not effective until the register links its approval; an unregistered deviation is nonconformance.

### GOV-05.10 — The approving role MUST be named by function…

**Requirement:** The approving role MUST be named by function and have documented authority for the affected risk under ORG-01. The person requesting or implementing a material exception MUST NOT be its sole approver. When no authorized approver is available, the exception is not approved; only separately authorized emergency containment MAY proceed under the applicable emergency control.

## Prohibited conditions

- Do not label a project, domain, or product “compliant” based on a partial or unscoped review.
- Do not accept self-approval for a material risk when independent authorization is required by the applicable control.
- Do not let an expired exception remain an undocumented operating state.

## Decision procedure

Select a control with a current pass, a failing/limited assessment, and an exception. Reperform the scope and evidence review, verify approval and expiry, test compensating controls, and confirm changed implementations trigger reassessment.

## Assessment procedure

### Examine

- Trace the applicable GOV-05 clauses to the decision owner, chosen design, implementation boundary, and retained evidence. Review both the selected approach and the material alternatives rejected.
- Check the relevant source, configuration, tests, operational procedures, and compatibility obligations; confirm that the rationale matches the implemented behavior.

### Interview

- Ask the accountable owner to explain the decision trigger, constraints, alternatives, failure behavior, and conditions that would cause reconsideration. Confirm the explanation against records and behavior.

### Test

- Execute the document-specific checks in the Decision procedure on the affected revision. Exercise at least one relevant boundary, failure, or change scenario; record expected and actual results.

## Assessment determination

Pass requires each applicable MUST to be met with current evidence and any SHOULD deviation to have a reasoned record. Fail when the selected pattern violates a stated decision criterion, enforcement is bypassable, a required case is unhandled, or evidence is missing/stale. Not applicable requires a stated condition and reviewer rationale.

## Required evidence

- Decision/change record identifying applicable GOV-05 clauses, owner, scope, alternatives, constraints, and reasons.
- Tests, analysis, or operational evidence showing normal, boundary, failure, and change behavior relevant to the decision.
- Approved exception record for any unmet requirement, with scope, risk, compensation, owner, approval, and expiry.
- Assurance-register entry for each material assessment or exception, including clause-level applicability, accountable decision owner, source revision, evidence links, and current disposition.

## Exceptions and nonconformance

A MUST deviation requires approval from the accountable engineering or product owner before release. Record affected control IDs and profiles, risk, compensating controls, remediation owner, and review/expiry date. An exception does not amend the rule; recurring exceptions require revising the rule or resolving the underlying decision.

## Record location and operating procedure

Use [`assurance-register.md`](../assurance-register.md) as the index for applicability decisions, conformance assessments, exceptions, and review evidence. The change owner creates or updates the entry when selecting controls and before acceptance; the risk approver records approval before a deviation takes effect. Link detailed test, review, or incident evidence from the durable work record. The register owner checks for missing fields, expired entries, and unresolved applicability at each release gate and after a material incident or change. Missing evidence, approval, or expiry is a failed assessment, not an implied pass.

## Reference trail

Source IDs R1,R2 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform the control but do not replace its project-specific requirements.
