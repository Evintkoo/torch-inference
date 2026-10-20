# code-quality domain

**Development stage:** TDD

This directory contains 11 normative control document(s) and the generated enforcement tests for the **code-quality** domain (Code quality and maintainability). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| CQ-01 | [01-format-lint-and-warning-policy.md](rules/01-format-lint-and-warning-policy.md) | ED-001–ED-005, CSC-006–CSC-008 | [tests/test_01_format_lint_and_warning_policy.py](tests/test_01_format_lint_and_warning_policy.py) | Formatting, lint, and warnings |
| CQ-02 | [02-dead-code-file-size-and-logging.md](rules/02-dead-code-file-size-and-logging.md) | ED-001–ED-005, CSC-006–CSC-008 | [tests/test_02_dead_code_file_size_and_logging.py](tests/test_02_dead_code_file_size_and_logging.py) | Dead code, file size, and runtime logging |
| CQ-03 | [03-rust-api-safety-errors-and-unsafe-code.md](rules/03-rust-api-safety-errors-and-unsafe-code.md) | ED-001–ED-005 | [tests/test_03_rust_api_safety_errors_and_unsafe_code.py](tests/test_03_rust_api_safety_errors_and_unsafe_code.py) | Rust API safety, errors, and unsafe code |
| CQ-04 | [04-static-analysis-and-supply-chain-quality.md](rules/04-static-analysis-and-supply-chain-quality.md) | ED-001–ED-002, ED-014, ED-020 | [tests/test_04_static_analysis_and_supply_chain_quality.py](tests/test_04_static_analysis_and_supply_chain_quality.py) | Static analysis and dependency quality |
| CQ-05 | [05-maintainability-and-technical-debt.md](rules/05-maintainability-and-technical-debt.md) | ED-002–ED-005, CSC-006–CSC-010 | [tests/test_05_maintainability_and_technical_debt.py](tests/test_05_maintainability_and_technical_debt.py) | Maintainability and technical debt |
| CQ-06 | [06-system-level-maintainability-and-quality-attributes.md](rules/06-system-level-maintainability-and-quality-attributes.md) | ED-001–ED-005, ED-014, ED-042, PA-010–PA-014, CSC-006–CSC-010 | [tests/test_06_system_level_maintainability_and_quality_attributes.py](tests/test_06_system_level_maintainability_and_quality_attributes.py) | System-level maintainability and quality attributes |
| CQ-07 | [07-module-boundaries-cohesion-and-dependency-direction.md](rules/07-module-boundaries-cohesion-and-dependency-direction.md) | ED-001–ED-005, ED-014, PA-010–PA-014, CSC-004, CSC-007 | [tests/test_07_module_boundaries_cohesion_and_dependency_direction.py](tests/test_07_module_boundaries_cohesion_and_dependency_direction.py) | Module boundaries, cohesion, and dependency direction |
| CQ-08 | [08-local-code-readability-types-and-control-flow.md](rules/08-local-code-readability-types-and-control-flow.md) | ED-001–ED-003, ED-014, CSC-006–CSC-009 | [tests/test_08_local_code_readability_types_and_control_flow.py](tests/test_08_local_code_readability_types_and_control_flow.py) | Local code readability, types, and control flow |
| CQ-09 | [09-change-safe-refactoring-and-compatibility.md](rules/09-change-safe-refactoring-and-compatibility.md) | ED-002–ED-005, ED-011, ED-013–ED-014, ED-023, CSC-005–CSC-010 | [tests/test_09_change_safe_refactoring_and_compatibility.py](tests/test_09_change_safe_refactoring_and_compatibility.py) | Change-safe refactoring and compatibility |
| CQ-10 | [10-technical-debt-and-maintainability-operations.md](rules/10-technical-debt-and-maintainability-operations.md) | ED-002–ED-005, ED-014, CSC-006–CSC-010 | [tests/test_10_technical_debt_and_maintainability_operations.py](tests/test_10_technical_debt_and_maintainability_operations.py) | Technical debt and maintainability operations |
| CQ-11 | [11-function-design-and-implementation.md](rules/11-function-design-and-implementation.md) | ED-001–ED-005, ED-010–ED-014, CSC-005–CSC-009, PDL-006–PDL-007, PDL-013–PDL-014 | [tests/test_11_function_design_and_implementation.py](tests/test_11_function_design_and_implementation.py) | Function design and implementation procedure |

## Detailed controls

### CQ-01 — Formatting, lint, and warnings

**Objective.** These controls govern **formatting, lint, and warnings**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** ED-001–ED-005, CSC-006–CSC-008

**Normative requirements:**

