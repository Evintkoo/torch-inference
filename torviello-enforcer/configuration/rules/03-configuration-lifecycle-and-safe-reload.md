# Configuration lifecycle and safe reload

**Control family:** configuration  
**Control document:** CFG-03  
**Requirement trace:** RP-001–RP-003, RP-030–RP-031  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **configuration lifecycle and safe reload** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed configuration behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### CFG-03.01 — Configuration MUST be parsed into one typed candidate…

**Requirement:** Configuration MUST be parsed into one typed candidate and validated completely before the application binds public listeners, activates models, or mutates persistent state.

### CFG-03.02 — Validation MUST report the setting name and a safe…

**Requirement:** Validation MUST report the setting name and a safe corrective action without echoing secret values or exposing internal paths. Multiple errors SHOULD be reported together when doing so does not expose sensitive material.

### CFG-03.03 — Configuration reload MUST be atomic: build and validate…

**Requirement:** Configuration reload MUST be atomic: build and validate a complete candidate, verify its dependencies, then switch active state at a defined boundary. If any step fails, the running system MUST retain the last known-good configuration and report the reload failure.

### CFG-03.04 — Each setting MUST declare whether it is startup-only…

**Requirement:** Each setting MUST declare whether it is startup-only, reloadable, or dynamically sampled. A reload MUST NOT leave components using incompatible snapshots unless the consistency model is explicitly designed and tested.

### CFG-03.05 — Configuration watchers MUST debounce partial file writes, handle…

**Requirement:** Configuration watchers MUST debounce partial file writes, handle rename-based replacement, permission changes, deletion, and invalid intermediate files, and MUST avoid unbounded reload loops.

### CFG-03.06 — Configuration schema evolution MUST define defaulting, deprecation…

**Requirement:** Configuration schema evolution MUST define defaulting, deprecation, migration, unknown-field, and downgrade behavior. A newer binary MUST NOT silently rewrite a file such that the prior supported version cannot start unless that migration is explicit and backed up.

### CFG-03.07 — Operator-facing effective-configuration output MUST redact credentials, identify source…

**Requirement:** Operator-facing effective-configuration output MUST redact credentials, identify source and precedence for each value, and distinguish explicit values from defaults without exposing secret contents.

## Prohibited conditions

- Do not apply a partially valid configuration.
- Do not restart or replace the service silently when a reload can be rejected safely.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to configuration lifecycle and safe reload. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Inject invalid values, file replacement races, permission loss, watcher duplication, and component activation failure; confirm atomic rollback and non-secret diagnostics.
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

Source IDs R1 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
