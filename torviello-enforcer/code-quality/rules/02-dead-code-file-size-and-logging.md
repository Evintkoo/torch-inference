# Dead code, file size, and runtime logging

**Control family:** code-quality  
**Control document:** CQ-02  
**Requirement trace:** ED-001–ED-005, CSC-006–CSC-008  
**Status:** Normative project control

## Control objective

These controls govern **dead code, file size, and runtime logging**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **code-quality** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### CQ-02.01 — Remove unused production code and obsolete feature paths

The project MUST remove unused production code and obsolete feature paths. If code MUST remain for a documented target or migration, gate it explicitly and identify the consumer.

### CQ-02.02 — Keep source files focused and under 500 lines by

The project SHOULD keep source files focused and under 500 lines by default. Split files at responsibility or ownership boundaries; line count alone is not a reason to create shallow fragments. Exceptions include a reason and a follow-up plan where practical.

### CQ-02.03 — Keep API schemas, transport handlers, business logic, and storage

The project MUST keep API schemas, transport handlers, business logic, and storage code in separate modules with typed interfaces.

### CQ-02.04 — Runtime services MUST use the shared structured logger

Runtime services MUST use the shared structured logger. Rust println/eprintln and equivalent direct print calls MUST be limited to intentional CLI output, build output, or test diagnostics.

### CQ-02.05 — Logs MUST exclude credentials, tokens, signing material, full prompts

Logs MUST exclude credentials, tokens, signing material, full prompts, raw uploads, and unnecessary personal data. Untrusted fields MUST be sanitized against log injection.

### CQ-02.06 — Use typed errors with stable public error mapping

The project MUST use typed errors with stable public error mapping. Internal context belongs in protected logs; clients receive safe error codes and correlation identifiers.

## Prohibited conditions

- The project MUST NOT keep dead code by adding broad warning suppressions
- The project MUST NOT split one responsibility across files only to meet a line limit
- The project MUST NOT log raw inference content for convenience or debugging in production

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

- Check production builds for warning suppressions and unused items. Review oversized files and direct printing by path and runtime role. Verify representative secret redaction at logging boundaries.
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

Source IDs R1,R3 are listed in [00-references-trails.md](../trails/00-references-trails.md). The project rules above are the required behavior; the references provide the standards basis and verification context.
