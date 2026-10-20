# Accelerator backends, compatibility, and fallback

**Control family:** performance  
**Control document:** PERF-04  
**Requirement trace:** RP-010–RP-015  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **accelerator backends, compatibility, and fallback** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed performance behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### PERF-04.01 — Each accelerator backend MUST publish a tested compatibility tuple…

**Requirement:** Each accelerator backend MUST publish a tested compatibility tuple covering hardware generation, OS/kernel, driver, runtime/provider, compiler/toolchain, model format, build feature, and precision modes.

### PERF-04.02 — Capability discovery MUST report device identity, available memory…

**Requirement:** Capability discovery MUST report device identity, available memory, supported operations/precision, driver/runtime version, and rejection reason without requiring model execution or exposing unstable device secrets.

### PERF-04.03 — Provider selection MUST be deterministic for a configured policy…

**Requirement:** Provider selection MUST be deterministic for a configured policy. Auto-selection MUST document priority, tie-breaking, and behavior when multiple devices or providers are present.

### PERF-04.04 — Fallback to CPU or another provider MUST be explicit…

**Requirement:** Fallback to CPU or another provider MUST be explicit, observable, and validated for output correctness, numerical tolerance, performance expectations, and resource impact. Unsupported forced-provider requests MUST fail clearly.

### PERF-04.05 — Backend initialization and runtime errors MUST identify whether…

**Requirement:** Backend initialization and runtime errors MUST identify whether the failure is transient, device-specific, model-specific, or unsupported; recovery MUST release partially initialized handles and not poison unrelated providers.

### PERF-04.06 — Build profiles MUST exclude disabled accelerator dependencies and runtime…

**Requirement:** Build profiles MUST exclude disabled accelerator dependencies and runtime libraries. Binary packaging MUST include only legally redistributable libraries and state external driver/runtime prerequisites.

### PERF-04.07 — Provider-specific optimizations MUST be gated by capability detection…

**Requirement:** Provider-specific optimizations MUST be gated by capability detection and have a correct baseline path; an optimization MUST not silently depend on undocumented hardware behavior.

## Prohibited conditions

- Do not advertise Metal, CUDA, Vulkan, or AMD support based on successful compilation alone.
- Do not silently change precision, deterministic behavior, or fallback provider after a runtime error.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to accelerator backends, compatibility, and fallback. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Run per-provider compile, discovery, load, inference, cancellation, numerical comparison, memory pressure, device loss, and fallback tests on the declared matrix; inspect excluded dependencies.
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
