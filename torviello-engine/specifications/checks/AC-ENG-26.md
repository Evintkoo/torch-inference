# AC-ENG-26 — Correlate requests through structured, redacted logs

**Check ID:** AC-ENG-26  
**Requirement:** ENG-020  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Every request is correlated and logged in structured form, including rejected traffic, with no sensitive payloads and with confined diagnostic access. AC-ENG-26 verifies ENG-020 and fails when the threshold below is not met.
- **Measurable:** 100% request correlation across HTTP, WebSocket, upstream, and response; zero log-forging via CRLF, ANSI, Unicode control, or oversized fields; zero secret or payload findings; 100% W3C trace-context propagation; 100% audited diagnostic access.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-020; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-020 — Correlate requests through structured, redacted logs

**Priority:** MUST  
**Requirement document:** [ENG-020](../../../requirements/items/ENG-020.md)

The engine MUST assign or validate a correlation identifier at ingress, propagate it through logs and optional upstream calls, emit structured records for accepted and rejected requests, and exclude secrets, prompts, audio, images, and full payloads from logs and diagnostic access.

**Acceptance summary:** A request without a correlation header receives a generated ID visible in the response and logs.

## 2. Observable check

Every request is correlated and logged in structured form, including rejected traffic, with no sensitive payloads and with confined diagnostic access.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `logging-and-correlation.feature`

#### Correlation ID is assigned at ingress

```gherkin
Scenario: Correlation ID is assigned at ingress
    Given a request without a correlation header
    When it enters the server
    Then the server assigns a unique identifier
    And the response and log records carry it
```

#### Caller-supplied correlation is validated

```gherkin
Scenario: Caller-supplied correlation is validated
    Given a request supplies an oversized or malformed correlation header
    When it enters the server
    Then the value is rejected or replaced safely
    And log injection through that header is impossible
```

#### Rejected requests are still logged

```gherkin
Scenario: Rejected requests are still logged
    Given auth or rate limiting rejects a request
    When the decision is made
    Then a structured record includes method, path, status, latency, and request ID
    And the record does not include credentials or payload bodies
```

#### Prompt, audio, and image content stay out of logs

```gherkin
Scenario: Prompt, audio, and image content stay out of logs
    Given an inference request contains user text, audio, or image bytes
    When the request is logged
    Then only bounded metadata such as size and content type are recorded
    And raw content is absent
```

#### Upstream trace context propagates

```gherkin
Scenario: Upstream trace context propagates
    Given tracing is enabled
    When the engine calls an optional upstream
    Then the trace context is propagated in the documented header
    And a rejected upstream does not break local correlation
```

#### Diagnostic access is controlled

