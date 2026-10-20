# Normative rule writing and control quality

**Control family:** governance  
**Control document:** GOV-02  
**Requirement trace:** CSC-002, CSC-005, CSC-010, ED-042  
**Status:** Normative project control

## Control objective

Rules must be complete enough to guide decisions and assess outcomes without requiring the author’s memory. A control is useful only when its applicability, required behavior, decision criteria, enforcement boundary, and evidence can be understood independently.

## Applicability

This control applies to new and changed governance decisions, artifacts, and agent-assisted work. Apply a clause where its stated condition exists. For existing behavior, use the control when that behavior is changed, relied on by a new capability, or assessed for a material risk. Product-specific choices remain governed by approved requirements and decision records.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### GOV-02.01 — Each rule document MUST identify its intended outcome…

**Requirement:** Each rule document MUST identify its intended outcome, audience, lifecycle scope, affected profiles, and conditions that make clauses applicable. Avoid universal claims such as “always secure” unless the controlled boundary and measurable result are specified.

### GOV-02.02 — Each numbered requirement MUST express one independently assessable outcome…

**Requirement:** Each numbered requirement MUST express one independently assessable outcome or a tightly coupled set of conditions that cannot sensibly be evaluated separately. Name the actor or system, trigger, required action, limit or invariant, failure behavior, and observable evidence where relevant.

### GOV-02.03 — Use BCP 14 terms only in all capitals…

**Requirement:** Use BCP 14 terms only in all capitals. MUST/MUST NOT identify release-critical obligations; SHOULD/SHOULD NOT allow a justified deviation and therefore require a rationale; MAY grants an option without implying preference. Do not use vague force words such as “best,” “robust,” “appropriate,” or “industry standard” without decision criteria.

### GOV-02.04 — A project rule MUST state the behavior required in…

**Requirement:** A project rule MUST state the behavior required in its own words. External links, other internal documents, examples, and tool output MAY provide context but MUST NOT be the sole statement of a required control.

### GOV-02.05 — Where more than one design, pattern, tool…

**Requirement:** Where more than one design, pattern, tool, or policy can satisfy the outcome, the rule MUST state the decision factors, constraints, failure modes, and evidence used to select among them. It MUST identify when a named pattern is a fit, when it is not, and what alternatives SHOULD be considered; it MUST NOT mandate a pattern solely because it is familiar.

### GOV-02.06 — A rule MUST distinguish normative obligations from rationale…

**Requirement:** A rule MUST distinguish normative obligations from rationale, examples, implementation advice, source provenance, and assessment steps. Examples MUST be labeled as examples and MUST NOT accidentally narrow or expand the normative clause.

### GOV-02.07 — For each control family, identify the owner/enforcement boundary…

**Requirement:** For each control family, identify the owner/enforcement boundary, assessment method, positive and adverse cases, pass/fail/not-applicable criteria, evidence freshness, exception authority, and expiry/review expectation. Interview or self-attestation alone MUST NOT prove a technical property when it can be examined or tested.

### GOV-02.08 — Each document MUST map to stable project requirement IDs…

**Requirement:** Each document MUST map to stable project requirement IDs and source IDs in its domain trail. Pin versioned sources when relevant; prefer primary/authoritative sources; explain each source’s role; record a gap when no suitable authoritative source exists rather than inventing a citation.

### GOV-02.09 — Before adding or changing a rule, review it…

**Requirement:** Before adding or changing a rule, review it as an implementer, reviewer, operator, and agent. Check that terms are defined, scope is bounded, requirements do not conflict, exceptions do not defeat the objective, and assessment can be repeated by someone other than the author.

### GOV-02.10 — Rule changes MUST have an owner, reason…

**Requirement:** Rule changes MUST have an owner, reason, affected controls, requirement/source impact, migration or adoption plan where needed, and validation of IDs, links, mappings, and cross-document consistency. Superseded controls MUST be explicitly replaced or retired with traceable history.

### GOV-02.11 — When a control prescribes work, it MUST provide…

