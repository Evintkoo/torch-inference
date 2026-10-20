# System-level maintainability and quality attributes

**Control family:** code-quality  
**Control document:** CQ-06  
**Requirement trace:** ED-001–ED-005, ED-014, ED-042, PA-010–PA-014, CSC-006–CSC-010  
**Status:** Normative project control

## Control objective

System maintainability is the ability to understand, change, verify, operate, and safely retire the product without disproportionate cost or risk. It is a system quality attribute shaped by architecture, team boundaries, dependencies, tests, documentation, and operational feedback—not a source-file metric alone.

## Applicability

This control applies to new and changed code-quality decisions, artifacts, and agent-assisted work. Apply a clause where its stated condition exists. For existing behavior, use the control when that behavior is changed, relied on by a new capability, or assessed for a material risk. Product-specific choices remain governed by approved requirements and decision records.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### CQ-06.01 — For a substantial feature or architecture change, identify…

**Requirement:** For a substantial feature or architecture change, identify affected quality attributes such as correctness, security, reliability, compatibility, performance, portability, operability, testability, and modifiability. State measurable scenarios, affected stakeholders, constraints, and tradeoffs; do not optimize one attribute while leaving material effects on the others unexamined.

### CQ-06.02 — Assess how many components, teams, deployment profiles…

**Requirement:** Assess how many components, teams, deployment profiles, data stores, APIs, and release artifacts MUST change for a representative future change. Reduce unnecessary change amplification through clear ownership and stable contracts, while preserving explicit coupling where consistency or latency requires it.

### CQ-06.03 — Before adopting a pattern such as layered architecture…

**Requirement:** Before adopting a pattern such as layered architecture, ports-and-adapters, event-driven messaging, plugin architecture, actor isolation, or shared libraries, state the forces it addresses, constraints, consistency needs, failure behavior, operational burden, and simpler alternatives. Use the pattern only when it improves the measured or reviewable system property.

### CQ-06.04 — A decision that changes trust boundaries, module ownership…

**Requirement:** A decision that changes trust boundaries, module ownership, deployment topology, public contracts, persistence, concurrency, or supported platforms MUST record context, constraints, alternatives, consequences, rejected options, and revisit triggers. Keep the record current when implementation materially diverges.

### CQ-06.05 — Where a boundary is essential to product quality…

**Requirement:** Where a boundary is essential to product quality, encode it in dependency checks, API contract tests, build profiles, schema validation, fitness functions, or release gates. A diagram or guideline alone is insufficient when an automated check is practical and the boundary is frequently violated.

### CQ-06.06 — Use defect recurrence, lead time for representative changes…

**Requirement:** Use defect recurrence, lead time for representative changes, dependency coupling, failed change rate, time to diagnose, flaky tests, and support incidents as contextual signals. No single metric or fixed threshold proves maintainability; interpret trends with code ownership, product change rate, and system scale.

### CQ-06.07 — A module, service, abstraction, or repository…

**Requirement:** A module, service, abstraction, or repository split MUST have a clear owner and contract and justify the costs it adds in build, deployment, observability, versioning, network failure, testing, and operations. Prefer an in-process module when isolation or independent deployment does not justify a separate service.

### CQ-06.08 — Design reviews MUST consider upgrade, migration, rollback…

**Requirement:** Design reviews MUST consider upgrade, migration, rollback, backward compatibility, data export/deletion, dependency end-of-life, and decommissioning where relevant. A design that is easy to launch but has no safe migration or retirement path is not maintainable.

### CQ-06.09 — Material production incidents, recurring workarounds, high change…

**Requirement:** Material production incidents, recurring workarounds, high change amplification, repeated exceptions, or inability to test a boundary MUST trigger an architecture and maintainability review with an owner and disposition.

## Prohibited conditions

- Do not treat a microservice, plugin, abstraction, or design pattern as inherently more maintainable.
- Do not use line count, test coverage percentage, or complexity score as the sole quality decision.
- Do not add speculative extension points without a demonstrated use case and owner.

## Decision procedure

For the changed system boundary, compare at least two viable approaches when the decision is consequential. Evaluate change impact, failure containment, testability, deployment/operational burden, compatibility, and retirement. Verify any claimed boundary with an automated check or a documented reason why one is impractical.

## Assessment procedure

### Examine

- Trace the applicable CQ-06 clauses to the decision owner, chosen design, implementation boundary, and retained evidence. Review both the selected approach and the material alternatives rejected.
- Check the relevant source, configuration, tests, operational procedures, and compatibility obligations; confirm that the rationale matches the implemented behavior.

### Interview

- Ask the accountable owner to explain the decision trigger, constraints, alternatives, failure behavior, and conditions that would cause reconsideration. Confirm the explanation against records and behavior.

### Test

- Execute the document-specific checks in the Decision procedure on the affected revision. Exercise at least one relevant boundary, failure, or change scenario; record expected and actual results.

## Assessment determination

Pass requires each applicable MUST to be met with current evidence and any SHOULD deviation to have a reasoned record. Fail when the selected pattern violates a stated decision criterion, enforcement is bypassable, a required case is unhandled, or evidence is missing/stale. Not applicable requires a stated condition and reviewer rationale.

## Required evidence

- Decision/change record identifying applicable CQ-06 clauses, owner, scope, alternatives, constraints, and reasons.
- Tests, analysis, or operational evidence showing normal, boundary, failure, and change behavior relevant to the decision.
- Approved exception record for any unmet requirement, with scope, risk, compensation, owner, approval, and expiry.

## Exceptions and nonconformance

A MUST deviation requires approval from the accountable engineering or product owner before release. Record affected control IDs and profiles, risk, compensating controls, remediation owner, and review/expiry date. An exception does not amend the rule; recurring exceptions require revising the rule or resolving the underlying decision.

## Reference trail

Source IDs R2,R5,R6 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform the control but do not replace its project-specific requirements.
