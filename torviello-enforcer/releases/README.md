# releases domain

**Development stage:** EDD

This directory contains 6 normative control document(s) and the generated enforcement tests for the **releases** domain (Packaging and release engineering). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| REL-01 | [01-reproducible-cross-platform-packaging.md](rules/01-reproducible-cross-platform-packaging.md) | RP-020–RP-024, ED-020–ED-024, SO-012, SO-031 | [tests/test_01_reproducible_cross_platform_packaging.py](tests/test_01_reproducible_cross_platform_packaging.py) | Reproducible cross-platform packaging |
| REL-02 | [02-artifact-integrity-provenance-and-sbom.md](rules/02-artifact-integrity-provenance-and-sbom.md) | RP-020–RP-024, ED-020–ED-024, SO-012, SO-031 | [tests/test_02_artifact_integrity_provenance_and_sbom.py](tests/test_02_artifact_integrity_provenance_and_sbom.py) | Artifact integrity, provenance, and SBOM |
| REL-03 | [03-release-gates-and-rollback.md](rules/03-release-gates-and-rollback.md) | RP-020–RP-024, ED-020–ED-024, SO-012, SO-031 | [tests/test_03_release_gates_and_rollback.py](tests/test_03_release_gates_and_rollback.py) | Release gates and rollback |
| REL-04 | [04-artifact-layout-versioning-and-support-lifecycle.md](rules/04-artifact-layout-versioning-and-support-lifecycle.md) | RP-020–RP-024, ED-020–ED-023 | [tests/test_04_artifact_layout_versioning_and_support_lifecycle.py](tests/test_04_artifact_layout_versioning_and_support_lifecycle.py) | Artifact layout, versioning, and support lifecycle |
| REL-05 | [05-install-upgrade-migration-and-rollback.md](rules/05-install-upgrade-migration-and-rollback.md) | RP-021–RP-024, RP-030–RP-034, SO-031 | [tests/test_05_install_upgrade_migration_and_rollback.py](tests/test_05_install_upgrade_migration_and_rollback.py) | Install, upgrade, migration, and rollback |
| REL-06 | [06-release-security-integrity-and-emergency-publication.md](rules/06-release-security-integrity-and-emergency-publication.md) | SO-012–SO-014, ED-020–ED-024 | [tests/test_06_release_security_integrity_and_emergency_publication.py](tests/test_06_release_security_integrity_and_emergency_publication.py) | Release security, integrity, and emergency publication |

## Detailed controls

### REL-01 — Reproducible cross-platform packaging

**Objective.** These controls govern **reproducible cross-platform packaging**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** RP-020–RP-024, ED-020–ED-024, SO-012, SO-031

**Normative requirements:**

- **REL-01.01 — Keep release/package definitions under /packaging and container definitions under.** The project MUST keep release/package definitions under /packaging and container definitions under /containers. The project MUST also provide an automation entry point that works across supported Windows, macOS, and Linux build environments.
- **REL-01.02 — Make platform-specific shell scripts the sole build or install.** The project MUST NOT make platform-specific shell scripts the sole build or install path. The project MUST also use a declarative or cross-platform workflow and keep shell scripts as optional wrappers only.
- **REL-01.03 — Record source revision, toolchain, dependency lock state, feature flags.** The project MUST record source revision, toolchain, dependency lock state, feature flags, model/runtime artifacts, environment inputs, and package commands for every artifact.
- **REL-01.04 — Support offline artifact construction from checked-in source.** The project MUST support offline artifact construction from checked-in source and a documented prepared cache. Distinguish online preparation of dependencies from the offline build itself.
- **REL-01.05 — Pin release inputs and produce the same artifact from.** The project MUST pin release inputs and produce the same artifact from equivalent inputs where the platform permits. The project MUST also document nondeterministic platform signing/notarization steps separately.
- **REL-01.06 — Build and install-test each product profile on its supported.** The project MUST build and install-test each product profile on its supported operating systems. The project MUST also exercise first start, health, graceful stop, upgrade, and rollback.

**Rule document:** [rules/01-reproducible-cross-platform-packaging.md](rules/01-reproducible-cross-platform-packaging.md)

**Enforcement:** [tests/test_01_reproducible_cross_platform_packaging.py](tests/test_01_reproducible_cross_platform_packaging.py)

**Prohibited conditions:**

- The project MUST NOT require GitHub, a vendor registry, or a package website during the actual offline build phase
- The project MUST NOT publish artifacts with unknown inputs or manually copied untracked files
- The project MUST NOT combine engine-only and full-package contents under ambiguous filenames
### REL-02 — Artifact integrity, provenance, and SBOM

**Objective.** These controls govern **artifact integrity, provenance, and sbom**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** RP-020–RP-024, ED-020–ED-024, SO-012, SO-031

**Normative requirements:**

