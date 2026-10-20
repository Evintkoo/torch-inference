# Exit, continuity, and provider failure

**Control family:** vendor-and-cost  
**Control document:** VEND-05  
**Requirement trace:** PA-002–PA-004, PA-024, RP-021–RP-024, SO-030  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **exit, continuity, and provider failure** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed vendor-and-cost behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### VEND-05.01 — Each critical provider MUST have an exit plan identifying…

**Requirement:** Each critical provider MUST have an exit plan identifying export format, data/configuration completeness, alternate provider or self-hosted path, credential/key transition, DNS/domain ownership, and required user communication.

### VEND-05.02 — Export and rebuild procedures MUST be tested before…

**Requirement:** Export and rebuild procedures MUST be tested before an outage or contract termination. Record elapsed time, missing fields, manual steps, and integrity checks.

### VEND-05.03 — Local inference MUST continue without hosted account, registry…

**Requirement:** Local inference MUST continue without hosted account, registry, telemetry, or documentation services after required artifacts have been installed, except where a separately approved entitlement policy explicitly constrains operation.

### VEND-05.04 — Provider outage handling MUST define bounded timeouts, retry/backoff…

**Requirement:** Provider outage handling MUST define bounded timeouts, retry/backoff, circuit breaking, cached data freshness, and operator-visible degraded state.

### VEND-05.05 — Critical source, release metadata, signing recovery procedures…

**Requirement:** Critical source, release metadata, signing recovery procedures, and required configuration MUST have protected copies outside a single provider account while preserving access control.

### VEND-05.06 — Domain names, package namespaces, signing identities…

**Requirement:** Domain names, package namespaces, signing identities, and update endpoints MUST have renewal and recovery ownership; transfer or loss of a stable identity MUST have a migration plan.

### VEND-05.07 — Provider termination or material security incident MUST trigger…

**Requirement:** Provider termination or material security incident MUST trigger an impact review across affected product profiles, data, users, releases, and update channels.

## Prohibited conditions

- Do not claim provider independence until export, rebuild, and restore have been demonstrated.
- Do not store the only copy of owned operational data or recovery material in the provider whose failure it is meant to mitigate.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to exit, continuity, and provider failure. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Run a provider-loss tabletop and at least one export/rebuild or failover exercise; record restore time, data loss, broken identities, and required human actions.
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
