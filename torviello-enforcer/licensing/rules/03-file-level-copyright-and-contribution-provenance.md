# File-level copyright and contribution provenance

**Control family:** licensing  
**Control document:** LIC-03  
**Requirement trace:** ED-040–ED-041, ED-020  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **file-level copyright and contribution provenance** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed licensing behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### LIC-03.01 — Every distributed source file and non-code asset MUST have…

**Requirement:** Every distributed source file and non-code asset MUST have an identifiable rights basis, copyright owner where known, license or terms, and provenance record sufficient to determine whether modification and redistribution are permitted.

### LIC-03.02 — Project-owned code MUST be accompanied by a contribution process…

**Requirement:** Project-owned code MUST be accompanied by a contribution process that makes the intended license and rights clear before accepting substantial external contributions. The process MUST state whether a contributor agreement, developer certificate, or other attestation is required.

### LIC-03.03 — Imported snippets MUST retain applicable copyright and license notices…

**Requirement:** Imported snippets MUST retain applicable copyright and license notices and MUST be assessed for compatibility with the destination file and product distribution model.

### LIC-03.04 — Generated source MUST record the generator and the rights…

**Requirement:** Generated source MUST record the generator and the rights basis of both generator and templates; generated content MUST not be assumed copyright-free.

### LIC-03.05 — License metadata MUST use canonical SPDX identifiers and valid…

**Requirement:** License metadata MUST use canonical SPDX identifiers and valid SPDX expressions where the license is represented in SPDX. A human-readable legal text MUST accompany every license grant that requires one.

### LIC-03.06 — Copyright or ownership ambiguity MUST block redistribution…

**Requirement:** Copyright or ownership ambiguity MUST block redistribution of the affected component until resolved by documented owner/legal review; a repository-wide claim MUST NOT override a third-party notice.

## Prohibited conditions

- Do not claim ownership of code or media based only on possession of a copy or a commit in this repository.
- Do not remove attribution or upstream notices during refactoring, vendoring, minification, or packaging.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to file-level copyright and contribution provenance. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Run REUSE lint or an equivalent inventory check; sample file headers, generated assets, contributor records, release notices, and third-party attribution.
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