- **REL-02.01 — Publish a cryptographic checksum for every release artifact.** The project MUST publish a cryptographic checksum for every release artifact. Sign artifacts where the target platform/distribution supports an established signing process.
- **REL-02.02 — Publish a machine-readable SBOM covering shipped binaries, containers, dependencies.** The project MUST publish a machine-readable SBOM covering shipped binaries, containers, dependencies, and bundled model/runtime assets where supported. The project MUST also include human-readable third-party notices.
- **REL-02.03 — Preserve build provenance that identifies source revision, builder, build.** The project MUST preserve build provenance that identifies source revision, builder, build process, and resolved inputs. The project MUST also adopt the highest practical SLSA Build track level for the selected build platform; state the level and verification method without overstating assurance.
- **REL-02.04 — Verify provenance, checksums, signatures, and package identity before installation.** The project MUST verify provenance, checksums, signatures, and package identity before installation where the distribution channel supports verification.
- **REL-02.05 — Build containers from maintained, pinned base images, use.** The project SHOULD build containers from maintained, pinned base images, use a .dockerignore, minimize unnecessary packages, run non-root where practical, and rebuild regularly for security updates.

**Rule document:** [rules/02-artifact-integrity-provenance-and-sbom.md](rules/02-artifact-integrity-provenance-and-sbom.md)

**Enforcement:** [tests/test_02_artifact_integrity_provenance_and_sbom.py](tests/test_02_artifact_integrity_provenance_and_sbom.py)

**Prohibited conditions:**

- The project MUST NOT treat a checksum hosted next to an unauthenticated artifact as proof of publisher identity
- The project MUST NOT claim a SLSA level without satisfying and verifying the versioned level requirements
- The project MUST NOT omit SBOM or notices from a smaller artifact when it still contains third-party components
### REL-03 — Release gates and rollback

**Objective.** These controls govern **release gates and rollback**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** RP-020–RP-024, ED-020–ED-024, SO-012, SO-031

**Normative requirements:**

- **REL-03.01 — Publish separate engine-only and full-package artifacts with an explicit.** The project MUST publish separate engine-only and full-package artifacts with an explicit contents/features matrix, version, platform support, prerequisites, model handling, and service dependencies.
- **REL-03.02 — Release gates MUST cover the build and install matrix.** Release gates MUST cover the build and install matrix, security findings, license review, SBOM/provenance, API/configuration compatibility, documentation, and release notes.
- **REL-03.03 — Use a defined versioning and deprecation policy.** The project MUST use a defined versioning and deprecation policy. Breaking API/config/data changes require migration instructions, support windows, and rollback/forward-recovery plans.
- **REL-03.04 — Preserve the prior known-good binary, configuration, registry, and model.** The project MUST preserve the prior known-good binary, configuration, registry, and model version until the upgrade is verified.
- **REL-03.05 — Provide consumers with a way to verify artifact identity.** The project MUST provide consumers with a way to verify artifact identity and report a vulnerability through a maintained channel.

**Rule document:** [rules/03-release-gates-and-rollback.md](rules/03-release-gates-and-rollback.md)

**Enforcement:** [tests/test_03_release_gates_and_rollback.py](tests/test_03_release_gates_and_rollback.py)

**Prohibited conditions:**

- The project MUST NOT ship a release with an unresolved exploitable critical issue without a documented risk decision and compensating control
- The project MUST NOT overwrite active models or persistent state during upgrade without an atomic migration and recovery point
- The project MUST NOT publish commercial or licensing claims inconsistent with reviewed terms
### REL-04 — Artifact layout, versioning, and support lifecycle

**Objective.** This control defines the intended outcome for **artifact layout, versioning, and support lifecycle** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-020–RP-024, ED-020–ED-023

**Normative requirements:**

- **REL-04.01 — Each release MUST define product version, artifact names….** **Requirement:** Each release MUST define product version, artifact names, target tuple, package type, feature profile, model/runtime inclusion, and compatibility scope in machine-readable metadata.
- **REL-04.02 — Engine-only and full-package artifacts MUST be independently installable….** **Requirement:** Engine-only and full-package artifacts MUST be independently installable and identifiable. They MUST document shared version relationships, allowed mixed versions, service dependencies, and upgrade path.
- **REL-04.03 — Package formats MUST follow target ecosystem conventions and define….** **Requirement:** Package formats MUST follow target ecosystem conventions and define install root, writable data paths, executable permissions, service identity, uninstall behavior, and user-owned state preservation.
- **REL-04.04 — Release channels MUST state stability and update policy….** **Requirement:** Release channels MUST state stability and update policy. Pre-release, stable, and security-fix channels MUST not overwrite one another’s artifact identities.
- **REL-04.05 — Every release MUST state supported prior application/config/schema versions….** **Requirement:** Every release MUST state supported prior application/config/schema versions, upgrade and downgrade behavior, breaking changes, and end-of-support dates where applicable.
- **REL-04.06 — Release metadata MUST bind checksums, signatures/provenance, SBOM….** **Requirement:** Release metadata MUST bind checksums, signatures/provenance, SBOM, notices, and artifacts by immutable digest.
- **REL-04.07 — Artifact retention MUST preserve the supported versions and recovery….** **Requirement:** Artifact retention MUST preserve the supported versions and recovery artifacts required by the published rollback/security policy.

**Rule document:** [rules/04-artifact-layout-versioning-and-support-lifecycle.md](rules/04-artifact-layout-versioning-and-support-lifecycle.md)

