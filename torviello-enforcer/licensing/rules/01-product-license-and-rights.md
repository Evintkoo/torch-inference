# Product licensing and rights

**Control family:** licensing  
**Control document:** LIC-01  
**Requirement trace:** ED-040–ED-041, SO-012, RP-012  
**Status:** Normative project control

## Control objective

These controls govern **product licensing and rights**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **licensing** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### LIC-01.01 — The product policy MUST be defined as free personal

The product policy MUST be defined as free personal use and licensed commercial use. The project MUST NOT publish or enforce that policy until the owner has confirmed rights and qualified legal review has approved the license terms and scope

### LIC-01.02 — Confirm ownership and contribution rights for source code, artwork

The project MUST confirm ownership and contribution rights for source code, artwork, fonts, video, documentation, datasets, and model assets before redistribution or sale.

### LIC-01.03 — Keep license statements consistent across the top-level license, package

The project MUST keep license statements consistent across the top-level license, package metadata, binary notices, website, and commercial terms. A source license MUST NOT be presumed to cover models or datasets.

### LIC-01.04 — Record the approved license, effective version, copyright owner, grants

The project MUST record the approved license, effective version, copyright owner, grants, restrictions, and review date. Revisit the policy before a major distribution or ownership change.

## Prohibited conditions

- The project MUST NOT invent legal wording, promise exclusive rights, or assert ownership of third-party contributions without evidence
- The project MUST NOT assume a dependency's license grants rights to its model weights, training data, hosted service, or trademarks
- The project MUST NOT make commercial use claims before review is complete

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

- Release review confirms the approved license policy and rights evidence cover every distributed component and asset.
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