- **CQ-01.01 — Run the selected formatter, compiler checks, and linter.** The project MUST run the selected formatter, compiler checks, and linter for every language in the changed area. CI runs the same required checks or a clearly documented equivalent.
- **CQ-01.02 — Rust production targets MUST pass formatting and Clippy's correctness.** Rust production targets MUST pass formatting and Clippy's correctness, suspicious, style, complexity, and performance defaults. Additional pedantic lints MAY be selected deliberately; restriction lints MUST be selected individually.
- **CQ-01.03 — Treat warnings as work to resolve.** The project MUST treat warnings as work to resolve. A lint allowance MUST be narrow, adjacent to the affected code, explain the false positive or intentional behavior, and have an owner when temporary.
- **CQ-01.04 — Keep the minimum supported Rust version and frontend runtime/toolchain.** The project MUST keep the minimum supported Rust version and frontend runtime/toolchain declared and tested. Lint configuration MUST NOT require a newer compiler than the support matrix.
- **CQ-01.05 — Lock dependency resolution for applications and review dependency feature.** The project MUST lock dependency resolution for applications and review dependency feature changes for build-size, portability, and security impact.

**Rule document:** [rules/01-format-lint-and-warning-policy.md](rules/01-format-lint-and-warning-policy.md)

**Enforcement:** [tests/test_01_format_lint_and_warning_policy.py](tests/test_01_format_lint_and_warning_policy.py)

**Prohibited conditions:**

- The project MUST NOT use crate-wide or repository-wide allow rules to hide unused code, unsafe behavior, or broken checks
- The project MUST NOT enable every Clippy restriction lint as a blanket policy; choose compatible rules based on project needs
- The project MUST NOT make CI silently skip formatting, lint, or type checks on a changed language
### CQ-02 — Dead code, file size, and runtime logging

**Objective.** These controls govern **dead code, file size, and runtime logging**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** ED-001–ED-005, CSC-006–CSC-008

**Normative requirements:**

- **CQ-02.01 — Remove unused production code and obsolete feature paths.** The project MUST remove unused production code and obsolete feature paths. If code MUST remain for a documented target or migration, gate it explicitly and identify the consumer.
- **CQ-02.02 — Keep source files focused and under 500 lines by.** The project SHOULD keep source files focused and under 500 lines by default. Split files at responsibility or ownership boundaries; line count alone is not a reason to create shallow fragments. Exceptions include a reason and a follow-up plan where practical.
- **CQ-02.03 — Keep API schemas, transport handlers, business logic, and storage.** The project MUST keep API schemas, transport handlers, business logic, and storage code in separate modules with typed interfaces.
- **CQ-02.04 — Runtime services MUST use the shared structured logger.** Runtime services MUST use the shared structured logger. Rust println/eprintln and equivalent direct print calls MUST be limited to intentional CLI output, build output, or test diagnostics.
- **CQ-02.05 — Logs MUST exclude credentials, tokens, signing material, full prompts.** Logs MUST exclude credentials, tokens, signing material, full prompts, raw uploads, and unnecessary personal data. Untrusted fields MUST be sanitized against log injection.
- **CQ-02.06 — Use typed errors with stable public error mapping.** The project MUST use typed errors with stable public error mapping. Internal context belongs in protected logs; clients receive safe error codes and correlation identifiers.

**Rule document:** [rules/02-dead-code-file-size-and-logging.md](rules/02-dead-code-file-size-and-logging.md)

**Enforcement:** [tests/test_02_dead_code_file_size_and_logging.py](tests/test_02_dead_code_file_size_and_logging.py)

**Prohibited conditions:**

- The project MUST NOT keep dead code by adding broad warning suppressions
- The project MUST NOT split one responsibility across files only to meet a line limit
- The project MUST NOT log raw inference content for convenience or debugging in production
### CQ-03 — Rust API safety, errors, and unsafe code

**Objective.** This control defines the intended outcome for **rust api safety, errors, and unsafe code** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-001–ED-005

**Normative requirements:**

