# Local code readability, types, and control flow

**Control family:** code-quality  
**Control document:** CQ-08  
**Requirement trace:** ED-001–ED-003, ED-014, CSC-006–CSC-009  
**Status:** Normative project control

## Control objective

Local code must communicate its intent and invariants to a future maintainer. Readability is a correctness and reviewability property: a reader should be able to follow inputs, state transitions, effects, and failures without reconstructing hidden conventions.

## Applicability

This control applies to new and changed code-quality decisions, artifacts, and agent-assisted work. Apply a clause where its stated condition exists. For existing behavior, use the control when that behavior is changed, relied on by a new capability, or assessed for a material risk. Product-specific choices remain governed by approved requirements and decision records.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### CQ-08.01 — Names MUST distinguish domain concepts, units, ownership…

**Requirement:** Names MUST distinguish domain concepts, units, ownership, lifetime, and state where ambiguity could cause misuse. Abbreviations are acceptable only when conventional for the audience; generic names such as `data`, `value`, `manager`, or `utils` require a narrow local context that makes their meaning unambiguous.

### CQ-08.02 — A function SHOULD have one primary purpose, explicit…

**Requirement:** A function SHOULD have one primary purpose, explicit inputs and outputs, and bounded side effects. Split it when doing so clarifies a meaningful step or enables independent verification; do not fragment straightforward logic into chains of trivial wrappers that hide the flow.

### CQ-08.03 — Prefer straightforward branches and explicit state transitions over deeply…

**Requirement:** Prefer straightforward branches and explicit state transitions over deeply nested conditions, hidden fallthrough, boolean mode flags, implicit retries, and mutation spread across callbacks. When complexity is necessary, name the states and transitions and test invalid or interrupted transitions.

### CQ-08.04 — Use domain-specific types, enums, and constructors when…

**Requirement:** Use domain-specific types, enums, and constructors when they prevent mixing units, identities, states, or validated/unvalidated data. At dynamic boundaries, validate before side effects; do not rely on a type name or comment to imply an invariant that constructors and mutation can violate.

### CQ-08.05 — Callers and reviewers MUST be able to identify I/O…

**Requirement:** Callers and reviewers MUST be able to identify I/O, allocation, blocking, locking, spawning, global state, and cancellation behavior from the API or local structure. In Rust, ownership and borrowing SHOULD express lifetime and mutation rules directly; synchronization primitives MUST match the required semantics.

### CQ-08.06 — Propagate errors with relevant context when the caller can…

**Requirement:** Propagate errors with relevant context when the caller can recover or choose policy. Translate errors at a public boundary into stable, safe categories. Do not discard errors, panic on expected environmental or user input failures, or convert distinct failure modes into success-shaped defaults.

### CQ-08.07 — Comments MUST explain why a constraint, workaround…

**Requirement:** Comments MUST explain why a constraint, workaround, unsafe operation, ordering, or non-obvious tradeoff exists and how it can be safely changed. Comments MUST remain consistent with code; remove restatements and stale TODOs or give each TODO an owner and actionable trigger.

### CQ-08.08 — Before extracting a helper, trait, generic…

**Requirement:** Before extracting a helper, trait, generic, macro, or framework, identify repeated behavior and its invariant. Consolidate only when callers genuinely share semantics; use explicit separate implementations when similar code has different security, lifecycle, failure, or performance meaning.

### CQ-08.09 — Use the repository formatter and lint policy for mechanical…

**Requirement:** Use the repository formatter and lint policy for mechanical consistency. Human review SHOULD focus on behavior, naming, invariants, and clarity rather than re-litigating formatter-owned details; exceptions MUST be narrow and justified.

## Prohibited conditions

- Do not use clever syntax, macros, generics, or implicit conversions when a direct expression is easier to verify.
- Do not encode distinct domain states as unrelated booleans when an explicit state type is clearer.
- Do not leave comments that claim guarantees the code does not enforce.

## Decision procedure

Ask a reviewer unfamiliar with the change to trace representative success, invalid-input, and failure paths. If the explanation requires oral context, hidden global knowledge, or reconstructing undocumented state, improve names, structure, types, or durable documentation and repeat the review.

## Assessment procedure

### Examine

- Trace the applicable CQ-08 clauses to the decision owner, chosen design, implementation boundary, and retained evidence. Review both the selected approach and the material alternatives rejected.
- Check the relevant source, configuration, tests, operational procedures, and compatibility obligations; confirm that the rationale matches the implemented behavior.

### Interview

- Ask the accountable owner to explain the decision trigger, constraints, alternatives, failure behavior, and conditions that would cause reconsideration. Confirm the explanation against records and behavior.

### Test

- Execute the document-specific checks in the Decision procedure on the affected revision. Exercise at least one relevant boundary, failure, or change scenario; record expected and actual results.

## Assessment determination

Pass requires each applicable MUST to be met with current evidence and any SHOULD deviation to have a reasoned record. Fail when the selected pattern violates a stated decision criterion, enforcement is bypassable, a required case is unhandled, or evidence is missing/stale. Not applicable requires a stated condition and reviewer rationale.

## Required evidence

- Decision/change record identifying applicable CQ-08 clauses, owner, scope, alternatives, constraints, and reasons.
- Tests, analysis, or operational evidence showing normal, boundary, failure, and change behavior relevant to the decision.
- Approved exception record for any unmet requirement, with scope, risk, compensation, owner, approval, and expiry.

## Exceptions and nonconformance

A MUST deviation requires approval from the accountable engineering or product owner before release. Record affected control IDs and profiles, risk, compensating controls, remediation owner, and review/expiry date. An exception does not amend the rule; recurring exceptions require revising the rule or resolving the underlying decision.

## Reference trail

Source IDs R1,R4,R5 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform the control but do not replace its project-specific requirements.
