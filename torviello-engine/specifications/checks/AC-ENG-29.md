# AC-ENG-29 — Sanitize inputs and postprocess outputs deterministically

**Check ID:** AC-ENG-29  
**Requirement:** ENG-023  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Input limits are enforced before inference, output postprocessing is ordered and reported, skip behavior is explicit, and identical requests produce identical results. AC-ENG-29 verifies ENG-023 and fails when the threshold below is not met.
- **Measurable:** 100% validate-before-infer; 100% deterministic output for identical inputs and parameters; 100% declared postprocessing order; zero validation bypasses or execution after rejection; mutation score ≥90% for validation/postprocessing.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-023; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-023 — Sanitize inputs and postprocess outputs deterministically

**Priority:** MUST  
**Requirement document:** [ENG-023](../../../requirements/items/ENG-023.md)

The engine MUST bound text and image inputs before inference, apply documented postprocessing to outputs, report every applied step and warning, preserve raw output when postprocessing is skipped, and keep results deterministic for identical inputs and configuration.

**Acceptance summary:** Oversized text is rejected with input.text_too_long and no model execution.

## 2. Observable check

Input limits are enforced before inference, output postprocessing is ordered and reported, skip behavior is explicit, and identical requests produce identical results.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `postprocessing-and-sanitization.feature`

#### Text input is bounded

```gherkin
Scenario: Text input is bounded
    Given a text input exceeds max_text_length
    When sanitization runs
    Then the request is rejected with error code "input.text_too_long"
    And no truncated payload is executed as if complete
```

#### Image dimensions are bounded

```gherkin
Scenario: Image dimensions are bounded
    Given an image exceeds max_image_width or max_image_height
    When sanitization runs
    Then the request is rejected before decoding full pixels
    And the limit is reported
```

#### Probabilities are rounded deterministically

```gherkin
Scenario: Probabilities are rounded deterministically
    Given probability_decimals is 4 and rounding is enabled
    When classification output is postprocessed
    Then every probability is rounded to four decimals
    And the ordering by confidence is preserved
```

#### Null values are removed or preserved by policy

```gherkin
Scenario: Null values are removed or preserved by policy
    Given remove_null_values is true
    When an output object contains null fields
    Then those fields are omitted
    And required fields are never removed
```

#### Postprocessing steps are reported

```gherkin
Scenario: Postprocessing steps are reported
    Given normalization and rounding are applied
    When the response is returned
    Then meta.postprocess_steps lists each applied step in order
    And meta.postprocessing_applied is true
```

#### Skipping postprocessing returns raw backend output

```gherkin
Scenario: Skipping postprocessing returns raw backend output
    Given skip_postprocess is true
    When inference succeeds
    Then the response reports raw values
    And sanitization still applies to the input boundary
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| API-01 | API contracts and schemas | [01-api-contracts-and-schemas.md](../../../torviello-enforcer/api/rules/01-api-contracts-and-schemas.md) |
| SEC-04 | Input, file, and resource security | [04-input-file-and-resource-security.md](../../../torviello-enforcer/security/rules/04-input-file-and-resource-security.md) |
| MOD-05 | Model runtime isolation and resource contracts | [05-model-runtime-isolation-and-resource-contracts.md](../../../torviello-enforcer/models/rules/05-model-runtime-isolation-and-resource-contracts.md) |

#### API-01.01 — Maintain a machine-readable OpenAPI description for every public HTTP

The project MUST maintain a machine-readable OpenAPI description for every public HTTP API. The project MUST also treat it as a reviewed contract that describes paths, methods, schemas, validation constraints, authentication, authorization, status codes, error bodies, pagination, and streaming behavior.

#### API-01.02 — Keep request and response schemas in a dedicated API

The project MUST keep request and response schemas in a dedicated API schema module. The project MUST also group handlers by user-facing functionality. A handler MAY parse transport input, invoke a domain interface, and serialize a response; it MUST NOT own inference, persistence, registry policy, or cross-service business logic.

#### API-01.03 — Use one stable error envelope

The project MUST use one stable error envelope. The project MUST also include a safe error code and correlation identifier; return actionable client guidance without leaking stack traces, filesystem paths, secrets, internal service names, or dependency errors.

#### API-01.04 — Define compatibility for every endpoint

The project MUST define compatibility for every endpoint. Additive changes preserve existing semantics. Breaking changes require an explicit API version/deprecation plan, a migration window, and consumer-facing release notes.

#### API-01.05 — Generate reference documentation from the contract when practical

The project SHOULD generate reference documentation from the contract when practical. Handwritten endpoint examples MUST be checked against the current contract and implementation.

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

## 5. Prohibited conditions

- Do not silently truncate text or resize an oversized image into an accepted request.
- Do not apply postprocessing without reporting it.
- Do not change confidence ordering through rounding.
- Do not remove required fields when null removal is enabled.
- Do not bypass input sanitization when postprocessing is skipped.

## 6. Procedure

- 1. Submit text and images just below and above each configured limit.
- 2. Run classification with rounding enabled and inspect decimals and ordering.
- 3. Run with null removal on and off and compare fields.
- 4. Run with postprocessing enabled, warning-producing, and skipped.
- 5. Repeat identical requests and compare outputs for determinism.
- 6. Record configuration, inputs, outputs, and metadata.

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

- Limit rejection responses for text and images.
- Rounded probability output and preserved ordering.
- Null-field comparison.
- Postprocess step and warning metadata.
- Determinism comparison for repeated requests.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../requirements/assurance-standard.md), this check additionally requires:

- The adversarial corpus and validate-before-infer evidence.
- The determinism report with tolerances.
- The postprocessing order and schema validation.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-023](../../../requirements/items/ENG-023.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [postprocessing-and-sanitization.feature](../features/postprocessing-and-sanitization.feature) |
| Rule controls | API-01, SEC-04, MOD-05 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
