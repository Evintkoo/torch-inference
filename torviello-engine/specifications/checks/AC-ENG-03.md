# AC-ENG-03 — A configured model descriptor exposes a stable model ID and declared backend.

**Check ID:** AC-ENG-03  
**Requirement:** RP-014  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** A configured model descriptor exposes a stable model ID and declared backend. AC-ENG-03 verifies RP-014 and fails when the threshold below is not met.
- **Measurable:** 100% of descriptors expose a unique, non-empty, stable model ID and declared backend; duplicate, empty, path-derived, and traversal-derived IDs are rejected; identity is unchanged across restart, download, load, and unload in 100% of cases.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** RP-014; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### RP-014 — Model loading and execution shall be isolated behind stable module interfaces

**Priority:** MUST  
**Requirement document:** [RP-014](../../../torviello-enforcer/requirements/items/RP-014.md)

Model loading and execution shall be isolated behind stable module interfaces.

**Acceptance:** Each backend adapter accepts a versioned model descriptor and exposes consistent load, readiness, inference, and failure behavior.


## 2. Observable check

A configured model descriptor exposes a stable model ID and declared backend.

The check is satisfied only when the result is produced by the shipping configuration and is reproducible from the recorded procedure. A debug-only path, a unit-test double, or a documentation statement does not satisfy it.

## 3. Feature scenarios

Background shared by the scenarios:

```gherkin
Given a local TOML configuration for profile "local"
```

#### Report configured capabilities

```gherkin
Given the configuration declares model "tiny" with backend "cpu"
    When the engine starts successfully
    Then health reports status "ok" and the engine version
    And the model catalog lists model "tiny" with backend "cpu"
```

#### Reject unknown configuration keys

```gherkin
Given the configuration contains an unknown key "accelerator"
    When the engine starts
    Then startup fails with error code "config.unknown_key"
    And no server accepts requests
```

#### Empty model catalog is valid

```gherkin
Given the configuration declares no models
    When the engine starts successfully
    Then health reports status "ok"
    And the model catalog is empty
```

#### Local mode requires no network

```gherkin
Given all required model assets are present
    When the engine starts with outbound network access disabled
    Then health reports status "ok"
    And no account or control-plane call is attempted
```


## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| ARC-01 | Module ownership and dependencies | [01-module-ownership-and-dependencies.md](../../../torviello-enforcer/architecture/rules/01-module-ownership-and-dependencies.md) |
| ARC-02 | Optional capabilities and build profiles | [02-optional-capabilities-and-build-profiles.md](../../../torviello-enforcer/architecture/rules/02-optional-capabilities-and-build-profiles.md) |
| ARC-04 | Boundaries, failures, and resource ownership | [04-boundaries-failures-and-resource-ownership.md](../../../torviello-enforcer/architecture/rules/04-boundaries-failures-and-resource-ownership.md) |
| ARC-05 | Architecture decisions and evolution | [05-architecture-decisions-and-evolution.md](../../../torviello-enforcer/architecture/rules/05-architecture-decisions-and-evolution.md) |
| MOD-01 | Model identity, metadata, and compatibility | [01-model-identity-metadata-and-compatibility.md](../../../torviello-enforcer/models/rules/01-model-identity-metadata-and-compatibility.md) |
| MOD-02 | Secure download, install, and activation | [02-secure-download-install-and-activation.md](../../../torviello-enforcer/models/rules/02-secure-download-install-and-activation.md) |
| MOD-03 | Registry administration and audit | [03-registry-administration-and-audit.md](../../../torviello-enforcer/models/rules/03-registry-administration-and-audit.md) |
| MOD-04 | Model evaluation and release cards | [04-model-evaluation-and-release-cards.md](../../../torviello-enforcer/models/rules/04-model-evaluation-and-release-cards.md) |
| MOD-05 | Model runtime isolation and resource contracts | [05-model-runtime-isolation-and-resource-contracts.md](../../../torviello-enforcer/models/rules/05-model-runtime-isolation-and-resource-contracts.md) |
| PERF-01 | Benchmark method and performance claims | [01-benchmark-method-and-performance-claims.md](../../../torviello-enforcer/performance/rules/01-benchmark-method-and-performance-claims.md) |
| PERF-02 | Resource bounds and accelerator tuning | [02-resource-bounds-and-accelerator-tuning.md](../../../torviello-enforcer/performance/rules/02-resource-bounds-and-accelerator-tuning.md) |
| PERF-04 | Accelerator backends, compatibility, and fallback | [04-accelerator-backend-compatibility-and-fallback.md](../../../torviello-enforcer/performance/rules/04-accelerator-backend-compatibility-and-fallback.md) |
| PORT-01 | Supported platform matrix | [01-supported-platform-matrix.md](../../../torviello-enforcer/portability/rules/01-supported-platform-matrix.md) |
| PORT-02 | Feature isolation and toolchain compatibility | [02-feature-isolation-and-toolchain-compatibility.md](../../../torviello-enforcer/portability/rules/02-feature-isolation-and-toolchain-compatibility.md) |
| PORT-05 | Cross-compilation, ABI, and native-runtime matrix | [05-cross-compilation-abi-and-native-runtime-matrix.md](../../../torviello-enforcer/portability/rules/05-cross-compilation-abi-and-native-runtime-matrix.md) |
| VER-05 | Model quality, hardware, and compatibility verification | [05-model-quality-hardware-and-compatibility-verification.md](../../../torviello-enforcer/verification/rules/05-model-quality-hardware-and-compatibility-verification.md) |

