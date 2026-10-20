# licensing domain

**Development stage:** SDD

This directory contains 5 normative control document(s) and the generated enforcement tests for the **licensing** domain (Licensing and third-party assets). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| LIC-01 | [01-product-license-and-rights.md](rules/01-product-license-and-rights.md) | ED-040–ED-041, SO-012, RP-012 | [tests/test_01_product_license_and_rights.py](tests/test_01_product_license_and_rights.py) | Product licensing and rights |
| LIC-02 | [02-dependency-model-and-media-notices.md](rules/02-dependency-model-and-media-notices.md) | ED-040–ED-041, SO-012, RP-012 | [tests/test_02_dependency_model_and_media_notices.py](tests/test_02_dependency_model_and_media_notices.py) | Third-party software, model, and media notices |
| LIC-03 | [03-file-level-copyright-and-contribution-provenance.md](rules/03-file-level-copyright-and-contribution-provenance.md) | ED-040–ED-041, ED-020 | [tests/test_03_file_level_copyright_and_contribution_provenance.py](tests/test_03_file_level_copyright_and_contribution_provenance.py) | File-level copyright and contribution provenance |
| LIC-04 | [04-model-dataset-font-and-media-rights.md](rules/04-model-dataset-font-and-media-rights.md) | ED-040–ED-041, RP-012, SO-012 | [tests/test_04_model_dataset_font_and_media_rights.py](tests/test_04_model_dataset_font_and_media_rights.py) | Model, dataset, font, and media rights |
| LIC-05 | [05-license-policy-publication-and-commercial-controls.md](rules/05-license-policy-publication-and-commercial-controls.md) | ED-040–ED-041 | [tests/test_05_license_policy_publication_and_commercial_controls.py](tests/test_05_license_policy_publication_and_commercial_controls.py) | License policy publication and commercial controls |

## Detailed controls

### LIC-01 — Product licensing and rights

**Objective.** These controls govern **product licensing and rights**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** ED-040–ED-041, SO-012, RP-012

**Normative requirements:**

- **LIC-01.01 — The product policy MUST be defined as free personal.** The product policy MUST be defined as free personal use and licensed commercial use. The project MUST NOT publish or enforce that policy until the owner has confirmed rights and qualified legal review has approved the license terms and scope
- **LIC-01.02 — Confirm ownership and contribution rights for source code, artwork.** The project MUST confirm ownership and contribution rights for source code, artwork, fonts, video, documentation, datasets, and model assets before redistribution or sale.
- **LIC-01.03 — Keep license statements consistent across the top-level license, package.** The project MUST keep license statements consistent across the top-level license, package metadata, binary notices, website, and commercial terms. A source license MUST NOT be presumed to cover models or datasets.
- **LIC-01.04 — Record the approved license, effective version, copyright owner, grants.** The project MUST record the approved license, effective version, copyright owner, grants, restrictions, and review date. Revisit the policy before a major distribution or ownership change.

**Rule document:** [rules/01-product-license-and-rights.md](rules/01-product-license-and-rights.md)

**Enforcement:** [tests/test_01_product_license_and_rights.py](tests/test_01_product_license_and_rights.py)

**Prohibited conditions:**

- The project MUST NOT invent legal wording, promise exclusive rights, or assert ownership of third-party contributions without evidence
- The project MUST NOT assume a dependency's license grants rights to its model weights, training data, hosted service, or trademarks
- The project MUST NOT make commercial use claims before review is complete
### LIC-02 — Third-party software, model, and media notices

**Objective.** These controls govern **third-party software, model, and media notices**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** ED-040–ED-041, SO-012, RP-012

**Normative requirements:**

