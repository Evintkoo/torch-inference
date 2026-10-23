# AC-ENG-21 — Bound requests and degrade predictably under pressure

**Check ID:** AC-ENG-21  
**Requirement:** ENG-015  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Requests are bounded at ingress, deadlines release resources, overload maps to explicit statuses, and probes remain available under pressure. AC-ENG-21 verifies ENG-015 and fails when the threshold below is not met.
- **Measurable:** 100% of limits enforced before buffering, decode, queue insertion, or dispatch; zero unbounded queues or retry budgets; 100% deadline resource release; probes remain available in 100% of saturation samples; overload never returns 500.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-015; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-015 — Bound requests and degrade predictably under pressure

**Priority:** MUST  
**Requirement document:** [ENG-015](../../../torviello-enforcer/requirements/items/ENG-015.md)

Every inbound boundary MUST enforce a configured limit, every dependency call MUST have a deadline, overload MUST produce an explicit retryable or non-retryable status, and failure isolation MUST prevent one failing backend from consuming all capacity.

**Acceptance summary:** An oversized JSON body returns 413 without full buffering.

## 2. Observable check

Requests are bounded at ingress, deadlines release resources, overload maps to explicit statuses, and probes remain available under pressure.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `resilience-and-limits.feature`

#### Request body limit is enforced before parsing

```gherkin
Scenario: Request body limit is enforced before parsing
    Given a JSON body larger than json_body_limit_mb
    When the request arrives
    Then the response is 413 with error code "request.too_large"
    And the body is not fully buffered
```

#### Per-item limits are enforced independently

```gherkin
Scenario: Per-item limits are enforced independently
    Given a batch body within the total limit but one item above its item limit
    When the request is validated
    Then the response is 413 naming the item
    And no item is processed
```

#### Inference timeout returns gateway timeout

```gherkin
Scenario: Inference timeout returns gateway timeout
    Given a backend call exceeds the configured inference deadline
    When the request completes
    Then the response is 504 with error code "inference.timeout"
    And the worker slot is released
```

#### Repeated backend failure opens the circuit

```gherkin
Scenario: Repeated backend failure opens the circuit
    Given the backend fails beyond the configured threshold
    When a new request arrives during the open interval
    Then the response is 503 with error code "backend.circuit_open"
    And the backend is not called
```

#### Circuit recovery is probed

```gherkin
Scenario: Circuit recovery is probed
    Given the circuit open interval has elapsed
    When a probe request succeeds
    Then the circuit closes
    And normal traffic resumes
```

#### Concurrency saturation rejects rather than queues unboundedly

```gherkin
Scenario: Concurrency saturation rejects rather than queues unboundedly
    Given every bulkhead permit is in use
    When another request arrives
    Then the response is 429 with error code "engine.busy"
    And the queue depth does not grow without bound
```

#### Rate limiting is local and observable

```gherkin
Scenario: Rate limiting is local and observable
    Given a client exceeds the per-IP request budget
    When the next request arrives
    Then the response is 429 with a Retry-After header
    And health and metrics probes remain exempt
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| PERF-02 | Resource bounds and accelerator tuning | [02-resource-bounds-and-accelerator-tuning.md](../../../torviello-enforcer/performance/rules/02-resource-bounds-and-accelerator-tuning.md) |
| SEC-10 | Secure defaults and abuse resilience | [10-secure-defaults-and-abuse-resilience.md](../../../torviello-enforcer/security/rules/10-secure-defaults-and-abuse-resilience.md) |
| API-02 | API input and stream safety | [02-api-input-and-stream-safety.md](../../../torviello-enforcer/api/rules/02-api-input-and-stream-safety.md) |

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

#### SEC-10.01 — Every security-relevant setting MUST have a safe default…

**Requirement:** Every security-relevant setting MUST have a safe default for its deployment profile and a validation rule preventing known-dangerous combinations.

#### SEC-10.02 — Authentication MUST be required for remote administrative and persistent…

**Requirement:** Authentication MUST be required for remote administrative and persistent user-data operations. Local account-free operation MUST be restricted to a clearly defined local exposure boundary.

#### SEC-10.03 — Authentication and authorization failures MUST not disclose credential validity…

**Requirement:** Authentication and authorization failures MUST not disclose credential validity, protected object existence, tenant membership, or internal policy details beyond what the caller needs to remediate.

#### SEC-10.04 — Expensive operations MUST enforce per-actor and global resource budgets…

**Requirement:** Expensive operations MUST enforce per-actor and global resource budgets, deadline, queue admission, cancellation, and retry ceilings; budgets MUST apply to preprocessing, model download, inference, and response serialization.

#### SEC-10.05 — Resource exhaustion MUST degrade predictably: reject new work…

**Requirement:** Resource exhaustion MUST degrade predictably: reject new work, protect existing work according to policy, preserve essential health/administrative recovery, and avoid process-wide failure from one request.

#### SEC-10.06 — Abuse detection MUST correlate repeated authentication failures, model-download…

**Requirement:** Abuse detection MUST correlate repeated authentication failures, model-download abuse, sensitive business flow automation, and unusual resource consumption with bounded signals and privacy-safe retention.

#### SEC-10.07 — Security controls MUST fail closed when their required key…

**Requirement:** Security controls MUST fail closed when their required key, policy, validator, or authorization dependency is unavailable; availability exceptions require a named decision and a bounded degraded mode.

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

- Do not parse or decode a body before enforcing its size limit.
- Do not let a timed-out request retain a worker or permit.
- Do not return 500 for capacity or dependency exhaustion that has a specific status.
- Do not allow unlimited queue growth under saturation.
- Do not rate-limit liveness, readiness, or metrics probes.

## 6. Procedure

- 1. Send bodies and items above each configured limit and inspect memory and status.
- 2. Use a stub backend that exceeds its deadline and verify worker release.
- 3. Drive repeated backend failures and observe circuit transitions and statuses.
- 4. Saturate permits and send additional requests.
- 5. Exceed the per-IP budget and call health and metrics.
- 6. Record configuration, load, statuses, and resource observations.

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

- Limit rejection responses and evidence of early enforcement.
- Timeout status and worker-release observation.
- Circuit state transitions and response codes.
- Saturation and rate-limit responses with headers.
- Probe exemption evidence.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- The load/soak report with hardware, configuration, and percentiles.
- The saturation and recovery timeline.
- The limit-enforcement matrix and fault-injection records.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-015](../../../torviello-enforcer/requirements/items/ENG-015.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [resilience-and-limits.feature](../features/resilience-and-limits.feature) |
| Rule controls | PERF-02, SEC-10, API-02 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
