# Privacy, data minimization, and inference boundaries

**Control family:** security  
**Control document:** SEC-09  
**Requirement trace:** SO-004, SO-010–SO-014, SO-020–SO-024, RP-032–RP-034  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **privacy, data minimization, and inference boundaries** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed security behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### SEC-09.01 — Each product profile MUST identify personal, sensitive…

**Requirement:** Each product profile MUST identify personal, sensitive, confidential, and security-relevant data processed at collection, inference, persistence, telemetry, support, and deletion boundaries.

### SEC-09.02 — Inference inputs and outputs MUST be processed in memory…

**Requirement:** Inference inputs and outputs MUST be processed in memory only by default. Persistence, remote export, training reuse, analytics, or support access MUST require explicit product behavior, disclosure, and retention controls.

### SEC-09.03 — Data collection MUST be limited to fields necessary…

**Requirement:** Data collection MUST be limited to fields necessary for a stated feature or operational purpose. Optional telemetry MUST be opt-in for local/offline profiles and MUST expose a clear disable path.

### SEC-09.04 — Access to stored prompts, outputs, credentials…

**Requirement:** Access to stored prompts, outputs, credentials, identity records, and audit data MUST be separated by role and purpose; support access MUST be time-bounded, approved, and audited.

### SEC-09.05 — Privacy-sensitive operations MUST define deletion scope, backup expiry…

**Requirement:** Privacy-sensitive operations MUST define deletion scope, backup expiry, export, retention exceptions, and legal hold behavior before implementation.

### SEC-09.06 — Privacy risk review MUST consider inference re-identification, model…

**Requirement:** Privacy risk review MUST consider inference re-identification, model memorization claims, prompt injection into logs, third-party provider handling, and accidental output exposure through caches or shared traces.

### SEC-09.07 — Incident response MUST include a process to determine whether…

**Requirement:** Incident response MUST include a process to determine whether personal or sensitive data was exposed, preserve minimal forensic evidence, contain access, and notify affected parties according to approved legal/product policy.

## Prohibited conditions

- Do not promise that model outputs are anonymous or private without evaluation and a defined system boundary.
- Do not reuse customer prompts or outputs for model training or product analytics by implication.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to privacy, data minimization, and inference boundaries. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Trace synthetic sensitive markers across API, logs, traces, metrics, storage, exports, crash reports, caches, and support bundles; verify deletion and opt-out behavior.
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
