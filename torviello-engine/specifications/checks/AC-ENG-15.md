# AC-ENG-15 — Transcribe and validate audio within explicit ingress bounds

**Check ID:** AC-ENG-15  
**Requirement:** ENG-009  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Audio ingress is bounded before decode, formats and durations are validated, transcription returns the documented fields, and validation works without model execution. AC-ENG-15 verifies ENG-009 and fails when the threshold below is not met.
- **Measurable:** 100% of oversized, malformed, polyglot, and decompression-bomb inputs are rejected before decode and dispatch; zero invalid inputs reach a model; 100% of responses contain text, language, duration, and timing; zero temporary-file, buffer, or reference leaks.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-009; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-009 — Transcribe and validate audio within explicit ingress bounds

**Priority:** MUST  
**Requirement document:** [ENG-009](../../../torviello-enforcer/requirements/items/ENG-009.md)

The engine MUST bound audio upload size and duration before decoding, support declared audio formats, reject undecodable input with a stable error, transcribe with optional timestamp segments, and expose validation metadata without executing a model.

**Acceptance summary:** A valid WAV transcribes with text, language, and confidence.

## 2. Observable check

Audio ingress is bounded before decode, formats and durations are validated, transcription returns the documented fields, and validation works without model execution.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `speech-to-text.feature`

#### Transcribe a WAV upload

```gherkin
Scenario: Transcribe a WAV upload
    Given a valid mono WAV file under the size limit
    When the client calls transcription
    Then the response contains text, language, and confidence
    And segments are absent unless timestamps were requested
```

#### Timestamps add segment bounds

```gherkin
Scenario: Timestamps add segment bounds
    Given the client requests timestamps
    When transcription succeeds
    Then each segment reports start and end seconds in ascending order
    And segment text concatenates to the response text
```

#### Invalid audio is rejected

```gherkin
Scenario: Invalid audio is rejected
    Given the uploaded bytes are not decodable audio
    When the request is validated
    Then the response is 400 with error code "audio.invalid_format"
    And no model inference runs
```

#### Oversized uploads return 413 before decoding

```gherkin
Scenario: Oversized uploads return 413 before decoding
    Given the upload exceeds multipart_audio_limit_mb
    When the request is read
    Then the response is 413 with error code "audio.too_large"
    And memory use stays bounded by the configured limit
```

#### Excessive duration is rejected

```gherkin
Scenario: Excessive duration is rejected
    Given a valid audio file longer than audio_max_duration_secs
    When the request is validated
    Then the response is 400 with error code "audio.too_long"
    And decoding stops at the configured bound
```

#### Validation without inference reports metadata

```gherkin
Scenario: Validation without inference reports metadata
    Given a valid audio upload
    When the client calls audio validation
    Then the response reports format, sample rate, channels, and duration
    And it reports valid true with an empty errors array
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| API-02 | API input and stream safety | [02-api-input-and-stream-safety.md](../../../torviello-enforcer/api/rules/02-api-input-and-stream-safety.md) |
| SEC-04 | Input, file, and resource security | [04-input-file-and-resource-security.md](../../../torviello-enforcer/security/rules/04-input-file-and-resource-security.md) |
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

#### SEC-04.01 — Validate type, size, structure, dimensions, duration, encoding, path

The project MUST validate type, size, structure, dimensions, duration, encoding, path, and resource cost before parsing or inference. The project MUST also apply independent limits at network, parser, queue, and model boundaries.

#### SEC-04.02 — Protect against path traversal, symlink escape, archive bombs, decompression

The project MUST protect against path traversal, symlink escape, archive bombs, decompression bombs, parser crashes, SSRF, command injection, and unsafe deserialization.

#### SEC-04.03 — Use allowlisted sources for remote fetches

The project MUST use allowlisted sources for remote fetches. The project MUST also restrict schemes, redirects, resolved addresses, ports, response sizes, and timeouts; block loopback/private/link-local destinations unless specifically required.

#### SEC-04.04 — Run model/file parsing with least privilege and bounded memory/CPU/time

The project MUST run model/file parsing with least privilege and bounded memory/CPU/time. The project MUST NOT execute model-provided code or custom operators without an explicit security review and isolation design.

#### SEC-04.05 — Use safe output encoding and content security policy

The project MUST use safe output encoding and content security policy for web views. The project MUST also treat model outputs as untrusted when rendered or used to construct downstream operations.

#### SEC-04.06 — Apply bounded concurrency, request size, queue depth, and timeouts

The project MUST apply bounded concurrency, request size, queue depth, and timeouts to prevent denial of service.

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

- Do not buffer an unbounded multipart body before enforcing the limit.
- Do not decode an entire oversized duration before rejecting it.
- Do not return a successful transcript for undecodable input.
- Do not log audio bytes or transcript content.
- Do not run synchronous decoding on the request reactor.

## 6. Procedure

- 1. Transcribe a short valid WAV with and without timestamps.
- 2. Submit random bytes, a truncated container, and an unsupported format.
- 3. Submit an upload above the multipart limit and one above the duration limit.
- 4. Call the validation endpoint with valid and invalid audio.
- 5. Inspect memory and worker behavior during the oversized cases.
- 6. Record fixtures, responses, and observed resource bounds.

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

- Transcript and segment output for the valid cases.
- Validation metadata for valid and invalid audio.
- 413 and 400 responses for size, duration, and format violations.
- Evidence that rejection occurred before full decode or model dispatch.
- Audio health output listing models and formats.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- Fuzz logs and the malicious audio corpus.
- Boundary results showing rejection before model execution.
- The transcript field schema and resource-cleanup report.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-009](../../../torviello-enforcer/requirements/items/ENG-009.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [speech-to-text.feature](../features/speech-to-text.feature) |
| Rule controls | API-02, SEC-04, API-03 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
