# AC-ENG-14 — Synthesize speech with bounded streaming and deterministic selection

**Check ID:** AC-ENG-14  
**Requirement:** ENG-008  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** TTS validates inputs, selects engine and voice deterministically, returns correctly framed full or streaming audio, bounds chunk gaps, and reports applied metadata. AC-ENG-14 verifies ENG-008 and fails when the threshold below is not met.
- **Measurable:** 100% of audio declares and matches sample rate, channels, encoding, and framing; zero reordered or unmarked-gap frames; 100% disconnect/deadline cancellation; 24 CPU-hours of text/parameter/audio fuzzing.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-008; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-008 — Synthesize speech with bounded streaming and deterministic selection

**Priority:** MUST  
**Requirement document:** [ENG-008](../../../torviello-enforcer/requirements/items/ENG-008.md)

The engine MUST validate TTS text and parameters, select an engine and voice deterministically, return playable full audio or framed PCM streaming audio, bound gaps between chunks, and report engine and voice metadata without silent fallback.

**Acceptance summary:** Full synthesis returns audio/wav with a valid header at the documented rate and layout.

## 2. Observable check

TTS validates inputs, selects engine and voice deterministically, returns correctly framed full or streaming audio, bounds chunk gaps, and reports applied metadata.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `text-to-speech.feature`

#### Full synthesis returns a playable WAV

```gherkin
Scenario: Full synthesis returns a playable WAV
    Given text "Hello world" and voice "af_heart"
    When the client calls full synthesis
    Then the response is audio/wav with a valid header
    And it reports sample rate 24000 and mono channel layout
```

#### Streaming synthesis returns PCM chunks

```gherkin
Scenario: Streaming synthesis returns PCM chunks
    Given a multi-sentence text
    When the client calls streaming synthesis
    Then the response content type is audio/pcm
    And chunks are 16-bit little-endian PCM at 24000 Hz mono
    And the first chunk arrives before the complete text is synthesized
```

#### Empty text is rejected

```gherkin
Scenario: Empty text is rejected
    Given the request text is empty
    When the request is validated
    Then the response is 400 with error code "tts.empty_text"
    And no engine is invoked
```

#### Parameters are clamped to supported ranges

```gherkin
Scenario: Parameters are clamped to supported ranges
    Given speed 99 and pitch 0.01
    When synthesis runs
    Then speed is clamped to 4.0 and pitch to 0.5
    And the response metadata records the applied values
```

#### A stuck engine closes the stream with a timeout

```gherkin
Scenario: A stuck engine closes the stream with a timeout
    Given the engine produces no chunk within the configured chunk timeout
    When the client consumes the stream
    Then the stream terminates with error code "tts.chunk_timeout"
    And the connection is closed rather than held open
```

#### Unknown engine or voice is rejected

```gherkin
Scenario: Unknown engine or voice is rejected
    Given the request names engine "missing-engine"
    When the request is validated
    Then the response is 404 with error code "tts.engine_not_found"
    And no fallback engine is used silently
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| API-02 | API input and stream safety | [02-api-input-and-stream-safety.md](../../../torviello-enforcer/api/rules/02-api-input-and-stream-safety.md) |
| PERF-05 | Throughput, latency, batching, and model quality | [05-throughput-latency-batching-and-model-quality.md](../../../torviello-enforcer/performance/rules/05-throughput-latency-batching-and-model-quality.md) |
| API-03 | HTTP semantics and client behavior | [03-http-semantics-and-client-behavior.md](../../../torviello-enforcer/api/rules/03-http-semantics-and-client-behavior.md) |

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

## 5. Prohibited conditions

- Do not stream arbitrary container bytes under an audio/pcm label.
- Do not silently substitute a different engine or voice.
- Do not hold a connection open indefinitely when an engine stalls.
- Do not emit out-of-order or duplicated chunks.
- Do not log synthesized text or raw audio content.

## 6. Procedure

- 1. Synthesize a short text in full and streaming modes and inspect container and chunk headers.
- 2. Submit empty and long texts and inspect validation responses.
- 3. Submit extreme speed and pitch values and inspect metadata.
- 4. Use a stub engine that delays beyond the chunk timeout.
- 5. Request an unknown engine and voice.
- 6. Record request, output inspection, and timing.

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

- WAV header inspection and streaming chunk trace.
- Validation responses for empty and oversized text.
- Metadata showing clamped parameters.
- Timeout terminal event and connection close.
- Unknown identifier error responses.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- Audio validation reports for every supported format.
- A stream timeline showing monotonic frames and terminal behavior.
- Cancellation evidence for disconnect and deadline expiry.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-008](../../../torviello-enforcer/requirements/items/ENG-008.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [text-to-speech.feature](../features/text-to-speech.feature) |
| Rule controls | API-02, PERF-05, API-03 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