- **CQ-03.01 — Public Rust APIs MUST use types that make invalid….** **Requirement:** Public Rust APIs MUST use types that make invalid states difficult to represent, validate untrusted inputs at construction boundaries, and document invariants that callers MUST uphold.
- **CQ-03.02 — Public types and functions MUST define ownership, borrowing….** **Requirement:** Public types and functions MUST define ownership, borrowing, thread-safety, cancellation, error, and resource-lifetime expectations. Implement standard traits and conversion patterns where they preserve the abstraction and expected semantics.
- **CQ-03.03 — Every unsafe block MUST have a local safety comment….** **Requirement:** Every unsafe block MUST have a local safety comment identifying the invariant relied upon and how it is upheld. Unsafe code MUST be minimized, encapsulated behind a safe interface, and reviewed by a qualified reviewer.
- **CQ-03.04 — FFI and backend boundaries MUST validate pointer, buffer….** **Requirement:** FFI and backend boundaries MUST validate pointer, buffer length, alignment, ownership, ABI, thread-safety, and error contracts before converting data into safe Rust abstractions.
- **CQ-03.05 — Production code MUST use typed errors that preserve source….** **Requirement:** Production code MUST use typed errors that preserve source context internally and define stable conversion at process, API, CLI, and module boundaries. Error types MUST distinguish invalid input, unsupported capability, unavailable resources, cancellation, and internal faults when callers respond differently.
- **CQ-03.06 — Concurrency code MUST document shared-state synchronization and poison/recovery behavior….** **Requirement:** Concurrency code MUST document shared-state synchronization and poison/recovery behavior. Use atomics, locks, channels, or ownership transfer only where their consistency and cancellation semantics are understood.
- **CQ-03.07 — Public API changes MUST be checked for source compatibility….** **Requirement:** Public API changes MUST be checked for source compatibility, semver impact, and feature interactions before publication.

**Rule document:** [rules/03-rust-api-safety-errors-and-unsafe-code.md](rules/03-rust-api-safety-errors-and-unsafe-code.md)

**Enforcement:** [tests/test_03_rust_api_safety_errors_and_unsafe_code.py](tests/test_03_rust_api_safety_errors_and_unsafe_code.py)

**Prohibited conditions:**

- Do not add unsafe code to avoid an otherwise manageable ownership or allocation design without measured justification.
- Do not discard error causes with generic strings or silently convert failure into a default value.
### CQ-04 — Static analysis and dependency quality

**Objective.** This control defines the intended outcome for **static analysis and dependency quality** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-001–ED-002, ED-014, ED-020

**Normative requirements:**

- **CQ-04.01 — Each production language MUST have a documented, versioned….** **Requirement:** Each production language MUST have a documented, versioned formatter, linter, compiler/static-analysis configuration, and CI invocation. Local and CI commands MUST produce equivalent policy results.
- **CQ-04.02 — Production code MUST compile with the declared warning policy….** **Requirement:** Production code MUST compile with the declared warning policy. A lint suppression MUST be scoped to the smallest valid item, explain the exact false positive or intentional behavior, identify an owner, and have an expiry when the reason is temporary.
- **CQ-04.03 — Dependency changes MUST be reviewed for purpose, maintenance….** **Requirement:** Dependency changes MUST be reviewed for purpose, maintenance status, security advisories, license, transitive additions, enabled features, native binaries, build scripts, and supported-platform effects.
- **CQ-04.04 — Application dependency resolution MUST be locked for released binaries….** **Requirement:** Application dependency resolution MUST be locked for released binaries. Library packages MUST follow a documented policy for lockfiles and compatibility ranges.
- **CQ-04.05 — Automated analysis findings MUST be triaged by reachability….** **Requirement:** Automated analysis findings MUST be triaged by reachability and impact, but severity downgrades MUST include a written rationale and reviewer. A clean scanner report MUST NOT be treated as evidence that manual review is unnecessary.
- **CQ-04.06 — Build scripts and procedural macros MUST be treated as….** **Requirement:** Build scripts and procedural macros MUST be treated as executable supply-chain inputs. Their network access, filesystem access, environment reads, and generated output MUST be reviewed and constrained.
- **CQ-04.07 — Analysis tools MUST fail clearly when unavailable or incompatible….** **Requirement:** Analysis tools MUST fail clearly when unavailable or incompatible; CI MUST NOT report success after a required analyzer was skipped.

**Rule document:** [rules/04-static-analysis-and-supply-chain-quality.md](rules/04-static-analysis-and-supply-chain-quality.md)

**Enforcement:** [tests/test_04_static_analysis_and_supply_chain_quality.py](tests/test_04_static_analysis_and_supply_chain_quality.py)

**Prohibited conditions:**

- Do not enable every lint as a blanket policy without checking compatibility with the declared compiler and dependency set.
- Do not suppress warnings globally to silence newly introduced findings.
### CQ-05 — Maintainability and technical debt

**Objective.** This control defines the intended outcome for **maintainability and technical debt** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-002–ED-005, CSC-006–CSC-010

**Normative requirements:**

