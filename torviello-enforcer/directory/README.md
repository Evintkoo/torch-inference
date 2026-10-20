# directory domain

**Development stage:** DDD

This directory contains 4 normative control document(s) and the generated enforcement tests for the **directory** domain (Directory structure and ownership). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| DIR-01 | [01-purpose-ownership-and-boundaries.md](rules/01-purpose-ownership-and-boundaries.md) | CSC-001–CSC-004, CSC-010, PA-020–PA-023 | [tests/test_01_purpose_ownership_and_boundaries.py](tests/test_01_purpose_ownership_and_boundaries.py) | Purpose, ownership, and boundaries |
| DIR-02 | [02-directory-documentation-and-adoption.md](rules/02-directory-documentation-and-adoption.md) | CSC-001–CSC-004, CSC-010, PA-020–PA-023 | [tests/test_02_directory_documentation_and_adoption.py](tests/test_02_directory_documentation_and_adoption.py) | Directory documentation and adoption |
| DIR-03 | [03-layout-naming-and-ownership-contracts.md](rules/03-layout-naming-and-ownership-contracts.md) | CSC-001–CSC-004, PA-020–PA-024 | [tests/test_03_layout_naming_and_ownership_contracts.py](tests/test_03_layout_naming_and_ownership_contracts.py) | Layout, naming, and ownership contracts |
| DIR-04 | [04-test-data-generated-assets-and-boundary-migrations.md](rules/04-test-data-generated-assets-and-boundary-migrations.md) | CSC-003–CSC-010, PA-020–PA-024 | [tests/test_04_test_data_generated_assets_and_boundary_migrations.py](tests/test_04_test_data_generated_assets_and_boundary_migrations.py) | Test data, generated assets, and boundary migrations |

## Detailed controls

### DIR-01 — Purpose, ownership, and boundaries

**Objective.** These controls govern **purpose, ownership, and boundaries**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** CSC-001–CSC-004, CSC-010, PA-020–PA-023

**Normative requirements:**

- **DIR-01.01 — Every maintained directory MUST have one clear purpose.** Every maintained directory MUST have one clear purpose and an owning subsystem. Its local documentation MUST state what belongs there, public entry points, dependency boundaries, build/run/validation steps, and generated/runtime content.
- **DIR-01.02 — Place code and assets with the component that owns.** The project MUST place code and assets with the component that owns their lifecycle. Shared code belongs in an explicit shared module with documented consumers and stable interface.
- **DIR-01.03 — Create a directory only when it establishes a useful.** The project MUST create a directory only when it establishes a useful responsibility, build, test, deployment, or distribution boundary. The project MUST also separate unrelated concerns instead of turning an existing directory into a catch-all.
- **DIR-01.04 — Keep production application code under source directories, automated tests.** The project MUST keep production application code under source directories, automated tests under their named test categories, and benchmarks under /benchmarks. The project MUST NOT place performance harnesses or non-unit tests in production source.
- **DIR-01.05 — Keep Dockerfiles and Compose files under /containers, package/release automation.** The project MUST keep Dockerfiles and Compose files under /containers, package/release automation under /packaging, and design tokens/assets under a dedicated design area.

**Rule document:** [rules/01-purpose-ownership-and-boundaries.md](rules/01-purpose-ownership-and-boundaries.md)

**Enforcement:** [tests/test_01_purpose_ownership_and_boundaries.py](tests/test_01_purpose_ownership_and_boundaries.py)

**Prohibited conditions:**

- The project MUST NOT add root-level files merely because a tool defaults to the repository root
- The project MUST NOT mix build outputs, downloaded models, runtime data, or user configuration into source ownership directories
- The project MUST NOT introduce a directory hierarchy that only mirrors concepts without clarifying ownership
### DIR-02 — Directory documentation and adoption

**Objective.** These controls govern **directory documentation and adoption**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** CSC-001–CSC-004, CSC-010, PA-020–PA-023

**Normative requirements:**

- **DIR-02.01 — The repository root and maintained product directories MUST use.** The repository root and maintained product directories MUST use README.md for purpose and usage and AGENTS.md for coding-agent instructions. These files explain different things and MUST NOT duplicate whole documents.
- **DIR-02.02 — The rules root MUST use README.** The rules root MUST use README.md as its index and AGENTS.md for maintenance instructions. Each rules domain MUST contain 00-references-trails.md and numbered normative Markdown rule files, and MUST NOT use README/AGENTS files as substitutes
- **DIR-02.03 — The requirements root MUST use README.** The requirements root MUST use README.md as the requirement index and AGENTS.md for requirement maintenance. Requirement sets MUST use their own named Markdown documents and local guidance only where it adds value.
- **DIR-02.04 — Update directory docs when interfaces, ownership, dependencies, operations, supported.** The project MUST update directory docs when interfaces, ownership, dependencies, operations, supported build profiles, or validation steps change.
- **DIR-02.05 — Adopt documentation conventions when creating or substantially changing directories.** The project MUST adopt documentation conventions when creating or substantially changing directories. The project MUST also track legacy adoption as migration work rather than adding empty placeholder files everywhere.

**Rule document:** [rules/02-directory-documentation-and-adoption.md](rules/02-directory-documentation-and-adoption.md)

