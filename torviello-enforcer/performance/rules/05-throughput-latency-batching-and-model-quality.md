# Throughput, latency, batching, and model quality

**Control family:** performance  
**Control document:** PERF-05  
**Requirement trace:** RP-012–RP-013, ED-012  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **throughput, latency, batching, and model quality** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed performance behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### PERF-05.01 — Concurrency and batching policies MUST state maximum batch size…

**Requirement:** Concurrency and batching policies MUST state maximum batch size, queue deadline, batching delay, fairness, cancellation behavior, and interaction with memory limits.

### PERF-05.02 — Batching MUST preserve request/response identity and ordering guarantees…

**Requirement:** Batching MUST preserve request/response identity and ordering guarantees. A cancellation or malformed request within a batch MUST not corrupt unrelated requests or silently discard completed results.

### PERF-05.03 — Throughput claims MUST report sustained and burst workload…

**Requirement:** Throughput claims MUST report sustained and burst workload, request mix, concurrency, warm-up, provider, model digest, input size, precision, hardware, and error/drop rate.

### PERF-05.04 — Latency claims MUST report distributions and tail percentiles separately…

**Requirement:** Latency claims MUST report distributions and tail percentiles separately for successful, rejected, and failed requests; averages alone MUST NOT support an interactive latency claim.

### PERF-05.05 — Quantization, lower precision, kernel fusion…

**Requirement:** Quantization, lower precision, kernel fusion, and approximate execution MUST be evaluated for quality as well as speed using fixed model/task-specific acceptance metrics.

### PERF-05.06 — Adaptive tuning MUST have bounded exploration, stable observability…

**Requirement:** Adaptive tuning MUST have bounded exploration, stable observability, operator override, and safe rollback. Online tuning MUST not change user-visible model quality or behavior without an explicit policy.

### PERF-05.07 — Performance regression thresholds MUST account for variance and hardware…

**Requirement:** Performance regression thresholds MUST account for variance and hardware differences. A threshold breach MUST trigger investigation before release, not automatic dismissal as noise.

## Prohibited conditions

- Do not compare different models or preprocessing paths as if the benchmark measured only a runtime backend.
- Do not permit one tenant/request class to monopolize accelerator queues without an approved priority policy.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to throughput, latency, batching, and model quality. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Benchmark isolated and mixed workloads; test batching with cancellation, tail latency, fairness, output quality, and regression detection on pinned environments.
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