- **CQ-05.01 — Production code MUST have one clear owner….** **Requirement:** Production code MUST have one clear owner and a cohesive reason to change. Split files and modules by behavior, interface, or lifecycle boundary; use the 500-line threshold as a review trigger, not as justification for shallow fragments.
- **CQ-05.02 — Dead or unreachable production paths MUST be removed unless….** **Requirement:** Dead or unreachable production paths MUST be removed unless a documented supported profile, migration, compatibility guarantee, or generated-code boundary requires them. Every retained conditional path MUST have a consumer and a test or build check.
- **CQ-05.03 — Complexity MUST be reduced when it obscures domain behavior….** **Requirement:** Complexity MUST be reduced when it obscures domain behavior or makes failure handling unreviewable. Prefer explicit state transitions and named abstractions over deeply nested branching, unbounded callback chains, and global mutable state.
- **CQ-05.04 — Code duplication MUST be consolidated only when behavior….** **Requirement:** Code duplication MUST be consolidated only when behavior and change ownership are genuinely shared. Similar-looking logic with different trust, lifecycle, or policy semantics MUST remain distinct or be parameterized explicitly.
- **CQ-05.05 — Performance optimization MUST be attached to the responsible component….** **Requirement:** Performance optimization MUST be attached to the responsible component, supported by a reproducible profile or benchmark, and include correctness and resource tradeoff evidence.
- **CQ-05.06 — Technical debt MUST be recorded with impact, affected….** **Requirement:** Technical debt MUST be recorded with impact, affected components, owner, and trigger or target date when it creates reliability, security, compatibility, or delivery risk.
- **CQ-05.07 — Runtime diagnostics MUST use shared structured logging; user-facing….** **Requirement:** Runtime diagnostics MUST use shared structured logging; user-facing CLI output and test diagnostics MUST remain intentionally separated from service logs.

**Rule document:** [rules/05-maintainability-and-technical-debt.md](rules/05-maintainability-and-technical-debt.md)

**Enforcement:** [tests/test_05_maintainability_and_technical_debt.py](tests/test_05_maintainability_and_technical_debt.py)

**Prohibited conditions:**

- Do not add catch-all utilities or abstractions without stable callers and named ownership.
- Do not keep code only because it was difficult to write; require a current supported use or remove it.
### CQ-06 — System-level maintainability and quality attributes

**Objective.** System maintainability is the ability to understand, change, verify, operate, and safely retire the product without disproportionate cost or risk. It is a system quality attribute shaped by architecture, team boundaries, dependencies, tests, documentation, and operational feedback—not a source-file metric alone.

**Requirements traced:** ED-001–ED-005, ED-014, ED-042, PA-010–PA-014, CSC-006–CSC-010

**Normative requirements:**

- **CQ-06.01 — For a substantial feature or architecture change, identify….** **Requirement:** For a substantial feature or architecture change, identify affected quality attributes such as correctness, security, reliability, compatibility, performance, portability, operability, testability, and modifiability. State measurable scenarios, affected stakeholders, constraints, and tradeoffs; do not optimize one attribute while leaving material effects on the others unexamined.
- **CQ-06.02 — Assess how many components, teams, deployment profiles….** **Requirement:** Assess how many components, teams, deployment profiles, data stores, APIs, and release artifacts MUST change for a representative future change. Reduce unnecessary change amplification through clear ownership and stable contracts, while preserving explicit coupling where consistency or latency requires it.
- **CQ-06.03 — Before adopting a pattern such as layered architecture….** **Requirement:** Before adopting a pattern such as layered architecture, ports-and-adapters, event-driven messaging, plugin architecture, actor isolation, or shared libraries, state the forces it addresses, constraints, consistency needs, failure behavior, operational burden, and simpler alternatives. Use the pattern only when it improves the measured or reviewable system property.
- **CQ-06.04 — A decision that changes trust boundaries, module ownership….** **Requirement:** A decision that changes trust boundaries, module ownership, deployment topology, public contracts, persistence, concurrency, or supported platforms MUST record context, constraints, alternatives, consequences, rejected options, and revisit triggers. Keep the record current when implementation materially diverges.
- **CQ-06.05 — Where a boundary is essential to product quality….** **Requirement:** Where a boundary is essential to product quality, encode it in dependency checks, API contract tests, build profiles, schema validation, fitness functions, or release gates. A diagram or guideline alone is insufficient when an automated check is practical and the boundary is frequently violated.
- **CQ-06.06 — Use defect recurrence, lead time for representative changes….** **Requirement:** Use defect recurrence, lead time for representative changes, dependency coupling, failed change rate, time to diagnose, flaky tests, and support incidents as contextual signals. No single metric or fixed threshold proves maintainability; interpret trends with code ownership, product change rate, and system scale.
- **CQ-06.07 — A module, service, abstraction, or repository….** **Requirement:** A module, service, abstraction, or repository split MUST have a clear owner and contract and justify the costs it adds in build, deployment, observability, versioning, network failure, testing, and operations. Prefer an in-process module when isolation or independent deployment does not justify a separate service.
- **CQ-06.08 — Design reviews MUST consider upgrade, migration, rollback….** **Requirement:** Design reviews MUST consider upgrade, migration, rollback, backward compatibility, data export/deletion, dependency end-of-life, and decommissioning where relevant. A design that is easy to launch but has no safe migration or retirement path is not maintainable.
- **CQ-06.09 — Material production incidents, recurring workarounds, high change….** **Requirement:** Material production incidents, recurring workarounds, high change amplification, repeated exceptions, or inability to test a boundary MUST trigger an architecture and maintainability review with an owner and disposition.

