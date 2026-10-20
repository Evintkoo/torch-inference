# Resource budgets, startup, and idle behavior

**Control family:** performance  
**Control document:** PERF-03  
**Requirement trace:** RP-010–RP-013, SO-032  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **resource budgets, startup, and idle behavior** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed performance behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### PERF-03.01 — Each supported profile MUST declare startup time, steady-state…

**Requirement:** Each supported profile MUST declare startup time, steady-state and peak memory, CPU utilization, disk/cache growth, network behavior, and accelerator memory expectations for named workloads.

### PERF-03.02 — User-visible latency MUST be decomposed into queue wait…

**Requirement:** User-visible latency MUST be decomposed into queue wait, preprocessing, model load, transfer, inference, postprocessing, and response delivery where the system can instrument those stages.

### PERF-03.03 — Startup optimization MUST preserve integrity checks, configuration validation…

**Requirement:** Startup optimization MUST preserve integrity checks, configuration validation, and readiness semantics. Lazy initialization MUST expose loading state and bound the first-request penalty.

### PERF-03.04 — Idle CPU/GPU power behavior MUST be measured on representative…

**Requirement:** Idle CPU/GPU power behavior MUST be measured on representative hardware after an explicit idle interval. Background polling, telemetry, model eviction, and keep-alive work MUST have documented intervals and operator controls.

### PERF-03.05 — Memory admission MUST account for model weights, runtime…

**Requirement:** Memory admission MUST account for model weights, runtime workspace, activation/sequence growth, concurrent batches, allocator fragmentation, and transient model replacement overlap.

### PERF-03.06 — Caching MUST define key identity, maximum size…

**Requirement:** Caching MUST define key identity, maximum size, eviction, invalidation, privacy boundaries, and disk persistence. Cache miss or corruption MUST not change correctness.

### PERF-03.07 — Performance defaults MUST be chosen from measured workloads…

**Requirement:** Performance defaults MUST be chosen from measured workloads and remain overrideable within safe hard bounds; tuning changes MUST state throughput, latency, quality, memory, power, and portability tradeoffs.

## Prohibited conditions

- Do not optimize one benchmark by disabling validation, observability, or safe resource bounds.
- Do not claim low idle use from a process that has not been measured after warm-up and device initialization.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to resource budgets, startup, and idle behavior. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Measure clean startup, warm startup, idle, burst, saturation, model swap, low-memory, and shutdown behavior with hardware/provider details and confidence intervals.
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
