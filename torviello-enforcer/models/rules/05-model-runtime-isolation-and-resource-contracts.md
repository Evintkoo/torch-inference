# Model runtime isolation and resource contracts

**Control family:** models  
**Control document:** MOD-05  
**Requirement trace:** RP-010–RP-015, SO-010–SO-011, SO-032  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **model runtime isolation and resource contracts** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed models behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### MOD-05.01 — Each model descriptor MUST declare required runtime/provider, supported…

**Requirement:** Each model descriptor MUST declare required runtime/provider, supported data types and shapes, maximum input dimensions/sequence length, precision constraints, required assets, and estimated memory/compute needs when known.

### MOD-05.02 — Model load MUST be a bounded lifecycle with explicit…

**Requirement:** Model load MUST be a bounded lifecycle with explicit queued, downloading, verifying, extracting, loading, ready, failed, unloading, and cancelled states where applicable. State transitions MUST be observable and invalid transitions rejected.

### MOD-05.03 — Untrusted or third-party model parsing MUST run with least…

**Requirement:** Untrusted or third-party model parsing MUST run with least privilege and bounded CPU, memory, disk, file count, and wall-clock time. Custom operators or executable model payloads MUST be disabled unless an explicit review and isolation design approves them.

### MOD-05.04 — Runtime adapters MUST enforce input and output shape…

**Requirement:** Runtime adapters MUST enforce input and output shape, dtype, tensor count, allocation, and execution-time limits before allocating or invoking backend operations.

### MOD-05.05 — Cancellation and shutdown MUST release model resources within…

**Requirement:** Cancellation and shutdown MUST release model resources within a defined deadline or report the provider limitation. A stuck device operation MUST not block health, shutdown, or unrelated CPU requests indefinitely.

### MOD-05.06 — GPU memory allocation and CPU fallback MUST be explicit…

**Requirement:** GPU memory allocation and CPU fallback MUST be explicit. Fallback MUST preserve the model contract or return a clear incompatibility/resource error; it MUST NOT silently change precision or quality behavior.

### MOD-05.07 — Concurrent model loading and inference MUST have defined isolation…

**Requirement:** Concurrent model loading and inference MUST have defined isolation, memory admission, eviction, and fairness rules. A model MUST NOT evict or corrupt another active model without an explicit policy.

## Prohibited conditions

- Do not execute model-provided code or custom operators in the privileged service process by default.
- Do not claim accelerator support for an untested provider/driver/device combination.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to model runtime isolation and resource contracts. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Use malformed model fixtures, resource exhaustion, cancellation, concurrent load/unload, GPU loss, low-memory, and fallback tests; capture process and device resource behavior.
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

Source IDs R2,R3,R4 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
