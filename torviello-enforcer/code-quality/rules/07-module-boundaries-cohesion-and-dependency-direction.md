# Module boundaries, cohesion, and dependency direction

**Control family:** code-quality  
**Control document:** CQ-07  
**Requirement trace:** ED-001–ED-005, ED-014, PA-010–PA-014, CSC-004, CSC-007  
**Status:** Normative project control

## Control objective

Modules must make responsibility, ownership, allowed dependencies, state, and change impact visible. The right boundary minimizes accidental coupling while keeping behavior that must change together cohesive.

## Applicability

This control applies to new and changed code-quality decisions, artifacts, and agent-assisted work. Apply a clause where its stated condition exists. For existing behavior, use the control when that behavior is changed, relied on by a new capability, or assessed for a material risk. Product-specific choices remain governed by approved requirements and decision records.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### CQ-07.01 — A module MUST own a coherent capability, policy…

**Requirement:** A module MUST own a coherent capability, policy, or lifecycle and expose a small interface suited to its callers. Group code by behavior and reasons to change rather than only by technical layer, file type, or current convenience.

### CQ-07.02 — Document or encode permitted module dependencies…

**Requirement:** Document or encode which modules are permitted to depend on which others. Dependencies MUST point toward stable policy or explicit interfaces; shared foundational code MUST NOT depend upward on feature or transport implementations. Cycles and hidden reach-through MUST be removed or recorded as bounded migration debt.

### CQ-07.03 — Place behavior together when it shares invariants, transaction…

**Requirement:** Place behavior together when it shares invariants, transaction boundaries, lifecycle, security authority, or release cadence. Separate behavior when it has distinct owners, trust levels, deployment needs, resource lifetimes, or independent change pressure. Do not split based only on file size or theoretical reuse.

### CQ-07.04 — Export only types and operations required by legitimate consumers…

**Requirement:** Export only types and operations required by legitimate consumers. Internal details, mutable storage representations, backend-specific errors, and implementation-specific synchronization MUST remain private unless a documented contract requires exposure.

### CQ-07.05 — At important module boundaries, use validated domain types…

**Requirement:** At important module boundaries, use validated domain types, enums for finite states, explicit units, and constructors that preserve invariants. Prefer compile-time guarantees when they improve clarity without creating disproportionate type complexity; validate dynamic input at the boundary.

### CQ-07.06 — For each shared mutable state object, define its…

**Requirement:** For each shared mutable state object, define its owner, synchronization model, consistency guarantees, initialization and shutdown behavior, and failure handling. Avoid globals and shared mutable caches unless their lifetime, invalidation, concurrency, and test isolation are explicit.

### CQ-07.07 — A module MUST expose errors that let callers choose…

**Requirement:** A module MUST expose errors that let callers choose a safe action without depending on private implementation details. Preserve causal context for diagnosis, classify retryability and user correction where relevant, and prevent secrets or internal topology from leaking across public boundaries.

### CQ-07.08 — Test public behavior and invariants at the module boundary…

**Requirement:** Test public behavior and invariants at the module boundary. Add architecture or build checks for forbidden dependencies when regressions are likely; mocks MUST not encode a contract different from the real implementation.

### CQ-07.09 — A temporary cross-boundary dependency MUST identify the owner…

**Requirement:** A temporary cross-boundary dependency MUST identify the owner, reason, affected callers, containment, removal condition, and expiry/review trigger. A compatibility adapter MAY preserve an older interface, but its lifecycle and removal criteria MUST be explicit.

## Prohibited conditions

- Do not create catch-all common, utils, helpers, or shared modules without a cohesive owner and stable consumers.
- Do not duplicate security, authorization, or validation policy in wrappers while leaving the authoritative module unprotected.
- Do not expose internal concrete types merely to avoid defining a useful contract.

## Decision procedure

Draw the affected dependency graph, identify owners and invariants, inspect public exports, then test a normal call, invalid input, dependency failure, and concurrent/lifecycle case where applicable. Confirm forbidden dependency directions are machine-checked or explicitly tracked.

## Assessment procedure

### Examine

- Trace the applicable CQ-07 clauses to the decision owner, chosen design, implementation boundary, and retained evidence. Review both the selected approach and the material alternatives rejected.
- Check the relevant source, configuration, tests, operational procedures, and compatibility obligations; confirm that the rationale matches the implemented behavior.

### Interview

- Ask the accountable owner to explain the decision trigger, constraints, alternatives, failure behavior, and conditions that would cause reconsideration. Confirm the explanation against records and behavior.

### Test

- Execute the document-specific checks in the Decision procedure on the affected revision. Exercise at least one relevant boundary, failure, or change scenario; record expected and actual results.

## Assessment determination

Pass requires each applicable MUST to be met with current evidence and any SHOULD deviation to have a reasoned record. Fail when the selected pattern violates a stated decision criterion, enforcement is bypassable, a required case is unhandled, or evidence is missing/stale. Not applicable requires a stated condition and reviewer rationale.

## Required evidence

- Decision/change record identifying applicable CQ-07 clauses, owner, scope, alternatives, constraints, and reasons.
- Tests, analysis, or operational evidence showing normal, boundary, failure, and change behavior relevant to the decision.
- Approved exception record for any unmet requirement, with scope, risk, compensation, owner, approval, and expiry.

## Exceptions and nonconformance

A MUST deviation requires approval from the accountable engineering or product owner before release. Record affected control IDs and profiles, risk, compensating controls, remediation owner, and review/expiry date. An exception does not amend the rule; recurring exceptions require revising the rule or resolving the underlying decision.

## Reference trail

Source IDs R1,R4,R5 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform the control but do not replace its project-specific requirements.
