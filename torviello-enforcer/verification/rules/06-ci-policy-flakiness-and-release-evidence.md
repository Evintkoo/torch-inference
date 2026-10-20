# CI policy, flakiness, and release evidence

**Control family:** verification  
**Control document:** VER-06  
**Requirement trace:** ED-010–ED-014, ED-020–ED-023  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **ci policy, flakiness, and release evidence** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed verification behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### VER-06.01 — CI MUST define required checks by change class…

**Requirement:** CI MUST define required checks by change class and product area, protect release branches, and ensure required workflows cannot be bypassed by path filters, job cancellation, or missing credentials.

### VER-06.02 — Every required job MUST publish tool versions, command…

**Requirement:** Every required job MUST publish tool versions, command, target/profile, result, and machine-readable test or artifact metadata sufficient to reproduce its outcome.

### VER-06.03 — Flaky tests MUST be tracked with owner, issue…

**Requirement:** Flaky tests MUST be tracked with owner, issue, failure signature, quarantine scope, expiry, and remediation target. Quarantined tests MUST remain visible and MUST not count as passing coverage.

### VER-06.04 — Build caches MUST be keyed by source, toolchain…

**Requirement:** Build caches MUST be keyed by source, toolchain, target, features, and relevant environment inputs; untrusted jobs MUST not write cache entries consumed by privileged release jobs.

### VER-06.05 — Release evidence MUST bind source revision, workflow/builder identity…

**Requirement:** Release evidence MUST bind source revision, workflow/builder identity, resolved dependencies, test results, artifact digests, SBOM, provenance, signatures, and approval to one immutable release candidate.

### VER-06.06 — CI artifacts MUST have retention and access policies…

**Requirement:** CI artifacts MUST have retention and access policies; logs and test outputs MUST redact secrets and sensitive payloads before upload.

### VER-06.07 — A release MUST fail closed when a required check…

**Requirement:** A release MUST fail closed when a required check is unknown, missing, stale, or executed against a different candidate digest.

## Prohibited conditions

- Do not suppress or retry a flaky test until green without preserving the original failure evidence.
- Do not share privileged signing credentials with general test jobs.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to ci policy, flakiness, and release evidence. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Test branch protection with deliberate failing/missing jobs; inspect cache isolation, artifact redaction, stale evidence rejection, and immutable candidate binding.
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