**Enforcement:** [tests/test_02_directory_documentation_and_adoption.py](tests/test_02_directory_documentation_and_adoption.py)

**Prohibited conditions:**

- The project MUST NOT treat a README or AGENTS file as the normative rule content of a rules domain
- The project MUST NOT leave stale README instructions that contradict actual config, scripts, endpoints, or directory layout
- The project MUST NOT create empty guidance files solely to satisfy a count
### DIR-03 — Layout, naming, and ownership contracts

**Objective.** This control defines the intended outcome for **layout, naming, and ownership contracts** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** CSC-001–CSC-004, PA-020–PA-024

**Normative requirements:**

- **DIR-03.01 — Every maintained directory MUST have one primary responsibility….** **Requirement:** Every maintained directory MUST have one primary responsibility and an accountable owning subsystem. The owner MUST define allowed contents, public entry points, dependencies, generated content, and lifecycle.
- **DIR-03.02 — Directory and file names MUST be stable, searchable….** **Requirement:** Directory and file names MUST be stable, searchable, language-appropriate, and consistent with the repository convention. Names MUST NOT encode temporary status, personal ownership, or implementation details likely to change independently of the content.
- **DIR-03.03 — Each boundary MUST correspond to a real ownership….** **Requirement:** Each boundary MUST correspond to a real ownership, build, test, deployment, or distribution concern. Create a new module when it reduces coupling or provides independent selection; do not create levels of nesting that merely repeat product names.
- **DIR-03.04 — Public interfaces and shared assets MUST have one authoritative….** **Requirement:** Public interfaces and shared assets MUST have one authoritative location. Compatibility aliases or duplicate copies MUST identify their source of truth, synchronization mechanism, and planned removal condition.
- **DIR-03.05 — Directory-level docs MUST distinguish source, generated output….** **Requirement:** Directory-level docs MUST distinguish source, generated output, runtime data, fixtures, vendored code, and user-owned data. Build and cleanup tools MUST not delete user-owned or checked-in source data.
- **DIR-03.06 — Cross-cutting implementation MUST remain with the owning domain….** **Requirement:** Cross-cutting implementation MUST remain with the owning domain or a clearly owned shared interface; do not create a generic “optimization”, “misc”, or “common” directory without explicit scope and consumers.

**Rule document:** [rules/03-layout-naming-and-ownership-contracts.md](rules/03-layout-naming-and-ownership-contracts.md)

**Enforcement:** [tests/test_03_layout_naming_and_ownership_contracts.py](tests/test_03_layout_naming_and_ownership_contracts.py)

**Prohibited conditions:**

- Do not place credentials, local state, caches, or generated artifacts in source-owned directories without a defined reason and cleanup policy.
- Do not create an empty placeholder directory merely to satisfy a naming template.
### DIR-04 — Test data, generated assets, and boundary migrations

**Objective.** This control defines the intended outcome for **test data, generated assets, and boundary migrations** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** CSC-003–CSC-010, PA-020–PA-024

**Normative requirements:**

- **DIR-04.01 — Production source, unit tests, integration tests….** **Requirement:** Production source, unit tests, integration tests, end-to-end tests, benchmarks, fixtures, model assets, docs source, design assets, containers, and generated outputs MUST have distinct discoverable homes consistent with their lifecycle and execution needs.
- **DIR-04.02 — Fixtures MUST be deterministic, licensed for the intended….** **Requirement:** Fixtures MUST be deterministic, licensed for the intended use, free of production secrets and personal data, and small enough for routine checks unless an explicit large-data test is separately gated.
- **DIR-04.03 — Generated files MUST identify their generator and regeneration command….** **Requirement:** Generated files MUST identify their generator and regeneration command. Hand edits to generated files MUST either be prohibited or reconciled to the source generator before merge.
- **DIR-04.04 — Large models, datasets, videos, and benchmark….** **Requirement:** Large models, datasets, videos, and benchmark corpora MUST use an approved external artifact or local cache strategy with immutable identifiers, size, license, and checksum recorded; Git history MUST not become an unbounded binary store.
- **DIR-04.05 — Boundary migrations MUST update imports, build scripts….** **Requirement:** Boundary migrations MUST update imports, build scripts, CI, package manifests, documentation links, and release automation in the same planned change. Compatibility shims MUST have an owner and removal condition.
- **DIR-04.06 — Cleanup, formatting, and code-generation commands MUST be….** **Requirement:** Cleanup, formatting, and code-generation commands MUST be scoped so they cannot recursively delete or rewrite user data, unrelated products, vendored sources, or manually maintained artifacts.
- **DIR-04.07 — New directories MUST receive purpose and agent guidance required….** **Requirement:** New directories MUST receive purpose and agent guidance required by CSC-001/002 unless the directory is a documented rules-domain exception; do not create empty files without useful local content.

**Rule document:** [rules/04-test-data-generated-assets-and-boundary-migrations.md](rules/04-test-data-generated-assets-and-boundary-migrations.md)

**Enforcement:** [tests/test_04_test_data_generated_assets_and_boundary_migrations.py](tests/test_04_test_data_generated_assets_and_boundary_migrations.py)

**Prohibited conditions:**

- Do not put integration or performance tests under production source to simplify discovery.
- Do not move files without updating every workflow and consumer that names the old path.

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/directory
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
