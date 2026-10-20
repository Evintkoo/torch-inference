# Traces, context propagation, and telemetry cost

**Control family:** observability  
**Control document:** OBS-03  
**Requirement trace:** SO-020–SO-024  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **traces, context propagation, and telemetry cost** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed observability behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### OBS-03.01 — Trace context MUST propagate across API handling, queues…

**Requirement:** Trace context MUST propagate across API handling, queues, model loading, inference, persistence, and external calls where causal relationships exist, using supported W3C trace context or an explicitly documented equivalent.

### OBS-03.02 — Incoming trace context MUST be validated and treated as…

**Requirement:** Incoming trace context MUST be validated and treated as untrusted. It MUST NOT authorize access, select an arbitrary exporter, or cause unbounded trace state or baggage growth.

### OBS-03.03 — Spans MUST represent operations with meaningful duration or cross-boundary…

**Requirement:** Spans MUST represent operations with meaningful duration or cross-boundary causality. Attributes MUST use stable semantic names, bounded values, documented units, and approved redaction rules.

### OBS-03.04 — Telemetry sampling MUST define head/tail behavior, error…

**Requirement:** Telemetry sampling MUST define head/tail behavior, error and latency retention, per-profile defaults, and operator controls. Sampling MUST NOT create an unbounded memory buffer or delay request completion.

### OBS-03.05 — Export MUST be optional for local/offline deployments. Exporter…

**Requirement:** Export MUST be optional for local/offline deployments. Exporter destination, TLS/authentication, data categories, sampling, retry buffer, and shutdown flush timeout MUST be configurable.

### OBS-03.06 — Telemetry failures MUST not fail inference or block readiness…

**Requirement:** Telemetry failures MUST not fail inference or block readiness unless telemetry is explicitly a required product dependency. Export queues MUST have bounded size and drop behavior with a metric.

### OBS-03.07 — Changes to semantic conventions MUST document migration and compatibility…

**Requirement:** Changes to semantic conventions MUST document migration and compatibility because dashboards and alert rules can consume the emitted names.

## Prohibited conditions

- Do not place prompts, uploads, credentials, raw model output, or high-cardinality identifiers in trace attributes by default.
- Do not let an exporter retry queue grow without a hard bound.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to traces, context propagation, and telemetry cost. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Test trace propagation through async boundaries, malformed incoming context, exporter outage/backpressure, offline mode, shutdown flush, and redaction.
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
