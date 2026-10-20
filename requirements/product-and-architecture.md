# Product and Architecture Requirements

## Product goals

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [PA-001](items/PA-001.md) | MUST | The product shall be usable by non-developers, configurable by operations staff, and extensible by developers. | A first-time user can install and run a supported package using documented steps; operators can configure deployment without changing source; developers can add a model capability through documented module interfaces. |
| [PA-002](items/PA-002.md) | MUST | The system shall support standalone local inference without requiring a Torviello hosted account or remote control plane. | A documented local deployment can start, load a local model, and serve inference with outbound network access disabled after required artifacts are present. |
| [PA-003](items/PA-003.md) | SHOULD | The product shall support an optional hosted platform for accounts, administration, and managed model/service configuration. | The boundary between local engine and hosted services is documented, and local inference remains operable if the hosted platform is unavailable. |
| [PA-004](items/PA-004.md) | SHOULD | The product shall provide two clear distributions: an inference engine package and a full package that includes the user-facing application and its supported services. | Release artifacts, install instructions, feature matrices, and versioning identify which distribution contains each capability. |

## Modular system

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [PA-010](items/PA-010.md) | MUST | Inference capabilities shall be organized as modules with explicit interfaces and dependencies. | The architecture describes module ownership, public interfaces, optional dependencies, and data flow; a module can be selected without compiling unrelated optional capabilities. |
| [PA-011](items/PA-011.md) | MUST | A build shall include only the capabilities selected for that distribution or deployment profile. | CI produces at least a minimal CPU engine build and a full build; dependency and artifact reports demonstrate that disabled optional backends are excluded. |
| [PA-012](items/PA-012.md) | SHOULD | Optional model and backend assets shall be discoverable and installable independently, including after initial installation. | An operator can list available capabilities, fetch a selected compatible asset, verify it, and run it without replacing the entire application. |
| [PA-013](items/PA-013.md) | MUST | The system architecture and module connections shall be represented in a maintained system blueprint. | The canvas or successor architecture view includes runtime services, module boundaries, external dependencies, data stores, and deployment paths; changes are reviewed alongside architecture changes. |
| [PA-014](items/PA-014.md) | SHOULD | Each service or component shall have one clear responsibility and a documented owner boundary. | A module map identifies responsibilities, inputs, outputs, and allowed dependencies; circular dependencies between feature modules are absent. |

## Repository boundaries

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [PA-020](items/PA-020.md) | MUST | Each unit's `src/` shall contain production code only. | Benchmarks, load/performance experiments, fixtures, and non-unit tests live outside `src/`; each unit documents the distinction. |
| [PA-021](items/PA-021.md) | MUST | Benchmark code and benchmark data shall live under `torviello-bench/`. | The benchmark inventory and developer instructions point to `torviello-bench/`; build targets and CI invoke benchmarks from that location. |
| [PA-022](items/PA-022.md) | MUST | Tests shall be separated by purpose within each unit, with unit, contract, and integration tests in distinct categories. | Each unit's `tests/unit`, `tests/contract`, and `tests/integration` trees and CI jobs make each category independently discoverable and runnable. |
| [PA-023](items/PA-023.md) | SHOULD | Docker and container assets shall live under a dedicated directory rather than accumulating at repository root. | Dockerfiles, Compose definitions, and related container configuration have a documented home and all build/release references use it. |
| [PA-024](items/PA-024.md) | MUST | This repository shall be the monorepo for `torviello-engine`, `torviello-serve`, `torviello-bench`, the proposed `torviello-cloud`, `torviello-design`, `torviello-landing`, `torviello-docs`, and `torviello-media`. | A repository map identifies each unit, its toolchain, build entry point, owner, and release lifecycle; media and website tooling remain independent of the inference runtime. |

## User-facing surfaces

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [PA-030](items/PA-030.md) | MUST | User-facing design assets and system rules shall live in `torviello-design/`, and application interfaces shall use a documented design system with atomic reusable components. | The design directory contains shared tokens, component patterns, accessibility expectations, and contribution guidance; new UI features use them. |
| [PA-031](items/PA-031.md) | SHOULD | Documentation shall be publishable as a rendered site sourced from the repository's documentation content. | A documented local build renders the supported docs tree, and a release or deployment process can publish the same content reproducibly. |
| [PA-032](items/PA-032.md) | COULD | The monorepo may include workflows for product demos and marketing media. | A separate scope and ownership decision defines tooling, assets, licensing, and release needs before these workflows become engine requirements. |
| [PA-033](items/PA-033.md) | MUST | Each website or web application shall have an explicit audience, information architecture, user journeys, responsive behavior, and operational design before implementation. | A reviewed design/spec identifies routes, content ownership, key tasks, states, accessibility expectations, performance/security constraints, analytics/privacy decisions, and acceptance checks. |
| [PA-034](items/PA-034.md) | MUST | Atomic design shall be applied as a vocabulary for reusable UI composition and shall not override cohesion, accessibility, ownership, or maintainability. | Components have documented responsibility, public API, states, design-system alignment, and usage evidence; abstractions are shared when repeated use and consistent behavior justify them. |
| [PA-035](items/PA-035.md) | MUST | Product demonstration and marketing video work shall have an owned, rights-cleared, accessible, reviewable production and publication lifecycle. | Each published video has an approved brief, source/provenance and rights record, validated claims, accessible captions/transcript, technical quality review, publication owner, source-project retention decision, and update/withdrawal path. |
| [PA-036](items/PA-036.md) | MUST | Reusable visual/audio design conventions, content templates, asset organization, technical profiles, and website integration shall be defined for video work. | Maintainers can produce a new approved video using documented templates and pinned/recorded production settings; reviewers can check design consistency, rights, accessibility, playback, and reproducibility from retained artifacts. |
