# Model, dataset, font, and media rights

**Control family:** licensing  
**Control document:** LIC-04  
**Requirement trace:** ED-040–ED-041, RP-012, SO-012  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **model, dataset, font, and media rights** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed licensing behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### LIC-04.01 — Every model, tokenizer, dataset, font…

**Requirement:** Every model, tokenizer, dataset, font, image, icon, audio, video, and documentation asset MUST have a record of source, exact version or digest, applicable license/terms, attribution, modification status, commercial-use status, redistribution rights, and approval owner.

### LIC-04.02 — Model weights and code MUST be assessed separately…

**Requirement:** Model weights and code MUST be assessed separately. A permissive software license MUST NOT be presumed to grant rights to model weights, tokenizer data, training data, outputs, trademarks, or hosted APIs.

### LIC-04.03 — Dataset terms MUST be reviewed for collection provenance…

**Requirement:** Dataset terms MUST be reviewed for collection provenance, personal/sensitive data, intended processing, redistribution, retention, and downstream model restrictions before bundling or training.

### LIC-04.04 — Fonts, stock media, and icon packs MUST…

**Requirement:** Fonts, stock media, and icon packs MUST be checked for embedding, modification, redistribution, and offline-install rights; source URLs and purchase receipts or grants MUST be retained where applicable.

### LIC-04.05 — If an asset can only be fetched at runtime…

**Requirement:** If an asset can only be fetched at runtime, the user MUST be told the source, size, license/terms, network behavior, storage location, and verification method before activation.

### LIC-04.06 — Redistribution approval MUST bind to a concrete artifact version…

**Requirement:** Redistribution approval MUST bind to a concrete artifact version and jurisdiction/scope where terms differ. New versions MUST be rechecked for changed license or usage restrictions.

### LIC-04.07 — Automated license scanners MUST be supplemented with review…

**Requirement:** Automated license scanners MUST be supplemented with review for model/dataset/media assets that scanners cannot reliably identify.

## Prohibited conditions

- Do not bundle an asset because its public hosting page makes it downloadable.
- Do not rely on a model card or package metadata alone when the actual license text is ambiguous or contradictory.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to model, dataset, font, and media rights. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Verify asset manifest digests against shipped artifacts; inspect upstream license text, attribution rendering, offline installer contents, and legal approval evidence.
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

Source IDs R2,R3 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