- **LIC-02.01 — Maintain an inventory of direct and transitive software dependencies.** The project MUST maintain an inventory of direct and transitive software dependencies and separately inventory model weights, datasets, fonts, images, audio, video, and other bundled assets.
- **LIC-02.02 — The project MUST record source, version or digest, SPDX.** For each asset, the project MUST record source, version or digest, SPDX identifier or license URL, attribution, redistribution terms, commercial-use restrictions, and approval status.
- **LIC-02.03 — Include a machine-readable SBOM and human-readable third-party notices in.** The project MUST include a machine-readable SBOM and human-readable third-party notices in every release. The project MUST also use canonical SPDX identifiers and expressions for known software licenses.
- **LIC-02.04 — Review license changes and distribution mode before upgrading.** The project MUST review license changes and distribution mode before upgrading or bundling an asset. If terms are unclear or incompatible, block redistribution until resolved.

**Rule document:** [rules/02-dependency-model-and-media-notices.md](rules/02-dependency-model-and-media-notices.md)

**Enforcement:** [tests/test_02_dependency_model_and_media_notices.py](tests/test_02_dependency_model_and_media_notices.py)

**Prohibited conditions:**

- The project MUST NOT mark an asset as cleared because its source is publicly downloadable
- The project MUST NOT ship assets with unknown provenance, missing required attribution, or unreviewed commercial restrictions
- The project MUST NOT silently remove third-party notices from smaller engine-only distributions
### LIC-03 — File-level copyright and contribution provenance

**Objective.** This control defines the intended outcome for **file-level copyright and contribution provenance** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-040–ED-041, ED-020

**Normative requirements:**

- **LIC-03.01 — Every distributed source file and non-code asset MUST have….** **Requirement:** Every distributed source file and non-code asset MUST have an identifiable rights basis, copyright owner where known, license or terms, and provenance record sufficient to determine whether modification and redistribution are permitted.
- **LIC-03.02 — Project-owned code MUST be accompanied by a contribution process….** **Requirement:** Project-owned code MUST be accompanied by a contribution process that makes the intended license and rights clear before accepting substantial external contributions. The process MUST state whether a contributor agreement, developer certificate, or other attestation is required.
- **LIC-03.03 — Imported snippets MUST retain applicable copyright and license notices….** **Requirement:** Imported snippets MUST retain applicable copyright and license notices and MUST be assessed for compatibility with the destination file and product distribution model.
- **LIC-03.04 — Generated source MUST record the generator and the rights….** **Requirement:** Generated source MUST record the generator and the rights basis of both generator and templates; generated content MUST not be assumed copyright-free.
- **LIC-03.05 — License metadata MUST use canonical SPDX identifiers and valid….** **Requirement:** License metadata MUST use canonical SPDX identifiers and valid SPDX expressions where the license is represented in SPDX. A human-readable legal text MUST accompany every license grant that requires one.
- **LIC-03.06 — Copyright or ownership ambiguity MUST block redistribution….** **Requirement:** Copyright or ownership ambiguity MUST block redistribution of the affected component until resolved by documented owner/legal review; a repository-wide claim MUST NOT override a third-party notice.

**Rule document:** [rules/03-file-level-copyright-and-contribution-provenance.md](rules/03-file-level-copyright-and-contribution-provenance.md)

**Enforcement:** [tests/test_03_file_level_copyright_and_contribution_provenance.py](tests/test_03_file_level_copyright_and_contribution_provenance.py)

**Prohibited conditions:**

- Do not claim ownership of code or media based only on possession of a copy or a commit in this repository.
- Do not remove attribution or upstream notices during refactoring, vendoring, minification, or packaging.
### LIC-04 — Model, dataset, font, and media rights

**Objective.** This control defines the intended outcome for **model, dataset, font, and media rights** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-040–ED-041, RP-012, SO-012

**Normative requirements:**

