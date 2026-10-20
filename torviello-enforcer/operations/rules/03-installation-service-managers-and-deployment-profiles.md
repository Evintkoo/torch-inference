# Installation, service managers, and deployment profiles

**Control family:** operations  
**Control document:** OPS-03  
**Requirement trace:** RP-020–RP-024, RP-030  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **installation, service managers, and deployment profiles** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed operations behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### OPS-03.01 — Every supported deployment profile MUST state target OS/architecture…

**Requirement:** Every supported deployment profile MUST state target OS/architecture, prerequisites, filesystem paths, service identity, required ports, data directories, model storage, configuration source, and network dependencies.

### OPS-03.02 — Install and upgrade procedures MUST be repeatable from…

**Requirement:** Install and upgrade procedures MUST be repeatable from a clean machine and MUST distinguish administrator actions from service-user actions. The service MUST run with least privilege and writable paths limited to documented state/cache locations.

### OPS-03.03 — Service definitions MUST set restart policy, startup ordering…

**Requirement:** Service definitions MUST set restart policy, startup ordering, graceful stop timeout, environment/config source, resource limits, and log routing appropriate to the target service manager.

### OPS-03.04 — Container images MUST pin base image identity, use…

**Requirement:** Container images MUST pin base image identity, use non-root execution where feasible, include only runtime artifacts, define health checks, and avoid embedding secrets or mutable model downloads in image layers.

### OPS-03.05 — Network listeners MUST bind to the intended interface by…

**Requirement:** Network listeners MUST bind to the intended interface by default. Remote exposure MUST require an explicit deployment choice and documented authentication, TLS termination, firewall, and proxy trust policy.

### OPS-03.06 — First startup MUST distinguish missing prerequisites from corrupt state…

**Requirement:** First startup MUST distinguish missing prerequisites from corrupt state and transient dependency failures; automated restart MUST use backoff and MUST not create a restart loop that hides permanent configuration errors.

### OPS-03.07 — Installation MUST preserve user data and configuration on upgrade…

**Requirement:** Installation MUST preserve user data and configuration on upgrade; uninstall MUST explain which state is retained or removed and require explicit confirmation before destructive deletion.

## Prohibited conditions

- Do not run production services as root/administrator without a documented platform requirement and compensating controls.
- Do not expose a development server or unauthenticated admin endpoint through a production profile.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to installation, service managers, and deployment profiles. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Install, start, restart, stop, upgrade, uninstall, and recover each supported profile on a clean target; inspect effective user, permissions, ports, image layers, and health behavior.
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
