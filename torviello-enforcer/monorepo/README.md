# monorepo domain

**Development stage:** DDD

This directory contains 4 normative control document(s) and the generated enforcement tests for the **monorepo** domain (Monorepo product boundaries). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| MON-01 | [01-product-area-ownership.md](rules/01-product-area-ownership.md) | PA-002–PA-004, PA-024, ED-024 | [tests/test_01_product_area_ownership.py](tests/test_01_product_area_ownership.py) | Product area ownership |
| MON-02 | [02-independent-products-and-releases.md](rules/02-independent-products-and-releases.md) | PA-002–PA-004, PA-024, ED-024 | [tests/test_02_independent_products_and_releases.py](tests/test_02_independent_products_and_releases.py) | Independent products and releases |
| MON-03 | [03-product-area-build-and-toolchain-isolation.md](rules/03-product-area-build-and-toolchain-isolation.md) | PA-020–PA-024, ED-001, ED-010 | [tests/test_03_product_area_build_and_toolchain_isolation.py](tests/test_03_product_area_build_and_toolchain_isolation.py) | Product-area build and toolchain isolation |
| MON-04 | [04-shared-assets-content-and-media-governance.md](rules/04-shared-assets-content-and-media-governance.md) | PA-024, PA-030–PA-032, ED-030–ED-033 | [tests/test_04_shared_assets_content_and_media_governance.py](tests/test_04_shared_assets_content_and_media_governance.py) | Shared assets, content, and media governance |

## Detailed controls

### MON-01 — Product area ownership

**Objective.** These controls govern **product area ownership**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** PA-002–PA-004, PA-024, ED-024

**Normative requirements:**

- **MON-01.01 — Keep the inference engine/application, hosted platform, landing page, docs.** The project MUST keep the inference engine/application, hosted platform, landing page, docs site, demos, and marketing media workflows as named product areas with clear owners and lifecycle.
- **MON-01.02 — Each product area MUST document its purpose, toolchain, dependencies.** Each product area MUST document its purpose, toolchain, dependencies, build/test entry points, deployment target, and release cadence in its own directory documentation.
- **MON-01.03 — Shared contracts such as API schemas, model metadata, design.** Shared contracts such as API schemas, model metadata, design tokens, and version policy MUST have one source of truth and a named owner.
- **MON-01.04 — Require an owner and a defined user or operational.** The project MUST require an owner and a defined user or operational outcome before adding a new product area.

**Rule document:** [rules/01-product-area-ownership.md](rules/01-product-area-ownership.md)

**Enforcement:** [tests/test_01_product_area_ownership.py](tests/test_01_product_area_ownership.py)

**Prohibited conditions:**

- The project MUST NOT let the frontend, marketing, or hosted control-plane toolchain become a dependency of the standalone inference engine
- The project MUST NOT copy shared contracts into separate projects and allow them to drift
- The project MUST NOT add a directory that has no owner, lifecycle, or build/test path
### MON-02 — Independent products and releases

**Objective.** These controls govern **independent products and releases**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** PA-002–PA-004, PA-024, ED-024

**Normative requirements:**

- **MON-02.01 — Define engine-only and full-package distributions by an explicit feature.** The project MUST define engine-only and full-package distributions by an explicit feature and service matrix. The engine package contains only backend inference capabilities and dependencies needed for that profile; full package composition is listed separately.
- **MON-02.02 — Build and release each distribution independently, even when versions.** The project MUST build and release each distribution independently, even when versions are coordinated. State version compatibility, model assets, service dependencies, upgrade path, and operating requirements.
- **MON-02.03 — Keep containers under /containers, packaging workflows under /packaging, performance.** The project MUST keep containers under /containers, packaging workflows under /packaging, performance work under /benchmarks, documentation source under the docs area, and design assets under the design area.
- **MON-02.04 — Coordinate cross-area changes through versioned contracts, migration steps.** The project MUST coordinate cross-area changes through versioned contracts, migration steps, and a rollout plan.
- **MON-02.05 — Keep local inference functional when hosted services, landing pages.** The project MUST keep local inference functional when hosted services, landing pages, or remote telemetry are unavailable.

**Rule document:** [rules/02-independent-products-and-releases.md](rules/02-independent-products-and-releases.md)

**Enforcement:** [tests/test_02_independent_products_and_releases.py](tests/test_02_independent_products_and_releases.py)

**Prohibited conditions:**

- The project MUST NOT force all users to install the full monorepo stack for standalone inference
- The project MUST NOT release a product artifact without identifying included components and support boundaries
- The project MUST NOT share mutable build outputs between incompatible products or targets
### MON-03 — Product-area build and toolchain isolation