**Rule document:** [rules/06-system-level-maintainability-and-quality-attributes.md](rules/06-system-level-maintainability-and-quality-attributes.md)

**Enforcement:** [tests/test_06_system_level_maintainability_and_quality_attributes.py](tests/test_06_system_level_maintainability_and_quality_attributes.py)
### CQ-07 — Module boundaries, cohesion, and dependency direction

**Objective.** Modules must make responsibility, ownership, allowed dependencies, state, and change impact visible. The right boundary minimizes accidental coupling while keeping behavior that must change together cohesive.

**Requirements traced:** ED-001–ED-005, ED-014, PA-010–PA-014, CSC-004, CSC-007

**Normative requirements:**

- **CQ-07.01 — A module MUST own a coherent capability, policy….** **Requirement:** A module MUST own a coherent capability, policy, or lifecycle and expose a small interface suited to its callers. Group code by behavior and reasons to change rather than only by technical layer, file type, or current convenience.
- **CQ-07.02 — Document or encode permitted module dependencies….** **Requirement:** Document or encode which modules are permitted to depend on which others. Dependencies MUST point toward stable policy or explicit interfaces; shared foundational code MUST NOT depend upward on feature or transport implementations. Cycles and hidden reach-through MUST be removed or recorded as bounded migration debt.
- **CQ-07.03 — Place behavior together when it shares invariants, transaction….** **Requirement:** Place behavior together when it shares invariants, transaction boundaries, lifecycle, security authority, or release cadence. Separate behavior when it has distinct owners, trust levels, deployment needs, resource lifetimes, or independent change pressure. Do not split based only on file size or theoretical reuse.
- **CQ-07.04 — Export only types and operations required by legitimate consumers….** **Requirement:** Export only types and operations required by legitimate consumers. Internal details, mutable storage representations, backend-specific errors, and implementation-specific synchronization MUST remain private unless a documented contract requires exposure.
- **CQ-07.05 — At important module boundaries, use validated domain types….** **Requirement:** At important module boundaries, use validated domain types, enums for finite states, explicit units, and constructors that preserve invariants. Prefer compile-time guarantees when they improve clarity without creating disproportionate type complexity; validate dynamic input at the boundary.
- **CQ-07.06 — For each shared mutable state object, define its….** **Requirement:** For each shared mutable state object, define its owner, synchronization model, consistency guarantees, initialization and shutdown behavior, and failure handling. Avoid globals and shared mutable caches unless their lifetime, invalidation, concurrency, and test isolation are explicit.
- **CQ-07.07 — A module MUST expose errors that let callers choose….** **Requirement:** A module MUST expose errors that let callers choose a safe action without depending on private implementation details. Preserve causal context for diagnosis, classify retryability and user correction where relevant, and prevent secrets or internal topology from leaking across public boundaries.
- **CQ-07.08 — Test public behavior and invariants at the module boundary….** **Requirement:** Test public behavior and invariants at the module boundary. Add architecture or build checks for forbidden dependencies when regressions are likely; mocks MUST not encode a contract different from the real implementation.
- **CQ-07.09 — A temporary cross-boundary dependency MUST identify the owner….** **Requirement:** A temporary cross-boundary dependency MUST identify the owner, reason, affected callers, containment, removal condition, and expiry/review trigger. A compatibility adapter MAY preserve an older interface, but its lifecycle and removal criteria MUST be explicit.

**Rule document:** [rules/07-module-boundaries-cohesion-and-dependency-direction.md](rules/07-module-boundaries-cohesion-and-dependency-direction.md)

**Enforcement:** [tests/test_07_module_boundaries_cohesion_and_dependency_direction.py](tests/test_07_module_boundaries_cohesion_and_dependency_direction.py)
### CQ-08 — Local code readability, types, and control flow

**Objective.** Local code must communicate its intent and invariants to a future maintainer. Readability is a correctness and reviewability property: a reader should be able to follow inputs, state transitions, effects, and failures without reconstructing hidden conventions.

**Requirements traced:** ED-001–ED-003, ED-014, CSC-006–CSC-009

**Normative requirements:**

