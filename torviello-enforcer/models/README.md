# models domain

**Development stage:** CDD

This directory contains 6 normative control document(s) and the generated enforcement tests for the **models** domain (Model registry and artifact lifecycle). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| MOD-01 | [01-model-identity-metadata-and-compatibility.md](rules/01-model-identity-metadata-and-compatibility.md) | PA-012, RP-012, RP-014, RP-031, SO-010–SO-012, SO-031 | [tests/test_01_model_identity_metadata_and_compatibility.py](tests/test_01_model_identity_metadata_and_compatibility.py) | Model identity, metadata, and compatibility |
| MOD-02 | [02-secure-download-install-and-activation.md](rules/02-secure-download-install-and-activation.md) | PA-012, RP-012, RP-014, RP-031, SO-010–SO-012, SO-031 | [tests/test_02_secure_download_install_and_activation.py](tests/test_02_secure_download_install_and_activation.py) | Secure download, install, and activation |
| MOD-03 | [03-registry-administration-and-audit.md](rules/03-registry-administration-and-audit.md) | PA-012, RP-012, RP-014, RP-031, SO-010–SO-012, SO-031 | [tests/test_03_registry_administration_and_audit.py](tests/test_03_registry_administration_and_audit.py) | Registry administration and audit |
| MOD-04 | [04-model-evaluation-and-release-cards.md](rules/04-model-evaluation-and-release-cards.md) | RP-012–RP-014, SO-010–SO-012 | [tests/test_04_model_evaluation_and_release_cards.py](tests/test_04_model_evaluation_and_release_cards.py) | Model evaluation and release cards |
| MOD-05 | [05-model-runtime-isolation-and-resource-contracts.md](rules/05-model-runtime-isolation-and-resource-contracts.md) | RP-010–RP-015, SO-010–SO-011, SO-032 | [tests/test_05_model_runtime_isolation_and_resource_contracts.py](tests/test_05_model_runtime_isolation_and_resource_contracts.py) | Model runtime isolation and resource contracts |
| MOD-06 | [06-model-provenance-installation-and-update-trust.md](rules/06-model-provenance-installation-and-update-trust.md) | SO-012, RP-012, RP-031 | [tests/test_06_model_provenance_installation_and_update_trust.py](tests/test_06_model_provenance_installation_and_update_trust.py) | Model provenance, installation, and update trust |

## Detailed controls

### MOD-01 — Model identity, metadata, and compatibility

**Objective.** These controls govern **model identity, metadata, and compatibility**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** PA-012, RP-012, RP-014, RP-031, SO-010–SO-012, SO-031

**Normative requirements:**

- **MOD-01.01 — Give each model artifact a stable model ID.** The project MUST give each model artifact a stable model ID and immutable version or digest. Registry records specify task, format, source, license, input/output schema, tokenizer/preprocessor requirements, runtime/provider constraints, memory estimates, supported platform, and verification status.
- **MOD-01.02 — Separate model metadata from model bytes.** The project MUST separate model metadata from model bytes. A registry entry cannot claim available or ready until the corresponding artifact is present, digest-verified, compatible, and successfully loaded for the selected runtime.
- **MOD-01.03 — Treat model files, tokenizer data, configuration, and metadata as.** The project MUST treat model files, tokenizer data, configuration, and metadata as untrusted supply-chain inputs. The project MUST also record provenance and permitted redistribution.
- **MOD-01.04 — Define compatibility checks explicitly.** The project MUST define compatibility checks explicitly. The project MUST NOT infer task, architecture, or provider support from filenames or extensions alone.
- **MOD-01.05 — Preserve immutable version history.** The project MUST preserve immutable version history. Updating a model means creating a new version and an explicit promotion or rollback operation.

**Rule document:** [rules/01-model-identity-metadata-and-compatibility.md](rules/01-model-identity-metadata-and-compatibility.md)