#### ARC-01.01 — Give each production module one primary responsibility, a named

The project MUST give each production module one primary responsibility, a named owner, a small public interface, and explicit inputs, outputs, errors, and lifecycle.

#### ARC-01.02 — Keep dependency direction toward stable abstractions

The project MUST keep dependency direction toward stable abstractions. Feature modules MAY depend on shared platform interfaces; shared infrastructure MUST NOT depend on concrete feature implementations.

#### ARC-01.03 — Keep another module's internals private

The project MUST keep another module's internals private. Cross-module work uses a documented interface or event contract rather than reaching into private state or creating circular dependencies.

#### ARC-01.04 — Place API transport, domain logic, model execution, persistence

The project MUST place API transport, domain logic, model execution, persistence, and presentation in separate layers. The project MUST also keep benchmark and test code outside production modules.

#### ARC-01.05 — The project MUST document which capabilities are optional, which

For each module, the project MUST document which capabilities are optional, which resources it owns, which configuration it reads, and what readiness means.

#### ARC-01.06 — Update the system blueprint and dependency map when runtime

The project MUST update the system blueprint and dependency map when runtime boundaries, services, trust zones, persistence, or external dependencies change.

#### ARC-02.01 — Make hardware backends and large optional runtimes selectable capabilities

The project MUST make hardware backends and large optional runtimes selectable capabilities. Disabled capabilities MUST NOT pull their runtime dependencies into a minimal profile.

#### ARC-02.02 — Use additive Cargo features named after user-visible capabilities

The project MUST use additive Cargo features named after user-visible capabilities and document their dependency effects. It MUST NOT use features that silently change unrelated behavior.

#### ARC-02.03 — Publish build profiles for minimal CPU, supported CPU features

The project MUST publish build profiles for minimal CPU, supported CPU features, and each supported accelerator family. The matrix states exact OS, architecture, runtime, driver, and toolchain requirements.

#### ARC-02.04 — Each adapter MUST implement the same model lifecycle contract

Each adapter MUST implement the same model lifecycle contract: capability discovery, load, readiness, inference, cancellation, shutdown, and typed failure

#### ARC-02.05 — Record architecture decisions for module boundaries, backend interfaces, serialization

The project MUST record architecture decisions for module boundaries, backend interfaces, serialization, persistence, or compatibility, including alternatives and migration cost.

#### ARC-04.01 — Every module boundary MUST define the data it accepts…

**Requirement:** Every module boundary MUST define the data it accepts and returns, validation responsibility, error vocabulary, cancellation behavior, resource ownership, concurrency expectations, and lifecycle transitions.

#### ARC-04.02 — Dependencies MUST point toward stable abstractions. Dependency cycles…

**Requirement:** Dependencies MUST point toward stable abstractions. Dependency cycles MUST be prevented in the build graph or detected by an automated architecture check; shared modules MUST NOT import feature-specific policy or implementation details.

#### ARC-04.03 — A module MUST own or explicitly borrow every long-lived…

**Requirement:** A module MUST own or explicitly borrow every long-lived resource it creates, including threads, GPU contexts, memory pools, files, sockets, database connections, and child processes. Ownership and shutdown ordering MUST be explicit.

#### ARC-04.04 — Cross-module errors MUST preserve actionable internal context while mapping…

**Requirement:** Cross-module errors MUST preserve actionable internal context while mapping to a stable boundary error. A caller MUST be able to distinguish retryable, permanent, cancelled, unsupported, invalid-input, and resource-exhaustion outcomes where behavior differs.

