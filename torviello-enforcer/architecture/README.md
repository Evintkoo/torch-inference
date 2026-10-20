# architecture domain

**Development stage:** DDD

This directory contains 5 normative control document(s) and the generated enforcement tests for the **architecture** domain (Architecture and modularity). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| ARC-01 | [01-module-ownership-and-dependencies.md](rules/01-module-ownership-and-dependencies.md) | PA-010–PA-014, ED-004–ED-005, RP-014–RP-015 | [tests/test_01_module_ownership_and_dependencies.py](tests/test_01_module_ownership_and_dependencies.py) | Module ownership and dependencies |
| ARC-02 | [02-optional-capabilities-and-build-profiles.md](rules/02-optional-capabilities-and-build-profiles.md) | PA-010–PA-014, ED-004–ED-005, RP-014–RP-015 | [tests/test_02_optional_capabilities_and_build_profiles.py](tests/test_02_optional_capabilities_and_build_profiles.py) | Optional capabilities and build profiles |
| ARC-03 | [03-system-context-and-architecture-views.md](rules/03-system-context-and-architecture-views.md) | PA-013–PA-014, ED-005 | [tests/test_03_system_context_and_architecture_views.py](tests/test_03_system_context_and_architecture_views.py) | System context and architecture views |
| ARC-04 | [04-boundaries-failures-and-resource-ownership.md](rules/04-boundaries-failures-and-resource-ownership.md) | PA-010–PA-014, RP-014–RP-015 | [tests/test_04_boundaries_failures_and_resource_ownership.py](tests/test_04_boundaries_failures_and_resource_ownership.py) | Boundaries, failures, and resource ownership |
| ARC-05 | [05-architecture-decisions-and-evolution.md](rules/05-architecture-decisions-and-evolution.md) | PA-010–PA-014, RP-011–RP-015, ED-005 | [tests/test_05_architecture_decisions_and_evolution.py](tests/test_05_architecture_decisions_and_evolution.py) | Architecture decisions and evolution |

## Detailed controls

### ARC-01 — Module ownership and dependencies

**Objective.** These controls govern **module ownership and dependencies**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** PA-010–PA-014, ED-004–ED-005, RP-014–RP-015

**Normative requirements:**

- **ARC-01.01 — Give each production module one primary responsibility, a named.** The project MUST give each production module one primary responsibility, a named owner, a small public interface, and explicit inputs, outputs, errors, and lifecycle.
- **ARC-01.02 — Keep dependency direction toward stable abstractions.** The project MUST keep dependency direction toward stable abstractions. Feature modules MAY depend on shared platform interfaces; shared infrastructure MUST NOT depend on concrete feature implementations.
- **ARC-01.03 — Keep another module's internals private.** The project MUST keep another module's internals private. Cross-module work uses a documented interface or event contract rather than reaching into private state or creating circular dependencies.
- **ARC-01.04 — Place API transport, domain logic, model execution, persistence.** The project MUST place API transport, domain logic, model execution, persistence, and presentation in separate layers. The project MUST also keep benchmark and test code outside production modules.
- **ARC-01.05 — The project MUST document which capabilities are optional, which.** For each module, the project MUST document which capabilities are optional, which resources it owns, which configuration it reads, and what readiness means.
- **ARC-01.06 — Update the system blueprint and dependency map when runtime.** The project MUST update the system blueprint and dependency map when runtime boundaries, services, trust zones, persistence, or external dependencies change.

**Rule document:** [rules/01-module-ownership-and-dependencies.md](rules/01-module-ownership-and-dependencies.md)

**Enforcement:** [tests/test_01_module_ownership_and_dependencies.py](tests/test_01_module_ownership_and_dependencies.py)

**Prohibited conditions:**

- The project MUST NOT create catch-all common, utils, helpers, or optimization modules without a defined owner and stable callers
- The project MUST NOT place performance tuning in an unrelated central file; keep it with the component whose behavior it changes
- The project MUST NOT share mutable state across services without an explicit consistency and ownership model
### ARC-02 — Optional capabilities and build profiles

**Objective.** These controls govern **optional capabilities and build profiles**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** PA-010–PA-014, ED-004–ED-005, RP-014–RP-015

**Normative requirements:**