**Enforcement:** [tests/test_01_model_identity_metadata_and_compatibility.py](tests/test_01_model_identity_metadata_and_compatibility.py)

**Prohibited conditions:**

- The project MUST NOT mutate model bytes in place while retaining the same version/digest
- The project MUST NOT silently substitute a different model when the requested artifact is missing
- The project MUST NOT bundle model assets until license and source terms have been reviewed
### MOD-02 — Secure download, install, and activation

**Objective.** These controls govern **secure download, install, and activation**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** PA-012, RP-012, RP-014, RP-031, SO-010–SO-012, SO-031

**Normative requirements:**

- **MOD-02.01 — Restrict downloads to configured or allowlisted sources.** The project MUST restrict downloads to configured or allowlisted sources. The project MUST also enforce TLS verification, safe redirect rules, connection and total timeouts, maximum size, disk-space checks, and bounded retries.
- **MOD-02.02 — Verify a cryptographic digest or signature before extracting.** The project MUST verify a cryptographic digest or signature before extracting or loading an artifact. Reject mismatches and retain evidence of the verification result.
- **MOD-02.03 — Extract archives into a staging directory after rejecting absolute.** The project MUST extract archives into a staging directory after rejecting absolute paths, parent traversal, links outside the destination, duplicate collisions, and excessive expanded size.
- **MOD-02.04 — Install and activate atomically.** The project MUST install and activate atomically. A failed or interrupted download, extraction, or model load leaves the prior active artifact intact.
- **MOD-02.05 — Separate download state, installed state, and active state.** The project MUST separate download state, installed state, and active state. The project MUST also report each explicitly to operators and readiness checks.
- **MOD-02.06 — Provide a preloaded/offline installation path for restricted deployments.** The project MUST provide a preloaded/offline installation path for restricted deployments.

**Rule document:** [rules/02-secure-download-install-and-activation.md](rules/02-secure-download-install-and-activation.md)

**Enforcement:** [tests/test_02_secure_download_install_and_activation.py](tests/test_02_secure_download_install_and_activation.py)

**Prohibited conditions:**

- The project MUST NOT load partially downloaded or unverified files
- The project MUST NOT trust remote filenames or metadata as local paths
- The project MUST NOT automatically activate a model solely because a download completed
### MOD-03 — Registry administration and audit

**Objective.** These controls govern **registry administration and audit**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** PA-012, RP-012, RP-014, RP-031, SO-010–SO-012, SO-031

**Normative requirements:**

- **MOD-03.01 — Registry mutations MUST require authenticated identity and least-privilege authorization.** Registry mutations MUST require authenticated identity and least-privilege authorization. The project MUST also separate view, add, promote, rollback, and delete permissions where the product requires distinct roles.
- **MOD-03.02 — Validate edits through one schema and policy layer whether.** The project MUST validate edits through one schema and policy layer whether they arrive through an admin API or a controlled manual file change.
- **MOD-03.03 — Audit actor, time, action, target model/version, outcome, and change.** The project MUST audit actor, time, action, target model/version, outcome, and change identifier. The project MUST NOT log tokens or secret configuration values.
- **MOD-03.04 — Make changes transactional: validate a candidate, persist it safely.** The project MUST make changes transactional: validate a candidate, persist it safely, then publish the new version. The project MUST provide a rollback to the last known-good registry state.
- **MOD-03.05 — The standalone engine MUST operate with a local registry/cache.** The standalone engine MUST operate with a local registry/cache and MUST NOT require a hosted control plane for local inference

**Rule document:** [rules/03-registry-administration-and-audit.md](rules/03-registry-administration-and-audit.md)

**Enforcement:** [tests/test_03_registry_administration_and_audit.py](tests/test_03_registry_administration_and_audit.py)

**Prohibited conditions:**

