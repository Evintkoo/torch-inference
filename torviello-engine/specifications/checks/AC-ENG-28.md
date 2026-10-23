# AC-ENG-28 — Keep concurrency, streaming, and shutdown responsive

**Check ID:** AC-ENG-28  
**Requirement:** ENG-022  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Blocking work is off the reactor, queues and channels are bounded, backpressure and cancellation work, sessions are isolated, and shutdown completes within the deadline. AC-ENG-28 verifies ENG-022 and fails when the threshold below is not met.
- **Measurable:** TLA+/Loom find zero concurrency or ownership violations; blocking detector finds zero reactor blocking; zero unbounded queues/channels; 100% cancellation and deadline release; 100% shutdown within deadline; ASan/UBSan/TSan/Miri clean.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-022; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-022 — Keep concurrency, streaming, and shutdown responsive

**Priority:** MUST  
**Requirement document:** [ENG-022](../../../torviello-enforcer/requirements/items/ENG-022.md)

The engine MUST keep blocking inference off the request reactor, bound worker and stream queues, apply backpressure to producers and slow consumers, cancel work on disconnect, and terminate workers within the shutdown deadline.

**Acceptance summary:** Health responds while a long CPU-bound inference is running.

## 2. Observable check

Blocking work is off the reactor, queues and channels are bounded, backpressure and cancellation work, sessions are isolated, and shutdown completes within the deadline.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `concurrency-and-streaming.feature`

#### CPU-bound inference does not stall the reactor

```gherkin
Scenario: CPU-bound inference does not stall the reactor
    Given one long CPU-bound inference is running
    When a health request arrives
    Then health responds before the inference completes
    And the inference runs on a blocking-capable worker
```

#### Worker pool bounds concurrency

```gherkin
Scenario: Worker pool bounds concurrency
    Given every worker is busy
    When additional work arrives
    Then the queue follows the documented admission policy
    And no unbounded task backlog is created
```

#### Streaming applies backpressure

```gherkin
Scenario: Streaming applies backpressure
    Given a slow client consumes a stream
    When the producer outpaces the client
    Then the producer waits on the bounded channel
    And memory does not grow without limit
```

#### Client disconnect cancels work

```gherkin
Scenario: Client disconnect cancels work
    Given a client disconnects during streaming synthesis
    When the transport notices the close
    Then synthesis for that request stops
    And the concurrency slot is released
```

#### Shutdown terminates idle workers

```gherkin
Scenario: Shutdown terminates idle workers
    Given the engine is shutting down
    When workers become idle
    Then they stop within the shutdown deadline
    And shutdown does not wait indefinitely for idle threads
```

#### Concurrent sessions remain isolated

```gherkin
Scenario: Concurrent sessions remain isolated
    Given two WebSocket sessions run different models
    When both stream simultaneously
    Then each session receives only its own results
    And one session's failure does not close the other
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| ARC-04 | Boundaries, failures, and resource ownership | [04-boundaries-failures-and-resource-ownership.md](../../../torviello-enforcer/architecture/rules/04-boundaries-failures-and-resource-ownership.md) |
| PERF-02 | Resource bounds and accelerator tuning | [02-resource-bounds-and-accelerator-tuning.md](../../../torviello-enforcer/performance/rules/02-resource-bounds-and-accelerator-tuning.md) |
| API-02 | API input and stream safety | [02-api-input-and-stream-safety.md](../../../torviello-enforcer/api/rules/02-api-input-and-stream-safety.md) |

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

#### API-02.01 — Treat every request field, header, URL, filename, archive entry

The project MUST treat every request field, header, URL, filename, archive entry, image, audio stream, and model input as untrusted. Parse into validated domain types before expensive work.

#### API-02.02 — Bound request bytes, multipart part count, image dimensions, audio

The project MUST bound request bytes, multipart part count, image dimensions, audio duration, decompressed size, queue wait, inference time, concurrent work, and response size. Limits MUST be configurable within safe hard bounds.

#### API-02.03 — Reject invalid content types, unsupported encodings, malformed multipart boundaries

The project MUST reject invalid content types, unsupported encodings, malformed multipart boundaries, path traversal, unexpected archive paths, and values outside schema constraints with safe client errors.

#### API-02.04 — Apply authentication and authorization to each operation

The project MUST apply authentication and authorization to each operation. Health endpoints disclose only their intended readiness state; administrative operations require explicit roles/scopes.

#### API-02.05 — Streaming routes MUST define cancellation, client disconnect handling, backpressure

Streaming routes MUST define cancellation, client disconnect handling, backpressure, timeout, partial result, and cleanup behavior. The project MUST NOT retain unbounded output in memory for a slow consumer.

#### API-02.06 — Use rate limits and concurrency controls at the API

The project MUST use rate limits and concurrency controls at the API boundary for expensive or abuse-sensitive operations. The project MUST also return a documented overload response and expose a bounded metric.

## 5. Prohibited conditions

- Do not execute blocking model inference on the request reactor.
- Do not use an unbounded queue or channel for inference or streaming.
- Do not continue work after a client disconnect unless explicitly detached and bounded.
- Do not share mutable per-session buffers between sessions.
- Do not wait indefinitely for idle workers during shutdown.

## 6. Procedure

- 1. Run a long inference and call health during it.
- 2. Saturate workers and observe queue depth and response status.
- 3. Attach a slow stream consumer and measure memory and producer progress.
- 4. Disconnect during a stream and inspect cancellation and slot release.
- 5. Initiate shutdown and measure worker termination.
- 6. Record configuration, timings, queue depth, and memory.

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

- Health latency during long inference.
- Queue and admission behavior at saturation.
- Memory and progress evidence for a slow consumer.
- Cancellation and slot-release evidence.
- Worker shutdown timing.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- Formal and Loom reports, sanitizer logs, and Miri results.
- The blocking-detector report.
- The cancellation and shutdown resource timeline.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-022](../../../torviello-enforcer/requirements/items/ENG-022.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [concurrency-and-streaming.feature](../features/concurrency-and-streaming.feature) |
| Rule controls | ARC-04, PERF-02, API-02 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