- **ARC-02.01 — Make hardware backends and large optional runtimes selectable capabilities.** The project MUST make hardware backends and large optional runtimes selectable capabilities. Disabled capabilities MUST NOT pull their runtime dependencies into a minimal profile.
- **ARC-02.02 — Use additive Cargo features named after user-visible capabilities.** The project MUST use additive Cargo features named after user-visible capabilities and document their dependency effects. It MUST NOT use features that silently change unrelated behavior.
- **ARC-02.03 — Publish build profiles for minimal CPU, supported CPU features.** The project MUST publish build profiles for minimal CPU, supported CPU features, and each supported accelerator family. The matrix states exact OS, architecture, runtime, driver, and toolchain requirements.
- **ARC-02.04 — Each adapter MUST implement the same model lifecycle contract.** Each adapter MUST implement the same model lifecycle contract: capability discovery, load, readiness, inference, cancellation, shutdown, and typed failure
- **ARC-02.05 — Record architecture decisions for module boundaries, backend interfaces, serialization.** The project MUST record architecture decisions for module boundaries, backend interfaces, serialization, persistence, or compatibility, including alternatives and migration cost.

**Rule document:** [rules/02-optional-capabilities-and-build-profiles.md](rules/02-optional-capabilities-and-build-profiles.md)

**Enforcement:** [tests/test_02_optional_capabilities_and_build_profiles.py](tests/test_02_optional_capabilities_and_build_profiles.py)

**Prohibited conditions:**

- The project MUST NOT compile every backend into every artifact by default
- The project MUST NOT claim modularity merely because code is in separate files; verify that dependencies and build graph are independently selectable
- The project MUST NOT rely on undocumented feature unification or target-specific dependency behavior
### ARC-03 — System context and architecture views

**Objective.** This control defines the intended outcome for **system context and architecture views** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** PA-013–PA-014, ED-005

**Normative requirements:**

- **ARC-03.01 — The maintained system blueprint MUST identify system purpose….** **Requirement:** The maintained system blueprint MUST identify system purpose, primary user and operator concerns, system boundary, external actors, adjacent systems, trust boundaries, and deployment contexts.
- **ARC-03.02 — Architecture views MUST be selected to answer named stakeholder….** **Requirement:** Architecture views MUST be selected to answer named stakeholder concerns rather than drawn only to show code folders. At minimum, the blueprint MUST show runtime components and communication, data ownership and persistence, deployment/package profiles, external dependencies, and security trust boundaries.
- **ARC-03.03 — Each view MUST identify its scope, notation….** **Requirement:** Each view MUST identify its scope, notation or legend, last reviewed revision, and source of truth. A diagram that is partly generated MUST state which parts are generated and which require human review.
- **ARC-03.04 — Architecture changes MUST update affected views in the same….** **Requirement:** Architecture changes MUST update affected views in the same change or record why the view remains accurate. Reviewers MUST be able to trace a runtime component to its owning module, configuration, data stores, and external interfaces.
- **ARC-03.05 — Architecture constraints and quality attributes MUST be written as….** **Requirement:** Architecture constraints and quality attributes MUST be written as measurable scenarios that state stimulus, environment, affected component, response, and measure (for example, offline start after assets are installed, or model-load failure preserving readiness semantics).
- **ARC-03.06 — Alternative designs for material decisions MUST be compared against….** **Requirement:** Alternative designs for material decisions MUST be compared against requirements, operational burden, failure behavior, portability, security, build impact, and migration cost; record the selected option and rejected alternatives.

**Rule document:** [rules/03-system-context-and-architecture-views.md](rules/03-system-context-and-architecture-views.md)

**Enforcement:** [tests/test_03_system_context_and_architecture_views.py](tests/test_03_system_context_and_architecture_views.py)

**Prohibited conditions:**

- Do not treat a canvas or component diagram as a complete system description when data, deployment, trust, or external-service views are missing.
- Do not keep architecture drawings whose displayed boundaries contradict the shipped build or runtime graph.
### ARC-04 — Boundaries, failures, and resource ownership

**Objective.** This control defines the intended outcome for **boundaries, failures, and resource ownership** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** PA-010–PA-014, RP-014–RP-015

**Normative requirements:**