- The project MUST NOT let unauthenticated endpoints create, delete, promote, or redirect model assets
- The project MUST NOT expose filesystem paths or credentials through registry responses
- The project MUST NOT let hosted service failure corrupt local registry state
### MOD-04 — Model evaluation and release cards

**Objective.** This control defines the intended outcome for **model evaluation and release cards** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-012–RP-014, SO-010–SO-012

**Normative requirements:**

- **MOD-04.01 — Every model release MUST include a versioned model card….** **Requirement:** Every model release MUST include a versioned model card that identifies publisher, model/version digest, architecture/task, intended and prohibited use, input/output contract, tokenizer/pre/post-processing, training/evaluation provenance available to the publisher, known limitations, and license.
- **MOD-04.02 — Evaluation MUST use a documented task-relevant test set….** **Requirement:** Evaluation MUST use a documented task-relevant test set, preprocessing path, metric definition, baseline, and model/runtime versions. Results MUST be reproducible from a recorded command or harness revision.
- **MOD-04.03 — Quality claims MUST distinguish vendor-reported, independently reproduced….** **Requirement:** Quality claims MUST distinguish vendor-reported, independently reproduced, and locally measured results. Do not compare scores produced with different datasets, normalization, decoding parameters, hardware, or metric implementations without stating the difference.
- **MOD-04.04 — Before promotion, evaluate functional correctness, malformed inputs….** **Requirement:** Before promotion, evaluate functional correctness, malformed inputs, resource ceilings, cancellation, concurrency, numerical tolerance, and regressions against the previous approved model where compatibility matters.
- **MOD-04.05 — High-impact or sensitive use cases MUST map relevant NIST….** **Requirement:** High-impact or sensitive use cases MUST map relevant NIST AI RMF Govern/Map/Measure/Manage outcomes to model selection, evaluation, user disclosure, monitoring, and incident response; record excluded outcomes and rationale.
- **MOD-04.06 — Known bias, safety, privacy, robustness….** **Requirement:** Known bias, safety, privacy, robustness, and distribution-shift limitations MUST be disclosed with evidence and user/operational mitigations proportionate to intended use.
- **MOD-04.07 — Model updates MUST be evaluated before promotion and retain….** **Requirement:** Model updates MUST be evaluated before promotion and retain the previous approved digest and metadata for rollback.

**Rule document:** [rules/04-model-evaluation-and-release-cards.md](rules/04-model-evaluation-and-release-cards.md)

**Enforcement:** [tests/test_04_model_evaluation_and_release_cards.py](tests/test_04_model_evaluation_and_release_cards.py)

**Prohibited conditions:**

- Do not infer suitability from a model name, benchmark leaderboard, or vendor marketing claim.
- Do not claim fairness, safety, or accuracy beyond the tested populations, tasks, and conditions.
### MOD-05 — Model runtime isolation and resource contracts

**Objective.** This control defines the intended outcome for **model runtime isolation and resource contracts** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-010–RP-015, SO-010–SO-011, SO-032

**Normative requirements:**

