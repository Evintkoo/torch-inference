# User research, content, and design review

**Control family:** documentation-and-design  
**Control document:** DOC-05  
**Requirement trace:** PA-001, PA-030–PA-032, ED-030–ED-033  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **user research, content, and design review** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed documentation-and-design behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### DOC-05.01 — Design work MUST identify target user, task…

**Requirement:** Design work MUST identify target user, task, context of use, non-developer skill assumptions, accessibility needs, and failure cost before selecting a component or interaction pattern.

### DOC-05.02 — High-impact workflows MUST be validated with representative users…

**Requirement:** High-impact workflows MUST be validated with representative users or documented usability review before broad release. Evidence MUST identify the scenario, observed friction, and resulting design decision without exposing participant personal data.

### DOC-05.03 — User-facing error content MUST state what happened, what…

**Requirement:** User-facing error content MUST state what happened, what the user can safely do next, whether work was saved, and how to obtain support when recovery is not self-service.

### DOC-05.04 — Product copy MUST distinguish local from hosted behavior…

**Requirement:** Product copy MUST distinguish local from hosted behavior, required from optional network access, and free/personal from licensed/commercial use according to approved legal terms.

### DOC-05.05 — Demo and marketing media MUST identify the product version/profile…

**Requirement:** Demo and marketing media MUST identify the product version/profile shown, avoid implying unsupported performance or capabilities, include required third-party/model notices, and be reproducible from approved source assets where feasible.

### DOC-05.06 — Design reviews MUST include privacy, data disclosure…

**Requirement:** Design reviews MUST include privacy, data disclosure, permission boundaries, accessibility, narrow/large viewport behavior, empty and failure states, and supportability in addition to visual consistency.

### DOC-05.07 — When user research is not possible, the change…

**Requirement:** When user research is not possible, the change MUST record assumptions, risks, and a follow-up signal or feedback path rather than presenting assumptions as validated facts.

## Prohibited conditions

- Do not publish marketing claims that exceed measured support or legal approval.
- Do not use real user data in design prototypes or media unless it is explicitly authorized and protected.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to user research, content, and design review. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Review prototypes against task scenarios and evidence; inspect released UI for state coverage, claim accuracy, license notices, and feedback tracking.
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

Source IDs R1,R2,R3 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