- **ARC-04.01 — Every module boundary MUST define the data it accepts….** **Requirement:** Every module boundary MUST define the data it accepts and returns, validation responsibility, error vocabulary, cancellation behavior, resource ownership, concurrency expectations, and lifecycle transitions.
- **ARC-04.02 — Dependencies MUST point toward stable abstractions. Dependency cycles….** **Requirement:** Dependencies MUST point toward stable abstractions. Dependency cycles MUST be prevented in the build graph or detected by an automated architecture check; shared modules MUST NOT import feature-specific policy or implementation details.
- **ARC-04.03 — A module MUST own or explicitly borrow every long-lived….** **Requirement:** A module MUST own or explicitly borrow every long-lived resource it creates, including threads, GPU contexts, memory pools, files, sockets, database connections, and child processes. Ownership and shutdown ordering MUST be explicit.
- **ARC-04.04 — Cross-module errors MUST preserve actionable internal context while mapping….** **Requirement:** Cross-module errors MUST preserve actionable internal context while mapping to a stable boundary error. A caller MUST be able to distinguish retryable, permanent, cancelled, unsupported, invalid-input, and resource-exhaustion outcomes where behavior differs.
- **ARC-04.05 — Failure propagation MUST be bounded. Define which failures….** **Requirement:** Failure propagation MUST be bounded. Define which failures are isolated to a request, module, model, process, or deployment; avoid cascading retries; and ensure cleanup runs on cancellation, timeout, partial initialization, and shutdown.
- **ARC-04.06 — Optional capability adapters MUST be conformant to shared lifecycle….** **Requirement:** Optional capability adapters MUST be conformant to shared lifecycle and error contracts. Capability discovery MUST not load the capability merely to determine whether it exists.
- **ARC-04.07 — Asynchronous boundaries MUST document queue ownership, backpressure….** **Requirement:** Asynchronous boundaries MUST document queue ownership, backpressure, ordering guarantees, delivery semantics, timeout budget, cancellation propagation, and behavior when the consumer disappears.

**Rule document:** [rules/04-boundaries-failures-and-resource-ownership.md](rules/04-boundaries-failures-and-resource-ownership.md)

**Enforcement:** [tests/test_04_boundaries_failures_and_resource_ownership.py](tests/test_04_boundaries_failures_and_resource_ownership.py)

**Prohibited conditions:**

- Do not expose mutable module internals as an undocumented integration surface.
- Do not allow a module to retain work or resources after its owning request, model, or service lifecycle has ended.
### ARC-05 — Architecture decisions and evolution

**Objective.** This control defines the intended outcome for **architecture decisions and evolution** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** PA-010–PA-014, RP-011–RP-015, ED-005

**Normative requirements:**

- **ARC-05.01 — A decision record MUST be created before committing….** **Requirement:** A decision record MUST be created before committing to a material change in module boundaries, public protocols, build profiles, backend abstraction, persistence, hosted/local split, or compatibility policy.
- **ARC-05.02 — Each decision record MUST state status, date….** **Requirement:** Each decision record MUST state status, date, owner, context, requirements, constraints, options considered, decision, consequences, security and operational implications, migration path, and superseded decisions.
- **ARC-05.03 — Architecture decisions MUST distinguish proven facts, measured results….** **Requirement:** Architecture decisions MUST distinguish proven facts, measured results, assumptions, and unresolved questions. Unverified assumptions that could invalidate the selection MUST become owned discovery tasks or open decisions.
- **ARC-05.04 — Architecture evolution MUST preserve explicit compatibility guarantees or document….** **Requirement:** Architecture evolution MUST preserve explicit compatibility guarantees or document a versioned transition plan. A deprecated interface MUST have a removal condition and consumer migration path.
- **ARC-05.05 — Architecture fitness checks SHOULD be automated for properties that….** **Requirement:** Architecture fitness checks SHOULD be automated for properties that can be checked mechanically, including allowed dependency direction, feature isolation, generated API compatibility, and forbidden production dependencies.
- **ARC-05.06 — An architecture decision MUST NOT silently convert an optional hosted….** **Requirement:** An architecture decision MUST NOT silently convert an optional hosted capability into a runtime dependency for the standalone local profile; changes to offline assumptions require an explicit product decision.

**Rule document:** [rules/05-architecture-decisions-and-evolution.md](rules/05-architecture-decisions-and-evolution.md)

**Enforcement:** [tests/test_05_architecture_decisions_and_evolution.py](tests/test_05_architecture_decisions_and_evolution.py)

**Prohibited conditions:**

- Do not record a decision after implementation merely to legitimize an undocumented choice.
- Do not claim a quality attribute such as portability, isolation, or offline operation without a scenario and verification evidence.

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/architecture
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