- **MOD-05.01 — Each model descriptor MUST declare required runtime/provider, supported….** **Requirement:** Each model descriptor MUST declare required runtime/provider, supported data types and shapes, maximum input dimensions/sequence length, precision constraints, required assets, and estimated memory/compute needs when known.
- **MOD-05.02 — Model load MUST be a bounded lifecycle with explicit….** **Requirement:** Model load MUST be a bounded lifecycle with explicit queued, downloading, verifying, extracting, loading, ready, failed, unloading, and cancelled states where applicable. State transitions MUST be observable and invalid transitions rejected.
- **MOD-05.03 — Untrusted or third-party model parsing MUST run with least….** **Requirement:** Untrusted or third-party model parsing MUST run with least privilege and bounded CPU, memory, disk, file count, and wall-clock time. Custom operators or executable model payloads MUST be disabled unless an explicit review and isolation design approves them.
- **MOD-05.04 — Runtime adapters MUST enforce input and output shape….** **Requirement:** Runtime adapters MUST enforce input and output shape, dtype, tensor count, allocation, and execution-time limits before allocating or invoking backend operations.
- **MOD-05.05 — Cancellation and shutdown MUST release model resources within….** **Requirement:** Cancellation and shutdown MUST release model resources within a defined deadline or report the provider limitation. A stuck device operation MUST not block health, shutdown, or unrelated CPU requests indefinitely.
- **MOD-05.06 — GPU memory allocation and CPU fallback MUST be explicit….** **Requirement:** GPU memory allocation and CPU fallback MUST be explicit. Fallback MUST preserve the model contract or return a clear incompatibility/resource error; it MUST NOT silently change precision or quality behavior.
- **MOD-05.07 — Concurrent model loading and inference MUST have defined isolation….** **Requirement:** Concurrent model loading and inference MUST have defined isolation, memory admission, eviction, and fairness rules. A model MUST NOT evict or corrupt another active model without an explicit policy.

**Rule document:** [rules/05-model-runtime-isolation-and-resource-contracts.md](rules/05-model-runtime-isolation-and-resource-contracts.md)

**Enforcement:** [tests/test_05_model_runtime_isolation_and_resource_contracts.py](tests/test_05_model_runtime_isolation_and_resource_contracts.py)

**Prohibited conditions:**

- Do not execute model-provided code or custom operators in the privileged service process by default.
- Do not claim accelerator support for an untested provider/driver/device combination.
### MOD-06 — Model provenance, installation, and update trust

**Objective.** This control defines the intended outcome for **model provenance, installation, and update trust** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** SO-012, RP-012, RP-031

**Normative requirements:**

- **MOD-06.01 — Model manifests MUST bind publisher identity, immutable model/version….** **Requirement:** Model manifests MUST bind publisher identity, immutable model/version identity, file list, size, cryptographic digest, license, compatibility metadata, and any signature or attestation to the exact bytes installed.
- **MOD-06.02 — Downloaded model files MUST be written to an isolated….** **Requirement:** Downloaded model files MUST be written to an isolated temporary location, size-limited during transfer, verified before activation, and atomically moved into the immutable content-addressed store only after complete validation.
- **MOD-06.03 — Archive extraction MUST reject path traversal, absolute paths….** **Requirement:** Archive extraction MUST reject path traversal, absolute paths, duplicate/conflicting paths, symlink escape, excessive file count, excessive expansion, and special device files.
- **MOD-06.04 — Update trust MUST define trusted roots, key rotation….** **Requirement:** Update trust MUST define trusted roots, key rotation, expiration, rollback/freeze/mix-and-match defenses, metadata freshness, and recovery when signing keys are suspected compromised; use TUF or an equivalent reviewed update framework for remote catalogs.
- **MOD-06.05 — Failed network, signature, digest, license….** **Requirement:** Failed network, signature, digest, license, compatibility, disk-write, or activation checks MUST preserve the last known-good model and leave a diagnosable failure record.
- **MOD-06.06 — Local/offline installation MUST have an import path that verifies….** **Requirement:** Local/offline installation MUST have an import path that verifies the same identity, integrity, license, and compatibility data as remote installation.
- **MOD-06.07 — Model deletion MUST distinguish user-owned, shared, active….** **Requirement:** Model deletion MUST distinguish user-owned, shared, active, cached, and system-provided assets; active references MUST be released safely before bytes are removed.

**Rule document:** [rules/06-model-provenance-installation-and-update-trust.md](rules/06-model-provenance-installation-and-update-trust.md)

**Enforcement:** [tests/test_06_model_provenance_installation_and_update_trust.py](tests/test_06_model_provenance_installation_and_update_trust.py)

**Prohibited conditions:**

- Do not overwrite model bytes in place while retaining the same identifier or digest.
- Do not activate an artifact merely because its download completed successfully.

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/models
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
