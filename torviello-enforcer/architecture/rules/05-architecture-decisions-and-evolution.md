# Architecture decisions and evolution

**Control family:** architecture  
**Control document:** ARC-05  
**Requirement trace:** PA-010–PA-014, RP-011–RP-015, ED-005  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **architecture decisions and evolution** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed architecture behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### ARC-05.01 — A decision record MUST be created before committing…

**Requirement:** A decision record MUST be created before committing to a material change in module boundaries, public protocols, build profiles, backend abstraction, persistence, hosted/local split, or compatibility policy.

### ARC-05.02 — Each decision record MUST state status, date…

**Requirement:** Each decision record MUST state status, date, owner, context, requirements, constraints, options considered, decision, consequences, security and operational implications, migration path, and superseded decisions.

### ARC-05.03 — Architecture decisions MUST distinguish proven facts, measured results…

**Requirement:** Architecture decisions MUST distinguish proven facts, measured results, assumptions, and unresolved questions. Unverified assumptions that could invalidate the selection MUST become owned discovery tasks or open decisions.

### ARC-05.04 — Architecture evolution MUST preserve explicit compatibility guarantees or document…

**Requirement:** Architecture evolution MUST preserve explicit compatibility guarantees or document a versioned transition plan. A deprecated interface MUST have a removal condition and consumer migration path.

### ARC-05.05 — Architecture fitness checks SHOULD be automated for properties that…

**Requirement:** Architecture fitness checks SHOULD be automated for properties that can be checked mechanically, including allowed dependency direction, feature isolation, generated API compatibility, and forbidden production dependencies.

### ARC-05.06 — An architecture decision MUST NOT silently convert an optional hosted…

**Requirement:** An architecture decision MUST NOT silently convert an optional hosted capability into a runtime dependency for the standalone local profile; changes to offline assumptions require an explicit product decision.

## Prohibited conditions

- Do not record a decision after implementation merely to legitimize an undocumented choice.
- Do not claim a quality attribute such as portability, isolation, or offline operation without a scenario and verification evidence.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to architecture decisions and evolution. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Review the decision record and linked evidence; verify architecture fitness checks fail when a prohibited dependency or boundary regression is introduced.
- Exercise negative, boundary, and failure cases identified by the control; record actual versus expected behavior. A skipped required check is not passing evidence.

## Assessment determination

Assess each control ID as **pass**, **fail**, or **not applicable**. Pass requires every applicable MUST to be implemented and supported by current evidence. Fail applies when behavior contradicts a requirement, enforcement is bypassable, evidence is missing/stale, or a required scenario cannot be reproduced. Not applicable requires a condition stated by the requirement and reviewer rationale.

## Required evidence

- Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.

## Exceptions and nonconformance

A deviation from a MUST requirement requires accountable owner approval before release. Record affected control IDs and profiles, risk, compensating measures, remediation owner, and expiry/review date. A SHOULD deviation requires rationale and impact in the change record. An expired or unapproved exception is a nonconformance and MUST block a release when the affected control is release-critical.

## Reference trail

Source IDs R2,R3 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
