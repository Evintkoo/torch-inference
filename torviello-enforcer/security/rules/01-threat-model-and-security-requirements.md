# Threat model and security requirements

**Control family:** security  
**Control document:** SEC-01  
**Requirement trace:** SO-001–SO-005, SO-010–SO-014, SO-031, RP-031  
**Status:** Normative project control

## Control objective

These controls govern **threat model and security requirements**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **security** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### SEC-01.01 — Before implementing or materially changing a security-sensitive capability

Before implementing or materially changing a security-sensitive capability, the project MUST document assets, actors, trust boundaries, entry points, abuse cases, mitigations, and residual risk.

### SEC-01.02 — Threat models MUST cover public APIs, local control surfaces

Threat models MUST cover public APIs, local control surfaces, authentication, authorization, uploads, model files, registry changes, dependency/build inputs, updates, persistence, and hosted-service links.

### SEC-01.03 — Map production web/API controls to applicable OWASP ASVS 5

The project MUST map production web/API controls to applicable OWASP ASVS 5.0.0 Level 2 requirements. Map production AI/model lifecycle controls to applicable OWASP AISVS 1.01 Level 2 requirements. The project MUST also record each versioned control ID and justified exclusion.

### SEC-01.04 — Use NIST SSDF practices throughout design, development, review, release

The project MUST maintain a versioned implementation mapping for NIST SSDF Version 1.1 (SP 800-218) across design, development, review, release, vulnerability response, and remediation. The mapping MUST identify each selected practice and the project control/evidence that implements it; list non-selected practices with scope and rationale; and be reviewed before release and when a supported development profile changes. Citing SSDF MUST NOT be represented as certification or full conformance.

### SEC-01.05 — Review threat assumptions at release and whenever data flows

The project MUST review threat assumptions at release and whenever data flows, privileges, network exposure, model loading, storage, or update paths change.

## Prohibited conditions

- The project MUST NOT treat a vulnerability scan as a threat model or as evidence that all controls work
- The project MUST NOT say “OWASP compliant” or “certified” without a formal scope, assessment, and evidence
- The project MUST NOT defer high-impact risks without a named owner, mitigation, and expiry/review date

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

- Security review records the threat model version, controls assessed, evidence, findings, owner, due date, and accepted residual risks.
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

Source IDs R1,R2,R3 are listed in [00-references-trails.md](../trails/00-references-trails.md). The project rules above are the required behavior; the references provide the standards basis and verification context.