#### ARC-04.05 — Failure propagation MUST be bounded. Define which failures…

**Requirement:** Failure propagation MUST be bounded. Define which failures are isolated to a request, module, model, process, or deployment; avoid cascading retries; and ensure cleanup runs on cancellation, timeout, partial initialization, and shutdown.

#### ARC-04.06 — Optional capability adapters MUST be conformant to shared lifecycle…

**Requirement:** Optional capability adapters MUST be conformant to shared lifecycle and error contracts. Capability discovery MUST not load the capability merely to determine whether it exists.

#### ARC-04.07 — Asynchronous boundaries MUST document queue ownership, backpressure…

**Requirement:** Asynchronous boundaries MUST document queue ownership, backpressure, ordering guarantees, delivery semantics, timeout budget, cancellation propagation, and behavior when the consumer disappears.

#### ARC-05.01 — A decision record MUST be created before committing…

**Requirement:** A decision record MUST be created before committing to a material change in module boundaries, public protocols, build profiles, backend abstraction, persistence, hosted/local split, or compatibility policy.

#### ARC-05.02 — Each decision record MUST state status, date…

**Requirement:** Each decision record MUST state status, date, owner, context, requirements, constraints, options considered, decision, consequences, security and operational implications, migration path, and superseded decisions.

#### ARC-05.03 — Architecture decisions MUST distinguish proven facts, measured results…

**Requirement:** Architecture decisions MUST distinguish proven facts, measured results, assumptions, and unresolved questions. Unverified assumptions that could invalidate the selection MUST become owned discovery tasks or open decisions.

#### ARC-05.04 — Architecture evolution MUST preserve explicit compatibility guarantees or document…

**Requirement:** Architecture evolution MUST preserve explicit compatibility guarantees or document a versioned transition plan. A deprecated interface MUST have a removal condition and consumer migration path.

#### ARC-05.05 — Architecture fitness checks SHOULD be automated for properties that…

**Requirement:** Architecture fitness checks SHOULD be automated for properties that can be checked mechanically, including allowed dependency direction, feature isolation, generated API compatibility, and forbidden production dependencies.

#### ARC-05.06 — An architecture decision MUST NOT silently convert an optional hosted…

**Requirement:** An architecture decision MUST NOT silently convert an optional hosted capability into a runtime dependency for the standalone local profile; changes to offline assumptions require an explicit product decision.

#### MOD-01.01 — Give each model artifact a stable model ID

The project MUST give each model artifact a stable model ID and immutable version or digest. Registry records specify task, format, source, license, input/output schema, tokenizer/preprocessor requirements, runtime/provider constraints, memory estimates, supported platform, and verification status.

#### MOD-01.02 — Separate model metadata from model bytes

The project MUST separate model metadata from model bytes. A registry entry cannot claim available or ready until the corresponding artifact is present, digest-verified, compatible, and successfully loaded for the selected runtime.

#### MOD-01.03 — Treat model files, tokenizer data, configuration, and metadata as

The project MUST treat model files, tokenizer data, configuration, and metadata as untrusted supply-chain inputs. The project MUST also record provenance and permitted redistribution.

#### MOD-01.04 — Define compatibility checks explicitly

The project MUST define compatibility checks explicitly. The project MUST NOT infer task, architecture, or provider support from filenames or extensions alone.

#### MOD-01.05 — Preserve immutable version history

The project MUST preserve immutable version history. Updating a model means creating a new version and an explicit promotion or rollback operation.

#### MOD-02.01 — Restrict downloads to configured or allowlisted sources

The project MUST restrict downloads to configured or allowlisted sources. The project MUST also enforce TLS verification, safe redirect rules, connection and total timeouts, maximum size, disk-space checks, and bounded retries.

#### MOD-02.02 — Verify a cryptographic digest or signature before extracting

The project MUST verify a cryptographic digest or signature before extracting or loading an artifact. Reject mismatches and retain evidence of the verification result.

#### MOD-02.03 — Extract archives into a staging directory after rejecting absolute

The project MUST extract archives into a staging directory after rejecting absolute paths, parent traversal, links outside the destination, duplicate collisions, and excessive expanded size.

#### MOD-02.04 — Install and activate atomically

The project MUST install and activate atomically. A failed or interrupted download, extraction, or model load leaves the prior active artifact intact.

#### MOD-02.05 — Separate download state, installed state, and active state

The project MUST separate download state, installed state, and active state. The project MUST also report each explicitly to operators and readiness checks.

