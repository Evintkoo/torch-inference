# Retention, privacy, and diagnostic access

**Control family:** observability  
**Control document:** OBS-05  
**Requirement trace:** SO-020–SO-024, SO-004  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **retention, privacy, and diagnostic access** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed observability behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### OBS-05.01 — Logs, traces, metrics, crash reports…

**Requirement:** Logs, traces, metrics, crash reports, and support bundles MUST each have a stated purpose, data classification, retention period, storage location, access policy, and deletion mechanism.

### OBS-05.02 — Inference prompts, completions, uploaded files, model…

**Requirement:** Inference prompts, completions, uploaded files, model outputs, credentials, and direct identifiers MUST not be collected by default for diagnostics. Any opt-in collection MUST disclose fields, purpose, destination, retention, and how to disable/delete it.

### OBS-05.03 — Structured fields MUST use an allowlist or explicit classification…

**Requirement:** Structured fields MUST use an allowlist or explicit classification policy. Redaction MUST occur before persistence or export, and tests MUST cover nested fields, exception strings, URLs, query parameters, and malformed input.

### OBS-05.04 — Diagnostic access MUST be least-privilege and audited when it…

**Requirement:** Diagnostic access MUST be least-privilege and audited when it permits viewing security events, user identifiers, or sensitive inference content.

### OBS-05.05 — Log rotation and storage limits MUST prevent disk exhaustion…

**Requirement:** Log rotation and storage limits MUST prevent disk exhaustion; behavior when storage is full MUST preserve service safety and surface a bounded alert.

### OBS-05.06 — Telemetry pseudonyms and correlation identifiers MUST have bounded lifetime…

**Requirement:** Telemetry pseudonyms and correlation identifiers MUST have bounded lifetime and MUST NOT be reused as authentication credentials or stable cross-service user profiles.

### OBS-05.07 — Support bundles MUST be previewable or field-selectable before export…

**Requirement:** Support bundles MUST be previewable or field-selectable before export and MUST exclude secrets and user payloads unless explicitly selected under an approved support workflow.

## Prohibited conditions

- Do not treat local log files as inherently private or safe.
- Do not retain sensitive telemetry indefinitely because storage is inexpensive.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to retention, privacy, and diagnostic access. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Seed synthetic secrets and personal-like data through failure paths; inspect persisted/exported records, access controls, retention expiry, disk-full behavior, and bundle preview.
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
