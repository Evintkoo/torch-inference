# AC-ENG-17 — Detect objects with validated model selection and thresholds

**Check ID:** AC-ENG-17  
**Requirement:** ENG-011  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Detection validates model selection, thresholds, upload size, and dimensions, and returns attributable boxes or a stable error without model substitution. AC-ENG-17 verifies ENG-011 and fails when the threshold below is not met.
- **Measurable:** 100% of unsupported model families/sizes rejected without substitution; 100% threshold validation and monotonicity; 100% finite in-range boxes/scores; differential agreement with the reference model within the recorded tolerance; 24 CPU-hours of image/parameter fuzzing.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-011; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-011 — Detect objects with validated model selection and thresholds

**Priority:** MUST  
**Requirement document:** [ENG-011](../../../torviello-enforcer/requirements/items/ENG-011.md)

The engine MUST validate detection model version and size, resolve thresholds from request or configuration, bound upload size and image dimensions, reject missing models and invalid images before inference, and return boxes with stable class labels and applied thresholds.

**Acceptance summary:** A valid image returns detections with count, class names, confidences, and boxes.

## 2. Observable check

Detection validates model selection, thresholds, upload size, and dimensions, and returns attributable boxes or a stable error without model substitution.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `object-detection.feature`

#### Detect objects with default thresholds

```gherkin
Scenario: Detect objects with default thresholds
    Given a valid image upload
    When the client omits threshold overrides
    Then the server applies configured defaults
    And results report detections, count, class names, and confidence
```

#### Per-request thresholds override defaults

```gherkin
Scenario: Per-request thresholds override defaults
    Given the client sets conf_threshold 0.6 and iou_threshold 0.3
    When detection runs
    Then every returned confidence is at least 0.6
    And the response metadata records the applied thresholds
```

#### Unsupported version or size is rejected

```gherkin
Scenario: Unsupported version or size is rejected
    Given model_version "v7"
    When the request is validated
    Then the response is 400 with error code "detect.invalid_model"
    And the supported versions are listed
```

#### Missing model returns a stable not-found error

```gherkin
Scenario: Missing model returns a stable not-found error
    Given the requested model file is absent
    When detection is requested
    Then the response is 404 with error code "detect.model_not_found"
    And no substitute model is used
```

#### Oversized image is rejected

```gherkin
Scenario: Oversized image is rejected
    Given the upload exceeds multipart_image_limit_mb
    When the request is read
    Then the response is 413 with error code "detect.image_too_large"
    And no decoder allocates beyond the limit
```

#### Zero-dimension images are rejected

```gherkin
Scenario: Zero-dimension images are rejected
    Given an image whose decoded width or height is zero
    When detection runs
    Then the response is 400 with error code "detect.invalid_image"
    And the model is not invoked
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| API-02 | API input and stream safety | [02-api-input-and-stream-safety.md](../../../torviello-enforcer/api/rules/02-api-input-and-stream-safety.md) |
| API-03 | HTTP semantics and client behavior | [03-http-semantics-and-client-behavior.md](../../../torviello-enforcer/api/rules/03-http-semantics-and-client-behavior.md) |
| MOD-01 | Model identity, metadata, and compatibility | [01-model-identity-metadata-and-compatibility.md](../../../torviello-enforcer/models/rules/01-model-identity-metadata-and-compatibility.md) |

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

## 5. Prohibited conditions

- Do not silently change model version, size, or thresholds.
- Do not run detection on an image that failed dimension validation.
- Do not return boxes outside the declared coordinate system.
- Do not load a model from a path derived from an unvalidated request.
- Do not reuse a cached detector configured for different thresholds if the backend binds thresholds at initialization.

## 6. Procedure

- 1. Run detection with defaults and with explicit thresholds.
- 2. Request an unsupported version and size.
- 3. Remove the model file and request detection.
- 4. Submit an oversized upload and a zero-dimension image.
- 5. Inspect response metadata and class labels.
- 6. Record fixtures, commands, and observed results.

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

- Detection response with boxes, labels, confidences, and count.
- Threshold override effect on returned confidences and metadata.
- Validation and missing-model error responses.
- Upload and dimension rejection evidence.
- Response envelope with model ID and latency.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- The model-family and size validation matrix.
- The differential report with corpus digest and tolerance.
- Property-test and fuzz reports for image and parameter parsers.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-011](../../../torviello-enforcer/requirements/items/ENG-011.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [object-detection.feature](../features/object-detection.feature) |
| Rule controls | API-02, API-03, MOD-01 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
