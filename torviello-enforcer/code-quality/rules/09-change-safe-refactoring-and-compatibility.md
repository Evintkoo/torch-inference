# Change-safe refactoring and compatibility

**Control family:** code-quality  
**Control document:** CQ-09  
**Requirement trace:** ED-002–ED-005, ED-011, ED-013–ED-014, ED-023, CSC-005–CSC-010  
**Status:** Normative project control

## Control objective

Refactoring must reduce future change cost while preserving observable behavior and supported contracts. Safe change is staged so reviewers can distinguish structural movement from behavior changes and operators can recover from an unexpected result.

## Applicability

This control applies to new and changed code-quality decisions, artifacts, and agent-assisted work. Apply a clause where its stated condition exists. For existing behavior, use the control when that behavior is changed, relied on by a new capability, or assessed for a material risk. Product-specific choices remain governed by approved requirements and decision records.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### CQ-09.01 — Before a consequential refactor, identify public and internal…

**Requirement:** Before a consequential refactor, identify public and internal consumers, persisted formats, API/CLI behavior, configuration, error semantics, timing/resource guarantees, supported build profiles, and operational procedures that MUST remain stable.

### CQ-09.02 — Keep pure restructuring separate from feature changes when practical…

**Requirement:** Keep pure restructuring separate from feature changes when practical. If the changes are combined, label the behavior delta, rationale, test coverage, migration effect, and rollback boundary so reviewers can assess each independently.

### CQ-09.03 — For legacy or poorly specified behavior, capture representative…

**Requirement:** For legacy or poorly specified behavior, capture representative examples, invariants, contract tests, or production-safe telemetry before refactoring. Tests MUST distinguish intended behavior from accidental behavior; do not freeze a vulnerability or defect as a permanent contract.

### CQ-09.04 — Break large changes into small steps that compile…

**Requirement:** Break large changes into small steps that compile and can be reviewed. Preserve a working path, use adapters or expand-and-contract migrations when consumers change at different times, and avoid a big-bang rewrite unless a documented constraint makes incremental migration unsafe or more costly.

### CQ-09.05 — For public APIs, configuration, persisted data…

**Requirement:** For public APIs, configuration, persisted data, model metadata, plugin interfaces, and release artifacts, define compatibility guarantees and deprecation windows. Breaking changes MUST include affected consumers, migration steps, versioning, and rollback or forward-recovery behavior.

### CQ-09.06 — Keep an abstraction when it protects a real invariant…

**Requirement:** Keep an abstraction when it protects a real invariant, isolates volatile dependencies, enables required testing, or stabilizes a supported contract. Remove it when it obscures simple behavior, has no meaningful consumers, duplicates policy, or creates more change points than it saves.

### CQ-09.07 — A refactor MUST run relevant contract, regression…

**Requirement:** A refactor MUST run relevant contract, regression, concurrency, error, performance, and platform checks according to the changed boundary. A claimed maintainability improvement MUST name the reduced coupling, complexity, duplication, or operational burden and show it did not simply relocate the cost.

### CQ-09.08 — For stateful or deployed systems, test upgrade from…

**Requirement:** For stateful or deployed systems, test upgrade from supported prior states, interruption, restart, rollback, and mixed-version behavior as applicable. If rollback is unsafe, state the forward-recovery procedure and obtain release-owner acceptance before rollout.

### CQ-09.09 — Unrelated cleanup MUST be excluded unless required for safe…

**Requirement:** Unrelated cleanup MUST be excluded unless required for safe migration. Temporary adapters, feature flags, duplicate paths, and compatibility shims MUST have an owner, usage evidence, removal condition, and review date.

## Prohibited conditions

- Do not claim a refactor is behavior-preserving without identifying the behavior contract and running suitable checks.
- Do not use a compatibility wrapper to retain two divergent implementations indefinitely.
- Do not delete data, configuration, or public behavior as incidental cleanup.

## Decision procedure

Review the change in structural and behavioral parts; compare public contracts and representative outputs before/after; run tests and migration/rollback exercises matching the boundary. Verify temporary compatibility paths have a removal trigger and are not silently expanding supported behavior.

## Assessment procedure

### Examine

- Trace the applicable CQ-09 clauses to the decision owner, chosen design, implementation boundary, and retained evidence. Review both the selected approach and the material alternatives rejected.
- Check the relevant source, configuration, tests, operational procedures, and compatibility obligations; confirm that the rationale matches the implemented behavior.

### Interview

- Ask the accountable owner to explain the decision trigger, constraints, alternatives, failure behavior, and conditions that would cause reconsideration. Confirm the explanation against records and behavior.

### Test

- Execute the document-specific checks in the Decision procedure on the affected revision. Exercise at least one relevant boundary, failure, or change scenario; record expected and actual results.

## Assessment determination

Pass requires each applicable MUST to be met with current evidence and any SHOULD deviation to have a reasoned record. Fail when the selected pattern violates a stated decision criterion, enforcement is bypassable, a required case is unhandled, or evidence is missing/stale. Not applicable requires a stated condition and reviewer rationale.

## Required evidence

- Decision/change record identifying applicable CQ-09 clauses, owner, scope, alternatives, constraints, and reasons.
- Tests, analysis, or operational evidence showing normal, boundary, failure, and change behavior relevant to the decision.
- Approved exception record for any unmet requirement, with scope, risk, compensation, owner, approval, and expiry.

## Exceptions and nonconformance

A MUST deviation requires approval from the accountable engineering or product owner before release. Record affected control IDs and profiles, risk, compensating controls, remediation owner, and review/expiry date. An exception does not amend the rule; recurring exceptions require revising the rule or resolving the underlying decision.

## Reference trail

Source IDs R2,R3,R5 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform the control but do not replace its project-specific requirements.
