# Test levels, contracts, and deterministic fixtures

**Control family:** verification  
**Control document:** VER-03  
**Requirement trace:** ED-010–ED-014, CSC-009  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **test levels, contracts, and deterministic fixtures** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed verification behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### VER-03.01 — Unit tests MUST validate deterministic logic at module boundaries…

**Requirement:** Unit tests MUST validate deterministic logic at module boundaries; integration tests MUST validate adapters, persistence, and service contracts; end-to-end tests MUST validate representative user/operator journeys; system tests MUST validate deployment and resource behavior.

### VER-03.02 — Test ownership MUST follow product-area ownership. A shared…

**Requirement:** Test ownership MUST follow product-area ownership. A shared contract change MUST include consumer contract tests for every supported implementation or deployment profile that relies on it.

### VER-03.03 — Test names and directory placement MUST expose the behavior…

**Requirement:** Test names and directory placement MUST expose the behavior and level under test; tests MUST not depend on incidental private call order unless that order is a public invariant.

### VER-03.04 — Fixtures MUST be deterministic, versioned where behavior depends…

**Requirement:** Fixtures MUST be deterministic, versioned where behavior depends on them, licensed, and free of production secrets or user content. Randomized/property tests MUST record seeds when reproducing failures.

### VER-03.05 — Each acceptance criterion MUST map to one or more…

**Requirement:** Each acceptance criterion MUST map to one or more tests or an explicitly assigned manual assessment with owner, procedure, expected result, and release gate.

### VER-03.06 — Test isolation MUST prevent parallel tests from sharing mutable…

**Requirement:** Test isolation MUST prevent parallel tests from sharing mutable filesystem, database, port, model cache, credentials, or GPU state unless concurrency is itself under test.

### VER-03.07 — Test failure output MUST preserve enough context to debug…

**Requirement:** Test failure output MUST preserve enough context to debug without printing sensitive payloads or making success depend on external service availability.

## Prohibited conditions

- Do not classify a test as end-to-end merely because it starts a process; it must exercise a user-visible contract.
- Do not silently skip required suites when hardware, models, or external services are unavailable.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to test levels, contracts, and deterministic fixtures. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Run test categories independently and concurrently where designed; repeat with randomized order and verify deterministic seed replay, cleanup, fixture integrity, and CI parity.
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
