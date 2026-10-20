# Documentation architecture and content types

**Control family:** documentation-and-design  
**Control document:** DOC-03  
**Requirement trace:** ED-030–ED-032, PA-031  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **documentation architecture and content types** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed documentation-and-design behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### DOC-03.01 — Documentation MUST be organized by reader task: learning…

**Requirement:** Documentation MUST be organized by reader task: learning a first workflow, completing a task, consulting authoritative reference, or understanding design rationale. Each page MUST have one primary purpose and link to adjacent page types instead of combining them indiscriminately.

### DOC-03.02 — Product documentation MUST identify supported package/profile, prerequisites…

**Requirement:** Product documentation MUST identify supported package/profile, prerequisites, exact commands, expected output, failure recovery, and version scope. Commands MUST be tested in a clean checkout or explicitly marked as illustrative.

### DOC-03.03 — API, configuration, CLI, model descriptor…

**Requirement:** API, configuration, CLI, model descriptor, and deployment reference pages MUST derive from or be checked against the authoritative contract/schema. Every example MUST specify whether it is complete, partial, illustrative, or unsafe for production.

### DOC-03.04 — Architecture diagrams MUST identify scope, legend, trust…

**Requirement:** Architecture diagrams MUST identify scope, legend, trust boundaries, runtime and build-time dependencies, data flow, deployment profile, and version reviewed. Diagrams MUST be updated when the represented behavior changes.

### DOC-03.05 — Documentation navigation MUST reveal supported paths, lifecycle state…

**Requirement:** Documentation navigation MUST reveal supported paths, lifecycle state, audience, and deprecated guidance. Archived or unsupported instructions MUST be clearly marked and excluded from default search or onboarding routes.

### DOC-03.06 — Published documentation MUST be built from versioned repository source…

**Requirement:** Published documentation MUST be built from versioned repository source with reproducible dependencies. Local preview and link/example validation MUST be available to contributors; publication failure MUST be visible.

### DOC-03.07 — User-facing documentation MUST explain destructive actions, network access…

**Requirement:** User-facing documentation MUST explain destructive actions, network access, data retention, model downloads, resource needs, and required privileges before the user commits to them.

## Prohibited conditions

- Do not keep conflicting quick-start copies with different commands or configuration schemas.
- Do not describe planned capabilities as available or use screenshots that conceal required warnings and choices.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to documentation architecture and content types. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Build the site from a clean checkout; test links, code snippets, generated references, version selectors, and critical first-run procedures.
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

Source IDs R1,R2 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
