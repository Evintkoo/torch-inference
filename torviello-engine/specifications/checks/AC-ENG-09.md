# AC-ENG-09 — Detect execution backends and report capabilities truthfully

**Check ID:** AC-ENG-09  
**Requirement:** ENG-003  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Backend selection is explicit and observable, unavailable explicit requests fail, and capability output distinguishes compiled, available, configured, and active providers. AC-ENG-09 verifies ENG-003 and fails when the threshold below is not met.
- **Measurable:** 100% of declared providers are probed on every claimed target; zero false "available" results; selection is deterministic in 100% of randomized capability sets; 100% of fallbacks emit a reason and remain attributable.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-003; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-003 — Detect execution backends and report capabilities truthfully

**Priority:** MUST  
**Requirement document:** [ENG-003](../../../torviello-enforcer/requirements/items/ENG-003.md)

The engine MUST select an execution backend from the providers the running build can actually execute, make an explicit selection observable, fail an explicit unavailable request instead of silently changing provider, and report capabilities that distinguish available, configured, compiled, and active providers.

**Acceptance summary:** An auto start with a usable accelerator selects it and records the reason.

## 2. Observable check

Backend selection is explicit and observable, unavailable explicit requests fail, and capability output distinguishes compiled, available, configured, and active providers.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `backend-selection.feature`

#### Automatic selection prefers an available accelerator

```gherkin
Scenario: Automatic selection prefers an available accelerator
    Given device.device_type is "auto"
    And a supported CUDA device and runtime are available
    When the engine initializes execution
    Then the selected backend is "cuda"
    And the selection reason is recorded
```

#### Automatic selection falls back to CPU when no accelerator is usable

```gherkin
Scenario: Automatic selection falls back to CPU when no accelerator is usable
    Given device.device_type is "auto"
    And no accelerator runtime is available
    When the engine initializes execution
    Then the selected backend is "cpu"
    And health reports CPU as the active backend without claiming accelerator support
```

#### Explicit accelerator request fails when unavailable

```gherkin
Scenario: Explicit accelerator request fails when unavailable
    Given device.device_type is "cuda"
    And the running build has no CUDA provider
    When the engine initializes execution
    Then startup fails with error code "backend.unavailable"
    And it does not silently switch to CPU
```

#### Capability output excludes compiled but unusable providers

```gherkin
Scenario: Capability output excludes compiled but unusable providers
    Given the binary was compiled with an optional provider
    And the provider runtime cannot be loaded on this host
    When capabilities are reported
    Then the provider is marked unavailable with a reason
    And no endpoint reports it as an active backend
```

#### Precision flags are reflected in the reported profile

```gherkin
Scenario: Precision flags are reflected in the reported profile
    Given device.use_fp16 is true and the selected backend supports it
    When the engine reports its runtime profile
    Then the profile names the precision and device
    And requests that require unsupported precision are rejected explicitly
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| PERF-04 | Accelerator backends, compatibility, and fallback | [04-accelerator-backend-compatibility-and-fallback.md](../../../torviello-enforcer/performance/rules/04-accelerator-backend-compatibility-and-fallback.md) |
| ARC-02 | Optional capabilities and build profiles | [02-optional-capabilities-and-build-profiles.md](../../../torviello-enforcer/architecture/rules/02-optional-capabilities-and-build-profiles.md) |
| PERF-02 | Resource bounds and accelerator tuning | [02-resource-bounds-and-accelerator-tuning.md](../../../torviello-enforcer/performance/rules/02-resource-bounds-and-accelerator-tuning.md) |

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

## 5. Prohibited conditions

- Do not infer capability from a build flag without a runtime probe.
- Do not silently fall back from an explicitly requested accelerator.
- Do not report a provider as active when it is only installed or configured.
- Do not expose provider-specific types in the public API.
- Do not change precision silently to make a request succeed.

## 6. Procedure

- 1. Run on a host with a usable accelerator and on a CPU-only host with the same build where possible.
- 2. Start with device_type auto and inspect the selected backend, device, precision, and reason.
- 3. Start with an explicit unavailable backend and confirm startup or request failure without fallback.
- 4. Load an optional provider that is compiled but whose runtime library is absent and inspect capability output.
- 5. Submit an unsupported precision override and confirm rejection before dispatch.
- 6. Record hosts, provider versions, configuration, and observed output.

## 7. Pass criteria

- The observable check in section 2 is satisfied through the shipping engine.
- Every applicable obligation in section 4 is met, including limits, failure behavior, and observability.
- Every feature scenario in section 3 is covered by an automated test or a recorded manual check.
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
- A required negative, boundary, or failure case is untested, skipped, or bypassed.
- A prohibited condition occurs.
- Evidence is stale or the implementation changed without re-running the check.
- An exception is unapproved, expired, or missing compensating measures.

- Highest-standard assurance evidence is missing, stale, or below the recorded threshold.

## 9. Required evidence

- Runtime capability output for each host and build.
- Selection reason and active backend from health or introspection.
- Failure envelope for an explicit unavailable backend.
- Evidence that a compiled-but-unusable provider is marked unavailable.
- The per-inference backend metadata from a successful request.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- The backend-by-target matrix with probe transcripts and driver versions.
- Selection and fallback event records with reasons.
- A negative matrix showing unavailable providers are never reported as available.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-003](../../../torviello-enforcer/requirements/items/ENG-003.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [backend-selection.feature](../features/backend-selection.feature) |
| Rule controls | PERF-04, ARC-02, PERF-02 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