- **CQ-08.01 — Names MUST distinguish domain concepts, units, ownership….** **Requirement:** Names MUST distinguish domain concepts, units, ownership, lifetime, and state where ambiguity could cause misuse. Abbreviations are acceptable only when conventional for the audience; generic names such as `data`, `value`, `manager`, or `utils` require a narrow local context that makes their meaning unambiguous.
- **CQ-08.02 — A function SHOULD have one primary purpose, explicit….** **Requirement:** A function SHOULD have one primary purpose, explicit inputs and outputs, and bounded side effects. Split it when doing so clarifies a meaningful step or enables independent verification; do not fragment straightforward logic into chains of trivial wrappers that hide the flow.
- **CQ-08.03 — Prefer straightforward branches and explicit state transitions over deeply….** **Requirement:** Prefer straightforward branches and explicit state transitions over deeply nested conditions, hidden fallthrough, boolean mode flags, implicit retries, and mutation spread across callbacks. When complexity is necessary, name the states and transitions and test invalid or interrupted transitions.
- **CQ-08.04 — Use domain-specific types, enums, and constructors when….** **Requirement:** Use domain-specific types, enums, and constructors when they prevent mixing units, identities, states, or validated/unvalidated data. At dynamic boundaries, validate before side effects; do not rely on a type name or comment to imply an invariant that constructors and mutation can violate.
- **CQ-08.05 — Callers and reviewers MUST be able to identify I/O….** **Requirement:** Callers and reviewers MUST be able to identify I/O, allocation, blocking, locking, spawning, global state, and cancellation behavior from the API or local structure. In Rust, ownership and borrowing SHOULD express lifetime and mutation rules directly; synchronization primitives MUST match the required semantics.
- **CQ-08.06 — Propagate errors with relevant context when the caller can….** **Requirement:** Propagate errors with relevant context when the caller can recover or choose policy. Translate errors at a public boundary into stable, safe categories. Do not discard errors, panic on expected environmental or user input failures, or convert distinct failure modes into success-shaped defaults.
- **CQ-08.07 — Comments MUST explain why a constraint, workaround….** **Requirement:** Comments MUST explain why a constraint, workaround, unsafe operation, ordering, or non-obvious tradeoff exists and how it can be safely changed. Comments MUST remain consistent with code; remove restatements and stale TODOs or give each TODO an owner and actionable trigger.
- **CQ-08.08 — Before extracting a helper, trait, generic….** **Requirement:** Before extracting a helper, trait, generic, macro, or framework, identify repeated behavior and its invariant. Consolidate only when callers genuinely share semantics; use explicit separate implementations when similar code has different security, lifecycle, failure, or performance meaning.
- **CQ-08.09 — Use the repository formatter and lint policy for mechanical….** **Requirement:** Use the repository formatter and lint policy for mechanical consistency. Human review SHOULD focus on behavior, naming, invariants, and clarity rather than re-litigating formatter-owned details; exceptions MUST be narrow and justified.

**Rule document:** [rules/08-local-code-readability-types-and-control-flow.md](rules/08-local-code-readability-types-and-control-flow.md)

**Enforcement:** [tests/test_08_local_code_readability_types_and_control_flow.py](tests/test_08_local_code_readability_types_and_control_flow.py)
### CQ-09 — Change-safe refactoring and compatibility

**Objective.** Refactoring must reduce future change cost while preserving observable behavior and supported contracts. Safe change is staged so reviewers can distinguish structural movement from behavior changes and operators can recover from an unexpected result.

**Requirements traced:** ED-002–ED-005, ED-011, ED-013–ED-014, ED-023, CSC-005–CSC-010

**Normative requirements:**

- **CQ-09.01 — Before a consequential refactor, identify public and internal….** **Requirement:** Before a consequential refactor, identify public and internal consumers, persisted formats, API/CLI behavior, configuration, error semantics, timing/resource guarantees, supported build profiles, and operational procedures that MUST remain stable.
- **CQ-09.02 — Keep pure restructuring separate from feature changes when practical….** **Requirement:** Keep pure restructuring separate from feature changes when practical. If the changes are combined, label the behavior delta, rationale, test coverage, migration effect, and rollback boundary so reviewers can assess each independently.
- **CQ-09.03 — For legacy or poorly specified behavior, capture representative….** **Requirement:** For legacy or poorly specified behavior, capture representative examples, invariants, contract tests, or production-safe telemetry before refactoring. Tests MUST distinguish intended behavior from accidental behavior; do not freeze a vulnerability or defect as a permanent contract.
- **CQ-09.04 — Break large changes into small steps that compile….** **Requirement:** Break large changes into small steps that compile and can be reviewed. Preserve a working path, use adapters or expand-and-contract migrations when consumers change at different times, and avoid a big-bang rewrite unless a documented constraint makes incremental migration unsafe or more costly.
- **CQ-09.05 — For public APIs, configuration, persisted data….** **Requirement:** For public APIs, configuration, persisted data, model metadata, plugin interfaces, and release artifacts, define compatibility guarantees and deprecation windows. Breaking changes MUST include affected consumers, migration steps, versioning, and rollback or forward-recovery behavior.
- **CQ-09.06 — Keep an abstraction when it protects a real invariant….** **Requirement:** Keep an abstraction when it protects a real invariant, isolates volatile dependencies, enables required testing, or stabilizes a supported contract. Remove it when it obscures simple behavior, has no meaningful consumers, duplicates policy, or creates more change points than it saves.
- **CQ-09.07 — A refactor MUST run relevant contract, regression….** **Requirement:** A refactor MUST run relevant contract, regression, concurrency, error, performance, and platform checks according to the changed boundary. A claimed maintainability improvement MUST name the reduced coupling, complexity, duplication, or operational burden and show it did not simply relocate the cost.
- **CQ-09.08 — For stateful or deployed systems, test upgrade from….** **Requirement:** For stateful or deployed systems, test upgrade from supported prior states, interruption, restart, rollback, and mixed-version behavior as applicable. If rollback is unsafe, state the forward-recovery procedure and obtain release-owner acceptance before rollout.
- **CQ-09.09 — Unrelated cleanup MUST be excluded unless required for safe….** **Requirement:** Unrelated cleanup MUST be excluded unless required for safe migration. Temporary adapters, feature flags, duplicate paths, and compatibility shims MUST have an owner, usage evidence, removal condition, and review date.

