# Torviello Requirements

This directory turns the originating manual review into requirements that can guide future specifications, technical designs, and implementation plans. It describes the intended product and engineering outcomes; it does not claim that the current repository already meets them.

## How to use these requirements

For a feature or remediation, first write a product or system specification that identifies the requirement IDs it addresses. Follow that with technical requirements and a plan before changing code. Keep decisions that affect architecture, security, supported platforms, or compatibility in a reviewed decision record. Requirements should be revised when discovery changes the scope. Engine requirements are additionally governed by the [assurance standard](assurance-standard.md), which defines the HPA-4 evidence bar and prohibits claiming conformance without reproducible evidence.

Each requirement has a stable ID and a priority:

- **MUST**: needed for the stated product direction or a safe release.
- **SHOULD**: expected unless a documented tradeoff justifies deferral.
- **COULD**: a candidate capability that requires product or technical validation.

“Acceptance” describes observable evidence for satisfying the requirement. It does not mandate a specific implementation unless the requirement says so.

## Per-requirement documents

Every requirement ID has its own document under [`items/`](items/README.md), with the normative statement, acceptance criteria, rule-control mapping, checks, verification procedure, evidence, and failure conditions. The tables in this directory remain the authoritative source and link to each per-ID document.

## Requirement sets

- [Product and architecture](product-and-architecture.md): product audience, modularity, releases, repository boundaries, model delivery, user-facing surfaces, and video production.
- [Runtime and platform](runtime-and-platform.md): configuration, inference backends, portability, deployment, persistence, and registry service.
- [Security and operations](security-and-operations.md): authentication discovery, security, logging, monitoring, and operational behavior.
- [Engineering and delivery](engineering-and-delivery.md): code quality, tests, packaging, documentation, design, and development workflow.
- [Product discovery and delivery lifecycle](product-discovery-and-delivery.md): evidence, problem framing, requirements, solution selection, experiments, planning, acceptance, and learning.
- [Organization, people, and stakeholder requirements](organization-and-people.md): role authority, workforce lifecycle, collaboration, external commitments, and organizational assurance.
- [Engine runtime](engine-runtime.md): engine configuration, lifecycle, backends, model catalog and acquisition, inference capabilities, realtime transports, batching, resilience, security, errors, observability, contracts, and platform profiles.
- [Engine requirement assurance standard](assurance-standard.md): HPA-4 requirement quality, verification, security, supply-chain, observability, evidence thresholds, exceptions, and overclaiming rules for the engine set.
- [Open decisions](open-decisions.md): questions that need evidence or owner decisions before the related requirements can be fully specified.

## Common standards requirements

These requirements support the individual rules under [`../torviello-enforcer/`](../torviello-enforcer/README.md). IDs remain stable so rule documents and future plans can refer to them.

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [CSC-001](items/CSC-001.md) | MUST | Every maintained directory shall have a `README.md` that describes its purpose, contents, interfaces, ownership, and relevant build or validation steps. | New or substantially changed directories have a useful README; rule-domain directories contain `README.md`, `AGENTS.md`, `trails/`, `rules/`, and `tests/`; the domain README indexes the numbered controls and their enforcement tests. |
| [CSC-002](items/CSC-002.md) | MUST | Every maintained directory shall have an `AGENTS.md` that gives concise, local instructions for coding agents. | Local instructions define scope, boundaries, relevant requirements, and required checks, and do not conflict with parent guidance; rule-domain instructions also point to `trails/00-references-trails.md` and the numbered normative documents under `rules/`. |
| [CSC-003](items/CSC-003.md) | MUST | `README.md` and `AGENTS.md` shall be the only general directory-level guidance files. | Directory-specific technical content lives in source/configuration or central `docs/`, `requirements/`, and `torviello-enforcer/`; format-specific exceptions are documented. |
| [CSC-004](items/CSC-004.md) | MUST | Each directory shall have a clear responsibility and avoid unrelated code, assets, and documentation. | The directory README states ownership and allowed contents; new boundaries are created only when they improve ownership, build, test, or distribution. |
| [CSC-005](items/CSC-005.md) | MUST | Code changes shall follow the specification, technical requirements, plan, implementation flow. | Feature work references its requirement IDs, acceptance evidence, and applicable plan. |
| [CSC-006](items/CSC-006.md) | MUST | Code quality checks shall detect formatting, lint, unused production code, and broad warning suppression. | Required checks are documented and enforced in CI; intentional exceptions are narrow and justified. |
| [CSC-007](items/CSC-007.md) | SHOULD | Files should remain focused and under 500 lines. | Oversized files are split by responsibility or have a documented exception and rationale. |
| [CSC-008](items/CSC-008.md) | MUST | Runtime diagnostics shall use structured logging and avoid exposing secrets or unnecessary user data. | Runtime paths use the shared logger; representative redaction and log-level behavior are verifiable. |
| [CSC-009](items/CSC-009.md) | MUST | Tests and benchmarks shall be kept in their dedicated categories and described by the owning area. | Unit, integration, end-to-end, and benchmark checks can be selected independently and list prerequisites. |
| [CSC-010](items/CSC-010.md) | MUST | Common rules shall be applied consistently without claiming that untouched legacy directories already comply. | New and substantially changed directories follow the rules; repository-wide adoption is planned and measurable. |

## Repository baseline

The latest reviewed `main` snapshot is a Rust/Actix-Web server with a separate Rust LLM service and a web frontend. TOML is already present as the primary documented configuration format. The repository has API/core modules, `benches/`, categorized tests, Docker Compose variants, Prometheus configuration, auth implementation, and extensive docs. These are useful foundations, but their presence alone does not establish production readiness or satisfy the manual review.

Specific findings that inform this set include:

- The root README describes `config.yaml`, while current configuration docs and `config.toml` use TOML.
- The root README and architecture docs describe different layouts and capabilities, so documentation needs an authoritative source.
- Many Rust modules suppress dead-code warnings; some direct `println!`/`eprintln!` calls remain. Command-line tools and test diagnostics may use standard output, but server runtime paths must use structured logging.
- Auth code and documentation exist, but the product identity, account lifecycle, hosted service boundary, and authorization model still need requirements gathering.
- No application database choice or persistence scope is established by the repository baseline.
- The monitoring directory has a basic Prometheus scrape configuration. Its presence does not define alerting, retention, access control, or production operation.

## Scope and sequencing

This is a requirements baseline, not a mandate to rewrite every subsystem at once. Work should be split into independently releasable capabilities, starting with discovery where a requirement depends on an unresolved product or architecture decision. Each delivery should identify its requirement IDs, acceptance evidence, compatibility impact, and rollback or migration needs.
