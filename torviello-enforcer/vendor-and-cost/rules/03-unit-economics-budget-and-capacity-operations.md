# Unit economics, budgets, and capacity operations

**Control family:** vendor-and-cost  
**Control document:** VEND-03  
**Requirement trace:** PA-001–PA-004, PA-024, RP-013, SO-032  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **unit economics, budgets, and capacity operations** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed vendor-and-cost behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### VEND-03.01 — Each hosted or recurring product capability MUST identify…

**Requirement:** Each hosted or recurring product capability MUST identify the unit of value and cost driver, such as inference request, model storage, active user, build minute, bandwidth, or monitoring retention.

### VEND-03.02 — Cost estimates MUST state workload assumptions, region…

**Requirement:** Cost estimates MUST state workload assumptions, region, provider plan, volume, growth, free-tier boundaries, taxes/egress where applicable, and uncertainty range.

### VEND-03.03 — Production spend MUST have an owner, budget/forecast…

**Requirement:** Production spend MUST have an owner, budget/forecast, anomaly threshold, and action path. Alerts MUST distinguish expected burst/scale events from waste or runaway usage.

### VEND-03.04 — Architecture reviews MUST compare total cost of ownership across…

**Requirement:** Architecture reviews MUST compare total cost of ownership across hosted, self-hosted, and local execution where the deployment choice affects users; include staffing, upgrades, security, data transfer, storage, and failure recovery.

### VEND-03.05 — User-facing tiers and quotas MUST map to enforced technical…

**Requirement:** User-facing tiers and quotas MUST map to enforced technical limits and clear usage semantics; avoid promises that depend on unbounded external quotas or undocumented provider behavior.

### VEND-03.06 — Cost optimization MUST preserve security, accessibility, reliability…

**Requirement:** Cost optimization MUST preserve security, accessibility, reliability, support, and data-residency requirements; disclose the affected tradeoff and measured result.

### VEND-03.07 — Financial records and provider usage data MUST be access-controlled…

**Requirement:** Financial records and provider usage data MUST be access-controlled and retained only as long as needed for billing, forecasting, and audit.

## Prohibited conditions

- Do not classify a service as free-to-operate based only on a trial or current free tier.
- Do not reduce resilience or retention below approved objectives solely to meet a cost target.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to unit economics, budgets, and capacity operations. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Compare forecasts with metered use, verify alerts and quota behavior, and test that cost controls trigger before provider limits or budget exhaustion.
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
