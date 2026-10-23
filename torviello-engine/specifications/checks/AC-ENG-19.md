# AC-ENG-19 — Serve realtime WebSocket sessions with bounded framing

**Check ID:** AC-ENG-19  
**Requirement:** ENG-013  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** WebSocket sessions negotiate explicitly, validate and bound frames, preserve ordering, and release resources on disconnect without bypassing HTTP controls. AC-ENG-19 verifies ENG-013 and fails when the threshold below is not met.
- **Measurable:** 100% RFC 6455 conformance for handshake, framing, fragmentation, control frames, close codes, and UTF-8; zero malformed frames accepted; zero unbounded buffers; 100% resource release on disconnect; 24 CPU-hours of frame fuzzing.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-013; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-013 — Serve realtime WebSocket sessions with bounded framing

**Priority:** SHOULD  
**Requirement document:** [ENG-013](../../../torviello-enforcer/requirements/items/ENG-013.md)

Realtime WebSocket sessions MUST negotiate capabilities explicitly, validate control and binary frames, bound per-session buffers, preserve response ordering, and release all session resources on disconnect or error.

**Acceptance summary:** An audio upgrade receives a ready frame and accepts a control frame.

## 2. Observable check

WebSocket sessions negotiate explicitly, validate and bound frames, preserve ordering, and release resources on disconnect without bypassing HTTP controls.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `realtime-transports.feature`

#### Audio socket announces readiness

```gherkin
Scenario: Audio socket announces readiness
    Given a client upgrades the audio WebSocket
    When the connection is established
    Then the server sends {"type":"ready"}
    And the session accepts JSON control frames and binary PCM frames
```

#### Streaming TTS emits ordered audio

```gherkin
Scenario: Streaming TTS emits ordered audio
    Given the client sends a tts control frame with text
    When synthesis runs
    Then the server sends a tts_meta frame followed by binary PCM chunks
    And it sends tts_done after the final chunk
```

#### Streaming STT bounds the utterance

```gherkin
Scenario: Streaming STT bounds the utterance
    Given the client sends stt_begin with sample_rate 16000
    And streams f32 little-endian PCM frames
    When the client sends stt_end
    Then the server returns one transcript frame
    And it rejects frames that exceed the session buffer limit
```

#### Vision sockets require a config frame

```gherkin
Scenario: Vision sockets require a config frame
    Given a client connects to the classification or detection socket
    When it sends binary frames before a config frame
    Then the server returns an error frame
    And no inference runs
```

#### Invalid control frames are rejected

```gherkin
Scenario: Invalid control frames are rejected
    Given a malformed JSON control frame
    When the server processes it
    Then it returns an error frame with a stable code
    And the session remains usable
```

#### Disconnect releases session resources

```gherkin
Scenario: Disconnect releases session resources
    Given an active WebSocket session
    When the client disconnects abruptly
    Then the server stops synthesis or inference for that session
    And session-scoped buffers are released
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| API-02 | API input and stream safety | [02-api-input-and-stream-safety.md](../../../torviello-enforcer/api/rules/02-api-input-and-stream-safety.md) |
| API-04 | API inventory, evolution, and deprecation | [04-api-inventory-evolution-and-deprecation.md](../../../torviello-enforcer/api/rules/04-api-inventory-evolution-and-deprecation.md) |
| ARC-04 | Boundaries, failures, and resource ownership | [04-boundaries-failures-and-resource-ownership.md](../../../torviello-enforcer/architecture/rules/04-boundaries-failures-and-resource-ownership.md) |

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

#### API-04.01 — The project MUST maintain an inventory of every externally…

**Requirement:** The project MUST maintain an inventory of every externally reachable API surface, including engine HTTP routes, admin routes, health/metrics endpoints, callbacks, internal service APIs exposed through a gateway, and protocol versions. Each entry MUST identify owner, audience, exposure, auth policy, lifecycle state, and contract location.

#### API-04.02 — Production API changes MUST be classified as compatible…

**Requirement:** Production API changes MUST be classified as compatible, conditionally compatible, or breaking against the published contract and known consumers. Reviewers MUST examine field requiredness, defaults, enum expansion, response shape, status codes, ordering, pagination, streaming framing, and authorization changes.

#### API-04.03 — Breaking changes MUST use a versioning and migration policy…

**Requirement:** Breaking changes MUST use a versioning and migration policy chosen for the product (URI, media type, or another explicit scheme), with a published compatibility window, migration guidance, sunset date, and owner. Deprecation notices MUST be observable before removal.

#### API-04.04 — Every deployed version MUST be discoverable by operators…

**Requirement:** Every deployed version MUST be discoverable by operators. Remove unsupported versions from the deployment inventory only after traffic and consumer evidence show that the deprecation window has completed.

#### API-04.05 — Debug, experimental, and internal endpoints MUST be…

**Requirement:** Debug, experimental, and internal endpoints MUST be excluded from production packages or protected by an explicit access policy. Their presence and exposure MUST be checked in release qualification.

#### API-04.06 — OpenAPI contracts MUST be reviewed in the same change…

**Requirement:** OpenAPI contracts MUST be reviewed in the same change as implementation. Generated schemas MUST be reproducible; generated diffs MUST not hide semantic changes in hand-maintained descriptions or security declarations.

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

- Do not accept inference frames before required negotiation.
- Do not grow a session buffer without a configured bound.
- Do not interleave results from concurrent requests in one session.
- Do not leave inference running after disconnect.
- Do not bypass authentication or rate limiting because the transport is WebSocket.

## 6. Procedure

- 1. Connect to each socket and exercise the documented handshake.
- 2. Send valid TTS, STT, classification, and detection sessions and record frame order.
- 3. Send malformed control frames, binary frames before config, and oversized frames.
- 4. Disconnect during synthesis and inspect worker and buffer cleanup.
- 5. Attempt a connection without required credentials when authentication is enabled.
- 6. Record protocol transcripts and resource observations.

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

- Frame transcripts for each successful session type.
- Error frames for malformed and out-of-order input.
- Disconnect cleanup evidence.
- Authentication and rate-limit behavior on the WebSocket path.
- Ordering evidence across concurrent requests in one session.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- The RFC 6455 conformance report.
- Fuzz logs and the session resource timeline.
- Evidence that HTTP auth and rate policy applies to upgrades.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-013](../../../torviello-enforcer/requirements/items/ENG-013.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [realtime-transports.feature](../features/realtime-transports.feature) |
| Rule controls | API-02, API-04, ARC-04 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
