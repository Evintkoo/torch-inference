# Application security testing and control coverage

**Control family:** security  
**Control document:** SEC-11  
**Requirement trace:** SO-010–SO-014, ED-011, ED-014  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **application security testing and control coverage** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed security behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### SEC-11.01 — Every externally reachable or privileged feature MUST have…

**Requirement:** Every externally reachable or privileged feature MUST have a threat-informed security test plan covering actors, assets, entry points, trust boundaries, abuse cases, and expected denial behavior.

### SEC-11.02 — Production APIs MUST be assessed against applicable OWASP ASVS…

**Requirement:** Production APIs MUST be assessed against applicable OWASP ASVS 5.0.0 requirements, and AI/model lifecycle controls against applicable OWASP AISVS 1.01 requirements; the exact versioned control IDs, exclusions, and evidence MUST be recorded.

### SEC-11.03 — API risk review MUST account for OWASP API Security…

**Requirement:** API risk review MUST account for OWASP API Security Top 10 risks including object/property/function authorization, authentication, resource consumption, sensitive business flow abuse, SSRF, misconfiguration, inventory, and unsafe upstream API consumption where applicable.

### SEC-11.04 — Automated tests MUST include static analysis, dependency…

**Requirement:** Automated tests MUST include static analysis, dependency and secret checks, and dynamic or integration tests appropriate to exposed interfaces. Scanner findings MUST be triaged; scanner silence MUST not substitute for design review or targeted tests.

### SEC-11.05 — Untrusted parsers, archive handling, model formats…

**Requirement:** Untrusted parsers, archive handling, model formats, and protocol boundaries SHOULD receive property-based or fuzz testing with time/memory bounds and retained regression cases for confirmed defects.

### SEC-11.06 — Security test fixtures MUST be synthetic or approved…

**Requirement:** Security test fixtures MUST be synthetic or approved, isolated from production credentials, and cleaned after use; test artifacts MUST be access-controlled when they contain vulnerability details.

### SEC-11.07 — Release security review MUST verify unresolved findings, exceptions…

**Requirement:** Release security review MUST verify unresolved findings, exceptions, threat-model changes, dependency exposure, model integrity, and patch status for each shipped profile.

## Prohibited conditions

- Do not claim “OWASP compliant” because a checklist or scanner passed.
- Do not leave known exploitable findings unowned or without an explicit release decision.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to application security testing and control coverage. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Reconcile ASVS/AISVS/API risk IDs with test evidence; run negative authorization, parser fuzz, dependency, secret, dynamic, and release-gate checks for relevant attack surfaces.
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

Source IDs R1,R2,R4,R5 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
