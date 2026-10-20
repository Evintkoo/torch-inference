# Secret configuration and operator controls

**Control family:** configuration  
**Control document:** CFG-05  
**Requirement trace:** SO-004–SO-005, RP-002, RP-030  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **secret configuration and operator controls** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed configuration behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### CFG-05.01 — Secrets MUST use an approved source for the deployment…

**Requirement:** Secrets MUST use an approved source for the deployment profile: OS credential store, orchestrator secret, protected file, or explicitly configured environment input. Documentation MUST state the storage threat model and required file permissions.

### CFG-05.02 — Production secrets MUST be validated for presence, format…

**Requirement:** Production secrets MUST be validated for presence, format, purpose, and minimum strength at startup. Missing or invalid required credentials MUST fail closed before the service accepts traffic.

### CFG-05.03 — Secret rotation MUST support overlap or coordinated replacement where…

**Requirement:** Secret rotation MUST support overlap or coordinated replacement where clients require it, identify active key version, define rollback, and revoke compromised material without restoring the compromised value.

### CFG-05.04 — Configuration inspection, diagnostic endpoints, support bundles…

**Requirement:** Configuration inspection, diagnostic endpoints, support bundles, crash reports, and debug logging MUST redact secret-bearing fields recursively, including nested structures and secret references.

### CFG-05.05 — Operator controls MUST distinguish read-only inspection from mutating actions…

**Requirement:** Operator controls MUST distinguish read-only inspection from mutating actions, authenticate and authorize remote changes, audit actor/target/outcome, and prevent lost-update races with version checks or equivalent concurrency control.

### CFG-05.06 — Configuration files and generated state MUST have explicit ownership…

**Requirement:** Configuration files and generated state MUST have explicit ownership and permissions. The service MUST detect unexpected symlinks, world-readable credentials, or writable-by-untrusted-user files where those conditions weaken the deployment threat model.

### CFG-05.07 — Each setting with security or availability impact MUST document…

**Requirement:** Each setting with security or availability impact MUST document its default, valid range, effect, reloadability, and operational recovery path.

## Prohibited conditions

- Do not expose secret references if they reveal a provider name, path, or identity that is itself sensitive.
- Do not accept remote administrative configuration updates without authorization, audit, and concurrency protection.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to secret configuration and operator controls. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Use canary secrets to test all diagnostics and artifacts; verify rotation/revocation, unsafe permissions, remote mutation audit, stale version rejection, and restart behavior.
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

Source IDs R1,R2 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