**Requirement:** When a control prescribes work, it MUST provide or link to an actionable procedure that defines the trigger, responsible role, prerequisites and inputs, ordered steps, decision branches and criteria, required outputs, verification/evidence, failure and recovery path, handoff, and closure condition. A list of desired outcomes, tool names, or links alone is not a procedure. Procedures MUST identify which steps can be automated, which require human judgment or approval, and what evidence each step produces.

### GOV-02.12 — A procedure MUST state its applicable profiles and account…

**Requirement:** A procedure MUST state its applicable profiles and account for normal, boundary, failure, degraded, retry, interruption, rollback/forward-recovery, compatibility, security/privacy, and exceptional paths relevant to the work. It MUST define decision criteria for choosing among patterns and state when to stop and escalate. Do not imply one happy-path sequence covers distinct local, hosted, offline, enterprise, or user-facing profiles.

### GOV-02.13 — Multi-stage work MUST define an entry condition…

**Requirement:** Multi-stage work MUST define an entry condition and an objectively assessable exit condition for each phase, the role authorized to approve transitions, and the artifacts/evidence handed to the next phase. A phase MUST NOT be reported complete while required outputs or checks are absent; blocked, deferred, failed, and not-applicable states MUST remain distinct.

### GOV-02.14 — Procedure authors MUST test instructions by following them on…

**Requirement:** Procedure authors MUST test instructions by following them on a representative case or having an uninvolved contributor dry-run them. The dry-run reviewer MUST not be the sole author or approver of the procedure; record the reviewer’s role and basis for independence. Steps MUST name expected results and recovery/escalation when a result differs. Record the procedure revision, case inputs, expected and observed outputs, gaps, owner, and retest trigger in the governance assurance register. Owners MUST review procedures after incidents, material changes, repeated exceptions, or source/tool changes; stale commands, roles, forms, and assumptions MUST be corrected or explicitly retired.

## Prohibited conditions

- Do not equate a long document, many numbered files, or many citations with completeness or quality.
- Do not copy a standard’s text or claim formal adoption where the project has only used it as technical context.
- Do not split one coherent obligation into many trivial clauses merely to inflate control counts.

## Decision procedure

For sampled rules, ask an unfamiliar implementer to identify scope, required behavior, decision path, enforcement point, and evidence without oral help. For each material procedure, run a dry-run covering a normal case and at least one relevant exception or failure case. Have a separate reviewer classify representative cases as pass/fail/not applicable. Any interpretation that depends on author intent, any non-resolving citation, a missing operational path, or any untestable MUST is a rule defect.

## Assessment procedure

### Examine

- Trace the applicable GOV-02 clauses to the decision owner, chosen design, implementation boundary, and retained evidence. Review both the selected approach and the material alternatives rejected.
- Check the relevant source, configuration, tests, operational procedures, and compatibility obligations; confirm that the rationale matches the implemented behavior.

### Interview

- Ask the accountable owner to explain the decision trigger, constraints, alternatives, failure behavior, and conditions that would cause reconsideration. Confirm the explanation against records and behavior.

### Test

- Execute the document-specific checks in the Decision procedure on the affected revision. Exercise at least one relevant boundary, failure, or change scenario; record expected and actual results.

## Assessment determination

Pass requires each applicable MUST to be met with current evidence and any SHOULD deviation to have a reasoned record. Fail when the selected pattern violates a stated decision criterion, enforcement is bypassable, a required case is unhandled, or evidence is missing/stale. Not applicable requires a stated condition and reviewer rationale.

## Required evidence

- Decision/change record identifying applicable GOV-02 clauses, owner, scope, alternatives, constraints, and reasons.
- Tests, analysis, or operational evidence showing normal, boundary, failure, and change behavior relevant to the decision.
- Approved exception record for any unmet requirement, with scope, risk, compensation, owner, approval, and expiry.

## Exceptions and nonconformance

A MUST deviation requires approval from the accountable engineering or product owner before release. Record affected control IDs and profiles, risk, compensating controls, remediation owner, and review/expiry date. An exception does not amend the rule; recurring exceptions require revising the rule or resolving the underlying decision.

## Reference trail

Source IDs R1,R2 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform the control but do not replace its project-specific requirements.
