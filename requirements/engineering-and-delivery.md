# Engineering and Delivery Requirements

## Code health and structure

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [ED-001](items/ED-001.md) | MUST | The repository shall enforce Rust and JavaScript/TypeScript formatting, linting, and static checks in local guidance and CI. | `cargo fmt`, Clippy, and the selected frontend formatter/linter run on changed code; CI fails on violations rather than silently skipping them. |
| [ED-002](items/ED-002.md) | MUST | Production code shall not retain dead code or broad warning suppression as a substitute for a decision. | CI denies the selected dead-code warnings for production targets; any intentional exception is narrow, documented, and time-bounded where appropriate. |
| [ED-003](items/ED-003.md) | SHOULD | Source files shall remain reviewable, with 500 lines as the default upper bound. | CI or review tooling reports files above 500 lines; exceptions require a short rationale and a follow-up split plan when practical. |
| [ED-004](items/ED-004.md) | MUST | API schemas and handlers shall be organized into clear schema and functionality/category boundaries. | The API layout has a documented schema location and separate feature modules; handlers do not own unrelated business logic. |
| [ED-005](items/ED-005.md) | MUST | Modules shall expose intentional public interfaces and avoid cross-feature implementation coupling. | Architecture review can trace dependencies; module interfaces and visibility are covered by the module map. |

## Verification and quality gates

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [ED-010](items/ED-010.md) | MUST | Unit, integration, end-to-end, and benchmark checks shall be independently selectable. | CI has separate jobs or commands for each category, with environment and model prerequisites documented. |
| [ED-011](items/ED-011.md) | MUST | Every feature specification shall define observable acceptance checks before implementation. | Plans map requirement IDs to checks and expected outcomes; required checks run in CI or are explicitly recorded as manual release checks. |
| [ED-012](items/ED-012.md) | SHOULD | Performance claims shall be supported by repeatable benchmarks on declared hardware and input sets. | Benchmark reports include baseline, environment, workload, warmup, repetitions, and latency/throughput/resource measures. |
| [ED-013](items/ED-013.md) | MUST | Compatibility shall be checked across supported OS, architectures, and feature profiles. | CI or release qualification records a matrix result and names any unsupported combination. |
| [ED-014](items/ED-014.md) | SHOULD | The project shall track reliability and security findings with ownership and release impact. | Findings have severity, affected versions, acceptance evidence, and a resolution or documented deferral. |

## Packaging and release process

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [ED-020](items/ED-020.md) | MUST | Release automation shall produce signed or verifiable artifacts and a software bill of materials. | Each release publishes checksums, provenance/build metadata, and an SBOM; verification steps are documented. |
| [ED-021](items/ED-021.md) | MUST | Release workflows shall support a complete offline build from prepared, pinned inputs. | A clean-machine procedure successfully builds and packages supported targets without contacting external services during the build phase. |
| [ED-022](items/ED-022.md) | MUST | Packaging shall not depend on `.sh` scripts as the only way to build or install a release. | Windows, macOS, and Linux workflows each have a supported non-shell-specific entry point; platform-specific scripts may remain as wrappers where useful. |
| [ED-023](items/ED-023.md) | SHOULD | Releases shall define stable versioning, upgrade, downgrade, and configuration migration behavior. | Release notes and package metadata explain compatibility and required migrations; rollback is supported within the documented policy. |
| [ED-024](items/ED-024.md) | MUST | Container-related files shall be organized under a dedicated directory and invoked consistently by CI and documentation. | No root-level Docker or Compose definitions remain after migration; clean checkout workflows still build the supported images. |

## Documentation and design

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [ED-030](items/ED-030.md) | MUST | Documentation shall agree with the shipped configuration, endpoints, architecture, and release artifacts. | One authoritative index points to maintained references; examples are checked or exercised where feasible; contradictory setup guidance is removed. |
| [ED-031](items/ED-031.md) | MUST | The documentation source shall render through a maintained docs-site build. | A contributor can build the site locally from a clean checkout, and links/code examples receive automated checks appropriate to the toolchain. |
| [ED-032](items/ED-032.md) | SHOULD | The architecture canvas shall be generated or reviewed against the actual system and deployment boundaries. | A documented update process and review checklist keep the diagram aligned with implemented modules and external services. |
| [ED-033](items/ED-033.md) | SHOULD | UI components shall follow shared design tokens, accessibility rules, and reusable component patterns. | The design system is documented and key interactive flows pass automated accessibility checks plus targeted manual review. |

## Licensing and product governance

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [ED-040](items/ED-040.md) | MUST | Personal use shall be free, and commercial use shall require a license granted under the project owner's commercial terms, subject to confirming that the owner has the rights to offer those terms. | Qualified legal review confirms ownership, contribution rights, and third-party asset compatibility; repository license files, dependency notices, package metadata, and sales language state the approved policy consistently. |
| [ED-041](items/ED-041.md) | MUST | Copyright ownership and contribution rights shall be clear for the code and distributed assets. | Copyright notices, contributor terms if needed, model licenses, and third-party notices are reviewed and included in release artifacts. |
| [ED-042](items/ED-042.md) | MUST | Planning shall be enforced for feature work through a spec, technical requirements, plan, then implementation. | Each feature change links to those artifacts or records why a lightweight change does not need them; long-lived plans have an agreed storage and publication policy. |

## Development workflow (DDD → SDD → CDD → TDD → EDD)

These requirements make the five-stage flow a first-class, additive part of the engineering requirements set. They do not replace the requirements above.

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [ED-050](items/ED-050.md) | MUST | Feature work shall establish the domain model, ubiquitous language, invariants, and bounded contexts (DDD) before behavior is specified. | A maintained domain artifact records the model, glossary, business rules, and ownership; reviewers can trace behavior back to a domain rule. |
| [ED-051](items/ED-051.md) | MUST | Feature work shall state use cases, functional requirements with stable IDs, edge cases, and observable acceptance criteria (SDD) before implementation. | Specifications are testable and unambiguous, cite requirement IDs, and identify the domain rules they realize. |
| [ED-052](items/ED-052.md) | MUST | Component interactions shall be fixed by machine-readable, versioned contracts for interfaces and events (CDD). | OpenAPI/JSON Schema or equivalent contract artifacts exist and are checked by contract tests and schema linting. |
| [ED-053](items/ED-053.md) | MUST | Implementation shall be driven by failing tests for approved behaviors and edge cases (TDD), with unit, contract, and integration tests kept in their categories. | Required tests pass and their commands are recorded; weakening, skipping, or deleting tests to pass is treated as a defect. |
| [ED-054](items/ED-054.md) | MUST | The completed solution shall be evaluated against pre-established thresholds covering functionality, contracts, authorization, performance, and release-blocking defects (EDD). | A dated evaluation plan, metrics, and report record threshold results; unmet thresholds are reported as failures. |
| [ED-055](items/ED-055.md) | MUST | Every implementation change and test shall be traceable to a contract, specification, or business rule, and every critical requirement shall have implementation and verification evidence. | Requirement, contract, and control identifiers resolve in the repository; traceability and evaluation evidence exist for each critical requirement. |
