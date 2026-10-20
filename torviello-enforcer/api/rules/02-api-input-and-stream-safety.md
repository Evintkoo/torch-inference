# API input and stream safety

**Control family:** api  
**Control document:** API-02  
**Requirement trace:** ED-004, SO-002–SO-005, SO-011, PA-010  
**Status:** Normative project control

## Control objective

These controls govern **api input and stream safety**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **api** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### API-02.01 — Treat every request field, header, URL, filename, archive entry

The project MUST treat every request field, header, URL, filename, archive entry, image, audio stream, and model input as untrusted. Parse into validated domain types before expensive work.

### API-02.02 — Bound request bytes, multipart part count, image dimensions, audio

The project MUST bound request bytes, multipart part count, image dimensions, audio duration, decompressed size, queue wait, inference time, concurrent work, and response size. Limits MUST be configurable within safe hard bounds.

### API-02.03 — Reject invalid content types, unsupported encodings, malformed multipart boundaries

The project MUST reject invalid content types, unsupported encodings, malformed multipart boundaries, path traversal, unexpected archive paths, and values outside schema constraints with safe client errors.

### API-02.04 — Apply authentication and authorization to each operation

The project MUST apply authentication and authorization to each operation. Health endpoints disclose only their intended readiness state; administrative operations require explicit roles/scopes.

### API-02.05 — Streaming routes MUST define cancellation, client disconnect handling, backpressure

Streaming routes MUST define cancellation, client disconnect handling, backpressure, timeout, partial result, and cleanup behavior. The project MUST NOT retain unbounded output in memory for a slow consumer.

### API-02.06 — Use rate limits and concurrency controls at the API

The project MUST use rate limits and concurrency controls at the API boundary for expensive or abuse-sensitive operations. The project MUST also return a documented overload response and expose a bounded metric.

## Prohibited conditions

- The project MUST NOT trust client-supplied paths, model IDs, callback URLs, MIME types, dimensions, or content lengths
- The project MUST NOT pass arbitrary user URLs to a downloader or inference service without SSRF-safe destination policy
- The project MUST NOT return a success response before an operation is durable or active when the contract promises completion
- The project MUST NOT log raw prompts, uploads, authorization headers, or full inference payloads by default

## Implementation guidance

Implementation MUST satisfy the applicable requirements above at the boundary where the risk or behavior is introduced. A wrapper, UI-only check, documentation statement, or downstream compensating check does not satisfy a requirement when the rule requires enforcement at a lower or authoritative boundary. Keep implementation choices consistent with the domain sources in the reference trail; document approved deviations instead of silently weakening the control.

## Assessment procedure

Assess both design and operation. Use the methods below as appropriate to the control and retain enough context for another reviewer to reproduce the determination.

### Examine

- Inspect the relevant specification, source, configuration, dependency/build metadata, tests, and operational documentation to confirm the requirement is addressed at the stated boundary.
- Confirm the change is traceable to the requirement IDs listed above and that any conditions, limits, defaults, failure behavior, and exceptions are explicit.

### Interview

- When a requirement depends on an operational role or manual procedure, interview the accountable owner and confirm the described procedure matches the approved documentation and observed practice. An interview alone does not establish effectiveness when implementation or behavior can be examined or tested.

### Test

- Exercise malformed and oversized inputs, decompression limits, path traversal attempts, slow streams, client cancellation, timeout, rate-limit exhaustion, and unauthenticated or unauthorized requests.
- Exercise at least one negative or failure case for each security, compatibility, resource, or reliability boundary affected by the change; confirm the observed result matches the contract and does not bypass the control.
- Record the command or procedure, tested revision and environment, result, and any limitation. A skipped check is not passing evidence.

## Assessment determination

A control document passes only when every applicable MUST requirement is implemented and supported by current evidence, each applicable SHOULD deviation has a documented rationale, and no unapproved or expired exception remains. A requirement fails when implementation is absent, behavior contradicts the requirement, evidence is missing or stale, or the assessment cannot reproduce the claimed result. Record **pass**, **fail**, or **not applicable** per control ID; “not applicable” requires a stated condition and reviewer rationale.

## Required evidence

- A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.

## Exceptions and nonconformance

A deviation from a MUST requirement requires explicit approval from the accountable product or engineering owner before release. The exception record MUST identify affected controls, scope, risk, compensating measures, remediation owner, and expiry or review date. A SHOULD deviation MUST include a rationale and impact in the change record. Unapproved or expired deviations are nonconformances and MUST block the affected release when the requirement is release-critical.

## Reference trail

Source IDs R1,R2 are listed in [00-references-trails.md](../trails/00-references-trails.md). The project rules above are the required behavior; the references provide the standards basis and verification context.