```gherkin
Scenario: Diagnostic access is controlled
    Given an operator requests logs
    When the request is authorized
    Then only declared log files inside the log root are readable
    And path traversal outside that root is rejected
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| OBS-01 | Secure structured logging and traces | [01-secure-structured-logging-and-traces.md](../../../torviello-enforcer/observability/rules/01-secure-structured-logging-and-traces.md) |
| OBS-03 | Traces, context propagation, and telemetry cost | [03-traces-context-propagation-and-telemetry-cost.md](../../../torviello-enforcer/observability/rules/03-traces-context-propagation-and-telemetry-cost.md) |
| SEC-05 | Secrets, cryptography, and sensitive data | [05-secrets-cryptography-and-sensitive-data.md](../../../torviello-enforcer/security/rules/05-secrets-cryptography-and-sensitive-data.md) |
| OBS-05 | Retention, privacy, and diagnostic access | [05-retention-privacy-and-diagnostic-access.md](../../../torviello-enforcer/observability/rules/05-retention-privacy-and-diagnostic-access.md) |

#### OBS-01.01 — Emit structured runtime logs through the shared logging system

The project MUST emit structured runtime logs through the shared logging system. The project MUST also include timestamp, severity, service identity, event name, and correlation/trace context where available.

#### OBS-01.02 — Record operational and security events consistently: startup/shutdown, authentication

The project MUST record operational and security events consistently: startup/shutdown, authentication and authorization outcomes, configuration changes, model installation/promotion, dependency failures, and request outcomes.

#### OBS-01.03 — Log passwords, tokens, API keys, private keys, database credentials

The project MUST NOT log passwords, tokens, API keys, private keys, database credentials, full prompts, raw uploads, or unnecessary personal data. It MUST redact secrets at boundaries and sanitize untrusted values against log injection.

#### OBS-01.04 — Bound log volume and retention

The project MUST bound log volume and retention. The project MUST also use rotation or external collection without allowing disk exhaustion to interfere with application state.

#### OBS-01.05 — Use OpenTelemetry semantic conventions for HTTP, service identity, exceptions

The project MUST use OpenTelemetry semantic conventions for HTTP, service identity, exceptions, and resources. Propagate trace context across trusted service boundaries; never treat correlation identifiers as identity or authorization.

#### OBS-01.06 — Make telemetry export explicitly configurable and off by default

The project SHOULD make telemetry export explicitly configurable and off by default in local/offline profiles. The project MUST also document all exported fields and endpoints.

#### OBS-03.01 — Trace context MUST propagate across API handling, queues…

**Requirement:** Trace context MUST propagate across API handling, queues, model loading, inference, persistence, and external calls where causal relationships exist, using supported W3C trace context or an explicitly documented equivalent.

#### OBS-03.02 — Incoming trace context MUST be validated and treated as…

**Requirement:** Incoming trace context MUST be validated and treated as untrusted. It MUST NOT authorize access, select an arbitrary exporter, or cause unbounded trace state or baggage growth.

#### OBS-03.03 — Spans MUST represent operations with meaningful duration or cross-boundary…

**Requirement:** Spans MUST represent operations with meaningful duration or cross-boundary causality. Attributes MUST use stable semantic names, bounded values, documented units, and approved redaction rules.

#### OBS-03.04 — Telemetry sampling MUST define head/tail behavior, error…

**Requirement:** Telemetry sampling MUST define head/tail behavior, error and latency retention, per-profile defaults, and operator controls. Sampling MUST NOT create an unbounded memory buffer or delay request completion.

#### OBS-03.05 — Export MUST be optional for local/offline deployments. Exporter…

**Requirement:** Export MUST be optional for local/offline deployments. Exporter destination, TLS/authentication, data categories, sampling, retry buffer, and shutdown flush timeout MUST be configurable.

#### OBS-03.06 — Telemetry failures MUST not fail inference or block readiness…

**Requirement:** Telemetry failures MUST not fail inference or block readiness unless telemetry is explicitly a required product dependency. Export queues MUST have bounded size and drop behavior with a metric.

#### OBS-03.07 — Changes to semantic conventions MUST document migration and compatibility…

**Requirement:** Changes to semantic conventions MUST document migration and compatibility because dashboards and alert rules can consume the emitted names.

#### SEC-05.01 — Use maintained cryptographic libraries and standard algorithms

The project MUST use maintained cryptographic libraries and standard algorithms. The project MUST NOT implement cryptographic primitives or protocols directly.

#### SEC-05.02 — Store secrets in an appropriate OS/orchestrator secret store

Each supported deployment profile MUST name an approved secret store and enforce least-privilege read access. Prefer an OS or orchestrator secret manager; when one is unavailable, use a protected file readable only by the owning service identity on encrypted storage. The profile MUST define rotation and revocation steps and MUST fail closed if required secret material cannot be loaded or its access protections cannot be verified.

#### SEC-05.03 — Protect sensitive data in transit and at rest according

The project MUST protect sensitive data in transit and at rest according to classification and deployment threat model. Minimize retention and define deletion behavior.

#### SEC-05.04 — Keep secrets out of source control, logs, telemetry, crash

The project MUST keep secrets out of source control, logs, telemetry, crash reports, screenshots, URLs, and support bundles. Redact at system boundaries and test redaction.

#### SEC-05.05 — Use constant-time comparison for secret-derived authenticators where relevant

Every comparison of a secret-derived authenticator, including a password verifier, MAC, or token, MUST use a constant-time comparison. The project MUST generate secrets with cryptographically secure randomness and MUST fail closed if required entropy or key material is unavailable.

#### OBS-05.01 — Logs, traces, metrics, crash reports…

**Requirement:** Logs, traces, metrics, crash reports, and support bundles MUST each have a stated purpose, data classification, retention period, storage location, access policy, and deletion mechanism.

#### OBS-05.02 — Inference prompts, completions, uploaded files, model…

**Requirement:** Inference prompts, completions, uploaded files, model outputs, credentials, and direct identifiers MUST not be collected by default for diagnostics. Any opt-in collection MUST disclose fields, purpose, destination, retention, and how to disable/delete it.

#### OBS-05.03 — Structured fields MUST use an allowlist or explicit classification…

**Requirement:** Structured fields MUST use an allowlist or explicit classification policy. Redaction MUST occur before persistence or export, and tests MUST cover nested fields, exception strings, URLs, query parameters, and malformed input.

#### OBS-05.04 — Diagnostic access MUST be least-privilege and audited when it…

**Requirement:** Diagnostic access MUST be least-privilege and audited when it permits viewing security events, user identifiers, or sensitive inference content.

#### OBS-05.05 — Log rotation and storage limits MUST prevent disk exhaustion…

**Requirement:** Log rotation and storage limits MUST prevent disk exhaustion; behavior when storage is full MUST preserve service safety and surface a bounded alert.

#### OBS-05.06 — Telemetry pseudonyms and correlation identifiers MUST have bounded lifetime…

**Requirement:** Telemetry pseudonyms and correlation identifiers MUST have bounded lifetime and MUST NOT be reused as authentication credentials or stable cross-service user profiles.

#### OBS-05.07 — Support bundles MUST be previewable or field-selectable before export…

**Requirement:** Support bundles MUST be previewable or field-selectable before export and MUST exclude secrets and user payloads unless explicitly selected under an approved support workflow.

## 5. Prohibited conditions

- Do not log credentials, tokens, prompt text, transcripts, audio, or image bytes.
- Do not allow arbitrary text from a header to become an unescaped log field.
- Do not place request logging behind authentication or rate limiting only.
- Do not expose log files outside the declared root.
- Do not claim trace propagation while sending no context.

## 6. Procedure

- 1. Send requests with and without correlation headers, including malformed values.
- 2. Trigger authentication and rate-limit failures and inspect records.
- 3. Send representative prompt, audio, and image requests and inspect logs.
- 4. Call a configured upstream and inspect propagated headers.
- 5. Attempt log file access outside the root.
- 6. Record log samples and redaction results.

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

- Log records for accepted and rejected requests with correlation IDs.
- Safe handling of malformed correlation headers.
- Redaction inspection for each payload type.
- Upstream trace-header evidence.
- Path-confinement evidence for log access.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../requirements/assurance-standard.md), this check additionally requires:

- Injection and redaction reports with zero findings.
- The trace-propagation record.
- The retention, access, and audit evidence.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-020](../../../requirements/items/ENG-020.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [logging-and-correlation.feature](../features/logging-and-correlation.feature) |
| Rule controls | OBS-01, OBS-03, SEC-05, OBS-05 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
