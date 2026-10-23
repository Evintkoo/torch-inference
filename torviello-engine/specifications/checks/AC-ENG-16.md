# AC-ENG-16 — Classify images with bounded batches and progressive results

**Check ID:** AC-ENG-16  
**Requirement:** ENG-010  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Classification validates batches and item limits, preserves order, returns ordered top-k results, and can stream one event per image with a terminal done event. AC-ENG-16 verifies ENG-010 and fails when the threshold below is not met.
- **Measurable:** 100% input-order preservation; zero bound bypasses for count, bytes, dimensions, or `top_k`; 100% deterministic tie-breaking; 24 CPU-hours of image-decoder fuzzing; zero cross-item contamination.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-010; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-010 — Classify images with bounded batches and progressive results

**Priority:** MUST  
**Requirement document:** [ENG-010](../../../torviello-enforcer/requirements/items/ENG-010.md)

The engine MUST validate image batches, bound batch and per-image size, preserve submission order, return ordered top-k predictions, and optionally stream one progressive event per image with a terminal done event.

**Acceptance summary:** A three-image batch returns three result lists in the same order.

## 2. Observable check

Classification validates batches and item limits, preserves order, returns ordered top-k results, and can stream one event per image with a terminal done event.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `image-classification.feature`

#### Batch classification preserves order

```gherkin
Scenario: Batch classification preserves order
    Given three base64 images submitted in order A, B, C
    When the batch completes
    Then results contain three entries in the same order
    And each entry reports at most top_k predictions sorted by confidence
```

#### Progressive classification emits per-image events

```gherkin
Scenario: Progressive classification emits per-image events
    Given a batch of three images
    When the client consumes the SSE stream
    Then one event is emitted per image with its index and predictions
    And a final done event reports total count and batch duration
```

#### Empty batch is rejected

```gherkin
Scenario: Empty batch is rejected
    Given the images array is empty
    When the request is validated
    Then the response is 400 with error code "classify.empty_batch"
    And no backend runs
```

#### Batch size is bounded

```gherkin
Scenario: Batch size is bounded
    Given the request contains 129 images
    When the request is validated
    Then the response is 400 with error code "classify.batch_too_large"
    And the limit of 128 is reported
```

#### Per-image payload is bounded

```gherkin
Scenario: Per-image payload is bounded
    Given one base64 item exceeds classify_image_limit_mb
    When the request is validated
    Then the response is 413 with error code "classify.image_too_large"
    And the item index is reported
```

#### Invalid base64 is rejected with an index

```gherkin
Scenario: Invalid base64 is rejected with an index
    Given image at index 2 is not valid base64
    When decoding runs
    Then the response is 400 naming index 2
    And no predictions are returned for any image
```

#### Model input dimensions are validated

```gherkin
Scenario: Model input dimensions are validated
    Given model_width 0
    When the request is validated
    Then the response is 400 with error code "classify.invalid_dimensions"
    And no backend allocation occurs
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| API-02 | API input and stream safety | [02-api-input-and-stream-safety.md](../../../torviello-enforcer/api/rules/02-api-input-and-stream-safety.md) |
| API-03 | HTTP semantics and client behavior | [03-http-semantics-and-client-behavior.md](../../../torviello-enforcer/api/rules/03-http-semantics-and-client-behavior.md) |
| PERF-05 | Throughput, latency, batching, and model quality | [05-throughput-latency-batching-and-model-quality.md](../../../torviello-enforcer/performance/rules/05-throughput-latency-batching-and-model-quality.md) |

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

#### API-03.01 — The API MUST use HTTP methods and status codes…

**Requirement:** The API MUST use HTTP methods and status codes according to their defined semantics; a response status MUST accurately report whether the requested operation completed, was accepted for asynchronous processing, failed validation, lacked authorization, or failed in the service.

#### API-03.02 — An operation that can be retried MUST define idempotency…

**Requirement:** An operation that can be retried MUST define idempotency behavior. For non-idempotent writes, the API MUST accept a caller-supplied idempotency key or provide another documented deduplication mechanism, scope the key to the authenticated principal and operation, retain it for a documented period, and return the original outcome for a duplicate request.

#### API-03.03 — Retries MUST be safe under the endpoint contract…

**Requirement:** Retries MUST be safe under the endpoint contract. Clients MUST NOT blindly retry non-idempotent requests; servers MUST bound retryable work and expose Retry-After only when the service can honor the stated delay.

#### API-03.04 — Pagination MUST use stable ordering and bounded page size…

**Requirement:** Pagination MUST use stable ordering and bounded page size. Cursor-based pagination SHOULD be used when concurrent inserts or deletes can make offset pagination skip or repeat records; cursors MUST be opaque, integrity-protected when they encode state, and scoped to the caller and query.

#### API-03.05 — Long-running inference and model-management operations MUST define synchronous versus…

**Requirement:** Long-running inference and model-management operations MUST define synchronous versus asynchronous behavior, request identity, status transitions, result expiry, cancellation, and duplicate-submission handling.

#### API-03.06 — HTTP caching MUST be explicit for authenticated, user-specific…

**Requirement:** HTTP caching MUST be explicit for authenticated, user-specific, model, and administrative responses. Responses containing secrets or sensitive inference data MUST use no-store or an approved stricter policy; shared caches MUST NOT reuse them across principals.

#### API-03.07 — Content negotiation and compression MUST have explicit supported media…

**Requirement:** Content negotiation and compression MUST have explicit supported media types and size limits. The service MUST reject unsupported request and response encodings safely and MUST NOT allow compressed-size limits to be bypassed by decompression expansion.

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

## 5. Prohibited conditions

- Do not reorder results relative to inputs.
- Do not process a partial batch after a validation failure.
- Do not allow top-k or dimensions to reach an unbounded backend allocation.
- Do not buffer both encoded and decoded forms for the whole batch longer than necessary.
- Do not emit a done event before every image event.

## 6. Procedure

- 1. Submit a batch with distinct images and verify order and top-k.
- 2. Submit empty, oversized batch, oversized item, and invalid base64 cases.
- 3. Consume the SSE stream and compare event order and totals.
- 4. Run with postprocessing enabled and skipped.
- 5. Record requests, responses, and stream transcripts.

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

- Batch response with ordered predictions.
- Validation responses for each negative case.
- SSE transcript showing per-image events and the done event.
- Postprocessing metadata for enabled and skipped runs.
- Envelope metadata from a successful batch.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- The order-preservation property report.
- Fuzz logs and the malformed-image corpus.
- Peak-memory evidence at count and dimension boundaries.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-010](../../../torviello-enforcer/requirements/items/ENG-010.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [image-classification.feature](../features/image-classification.feature) |
| Rule controls | API-02, API-03, PERF-05 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