#### MOD-02.06 — Provide a preloaded/offline installation path for restricted deployments

The project MUST provide a preloaded/offline installation path for restricted deployments.

#### MOD-03.01 — Registry mutations MUST require authenticated identity and least-privilege authorization

Registry mutations MUST require authenticated identity and least-privilege authorization. The project MUST also separate view, add, promote, rollback, and delete permissions where the product requires distinct roles.

#### MOD-03.02 — Validate edits through one schema and policy layer whether

The project MUST validate edits through one schema and policy layer whether they arrive through an admin API or a controlled manual file change.

#### MOD-03.03 — Audit actor, time, action, target model/version, outcome, and change

The project MUST audit actor, time, action, target model/version, outcome, and change identifier. The project MUST NOT log tokens or secret configuration values.

#### MOD-03.04 — Make changes transactional: validate a candidate, persist it safely

The project MUST make changes transactional: validate a candidate, persist it safely, then publish the new version. The project MUST provide a rollback to the last known-good registry state.

#### MOD-03.05 — The standalone engine MUST operate with a local registry/cache

The standalone engine MUST operate with a local registry/cache and MUST NOT require a hosted control plane for local inference

#### MOD-04.01 — Every model release MUST include a versioned model card…

**Requirement:** Every model release MUST include a versioned model card that identifies publisher, model/version digest, architecture/task, intended and prohibited use, input/output contract, tokenizer/pre/post-processing, training/evaluation provenance available to the publisher, known limitations, and license.

#### MOD-04.02 — Evaluation MUST use a documented task-relevant test set…

**Requirement:** Evaluation MUST use a documented task-relevant test set, preprocessing path, metric definition, baseline, and model/runtime versions. Results MUST be reproducible from a recorded command or harness revision.

#### MOD-04.03 — Quality claims MUST distinguish vendor-reported, independently reproduced…

**Requirement:** Quality claims MUST distinguish vendor-reported, independently reproduced, and locally measured results. Do not compare scores produced with different datasets, normalization, decoding parameters, hardware, or metric implementations without stating the difference.

#### MOD-04.04 — Before promotion, evaluate functional correctness, malformed inputs…

**Requirement:** Before promotion, evaluate functional correctness, malformed inputs, resource ceilings, cancellation, concurrency, numerical tolerance, and regressions against the previous approved model where compatibility matters.

#### MOD-04.05 — High-impact or sensitive use cases MUST map relevant NIST…

**Requirement:** High-impact or sensitive use cases MUST map relevant NIST AI RMF Govern/Map/Measure/Manage outcomes to model selection, evaluation, user disclosure, monitoring, and incident response; record excluded outcomes and rationale.

#### MOD-04.06 — Known bias, safety, privacy, robustness…

**Requirement:** Known bias, safety, privacy, robustness, and distribution-shift limitations MUST be disclosed with evidence and user/operational mitigations proportionate to intended use.

#### MOD-04.07 — Model updates MUST be evaluated before promotion and retain…

**Requirement:** Model updates MUST be evaluated before promotion and retain the previous approved digest and metadata for rollback.

#### MOD-05.01 — Each model descriptor MUST declare required runtime/provider, supported…

**Requirement:** Each model descriptor MUST declare required runtime/provider, supported data types and shapes, maximum input dimensions/sequence length, precision constraints, required assets, and estimated memory/compute needs when known.

#### MOD-05.02 — Model load MUST be a bounded lifecycle with explicit…

**Requirement:** Model load MUST be a bounded lifecycle with explicit queued, downloading, verifying, extracting, loading, ready, failed, unloading, and cancelled states where applicable. State transitions MUST be observable and invalid transitions rejected.

#### MOD-05.03 — Untrusted or third-party model parsing MUST run with least…

**Requirement:** Untrusted or third-party model parsing MUST run with least privilege and bounded CPU, memory, disk, file count, and wall-clock time. Custom operators or executable model payloads MUST be disabled unless an explicit review and isolation design approves them.

#### MOD-05.04 — Runtime adapters MUST enforce input and output shape…

**Requirement:** Runtime adapters MUST enforce input and output shape, dtype, tensor count, allocation, and execution-time limits before allocating or invoking backend operations.

#### MOD-05.05 — Cancellation and shutdown MUST release model resources within…

**Requirement:** Cancellation and shutdown MUST release model resources within a defined deadline or report the provider limitation. A stuck device operation MUST not block health, shutdown, or unrelated CPU requests indefinitely.

#### MOD-05.06 — GPU memory allocation and CPU fallback MUST be explicit…