**Objective.** This control defines the intended outcome for **product-area build and toolchain isolation** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** PA-020–PA-024, ED-001, ED-010

**Normative requirements:**

- **MON-03.01 — Each product area MUST own its dependency manifest….** **Requirement:** Each product area MUST own its dependency manifest, toolchain version, build/test/lint commands, generated outputs, secrets boundary, and deployment configuration.
- **MON-03.02 — The engine MUST build and test without installing website….** **Requirement:** The engine MUST build and test without installing website, demo-media, documentation-site, or hosted-platform toolchains unless an explicit shared interface requires them.
- **MON-03.03 — Changes to shared code MUST identify all consuming product….** **Requirement:** Changes to shared code MUST identify all consuming product areas and run their relevant contract, build, and compatibility checks. A shared-library API change MUST include migration guidance for each consumer.
- **MON-03.04 — CI MUST select jobs by changed ownership paths….** **Requirement:** CI MUST select jobs by changed ownership paths and declared dependency graph while still running repository-wide checks for shared build logic, release workflows, and security policies.
- **MON-03.05 — Product areas MUST not share mutable generated state….** **Requirement:** Product areas MUST not share mutable generated state, caches, environment files, or credentials unless the shared mechanism is explicitly owned and access-controlled.
- **MON-03.06 — Cross-area interfaces MUST use versioned contracts for API schemas….** **Requirement:** Cross-area interfaces MUST use versioned contracts for API schemas, model metadata, design tokens, content pipelines, and artifact handoff where independently deployed or built.
- **MON-03.07 — Ownership boundaries MUST identify a responsible maintainer or decision….** **Requirement:** Ownership boundaries MUST identify a responsible maintainer or decision owner; automated code ownership rules MUST be synchronized with the documented map.

**Rule document:** [rules/03-product-area-build-and-toolchain-isolation.md](rules/03-product-area-build-and-toolchain-isolation.md)

**Enforcement:** [tests/test_03_product_area_build_and_toolchain_isolation.py](tests/test_03_product_area_build_and_toolchain_isolation.py)

**Prohibited conditions:**

- Do not make a frontend or content toolchain a transitive compile prerequisite for the standalone engine.
- Do not share a single broad CI secret across unrelated product areas.
### MON-04 — Shared assets, content, and media governance

**Objective.** This control defines the intended outcome for **shared assets, content, and media governance** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** PA-024, PA-030–PA-032, ED-030–ED-033

**Normative requirements:**

- **MON-04.01 — Landing pages, documentation, demos, and marketing….** **Requirement:** Landing pages, documentation, demos, and marketing media MUST have named owners, source directories, build entry points, licensing records, and release lifecycle independent of engine runtime artifacts.
- **MON-04.02 — Product media MUST be stored and versioned separately from….** **Requirement:** Product media MUST be stored and versioned separately from executable runtime assets unless a documented product use requires bundling. Media build tooling MUST not enter the inference package dependency graph.
- **MON-04.03 — Content that names a release, endpoint, UI….** **Requirement:** Content that names a release, endpoint, UI behavior, or performance claim MUST identify its source artifact and release version so stale content can be detected.
- **MON-04.04 — Demo pipelines MUST use synthetic or explicitly approved data….** **Requirement:** Demo pipelines MUST use synthetic or explicitly approved data and reproducible model/runtime versions. They MUST not publish credentials, private user data, internal endpoints, or unsupported behavior.
- **MON-04.05 — Shared design tokens and components MUST be consumed through….** **Requirement:** Shared design tokens and components MUST be consumed through a defined package or source interface; independent applications MUST have a compatibility and versioning policy for those assets.
- **MON-04.06 — Published docs/media MUST retain required attribution, model notices….** **Requirement:** Published docs/media MUST retain required attribution, model notices, font/image licenses, and accessibility alternatives in both source and rendered output.
- **MON-04.07 — External hosting failure MUST not prevent a clean local….** **Requirement:** External hosting failure MUST not prevent a clean local engine build or local documentation preview when the relevant assets are already present.

**Rule document:** [rules/04-shared-assets-content-and-media-governance.md](rules/04-shared-assets-content-and-media-governance.md)

**Enforcement:** [tests/test_04_shared_assets_content_and_media_governance.py](tests/test_04_shared_assets_content_and_media_governance.py)

**Prohibited conditions:**

- Do not package marketing/demo tooling into the backend-only engine.
- Do not treat a public media URL as proof of redistribution rights.

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/monorepo
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