**Rule document:** [rules/09-change-safe-refactoring-and-compatibility.md](rules/09-change-safe-refactoring-and-compatibility.md)

**Enforcement:** [tests/test_09_change_safe_refactoring_and_compatibility.py](tests/test_09_change_safe_refactoring_and_compatibility.py)
### CQ-10 — Technical debt and maintainability operations

**Objective.** Technical debt is a consciously or accidentally incurred cost that increases future change, failure, or operating risk. It must be visible and managed by impact and evidence, not used as a label for every imperfection or as a substitute for architectural decisions.

**Requirements traced:** ED-002–ED-005, ED-014, CSC-006–CSC-010

**Normative requirements:**

- **CQ-10.01 — A debt item MUST identify the affected component….** **Requirement:** A debt item MUST identify the affected component and users, current consequence, evidence or example, root cause, likelihood/impact, owner, mitigation, and a removal or reassessment trigger. “Refactor later” without a concrete consequence and owner is not an actionable debt record.
- **CQ-10.02 — Classify whether an item is a correctness/security defect….** **Requirement:** Classify whether an item is a correctness/security defect, an accepted risk, a compatibility constraint, missing capability, or maintainability debt. Route release-blocking defects through defect/security processes; do not downgrade them by relabeling as debt.
- **CQ-10.03 — Compare debt using change frequency, impact, blast….** **Requirement:** Compare debt using change frequency, impact, blast radius, user harm, security exposure, operational toil, incident history, remediation cost, and confidence. Address high-risk debt before adding dependent features; batch low-risk cleanup when it shares a safe change boundary.
- **CQ-10.04 — Track trends such as change lead time, review/rework….** **Requirement:** Track trends such as change lead time, review/rework, escaped defects, dependency fan-out, flaky tests, build duration, vulnerability age, incident toil, and exception renewals where useful. Metrics MUST have a defined population and interpretation; do not set individual performance targets from proxy measures.
- **CQ-10.05 — Planning MUST account for recurring maintenance, dependency upgrades….** **Requirement:** Planning MUST account for recurring maintenance, dependency upgrades, test reliability, and high-priority debt. The responsible owner MUST make the tradeoff visible when planned work defers a material risk or repeatedly consumes operator time.
- **CQ-10.06 — A workaround MUST identify the triggering condition, safe….** **Requirement:** A workaround MUST identify the triggering condition, safe operating envelope, monitoring signal, owner, expiry/review date, and permanent correction path. Reassess it when assumptions change, incidents occur, or its usage expands.
- **CQ-10.07 — For recurring or high-impact failures, analyze contributing architecture….** **Requirement:** For recurring or high-impact failures, analyze contributing architecture, review, testing, observability, and operational factors. Correct the system and controls where useful; do not stop at an individual fault or add process steps that do not address the failure mechanism.
- **CQ-10.08 — A debt item is complete only when its stated….** **Requirement:** A debt item is complete only when its stated consequence is removed or accepted under an explicit decision, affected tests/controls are updated, and residual risk is recorded. Verify the change in the environments and profiles where the debt existed.
- **CQ-10.09 — Owners MUST reassess material debt at planning/release boundaries….** **Requirement:** Owners MUST reassess material debt at planning/release boundaries and after incidents, dependency end-of-life, support changes, or repeated exception renewal. Retire stale items with rationale; keep unresolved high-risk items visible to the release and operational owners.

**Rule document:** [rules/10-technical-debt-and-maintainability-operations.md](rules/10-technical-debt-and-maintainability-operations.md)