**Requirement:** GPU memory allocation and CPU fallback MUST be explicit. Fallback MUST preserve the model contract or return a clear incompatibility/resource error; it MUST NOT silently change precision or quality behavior.

#### MOD-05.07 — Concurrent model loading and inference MUST have defined isolation…

**Requirement:** Concurrent model loading and inference MUST have defined isolation, memory admission, eviction, and fairness rules. A model MUST NOT evict or corrupt another active model without an explicit policy.

#### PERF-01.01 — Define the workload and target before optimizing: model, input

The project MUST define the workload and target before optimizing: model, input size, concurrency, latency percentile, throughput, peak memory, CPU/GPU utilization, energy/idle draw, and binary/build cost as applicable.

#### PERF-01.02 — Record hardware, OS, compiler, runtime/provider, driver, model digest, input

The project MUST record hardware, OS, compiler, runtime/provider, driver, model digest, input corpus, warmup, repetitions, concurrency, and measurement method. The project MUST report distributions and percentiles where latency matters.

#### PERF-01.03 — Keep benchmark code, harnesses, datasets, and reports under /benchmarks

The project MUST keep benchmark code, harnesses, datasets, and reports under /benchmarks. The project MUST also keep benchmarks out of production source and normal app startup.

#### PERF-01.04 — Compare results to a versioned baseline on the same

The project MUST compare results to a versioned baseline on the same reference environment. The project MUST also define regression thresholds and investigate material regressions before release.

#### PERF-01.05 — Profile to locate a bottleneck before changing algorithms

The project MUST profile to locate a bottleneck before changing algorithms or adding concurrency. The project MUST report both the achieved improvement and any resource/correctness tradeoff.

#### PERF-02.01 — Bound request concurrency, queue depth, batch size, model count

The project MUST bound request concurrency, queue depth, batch size, model count, model memory, download size, temporary disk, and request execution time. Defaults MUST be safe on the minimum supported machine.

#### PERF-02.02 — Make tradeoffs between throughput, tail latency, memory, CPU load

The project MUST make tradeoffs between throughput, tail latency, memory, CPU load, GPU utilization, energy use, and idle power explicit in profiles or configuration.

#### PERF-02.03 — Maintain a backend matrix for CPU, CUDA, Metal, Vulkan

The project MUST maintain a backend matrix for CPU, CUDA, Metal, Vulkan, and AMD paths. Each claimed combination lists provider/runtime/driver versions, hardware, build flags, support level, and known limits.

#### PERF-02.04 — Backend selection MUST be observable and deterministic

Backend selection MUST be observable and deterministic. Fallback MUST be allowed only when configured and MUST report why the requested provider was unavailable.

#### PERF-02.05 — Use load shedding and backpressure rather than allowing unbounded

The project MUST use load shedding and backpressure rather than allowing unbounded queues. Overload has a documented client response, metric, and recovery condition.

#### PERF-02.06 — Preserve a CPU-only baseline and validate inference correctness on

The project MUST preserve a CPU-only baseline and validate inference correctness on every advertised backend before performance tuning.

#### PERF-04.01 — Each accelerator backend MUST publish a tested compatibility tuple…

**Requirement:** Each accelerator backend MUST publish a tested compatibility tuple covering hardware generation, OS/kernel, driver, runtime/provider, compiler/toolchain, model format, build feature, and precision modes.

#### PERF-04.02 — Capability discovery MUST report device identity, available memory…

**Requirement:** Capability discovery MUST report device identity, available memory, supported operations/precision, driver/runtime version, and rejection reason without requiring model execution or exposing unstable device secrets.

#### PERF-04.03 — Provider selection MUST be deterministic for a configured policy…

**Requirement:** Provider selection MUST be deterministic for a configured policy. Auto-selection MUST document priority, tie-breaking, and behavior when multiple devices or providers are present.

#### PERF-04.04 — Fallback to CPU or another provider MUST be explicit…

**Requirement:** Fallback to CPU or another provider MUST be explicit, observable, and validated for output correctness, numerical tolerance, performance expectations, and resource impact. Unsupported forced-provider requests MUST fail clearly.

#### PERF-04.05 — Backend initialization and runtime errors MUST identify whether…

**Requirement:** Backend initialization and runtime errors MUST identify whether the failure is transient, device-specific, model-specific, or unsupported; recovery MUST release partially initialized handles and not poison unrelated providers.

#### PERF-04.06 — Build profiles MUST exclude disabled accelerator dependencies and runtime…

