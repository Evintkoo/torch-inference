# API inventory, evolution, and deprecation

**Control family:** api  
**Control document:** API-04  
**Requirement trace:** ED-004, ED-030, SO-010–SO-011, RP-023  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **api inventory, evolution, and deprecation** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed api behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### API-04.01 — The project MUST maintain an inventory of every externally…

**Requirement:** The project MUST maintain an inventory of every externally reachable API surface, including engine HTTP routes, admin routes, health/metrics endpoints, callbacks, internal service APIs exposed through a gateway, and protocol versions. Each entry MUST identify owner, audience, exposure, auth policy, lifecycle state, and contract location.

### API-04.02 — Production API changes MUST be classified as compatible…

**Requirement:** Production API changes MUST be classified as compatible, conditionally compatible, or breaking against the published contract and known consumers. Reviewers MUST examine field requiredness, defaults, enum expansion, response shape, status codes, ordering, pagination, streaming framing, and authorization changes.

### API-04.03 — Breaking changes MUST use a versioning and migration policy…

**Requirement:** Breaking changes MUST use a versioning and migration policy chosen for the product (URI, media type, or another explicit scheme), with a published compatibility window, migration guidance, sunset date, and owner. Deprecation notices MUST be observable before removal.

### API-04.04 — Every deployed version MUST be discoverable by operators…

**Requirement:** Every deployed version MUST be discoverable by operators. Remove unsupported versions from the deployment inventory only after traffic and consumer evidence show that the deprecation window has completed.

### API-04.05 — Debug, experimental, and internal endpoints MUST be…

**Requirement:** Debug, experimental, and internal endpoints MUST be excluded from production packages or protected by an explicit access policy. Their presence and exposure MUST be checked in release qualification.

### API-04.06 — OpenAPI contracts MUST be reviewed in the same change…

**Requirement:** OpenAPI contracts MUST be reviewed in the same change as implementation. Generated schemas MUST be reproducible; generated diffs MUST not hide semantic changes in hand-maintained descriptions or security declarations.

## Prohibited conditions

- Do not rely on undocumented consumers or guess that an additive-looking change is compatible.
- Do not leave obsolete or debug endpoints reachable without an owner, expiry, and access policy.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to api inventory, evolution, and deprecation. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- CI checks contract diffs and production route inventories; release assessment checks deprecation, version exposure, and consumer migration evidence.
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

Source IDs R1,R3,R5 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