**Enforcement:** [tests/test_04_artifact_layout_versioning_and_support_lifecycle.py](tests/test_04_artifact_layout_versioning_and_support_lifecycle.py)

**Prohibited conditions:**

- Do not use a moving “latest” alias as the only identity for a released artifact.
- Do not publish the same filename for different bytes or target architectures.
### REL-05 — Install, upgrade, migration, and rollback

**Objective.** This control defines the intended outcome for **install, upgrade, migration, and rollback** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-021–RP-024, RP-030–RP-034, SO-031

**Normative requirements:**

- **REL-05.01 — Installers MUST verify package identity and integrity before executing….** **Requirement:** Installers MUST verify package identity and integrity before executing privileged operations and MUST explain requested privileges and network access.
- **REL-05.02 — Upgrade MUST stage new binaries and configuration, validate….** **Requirement:** Upgrade MUST stage new binaries and configuration, validate prerequisites and migrations, switch active versions atomically where feasible, and retain the previous known-good state until health verification passes.
- **REL-05.03 — Configuration and database migrations MUST be versioned, backed….** **Requirement:** Configuration and database migrations MUST be versioned, backed up when destructive, observable, and compatible with the rollback policy. If downgrade is unsupported, the installer MUST block it before modifying state and explain forward recovery.
- **REL-05.04 — Model assets MUST be versioned independently from binaries when….** **Requirement:** Model assets MUST be versioned independently from binaries when their size or lifecycle warrants it; model rollback MUST verify compatibility with the target runtime version.
- **REL-05.05 — Interrupted installation, power loss, disk full….** **Requirement:** Interrupted installation, power loss, disk full, permission failure, failed signature, failed migration, and first-start failure MUST leave a recoverable state and preserve user data.
- **REL-05.06 — Rollback MUST verify artifact integrity, restore compatible configuration/registry….** **Requirement:** Rollback MUST verify artifact integrity, restore compatible configuration/registry, and confirm readiness before returning traffic. Rollback MUST not reuse compromised signing keys or vulnerable artifacts without explicit risk approval.
- **REL-05.07 — Users and operators MUST receive a release summary describing….** **Requirement:** Users and operators MUST receive a release summary describing required actions, data/schema changes, compatibility, and rollback limitations before upgrade.

**Rule document:** [rules/05-install-upgrade-migration-and-rollback.md](rules/05-install-upgrade-migration-and-rollback.md)

**Enforcement:** [tests/test_05_install_upgrade_migration_and_rollback.py](tests/test_05_install_upgrade_migration_and_rollback.py)

**Prohibited conditions:**

- Do not overwrite active binaries or user configuration before candidate validation.
- Do not automatically retry a destructive migration after an ambiguous partial failure without checking its state.
### REL-06 — Release security, integrity, and emergency publication

**Objective.** This control defines the intended outcome for **release security, integrity, and emergency publication** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** SO-012–SO-014, ED-020–ED-024

**Normative requirements:**

- **REL-06.01 — Release credentials MUST be separated from build/test credentials….** **Requirement:** Release credentials MUST be separated from build/test credentials, scoped to the minimum publication action, short-lived where supported, and unavailable to untrusted pull-request code.
- **REL-06.02 — Release builds MUST use reviewed, pinned source revisions….** **Requirement:** Release builds MUST use reviewed, pinned source revisions and dependencies; builder identity, parameters, resolved inputs, and artifact digest MUST be captured in provenance.
- **REL-06.03 — Provenance and signatures MUST be published with a stable….** **Requirement:** Provenance and signatures MUST be published with a stable mapping to every artifact and verified before installation where the distribution channel supports verification.
- **REL-06.04 — SBOMs MUST identify shipped components and versions, include….** **Requirement:** SBOMs MUST identify shipped components and versions, include transitive dependencies and bundled runtime/model assets where tooling supports them, and be reconciled with package contents.
- **REL-06.05 — Security release decisions MUST assess exploitability, affected versions/profiles….** **Requirement:** Security release decisions MUST assess exploitability, affected versions/profiles, available mitigations, disclosure timing, patch compatibility, and users unable to update immediately.
- **REL-06.06 — Emergency publication MUST use a documented minimal workflow….** **Requirement:** Emergency publication MUST use a documented minimal workflow, independent approval, artifact verification, customer communication, and post-release audit; skipped checks MUST be recorded with owner and follow-up deadline.
- **REL-06.07 — Published artifacts, attestations, signatures, and release….** **Requirement:** Published artifacts, attestations, signatures, and release tags MUST be immutable; a corrected build MUST receive a new artifact identity and clear supersession notice.

**Rule document:** [rules/06-release-security-integrity-and-emergency-publication.md](rules/06-release-security-integrity-and-emergency-publication.md)

**Enforcement:** [tests/test_06_release_security_integrity_and_emergency_publication.py](tests/test_06_release_security_integrity_and_emergency_publication.py)

**Prohibited conditions:**

- Do not expose signing keys to build steps that execute pull-request or user-controlled code.
- Do not treat a checksum hosted beside an artifact as authenticity proof unless its distribution is independently authenticated.

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/releases
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