**Requirement:** Build profiles MUST exclude disabled accelerator dependencies and runtime libraries. Binary packaging MUST include only legally redistributable libraries and state external driver/runtime prerequisites.

#### PERF-04.07 — Provider-specific optimizations MUST be gated by capability detection…

**Requirement:** Provider-specific optimizations MUST be gated by capability detection and have a correct baseline path; an optimization MUST not silently depend on undocumented hardware behavior.

#### PORT-01.01 — Publish a support matrix for each release: OS/version, architecture

The project MUST publish a support matrix for each release: OS/version, architecture, minimum CPU/instruction set, memory/storage floor, compiler/toolchain, runtime libraries, GPU provider, driver, and model format.

#### PORT-01.02 — Support the CPU-only profile as the portable baseline

The project MUST support the CPU-only profile as the portable baseline. Specialized CPU instructions are runtime-detected or excluded from targets that do not guarantee them.

#### PORT-01.03 — Claim Windows, macOS, Linux, CUDA, Metal, Vulkan, or AMD

The project MUST claim Windows, macOS, Linux, CUDA, Metal, Vulkan, or AMD support only after building and running a profile-specific smoke test on a representative target.

#### PORT-01.04 — State unsupported combinations and degraded behavior clearly

The project MUST state unsupported combinations and degraded behavior clearly. A compiled artifact alone does not establish a supported platform.

#### PORT-01.05 — Test both the oldest supported environment and a current

The project MUST test both the oldest supported environment and a current environment on each declared architecture family.

#### PORT-02.01 — Keep optional runtime dependencies behind explicit Cargo features

The project MUST keep optional runtime dependencies behind explicit Cargo features or target-specific dependencies. Default profiles include only intended capabilities.

#### PORT-02.02 — Use additive features with documented dependencies and user-visible effects

The project MUST use additive features with documented dependencies and user-visible effects. The project MUST also avoid relying on default feature behavior of transitive dependencies.

#### PORT-02.03 — Declare the minimum supported Rust and frontend toolchain

The project MUST declare the minimum supported Rust and frontend toolchain and use it in at least one CI job. The project MUST also pin release toolchains and record build flags.

#### PORT-02.04 — Test no-default-features, minimal CPU, production, and each important backend

The project MUST test no-default-features, minimal CPU, production, and each important backend combination. The project MUST also avoid an unbounded exhaustive matrix; select profiles by support commitments and risk.

#### PORT-02.05 — Keep build caches and generated artifacts target-specific

The project MUST keep build caches and generated artifacts target-specific. The project MUST NOT reuse incompatible outputs across OS, architecture, feature, or toolchain changes.

#### PORT-05.01 — Cross-compilation MUST declare host and target triples, linker…

**Requirement:** Cross-compilation MUST declare host and target triples, linker, SDK, sysroot, native libraries, code-signing stage, and which tests can run on target hardware.

#### PORT-05.02 — Artifacts MUST not accidentally link host libraries or inherit…

**Requirement:** Artifacts MUST not accidentally link host libraries or inherit host CPU features when they claim a portable target baseline.

#### PORT-05.03 — Native backend/runtime versions MUST be pinned or constrained…

**Requirement:** Native backend/runtime versions MUST be pinned or constrained to a documented compatible range and tested with the supported driver matrix.

#### PORT-05.04 — ABI and C/FFI boundaries MUST validate structure layout…

**Requirement:** ABI and C/FFI boundaries MUST validate structure layout, calling convention, integer widths, alignment, symbol versions, and allocator ownership for every target.

#### PORT-05.05 — CPU-specific optimization MUST use runtime feature detection or separately…

**Requirement:** CPU-specific optimization MUST use runtime feature detection or separately named artifacts with explicit minimum CPU requirements; generic builds MUST preserve the declared baseline.

#### PORT-05.06 — Cross-compiled release binaries MUST receive target-side smoke tests on…

**Requirement:** Cross-compiled release binaries MUST receive target-side smoke tests on real hardware or a documented emulator/virtualization environment; compilation alone is insufficient.

#### PORT-05.07 — Toolchain updates MUST rerun portability, binary inspection…

**Requirement:** Toolchain updates MUST rerun portability, binary inspection, startup, and installer checks before release.

#### VER-05.01 — Every claimed OS/architecture/profile/backend combination MUST have a recorded build…

**Requirement:** Every claimed OS/architecture/profile/backend combination MUST have a recorded build and runtime test result or be labeled unverified/unsupported.

#### VER-05.02 — Model evaluation MUST pin model digest, runtime/provider…

