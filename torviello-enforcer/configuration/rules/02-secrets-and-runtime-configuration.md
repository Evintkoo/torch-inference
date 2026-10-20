# Secrets and runtime changes

**Control family:** configuration  
**Control document:** CFG-02  
**Requirement trace:** RP-001–RP-003, SO-004  
**Status:** Normative project control

## Control objective

These controls govern **secrets and runtime changes**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

## Applicability

This control applies to every new or modified production component, interface, build or deployment artifact, operational procedure, and test within the **configuration** domain. Where a clause is conditional, its stated condition defines when it applies. Legacy behavior is brought into scope when changed or when an approved migration specifically addresses it.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### CFG-02.01 — Keep secret values out of checked-in files, sample configuration

The project MUST keep secret values out of checked-in files, sample configuration, screenshots, logs, diagnostics, and support bundles. Examples use obviously invalid placeholders.

### CFG-02.02 — Load secrets from an OS credential store, orchestrator secret

The project MUST load secrets from an OS credential store, orchestrator secret, protected file, or environment mechanism appropriate to the deployment. The project MUST also document precedence and file permissions.

### CFG-02.03 — Redact secret-bearing fields from debug output and configuration inspection

The project MUST redact secret-bearing fields from debug output and configuration inspection. The project MUST NOT serialize a fully resolved configuration if it contains credentials.

### CFG-02.04 — Configuration that requires restart MUST say so

Configuration that requires restart MUST say so. Hot reload MUST be permitted only when a complete candidate can be validated and atomically activated; on failure, the system MUST retain the last known-good configuration.

### CFG-02.05 — Separate user-editable settings from generated runtime state and default

The project MUST separate user-editable settings from generated runtime state and default templates. The project MUST NOT overwrite user state during package upgrade without explicit migration behavior.

## Prohibited conditions

- The project MUST NOT set production signing keys, database passwords, API tokens, or cloud credentials to built-in defaults
- The project MUST NOT update only part of active configuration and leave the process in a mixed state
- The project MUST NOT treat a secrets manager as a substitute for access control and rotation

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

- Check secret redaction in errors and logs. Test invalid reload preserves the previous state and valid reload updates all dependent modules atomically.
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
