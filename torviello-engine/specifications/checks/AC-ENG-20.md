# AC-ENG-20 — Batch, cache, and coalesce work without changing results

**Check ID:** AC-ENG-20  
**Requirement:** ENG-014  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Batching, caching, and coalescing preserve per-caller results and ordering, stay within configured bounds, and expose reconcilable statistics. AC-ENG-20 verifies ENG-014 and fails when the threshold below is not met.
- **Measurable:** 100% cache-key completeness for every result-changing input, parameter, model, backend option, and version; zero cross-caller leakage; zero stale, partial, or poisoned hits; 100% order preservation; 100% reconciliation of hits, misses, joins, and executions.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-014; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-014 — Batch, cache, and coalesce work without changing results

**Priority:** MUST  
**Requirement document:** [ENG-014](../../../requirements/items/ENG-014.md)

Batching, caching, and request coalescing MUST be opt-in by configuration, MUST preserve the result identity and ordering of each caller, and MUST keep memory, queue depth, and wait time within configured bounds with observable statistics.

**Acceptance summary:** An identical request within expiry returns the cached result and increments hits.

## 2. Observable check

Batching, caching, and coalescing preserve per-caller results and ordering, stay within configured bounds, and expose reconcilable statistics.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `batching-and-caching.feature`

#### Identical requests share a cache entry

```gherkin
Scenario: Identical requests share a cache entry
    Given a successful inference result is cached
    When an identical request arrives before expiry
    Then the cached result is returned with the original result metadata
    And the cache hit metric increments
```

#### Cache keys distinguish model and input

```gherkin
Scenario: Cache keys distinguish model and input
    Given two requests differ only in model ID
    When both execute
    Then they produce separate cache entries
    And no result crosses model boundaries
```

#### Concurrent duplicate requests are coalesced

```gherkin
Scenario: Concurrent duplicate requests are coalesced
    Given two identical requests arrive while the first is executing
    When the first completes
    Then both callers receive the same result
    And the backend executes once
```

#### Batch ordering is preserved

```gherkin
Scenario: Batch ordering is preserved
    Given a batch of requests with distinct inputs
    When the batch completes
    Then each caller receives the result for its own input
    And no caller receives another request's output
```

#### Batch wait is bounded

```gherkin
Scenario: Batch wait is bounded
    Given the queue has fewer items than the configured minimum
    When the batch timeout expires
    Then the partial batch executes
    And the wait time does not exceed the configured maximum
```

#### Cache capacity and expiry are enforced

```gherkin
Scenario: Cache capacity and expiry are enforced
    Given the cache reaches its configured size
    When a new entry is inserted
    Then eviction follows the documented LRU policy
    And expired entries are never served
```

#### Optimization statistics are observable

```gherkin
Scenario: Optimization statistics are observable
    Given requests have produced hits, misses, evictions, and batches
    When an operator reads statistics
    Then the counts reconcile with the recorded request history
    And no payload contents appear in the statistics
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| PERF-05 | Throughput, latency, batching, and model quality | [05-throughput-latency-batching-and-model-quality.md](../../../torviello-enforcer/performance/rules/05-throughput-latency-batching-and-model-quality.md) |
| PERF-02 | Resource bounds and accelerator tuning | [02-resource-bounds-and-accelerator-tuning.md](../../../torviello-enforcer/performance/rules/02-resource-bounds-and-accelerator-tuning.md) |
| ARC-04 | Boundaries, failures, and resource ownership | [04-boundaries-failures-and-resource-ownership.md](../../../torviello-enforcer/architecture/rules/04-boundaries-failures-and-resource-ownership.md) |

#### PERF-05.01 — Concurrency and batching policies MUST state maximum batch size…

**Requirement:** Concurrency and batching policies MUST state maximum batch size, queue deadline, batching delay, fairness, cancellation behavior, and interaction with memory limits.

#### PERF-05.02 — Batching MUST preserve request/response identity and ordering guarantees…

**Requirement:** Batching MUST preserve request/response identity and ordering guarantees. A cancellation or malformed request within a batch MUST not corrupt unrelated requests or silently discard completed results.

#### PERF-05.03 — Throughput claims MUST report sustained and burst workload…

**Requirement:** Throughput claims MUST report sustained and burst workload, request mix, concurrency, warm-up, provider, model digest, input size, precision, hardware, and error/drop rate.

#### PERF-05.04 — Latency claims MUST report distributions and tail percentiles separately…

**Requirement:** Latency claims MUST report distributions and tail percentiles separately for successful, rejected, and failed requests; averages alone MUST NOT support an interactive latency claim.

#### PERF-05.05 — Quantization, lower precision, kernel fusion…

**Requirement:** Quantization, lower precision, kernel fusion, and approximate execution MUST be evaluated for quality as well as speed using fixed model/task-specific acceptance metrics.

#### PERF-05.06 — Adaptive tuning MUST have bounded exploration, stable observability…

**Requirement:** Adaptive tuning MUST have bounded exploration, stable observability, operator override, and safe rollback. Online tuning MUST not change user-visible model quality or behavior without an explicit policy.

#### PERF-05.07 — Performance regression thresholds MUST account for variance and hardware…

**Requirement:** Performance regression thresholds MUST account for variance and hardware differences. A threshold breach MUST trigger investigation before release, not automatic dismissal as noise.

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

## 5. Prohibited conditions

- Do not omit model identity or execution parameters from a cache key.
- Do not return another caller's result or metadata.
- Do not grow the batch queue or cache beyond configured bounds.
- Do not serve an expired or partially written entry.
- Do not claim a performance gain without correctness evidence.

## 6. Procedure

- 1. Exercise cache hit, miss, model-differing, and expiry cases.
- 2. Issue concurrent duplicates and compare results and backend execution count.
- 3. Submit a batch with distinct inputs and verify per-caller binding and order.
- 4. Fill the cache and observe eviction; force a partial batch and measure wait.
- 5. Read statistics and reconcile them with the request sequence.
- 6. Record configuration, requests, backend counts, and statistics.

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

- Cache behavior transcripts for hit, miss, model difference, and expiry.
- Backend execution count for concurrent duplicates.
- Batch input-to-output mapping evidence.
- Eviction and maximum-wait measurements.
- Statistics output reconciled with the request log.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../requirements/assurance-standard.md), this check additionally requires:

- The cache-key property and collision reports.
- The linearizability or Loom report.
- Reconciled hit, miss, join, and execution counts.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-014](../../../requirements/items/ENG-014.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [batching-and-caching.feature](../features/batching-and-caching.feature) |
| Rule controls | PERF-05, PERF-02, ARC-04 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
