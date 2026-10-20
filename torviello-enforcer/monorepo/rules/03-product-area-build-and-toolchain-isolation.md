# Product-area build and toolchain isolation

**Control family:** monorepo  
**Control document:** MON-03  
**Requirement trace:** PA-020–PA-024, ED-001, ED-010  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **product-area build and toolchain isolation** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed monorepo behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### MON-03.01 — Each product area MUST own its dependency manifest…

**Requirement:** Each product area MUST own its dependency manifest, toolchain version, build/test/lint commands, generated outputs, secrets boundary, and deployment configuration.

### MON-03.02 — The engine MUST build and test without installing website…

**Requirement:** The engine MUST build and test without installing website, demo-media, documentation-site, or hosted-platform toolchains unless an explicit shared interface requires them.

### MON-03.03 — Changes to shared code MUST identify all consuming product…

**Requirement:** Changes to shared code MUST identify all consuming product areas and run their relevant contract, build, and compatibility checks. A shared-library API change MUST include migration guidance for each consumer.

### MON-03.04 — CI MUST select jobs by changed ownership paths…

**Requirement:** CI MUST select jobs by changed ownership paths and declared dependency graph while still running repository-wide checks for shared build logic, release workflows, and security policies.

### MON-03.05 — Product areas MUST not share mutable generated state…

**Requirement:** Product areas MUST not share mutable generated state, caches, environment files, or credentials unless the shared mechanism is explicitly owned and access-controlled.

### MON-03.06 — Cross-area interfaces MUST use versioned contracts for API schemas…

**Requirement:** Cross-area interfaces MUST use versioned contracts for API schemas, model metadata, design tokens, content pipelines, and artifact handoff where independently deployed or built.

### MON-03.07 — Ownership boundaries MUST identify a responsible maintainer or decision…

**Requirement:** Ownership boundaries MUST identify a responsible maintainer or decision owner; automated code ownership rules MUST be synchronized with the documented map.

## Prohibited conditions

- Do not make a frontend or content toolchain a transitive compile prerequisite for the standalone engine.
- Do not share a single broad CI secret across unrelated product areas.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to product-area build and toolchain isolation. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Build each product area from a clean checkout with unrelated toolchains absent; inspect path-filtered CI behavior and shared-contract consumer coverage.
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

Source IDs R1 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