**Requirement:** Model evaluation MUST pin model digest, runtime/provider, preprocessing, tokenizer, dataset split, metric implementation, parameters, hardware, and test harness revision.

#### VER-05.03 — Numerical correctness MUST use documented tolerances for each supported…

**Requirement:** Numerical correctness MUST use documented tolerances for each supported precision/provider and include edge inputs, empty/large tensors, batch changes, and deterministic mode where promised.

#### VER-05.04 — Backend adapter conformance MUST test load/readiness/inference/cancel/unload/error semantics against…

**Requirement:** Backend adapter conformance MUST test load/readiness/inference/cancel/unload/error semantics against the same contract suite.

#### VER-05.05 — Performance tests MUST be separate from correctness acceptance unless…

**Requirement:** Performance tests MUST be separate from correctness acceptance unless the feature explicitly promises a performance bound; report latency distributions, throughput, quality, memory, and device conditions.

#### VER-05.06 — Compatibility qualification MUST cover upgrade from supported prior versions…

**Requirement:** Compatibility qualification MUST cover upgrade from supported prior versions, configuration/schema migration, model reuse, and rollback, not only clean installation.

#### VER-05.07 — When physical hardware is scarce, emulation or mocks…

**Requirement:** When physical hardware is scarce, emulation or mocks MAY support early development but MUST NOT substitute for release evidence on advertised accelerator targets.

## 5. Prohibited conditions

- [ARC-01] The project MUST NOT create catch-all common, utils, helpers, or optimization modules without a defined owner and stable callers
- [ARC-01] The project MUST NOT place performance tuning in an unrelated central file; keep it with the component whose behavior it changes
- [ARC-01] The project MUST NOT share mutable state across services without an explicit consistency and ownership model
- [ARC-02] The project MUST NOT compile every backend into every artifact by default
- [ARC-02] The project MUST NOT claim modularity merely because code is in separate files; verify that dependencies and build graph are independently selectable
- [ARC-02] The project MUST NOT rely on undocumented feature unification or target-specific dependency behavior
- [ARC-04] Do not expose mutable module internals as an undocumented integration surface.
- [ARC-04] Do not allow a module to retain work or resources after its owning request, model, or service lifecycle has ended.
- [ARC-05] Do not record a decision after implementation merely to legitimize an undocumented choice.
- [ARC-05] Do not claim a quality attribute such as portability, isolation, or offline operation without a scenario and verification evidence.
- [MOD-01] The project MUST NOT mutate model bytes in place while retaining the same version/digest
- [MOD-01] The project MUST NOT silently substitute a different model when the requested artifact is missing
- [MOD-01] The project MUST NOT bundle model assets until license and source terms have been reviewed
- [MOD-02] The project MUST NOT load partially downloaded or unverified files
- [MOD-02] The project MUST NOT trust remote filenames or metadata as local paths
- [MOD-02] The project MUST NOT automatically activate a model solely because a download completed
- [MOD-03] The project MUST NOT let unauthenticated endpoints create, delete, promote, or redirect model assets
- [MOD-03] The project MUST NOT expose filesystem paths or credentials through registry responses
- [MOD-03] The project MUST NOT let hosted service failure corrupt local registry state
- [MOD-04] Do not infer suitability from a model name, benchmark leaderboard, or vendor marketing claim.
- [MOD-04] Do not claim fairness, safety, or accuracy beyond the tested populations, tasks, and conditions.
- [MOD-05] Do not execute model-provided code or custom operators in the privileged service process by default.
- [MOD-05] Do not claim accelerator support for an untested provider/driver/device combination.
- [PERF-01] The project MUST NOT present a single best measurement as a production guarantee
- [PERF-01] The project MUST NOT compare measurements from different hardware as equivalent
- [PERF-01] The project MUST NOT add an optimization catch-all module or file; keep tuning with the owning component
- [PERF-02] The project MUST NOT enable a backend because compile succeeded alone
- [PERF-02] The project MUST NOT optimize average latency while hiding degraded tail latency or resource exhaustion
- [PERF-02] The project MUST NOT sacrifice correctness or isolation to improve benchmark numbers
- [PERF-04] Do not advertise Metal, CUDA, Vulkan, or AMD support based on successful compilation alone.
- [PERF-04] Do not silently change precision, deterministic behavior, or fallback provider after a runtime error.
- [PORT-01] The project MUST NOT say “works on any machine” without a support boundary
- [PORT-01] The project MUST NOT assume GPU provider APIs or drivers exist on a target OS
- [PORT-01] The project MUST NOT ship binaries with undocumented dynamic library requirements
- [PORT-02] The project MUST NOT let test-only or benchmark dependencies enable optional runtime features in release artifacts
- [PORT-02] The project MUST NOT make unsupported feature combinations silently compile with missing behavior
- [PORT-02] The project MUST NOT use unpinned moving toolchains for release qualification
- [PORT-05] Do not distribute a binary with host-specific native library paths or an untested CPU instruction requirement.
- [PORT-05] Do not assume a container image removes host GPU driver or kernel compatibility constraints.
- [VER-05] Do not infer model quality from a successful load or a single happy-path output.
- [VER-05] Do not mark an untested backend supported because another provider uses a similar API.

