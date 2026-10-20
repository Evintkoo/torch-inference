# License policy publication and commercial controls

**Control family:** licensing  
**Control document:** LIC-05  
**Requirement trace:** ED-040–ED-041  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **license policy publication and commercial controls** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed licensing behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### LIC-05.01 — The approved product license MUST define personal and commercial…

**Requirement:** The approved product license MUST define personal and commercial use, grant scope, permitted and prohibited activities, territory or jurisdiction limits if any, termination, redistribution, warranty/liability terms, and how users obtain a commercial license.

### LIC-05.02 — Before publication, qualified legal review MUST confirm…

**Requirement:** Before publication, qualified legal review MUST confirm the rights chain for project code and assets supports the proposed product terms, including employee/contractor assignments and third-party obligations.

### LIC-05.03 — License and commercial terms MUST be consistent across repository…

**Requirement:** License and commercial terms MUST be consistent across repository license files, package metadata, download pages, installer notices, website, model registry, and sales/support communications.

### LIC-05.04 — License enforcement MUST have a documented offline behavior…

**Requirement:** License enforcement MUST have a documented offline behavior, grace/expiry policy, key revocation behavior, privacy impact, appeal/support path, and failure recovery. Local inference MUST not unexpectedly become unavailable through a hosted entitlement outage unless that is an explicitly approved product contract.

### LIC-05.05 — License service identity and signing keys MUST be separate…

**Requirement:** License service identity and signing keys MUST be separate from ordinary administrative credentials; issuance, renewal, revocation, and audit procedures MUST be restricted and recoverable.

### LIC-05.06 — Each release MUST include required third-party notices and license…

**Requirement:** Each release MUST include required third-party notices and license texts in locations users can discover before and after installation.

### LIC-05.07 — Any change to ownership, licensing model, bundling…

**Requirement:** Any change to ownership, licensing model, bundling, or commercial claims MUST trigger renewed legal review and release sign-off.

## Prohibited conditions

- Do not promise that personal use is free or commercial use requires a license until approved terms are published and supported by a valid rights chain.
- Do not describe technical activation as proof that use is legally licensed.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to license policy publication and commercial controls. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Compare legal text with every distribution surface; exercise license issue, expiry, offline, revocation, support, and rollback cases against the approved policy.
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

Source IDs R1,R3 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
