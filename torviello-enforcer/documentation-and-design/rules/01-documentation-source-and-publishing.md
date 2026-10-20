# Documentation source and publishing

**Control family:** documentation-and-design  
**Control document:** DOC-01  
**Requirement trace:** PA-013, PA-030–PA-032, ED-030–ED-033  
**Status:** Normative project control

## Control objective

These controls govern **documentation source and publishing**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **documentation-and-design** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### DOC-01.01 — Keep maintained product documentation in one authoritative source tree

The project MUST keep maintained product documentation in one authoritative source tree and render it with a maintained documentation engine. Contributors can build the same site locally from a clean checkout.

### DOC-01.02 — Publish accurate installation, configuration, API, architecture, security, deployment, upgrade

The project MUST publish accurate installation, configuration, API, architecture, security, deployment, upgrade, troubleshooting, and support guidance for each supported product profile.

### DOC-01.03 — Treat executable examples as tested interfaces

The project MUST treat executable examples as tested interfaces. The project MUST also validate TOML snippets, API requests, commands, and config examples automatically where possible; otherwise include them in release qualification.

### DOC-01.04 — Explain prerequisites, hardware/runtime requirements, network access, persistent storage, failure

The project MUST explain prerequisites, hardware/runtime requirements, network access, persistent storage, failure states, recovery, and data handling for each operation.

### DOC-01.05 — Distinguish implemented behavior from planned behavior

The project MUST distinguish implemented behavior from planned behavior. Mark preview or experimental features and state support limits.

### DOC-01.06 — Keep diagrams in source control and update them when

The project MUST keep diagrams in source control and update them when module boundaries, data flows, trust zones, or deployment topology changes.

## Prohibited conditions

- The project MUST NOT maintain conflicting copies of setup instructions as independent sources of truth
- The project MUST NOT document an endpoint or build option that does not exist in the supported release
- The project MUST NOT expose secrets in examples or leave unverified command blocks

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

- Build the docs site in CI from a clean checkout, validate internal links, and check representative examples against shipped commands and schemas.
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

Source IDs R2 are listed in [00-references-trails.md](../trails/00-references-trails.md). The project rules above are the required behavior; the references provide the standards basis and verification context.