**Enforcement:** [tests/test_10_technical_debt_and_maintainability_operations.py](tests/test_10_technical_debt_and_maintainability_operations.py)
### CQ-11 — Function design and implementation procedure

**Objective.** Provide a repeatable method for designing, implementing, testing, and reviewing functions so each function has an understandable contract, owns the right amount of work, handles invalid input and failure deliberately, and remains easy to change.

**Requirements traced:** ED-001–ED-005, ED-010–ED-014, CSC-005–CSC-009, PDL-006–PDL-007, PDL-013–PDL-014

**Normative requirements:**

- **CQ-11.02 — Give the function one cohesive responsibility.** A function MUST have one primary responsibility and a name that describes its observable action or result. Split it when it coordinates independent policies, mixes transport with domain or persistence behavior, has unrelated error paths, or requires many unrelated inputs. Keep cohesive sequences together when splitting would hide invariants or force callers to reconstruct a transaction. Length alone is a review signal, not an automatic extraction rule.
- **CQ-11.03 — Design an explicit contract.** Define parameters, return value, state changes, error cases, resource behavior, and invariants before implementation. Prefer types that make invalid states unrepresentable and encode units, identity, validated input, or state transitions where beneficial. Use distinct input/configuration types when a long positional argument list is ambiguous. Public functions MUST document purpose, important preconditions, errors/panics, safety constraints, and examples where callers cannot infer them from types and tests.
- **CQ-11.04 — Validate untrusted input at the authoritative boundary.** Validate external data once at the first trusted boundary, convert it to a validated internal type, and preserve that invariant through internal calls. Enforce business invariants in the authoritative domain/storage boundary as applicable; UI or caller validation is supplementary. Define behavior for missing, malformed, oversized, out-of-range, duplicate, unauthorized, and contradictory input relevant to the contract. Avoid redundant validation that obscures which layer owns the invariant.
- **CQ-11.05 — Make effects and ownership visible.** Keep pure computation free of I/O when that improves deterministic reasoning. Place filesystem, network, database, clock, randomness, process, GPU, and logging effects behind explicit dependencies or narrow adapters where practical. In Rust, use ownership and borrowing to express lifetimes and mutability; clone only when ownership requires it and the cost is understood. Do not hide expensive work, blocking calls, global state, or network access behind names that imply a cheap local computation.
- **CQ-11.06 — Define error behavior as part of the contract.** Return typed errors/results for expected operational failures; reserve panic for violated internal invariants or unrecoverable programming defects, never ordinary bad input or routine service failure. Add context at a boundary without discarding the cause; map internal errors to stable user/API/operator responses at the owning layer. Do not leak secrets, personal data, SQL parameters, filesystem internals, or sensitive model inputs in errors/logs. Retry only when the operation is safe/idempotent or protected by an idempotency mechanism; bound attempts and backoff.
- **CQ-11.07 — Bound resources, time, and concurrency.** For functions that process input, await work, allocate, query, or schedule tasks, define input/collection bounds, timeout/cancellation behavior, concurrency limits, backpressure, cleanup, and partial-result semantics as applicable. Do not hold locks across unbounded I/O. Ensure cancellation and early returns release resources and leave state consistent. Avoid detached tasks unless their owner, shutdown behavior, error reporting, and lifetime are explicit.
- **CQ-11.08 — Keep control flow direct and state transitions explicit.** Use early returns for guard failures when they improve clarity, match branches to meaningful states, and avoid deeply nested conditionals or boolean flags with unclear meaning. Every state mutation MUST have a clear owner and order. Do not silently swallow errors, use broad catch-all branches, or add fallback behavior that changes security or correctness assumptions. Comment on rationale/invariants, not syntax already expressed by code.
- **CQ-11.09 — Test the contract at the function’s appropriate seam.** Test representative valid behavior, boundary values, invalid input, failure propagation, side effects, and invariant preservation. Prefer a pure unit test for deterministic logic; use focused integration/contract tests for database, filesystem, network, runtime, or framework behavior. Inject controllable clocks, providers, or storage dependencies when nondeterminism otherwise prevents meaningful tests. Avoid tests coupled to private implementation details unless they guard a documented invariant.
- **CQ-11.10 — Review API impact and maintenance cost.** Before finalizing, inspect callers and public interfaces, error compatibility, performance/resource implications, accessibility/user-visible impact where relevant, and whether a new dependency or abstraction is warranted. Update docs, examples, API schemas, observability, and requirement trace for changed contracts. Prefer a small clear function contract over a generic framework unless multiple real use cases justify the framework.

**Rule document:** [rules/11-function-design-and-implementation.md](rules/11-function-design-and-implementation.md)

**Enforcement:** [tests/test_11_function_design_and_implementation.py](tests/test_11_function_design_and_implementation.py)

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/code-quality
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
