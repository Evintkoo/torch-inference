# AC-ENG-12 — Load models with bounded lifecycle, isolation, and capacity policy

**Check ID:** AC-ENG-12  
**Requirement:** ENG-006  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Model load lifecycle is explicit, concurrent loads coalesce, paths are confined, in-flight work is protected, and capacity policy is enforced or explicitly disabled. AC-ENG-12 verifies ENG-006 and fails when the threshold below is not met.
- **Measurable:** TLA+ and Loom find zero lifecycle, single-flight, capacity, or reference-ownership violations; zero double initialization; zero reference leaks across cancellation, error, unload, and eviction; 100% capacity enforcement; zero Ready slots after OOM.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-006; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-006 — Load models with bounded lifecycle, isolation, and capacity policy

**Priority:** MUST  
**Requirement document:** [ENG-006](../../../requirements/items/ENG-006.md)

Model loading MUST have an explicit lifecycle, coalesce concurrent loads, confine model paths to the configured root, prevent eviction of models with in-flight work, and enforce or explicitly disable a documented capacity policy.

**Acceptance summary:** A load advances through loading to ready and supports inference.

## 2. Observable check

Model load lifecycle is explicit, concurrent loads coalesce, paths are confined, in-flight work is protected, and capacity policy is enforced or explicitly disabled.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `model-loading.feature`

#### Load reaches a ready state

```gherkin
Scenario: Load reaches a ready state
    Given the model is not loaded
    When a client requests a load
    Then the model transitions through loading to ready
    And subsequent inference reports the same model ID and backend
```

#### Concurrent loads are coalesced

```gherkin
Scenario: Concurrent loads are coalesced
    Given two clients request the same model load at the same time
    When both requests complete
    Then one load operation is performed
    And both responses report the same ready state
```

#### Unload refuses to strand in-flight work

```gherkin
Scenario: Unload refuses to strand in-flight work
    Given a long inference request is active on the model
    When a client requests unload
    Then unload is deferred until the request completes or is cancelled
    And the model is not freed while referenced
```

#### Model capacity is enforced or explicitly unlimited

```gherkin
Scenario: Model capacity is enforced or explicitly unlimited
    Given performance.max_loaded_models is configured
    When a new load would exceed the limit
    Then the engine applies the documented eviction or rejection policy
    And the response identifies the limit and affected model
```

#### Registration paths cannot escape the model root

```gherkin
Scenario: Registration paths cannot escape the model root
    Given a registration request names a path outside the configured model root
    When the registry validates the path
    Then the response is 400 with error code "model.path_outside_root"
    And no file is read or registered
```

#### Unknown model execution is rejected before dispatch

```gherkin
Scenario: Unknown model execution is rejected before dispatch
    Given no model is loaded with ID "missing-model"
    When a client submits an inference request for it
    Then the response is 404 with error code "model.not_found"
    And no backend execution is attempted
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| MOD-05 | Model runtime isolation and resource contracts | [05-model-runtime-isolation-and-resource-contracts.md](../../../torviello-enforcer/models/rules/05-model-runtime-isolation-and-resource-contracts.md) |
| ARC-04 | Boundaries, failures, and resource ownership | [04-boundaries-failures-and-resource-ownership.md](../../../torviello-enforcer/architecture/rules/04-boundaries-failures-and-resource-ownership.md) |
| PERF-02 | Resource bounds and accelerator tuning | [02-resource-bounds-and-accelerator-tuning.md](../../../torviello-enforcer/performance/rules/02-resource-bounds-and-accelerator-tuning.md) |

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

- Do not publish a model as ready before initialization completes.
- Do not run duplicate initializations for the same ID without an explicit policy.
- Do not free a model while inference references it.
- Do not accept absolute or traversal paths from a client as model locations.
- Do not silently ignore a configured capacity limit.

## 6. Procedure

- 1. Load a valid model and observe state transitions and a successful inference.
- 2. Issue two concurrent load requests and compare initialization evidence and responses.
- 3. Start a long inference, request unload, and observe deferral and completion.
- 4. Set a small capacity limit and load beyond it.
- 5. Attempt registration through an escaping path and a symlink.
- 6. Record logs, state transitions, and memory observations.

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

- Load-state transitions and inference result for the valid case.
- Initialization count and responses for concurrent loads.
- Unload timing relative to the in-flight request.
- Capacity-policy output at the configured limit.
- Path-escape rejection and filesystem evidence.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../requirements/assurance-standard.md), this check additionally requires:

- The TLA+ and Loom reports with invariant coverage.
- Reference-count accounting before and after cancellation, error, unload, and eviction.
- Fault-injection results for OOM and provider failure.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-006](../../../requirements/items/ENG-006.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [model-loading.feature](../features/model-loading.feature) |
| Rule controls | MOD-05, ARC-04, PERF-02 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
