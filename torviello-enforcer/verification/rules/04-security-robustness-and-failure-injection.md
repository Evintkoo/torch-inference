# Security, robustness, and failure-injection testing

**Control family:** verification  
**Control document:** VER-04  
**Requirement trace:** ED-010–ED-014, SO-010–SO-014, SO-030–SO-032  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **security, robustness, and failure-injection testing** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed verification behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### VER-04.01 — Every trust boundary MUST have negative tests for malformed…

**Requirement:** Every trust boundary MUST have negative tests for malformed, unauthorized, oversized, replayed, stale, concurrent, and unavailable inputs relevant to that boundary.

### VER-04.02 — Parsers for HTTP bodies, TOML, model metadata…

**Requirement:** Parsers for HTTP bodies, TOML, model metadata, archives, image/audio formats, and update manifests MUST be tested for malformed structures, truncation, extreme nesting, integer overflow, decompression expansion, path escape, and resource exhaustion as applicable.

### VER-04.03 — Failure injection MUST cover network timeout/reset, DNS/TLS failure…

**Requirement:** Failure injection MUST cover network timeout/reset, DNS/TLS failure, disk full, database unavailable, partial write, process restart, accelerator loss, model load failure, and cancellation for profiles that depend on those components.

### VER-04.04 — Confirmed security defects MUST produce minimized regression fixtures…

**Requirement:** Confirmed security defects MUST produce minimized regression fixtures and tests that fail on the vulnerable behavior and pass on the fix.

### VER-04.05 — Fuzz and property-based tests MUST enforce execution and memory…

**Requirement:** Fuzz and property-based tests MUST enforce execution and memory budgets, preserve seed/corpus provenance, and avoid access to production credentials or network targets.

### VER-04.06 — Dynamic security testing MUST use an isolated environment…

**Requirement:** Dynamic security testing MUST use an isolated environment, synthetic accounts/data, explicit target authorization, and controlled cleanup; test findings MUST be triaged before release.

### VER-04.07 — Fault tests MUST verify recovery and cleanup as well…

**Requirement:** Fault tests MUST verify recovery and cleanup as well as detection: no leaked work, stale readiness, partially published state, corrupted registry, or silent data loss.

## Prohibited conditions

- Do not fuzz arbitrary third-party production endpoints or use real user data as a test corpus without authorization.
- Do not treat fault detection alone as successful recovery.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to security, robustness, and failure-injection testing. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Run targeted fuzzing and failure-injection scenarios; verify bounded termination, state integrity, observability, and repeatable regression evidence.
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