## 6. Procedure

1. Prepare the configuration, fixture, model, environment, or operating condition required by the scenarios and the observable check.
2. Execute the check through the shipping path, using the exact command or procedure that will be recorded as evidence.
3. Observe the result required by section 2, including the applicable negative, boundary, or failure case from the scenarios.
4. Confirm that no prohibited condition from section 5 occurs.
5. Record the revision, environment, result, limitations, and any skipped step.

## 7. Pass criteria

- The observable check in section 2 is satisfied.
- Every applicable requirement in section 1 is met through the mapped rule obligations.
- No prohibited condition in section 5 occurs.
- The result is reproducible from the recorded procedure and evidence.

- **HPA-4 gate:** every universal gate in [`acceptance-criteria.md`](../acceptance-criteria.md) section 2, the check-specific threshold in section 3, all section 9 evidence, and zero section 4 failure criteria MUST pass.
- The result MUST be reproducible on 3 independent runs against the shipping artifact; a skipped, stale, or summary-only result is not a pass.

## 8. Fail criteria

- Any one failure criterion in [`acceptance-criteria.md`](../acceptance-criteria.md) section 4 occurs.
- Any universal gate, check-specific threshold, or section 9 evidence requirement is unmet, missing, stale, or below threshold.
- The result is partial, conditional, non-reproducible, or depends on an unapproved exception.

- The observable result is absent, contradictory, or not reproducible.
- The check passes only through a debug path, test double, or non-shipping configuration.
- A required negative or boundary case is untested, skipped, or bypassed.
- A prohibited condition occurs.
- Evidence is stale or the implementation changed without re-running the check.
- An exception is unapproved, expired, or missing compensating measures.

- Highest-standard assurance evidence is missing, stale, or below the recorded threshold.

## 9. Required evidence

- The command, procedure, or inspection that exercises the check, including its environment and revision.
- The observed result required by section 2.
- The result of each applicable negative or boundary case.
- A link from the change, evaluation, or assurance record to that evidence.
- For an unmet check: an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

- [ARC-01] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [ARC-01] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [ARC-01] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [ARC-02] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [ARC-02] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [ARC-02] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [ARC-04] Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- [ARC-04] Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- [ARC-04] Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.
- [ARC-05] Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- [ARC-05] Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- [ARC-05] Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.
- [MOD-01] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [MOD-01] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [MOD-01] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [MOD-02] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [MOD-02] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [MOD-02] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [MOD-03] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [MOD-03] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [MOD-03] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [MOD-04] Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- [MOD-04] Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- [MOD-04] Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.
- [MOD-05] Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- [MOD-05] Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- [MOD-05] Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.
- [PERF-01] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [PERF-01] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [PERF-01] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [PERF-02] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [PERF-02] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [PERF-02] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [PERF-04] Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- [PERF-04] Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- [PERF-04] Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.
- [PORT-01] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [PORT-01] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [PORT-01] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [PORT-02] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [PORT-02] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [PORT-02] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [PORT-05] Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- [PORT-05] Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- [PORT-05] Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.
- [VER-05] Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- [VER-05] Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- [VER-05] Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this first-slice check additionally requires a reproducible run against the shipping artifact, schema validation where a contract is involved, and a retained report naming the revision, configuration, command, observed result, and limitation. Security-relevant cases MUST be assessed against OWASP ASVS 5.0.0 Level 3. A happy-path-only result or a summary without retained measurements fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [RP-014](../../../torviello-enforcer/requirements/items/RP-014.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Rule controls | ARC-01, ARC-02, ARC-04, ARC-05, MOD-01, MOD-02, MOD-03, MOD-04, MOD-05, PERF-01, PERF-02, PERF-04, PORT-01, PORT-02, PORT-05, VER-05 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule control, or acceptance criteria. Do not weaken the observable result, a scenario, or an evidence requirement to make an implementation pass.
