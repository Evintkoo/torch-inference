# Specification-Driven Development (SDD)

**Control family:** governance
**Control document:** GOV-07
**Requirement trace:** CSC-005, ED-011, ED-042, ED-051, ED-055
**Status:** Normative project control

## Control objective

Specification-Driven Development states exactly what the system must do before implementation. A specification MUST turn domain rules into testable use cases, functional requirements with stable identifiers, edge cases, and observable acceptance criteria so that implementation, contracts, tests, and evaluation share one unambiguous target.

## Applicability

This control applies to every feature, remediation, and agent-assisted change that alters observable behavior or acceptance criteria. A change with no observable behavior effect MAY record SDD as not applicable with a decision owner. Product-specific choices remain governed by approved requirements and decision records.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### GOV-07.01 — A feature or behavior change MUST have a specification before…

**Requirement:** A feature or behavior change MUST have a specification before implementation that states its use cases, functional requirements with stable identifiers, edge cases, and acceptance criteria. The specification MUST identify the domain rules it realizes.

### GOV-07.02 — Acceptance criteria MUST be observable, testable, and…

**Requirement:** Acceptance criteria MUST be observable, testable, and unambiguous. A specification MUST state the given conditions, the action, and the expected outcome, or an equivalent executable scenario form. Subjective qualities MUST be expressed as measurable criteria.

### GOV-07.03 — Every functional requirement MUST have a stable identifier that…

**Requirement:** Every functional requirement MUST have a stable identifier that resolves in the repository, and each identifier MUST be referenced by the contract, tests, or evaluation evidence that verifies it. A dangling or reused identifier is a defect.

### GOV-07.04 — Acceptance checks MUST be defined before implementation…

**Requirement:** Acceptance checks MUST be defined before implementation, and the plan MUST map each requirement identifier to the check, expected outcome, and whether the check runs automatically or manually. A specification without verification intent MUST NOT be treated as approved.

### GOV-07.05 — An approved specification MUST NOT be rewritten, narrowed, or…

**Requirement:** An approved specification MUST NOT be rewritten, narrowed, or silently reinterpreted to make an implementation pass. A necessary change to approved behavior REQUIRES human authority and MUST be recorded as a specification change with the decision owner and the affected requirements.

### GOV-07.06 — Specifications MUST remain discoverable and consistent with…

**Requirement:** Specifications MUST remain discoverable and consistent with the domain model, contracts, and delivered behavior. Contradictions between a specification and the shipped behavior MUST be reported as nonconformance rather than resolved by editing the specification alone.

## Prohibited conditions

- Implementing behavior before any testable acceptance criteria exist.
- Using vague criteria such as "works well" or "fast enough" without a measurable threshold.
- Referring to requirement identifiers that do not resolve in the repository.
- Rewriting or narrowing an approved specification to match a convenient implementation.
- Treating a specification document alone as evidence that behavior exists.

## Assessment procedure

1. Locate the specification and confirm it identifies the affected domain rules.
2. Confirm use cases, edge cases, requirement identifiers, and acceptance criteria are present and testable.
3. Verify each identifier resolves and is referenced by a contract, test, or evaluation record.
4. Compare the specified behavior with the implemented and evaluated behavior.
5. Record the result, including any specification changes and their authority, in the governance assurance register.

## Assessment determination

The control passes only when the specification exists before implementation, criteria are observable and testable, identifiers resolve and are referenced by verification evidence, and no approved behavior was silently changed. Missing criteria, dangling identifiers, or unrecorded specification changes are failures.

## Required evidence

- Specification with use cases, edge cases, and stable requirement identifiers.
- Acceptance criteria in observable, testable form.
- Plan mapping requirement identifiers to checks and expected outcomes.
- Links from specification identifiers to domain rules, contracts, tests, and evaluation evidence.
- Decision record for any change to approved behavior.

## Exceptions and nonconformance

An exception MUST identify the affected clauses, reason, risk, compensating controls, accountable approver, remediation owner, and expiry/review date, and MUST be recorded in the [assurance register](../assurance-register.md) before it is effective. Delivered behavior that contradicts an approved specification without an authorized change is nonconforming and MUST NOT be reported as passing.

## Implementation guidance

Prefer executable scenario files or specification sections with stable identifiers. Keep the identifier on every test and contract so the plan-to-verification mapping is mechanical.

## Reference trail

See [00-references-trails.md](../trails/00-references-trails.md) for sources and requirement mapping.