- **LIC-04.01 — Every model, tokenizer, dataset, font….** **Requirement:** Every model, tokenizer, dataset, font, image, icon, audio, video, and documentation asset MUST have a record of source, exact version or digest, applicable license/terms, attribution, modification status, commercial-use status, redistribution rights, and approval owner.
- **LIC-04.02 — Model weights and code MUST be assessed separately….** **Requirement:** Model weights and code MUST be assessed separately. A permissive software license MUST NOT be presumed to grant rights to model weights, tokenizer data, training data, outputs, trademarks, or hosted APIs.
- **LIC-04.03 — Dataset terms MUST be reviewed for collection provenance….** **Requirement:** Dataset terms MUST be reviewed for collection provenance, personal/sensitive data, intended processing, redistribution, retention, and downstream model restrictions before bundling or training.
- **LIC-04.04 — Fonts, stock media, and icon packs MUST….** **Requirement:** Fonts, stock media, and icon packs MUST be checked for embedding, modification, redistribution, and offline-install rights; source URLs and purchase receipts or grants MUST be retained where applicable.
- **LIC-04.05 — If an asset can only be fetched at runtime….** **Requirement:** If an asset can only be fetched at runtime, the user MUST be told the source, size, license/terms, network behavior, storage location, and verification method before activation.
- **LIC-04.06 — Redistribution approval MUST bind to a concrete artifact version….** **Requirement:** Redistribution approval MUST bind to a concrete artifact version and jurisdiction/scope where terms differ. New versions MUST be rechecked for changed license or usage restrictions.
- **LIC-04.07 — Automated license scanners MUST be supplemented with review….** **Requirement:** Automated license scanners MUST be supplemented with review for model/dataset/media assets that scanners cannot reliably identify.

**Rule document:** [rules/04-model-dataset-font-and-media-rights.md](rules/04-model-dataset-font-and-media-rights.md)

**Enforcement:** [tests/test_04_model_dataset_font_and_media_rights.py](tests/test_04_model_dataset_font_and_media_rights.py)

**Prohibited conditions:**

- Do not bundle an asset because its public hosting page makes it downloadable.
- Do not rely on a model card or package metadata alone when the actual license text is ambiguous or contradictory.
### LIC-05 — License policy publication and commercial controls

**Objective.** This control defines the intended outcome for **license policy publication and commercial controls** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-040–ED-041

**Normative requirements:**

- **LIC-05.01 — The approved product license MUST define personal and commercial….** **Requirement:** The approved product license MUST define personal and commercial use, grant scope, permitted and prohibited activities, territory or jurisdiction limits if any, termination, redistribution, warranty/liability terms, and how users obtain a commercial license.
- **LIC-05.02 — Before publication, qualified legal review MUST confirm….** **Requirement:** Before publication, qualified legal review MUST confirm the rights chain for project code and assets supports the proposed product terms, including employee/contractor assignments and third-party obligations.
- **LIC-05.03 — License and commercial terms MUST be consistent across repository….** **Requirement:** License and commercial terms MUST be consistent across repository license files, package metadata, download pages, installer notices, website, model registry, and sales/support communications.
- **LIC-05.04 — License enforcement MUST have a documented offline behavior….** **Requirement:** License enforcement MUST have a documented offline behavior, grace/expiry policy, key revocation behavior, privacy impact, appeal/support path, and failure recovery. Local inference MUST not unexpectedly become unavailable through a hosted entitlement outage unless that is an explicitly approved product contract.
- **LIC-05.05 — License service identity and signing keys MUST be separate….** **Requirement:** License service identity and signing keys MUST be separate from ordinary administrative credentials; issuance, renewal, revocation, and audit procedures MUST be restricted and recoverable.
- **LIC-05.06 — Each release MUST include required third-party notices and license….** **Requirement:** Each release MUST include required third-party notices and license texts in locations users can discover before and after installation.
- **LIC-05.07 — Any change to ownership, licensing model, bundling….** **Requirement:** Any change to ownership, licensing model, bundling, or commercial claims MUST trigger renewed legal review and release sign-off.

**Rule document:** [rules/05-license-policy-publication-and-commercial-controls.md](rules/05-license-policy-publication-and-commercial-controls.md)

**Enforcement:** [tests/test_05_license_policy_publication_and_commercial_controls.py](tests/test_05_license_policy_publication_and_commercial_controls.py)

**Prohibited conditions:**

- Do not promise that personal use is free or commercial use requires a license until approved terms are published and supported by a valid rights chain.
- Do not describe technical activation as proof that use is legally licensed.

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/licensing
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
