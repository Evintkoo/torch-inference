# Model evaluation and release cards

**Control family:** models  
**Control document:** MOD-04  
**Requirement trace:** RP-012–RP-014, SO-010–SO-012  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **model evaluation and release cards** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed models behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### MOD-04.01 — Every model release MUST include a versioned model card…

**Requirement:** Every model release MUST include a versioned model card that identifies publisher, model/version digest, architecture/task, intended and prohibited use, input/output contract, tokenizer/pre/post-processing, training/evaluation provenance available to the publisher, known limitations, and license.

### MOD-04.02 — Evaluation MUST use a documented task-relevant test set…

**Requirement:** Evaluation MUST use a documented task-relevant test set, preprocessing path, metric definition, baseline, and model/runtime versions. Results MUST be reproducible from a recorded command or harness revision.

### MOD-04.03 — Quality claims MUST distinguish vendor-reported, independently reproduced…

**Requirement:** Quality claims MUST distinguish vendor-reported, independently reproduced, and locally measured results. Do not compare scores produced with different datasets, normalization, decoding parameters, hardware, or metric implementations without stating the difference.

### MOD-04.04 — Before promotion, evaluate functional correctness, malformed inputs…

**Requirement:** Before promotion, evaluate functional correctness, malformed inputs, resource ceilings, cancellation, concurrency, numerical tolerance, and regressions against the previous approved model where compatibility matters.

### MOD-04.05 — High-impact or sensitive use cases MUST map relevant NIST…

**Requirement:** High-impact or sensitive use cases MUST map relevant NIST AI RMF Govern/Map/Measure/Manage outcomes to model selection, evaluation, user disclosure, monitoring, and incident response; record excluded outcomes and rationale.

### MOD-04.06 — Known bias, safety, privacy, robustness…

**Requirement:** Known bias, safety, privacy, robustness, and distribution-shift limitations MUST be disclosed with evidence and user/operational mitigations proportionate to intended use.

### MOD-04.07 — Model updates MUST be evaluated before promotion and retain…

**Requirement:** Model updates MUST be evaluated before promotion and retain the previous approved digest and metadata for rollback.

## Prohibited conditions

- Do not infer suitability from a model name, benchmark leaderboard, or vendor marketing claim.
- Do not claim fairness, safety, or accuracy beyond the tested populations, tasks, and conditions.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to model evaluation and release cards. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Re-run evaluation from pinned fixtures and model digest; verify card accuracy against files, test-set lineage, measurements, limitations, and rollback metadata.
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

Source IDs R4,R5 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
