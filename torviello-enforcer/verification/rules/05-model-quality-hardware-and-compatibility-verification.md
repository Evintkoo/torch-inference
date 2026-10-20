# Model quality, hardware, and compatibility verification

**Control family:** verification  
**Control document:** VER-05  
**Requirement trace:** RP-010–RP-015, RP-020, ED-012–ED-013  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **model quality, hardware, and compatibility verification** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed verification behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### VER-05.01 — Every claimed OS/architecture/profile/backend combination MUST have a recorded build…

**Requirement:** Every claimed OS/architecture/profile/backend combination MUST have a recorded build and runtime test result or be labeled unverified/unsupported.

### VER-05.02 — Model evaluation MUST pin model digest, runtime/provider…

**Requirement:** Model evaluation MUST pin model digest, runtime/provider, preprocessing, tokenizer, dataset split, metric implementation, parameters, hardware, and test harness revision.

### VER-05.03 — Numerical correctness MUST use documented tolerances for each supported…

**Requirement:** Numerical correctness MUST use documented tolerances for each supported precision/provider and include edge inputs, empty/large tensors, batch changes, and deterministic mode where promised.

### VER-05.04 — Backend adapter conformance MUST test load/readiness/inference/cancel/unload/error semantics against…

**Requirement:** Backend adapter conformance MUST test load/readiness/inference/cancel/unload/error semantics against the same contract suite.

### VER-05.05 — Performance tests MUST be separate from correctness acceptance unless…

**Requirement:** Performance tests MUST be separate from correctness acceptance unless the feature explicitly promises a performance bound; report latency distributions, throughput, quality, memory, and device conditions.

### VER-05.06 — Compatibility qualification MUST cover upgrade from supported prior versions…

**Requirement:** Compatibility qualification MUST cover upgrade from supported prior versions, configuration/schema migration, model reuse, and rollback, not only clean installation.

### VER-05.07 — When physical hardware is scarce, emulation or mocks…

**Requirement:** When physical hardware is scarce, emulation or mocks MAY support early development but MUST NOT substitute for release evidence on advertised accelerator targets.

## Prohibited conditions

- Do not infer model quality from a successful load or a single happy-path output.
- Do not mark an untested backend supported because another provider uses a similar API.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to model quality, hardware, and compatibility verification. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Reproduce the pinned evaluation, run backend conformance and target hardware smoke tests, and reconcile results with the published support matrix and release claims.
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

Source IDs R1,R3 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
