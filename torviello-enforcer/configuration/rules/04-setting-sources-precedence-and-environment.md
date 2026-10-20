# Setting sources, precedence, and environment

**Control family:** configuration  
**Control document:** CFG-04  
**Requirement trace:** RP-001–RP-003, SO-004  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **setting sources, precedence, and environment** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed configuration behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### CFG-04.01 — The documented precedence MUST be deterministic across every executable…

**Requirement:** The documented precedence MUST be deterministic across every executable and deployment profile. The current product requirement is built-in defaults, TOML file, environment overrides, then command-line overrides; any change MUST be approved and reflected in examples and tests.

### CFG-04.02 — Environment variable names MUST be namespaced, documented…

**Requirement:** Environment variable names MUST be namespaced, documented, and parsed by the same typed validation rules as file values. Ambiguous aliases, silent coercion, and undocumented environment discovery MUST be rejected.

### CFG-04.03 — Command-line overrides MUST be visible in help output…

**Requirement:** Command-line overrides MUST be visible in help output, validated identically to file settings, and excluded from process listings or logs when values are sensitive.

### CFG-04.04 — Path-valued settings MUST define resolution base, canonicalization…

**Requirement:** Path-valued settings MUST define resolution base, canonicalization, symlink behavior, permissions, and behavior when parent directories do not exist. User-supplied output paths MUST NOT escape an explicitly confined workspace when confinement is required.

### CFG-04.05 — Default configuration MUST be safe for local use…

**Requirement:** Default configuration MUST be safe for local use and MUST NOT expose network listeners, enable telemetry, grant administrative access, or select a non-local provider without explicit operator action.

### CFG-04.06 — Configuration examples MUST be syntactically valid TOML, use…

**Requirement:** Configuration examples MUST be syntactically valid TOML, use non-secret placeholders, and remain checked against the schema and shipped defaults.

### CFG-04.07 — Deployment-specific configuration MUST separate product policy from secrets…

**Requirement:** Deployment-specific configuration MUST separate product policy from secrets and generated state; package upgrades MUST preserve operator-owned settings unless a versioned migration explicitly changes them.

## Prohibited conditions

- Do not allow environment variables to silently override values without a discoverable name and precedence rule.
- Do not put secret defaults in sample TOML or install images.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to setting sources, precedence, and environment. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Test every source independently and in precedence combinations; verify unknown variables, invalid types, path traversal, secret redaction, and upgrade preservation.
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
