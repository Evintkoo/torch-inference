# Domain-Driven Design (DDD)

**Control family:** governance
**Control document:** GOV-06
**Requirement trace:** CSC-005, ED-050, ED-055
**Status:** Normative project control

## Control objective

Behavior-changing work MUST start from the business domain: the concepts that must exist, their invariants, their bounded contexts, and their owners. DDD establishes the meaning that specifications, contracts, tests, and evaluations trace back to. This control is additive to the existing domain controls and does not replace them.

## Applicability

This control applies to every feature, remediation, and agent-assisted change that introduces or changes business behavior, business rules, or domain ownership. A purely mechanical change that does not affect domain meaning MAY be recorded as not applicable with a decision owner. Product-specific choices remain governed by approved requirements and decision records.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### GOV-06.01 — Work that changes behavior MUST begin with a domain model…

**Requirement:** Work that changes behavior MUST begin with a domain model identifying the bounded context, business concepts, invariants, ownership, and the events or state transitions that matter. The model MUST be established before specifications and implementation, and MAY be revised when later stages expose a gap.

### GOV-06.02 — The repository MUST contain maintained domain artifacts…

**Requirement:** The repository MUST contain maintained domain artifacts that capture the domain model, ubiquitous language or glossary, business rules and invariants, bounded contexts, and ownership. These artifacts MUST live in a discoverable location, and physical separation from code is OPTIONAL; discoverability is REQUIRED.

### GOV-06.03 — A business concept or invariant MUST NOT exist only in…

**Requirement:** A business concept or invariant MUST NOT exist only in infrastructure names, database tables, or scattered code. Each business rule MUST be stated in a domain artifact and referenced by the specification that realizes it.

### GOV-06.04 — Every domain rule MUST have a stable identifier and MUST be…

**Requirement:** Every domain rule MUST have a stable identifier and MUST be traceable forward to its specification, contract, tests, and evaluation evidence. A domain rule with no forward reference MUST be treated as unimplemented or unverified, not as satisfied.

### GOV-06.05 — A change to the domain model MUST update affected…

**Requirement:** A change to the domain model MUST update the affected specifications, contracts, tests, and evaluations in the same change, or record why an affected artifact is unchanged. Silent domain drift between the model and the implementation is prohibited.

## Prohibited conditions

- Treating code or database names as the only definition of a business concept.
- Claiming DDD was performed because a document exists while no rule is traceable to verification.
- Changing a business invariant in code without updating the domain artifact and its dependent specifications.
- Creating multiple conflicting glossaries or bounded-context definitions without an owner decision.

## Assessment procedure

1. Locate the domain artifacts for the change and confirm the bounded context and ownership.
2. Confirm the business rules and invariants affected by the change are stated and have stable identifiers.
3. Follow each affected rule forward to its specification, contract, tests, and evaluation evidence.
4. Check that the implementation does not introduce a business rule that the domain artifact does not state.
5. Record the artifact locations, traceability result, and any unresolved ownership in the governance assurance register.

## Assessment determination

The control passes only when the domain model and invariants are documented for the affected context, each affected rule has a stable identifier and resolvable forward trace, and the implementation does not contradict the model. Missing domain artifacts, code-only rules, or broken forward traces are failures. A recorded not-applicable decision with a decision owner is acceptable only when the change has no domain effect.

## Required evidence

- Domain model, glossary or ubiquitous language, and bounded-context map.
- Business rules and invariants with stable identifiers.
- Ownership and decision records for domain boundaries.
- Forward trace from each affected rule to specification, contract, tests, and evaluation.
- Locations of the artifacts in the repository.

## Exceptions and nonconformance

An exception MUST identify the affected clauses, reason, risk, compensating controls, accountable approver, remediation owner, and expiry/review date, and MUST be recorded in the [assurance register](../assurance-register.md) before it is effective. A change whose domain rule cannot be traced forward is nonconforming and MUST NOT be reported as passing.

## Implementation guidance

Keep the domain artifact close to the specifications it feeds. Use stable rule identifiers that also appear in the specification and tests so tooling can verify the forward trace.

## Reference trail

See [00-references-trails.md](../trails/00-references-trails.md) for sources and requirement mapping.
