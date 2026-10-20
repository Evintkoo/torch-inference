# AC-ENG-25 — Make runtime, hardware, and performance inspectable

**Check ID:** AC-ENG-25  
**Requirement:** ENG-019  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Runtime, hardware, configuration, and performance information is truthful, redacted, windowed, and bounded in sampling and profiling cost. AC-ENG-25 verifies ENG-019 and fails when the threshold below is not met.
- **Measurable:** 100% of reported configuration matches the active snapshot; 100% of values report source and precedence; 100% sampling windows and sample counts stated; zero redaction findings; profiling cost stays within the declared bound.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-019; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-019 — Make runtime, hardware, and performance inspectable

**Priority:** SHOULD  
**Requirement document:** [ENG-019](../../../requirements/items/ENG-019.md)

The engine MUST expose effective runtime, hardware, GPU, and performance information with stated measurement windows, cache expensive sampling, redact secrets, and bound profiling to an explicit request or interval.

**Acceptance summary:** System information matches observed OS, CPU, memory, and runtime version.

## 2. Observable check

Runtime, hardware, configuration, and performance information is truthful, redacted, windowed, and bounded in sampling and profiling cost.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `system-introspection.feature`

#### System information describes hardware and runtime

```gherkin
Scenario: System information describes hardware and runtime
    Given an operator requests system information
    When the response is produced
    Then it reports OS, architecture, CPU count, memory, runtime version, and uptime
    And GPU devices are listed only when a provider is usable
```

#### Effective configuration is redacted

```gherkin
Scenario: Effective configuration is redacted
    Given the configuration contains authentication and storage credentials
    When the operator requests effective configuration
    Then credentials are redacted
    And non-secret values match the running configuration
```

#### GPU statistics are truthful

```gherkin
Scenario: GPU statistics are truthful
    Given no accelerator is available
    When GPU statistics are requested
    Then the response reports an empty device list with a reason
    And it does not fabricate utilization or memory values
```

#### Performance metrics report percentiles

```gherkin
Scenario: Performance metrics report percentiles
    Given completed requests with recorded latencies
    When performance is requested
    Then the response reports throughput and latency percentiles over the documented window
    And the window boundaries are stated
```

#### Profiling is bounded and explicit

```gherkin
Scenario: Profiling is bounded and explicit
    Given an operator requests a profile for one inference
    When profiling completes
    Then the response reports stage timings for that request
    And profiling does not remain enabled for unrelated traffic
```

#### Repeated introspection is cached or bounded

```gherkin
Scenario: Repeated introspection is cached or bounded
    Given many concurrent system information requests
    When the responses are produced
    Then hardware sampling is coalesced within the documented TTL
    And request latency is not dominated by repeated probes
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| OBS-02 | Metrics, health, and Prometheus operations | [02-metrics-health-and-prometheus-operations.md](../../../torviello-enforcer/observability/rules/02-metrics-health-and-prometheus-operations.md) |
| PERF-01 | Benchmark method and performance claims | [01-benchmark-method-and-performance-claims.md](../../../torviello-enforcer/performance/rules/01-benchmark-method-and-performance-claims.md) |
| SEC-05 | Secrets, cryptography, and sensitive data | [05-secrets-cryptography-and-sensitive-data.md](../../../torviello-enforcer/security/rules/05-secrets-cryptography-and-sensitive-data.md) |

#### OBS-02.01 — Expose bounded metrics for request volume, failures, latency distributions

The project MUST expose bounded metrics for request volume, failures, latency distributions, saturation, active work, queue depth, model load/readiness, resource use, and upstream failures.

#### OBS-02.02 — Give each metric one meaning and unit

The project MUST give each metric one meaning and unit. The project MUST also use standard base units and type suffixes where appropriate. The project MUST also use labels for bounded dimensions only; review multiplicative cardinality before adding labels.

#### OBS-02.03 — Distinguish process liveness from readiness to serve the selected

The project MUST distinguish process liveness from readiness to serve the selected product profile. A live process with required models unavailable is not ready.

#### OBS-02.04 — Restrict metrics endpoints to trusted monitoring networks or protect

The project MUST restrict metrics endpoints to trusted monitoring networks or protect them using deployment-supported authentication and TLS. The project MUST NOT expose Prometheus admin/lifecycle endpoints publicly.

#### OBS-02.05 — Monitoring profiles MUST document scrape intervals/timeouts, target discovery, authentication/TLS

Monitoring profiles MUST document scrape intervals/timeouts, target discovery, authentication/TLS, storage retention, dashboards, alert thresholds, ownership, and runbooks. Scrape timeout MUST NOT exceed scrape interval.

#### OBS-02.06 — Validate Prometheus configuration and alert/recording rules with official tooling

The project MUST validate Prometheus configuration and alert/recording rules with official tooling before deployment. Configuration changes are reviewed and rolled back on failed validation.

#### OBS-02.07 — Alerts MUST focus on user-visible symptoms, saturation, and recovery

Alerts MUST focus on user-visible symptoms, saturation, and recovery failure. Each production alert MUST have severity, owner, action, and a test path.

#### PERF-01.01 — Define the workload and target before optimizing: model, input

The project MUST define the workload and target before optimizing: model, input size, concurrency, latency percentile, throughput, peak memory, CPU/GPU utilization, energy/idle draw, and binary/build cost as applicable.

#### PERF-01.02 — Record hardware, OS, compiler, runtime/provider, driver, model digest, input

The project MUST record hardware, OS, compiler, runtime/provider, driver, model digest, input corpus, warmup, repetitions, concurrency, and measurement method. The project MUST report distributions and percentiles where latency matters.

#### PERF-01.03 — Keep benchmark code, harnesses, datasets, and reports under /benchmarks

The project MUST keep benchmark code, harnesses, datasets, and reports under /benchmarks. The project MUST also keep benchmarks out of production source and normal app startup.

#### PERF-01.04 — Compare results to a versioned baseline on the same

The project MUST compare results to a versioned baseline on the same reference environment. The project MUST also define regression thresholds and investigate material regressions before release.

#### PERF-01.05 — Profile to locate a bottleneck before changing algorithms

The project MUST profile to locate a bottleneck before changing algorithms or adding concurrency. The project MUST report both the achieved improvement and any resource/correctness tradeoff.

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

## 5. Prohibited conditions

- Do not fabricate GPU utilization, memory, or temperature.
- Do not expose secrets, tokens, or full environment dumps.
- Do not report percentiles without a stated window and sample basis.
- Do not leave profiling enabled globally after a single-request profile.
- Do not perform an uncached full system probe on every scrape.

## 6. Procedure

- 1. Request system information on hosts with and without accelerators.
- 2. Compare effective configuration with the running configuration and inspect redaction.
- 3. Generate known latencies and inspect reported percentiles and window.
- 4. Issue concurrent introspection requests and measure sampling behavior.
- 5. Profile one inference and verify profiling state afterward.
- 6. Record outputs, timing, and redaction checks.

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

- System information from each host profile.
- GPU output for available and unavailable cases.
- Redacted effective configuration.
- Performance output with window and percentile basis.
- Sampling and profiling state evidence.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../requirements/assurance-standard.md), this check additionally requires:

- The configuration diff report.
- The redaction report and sampling-cost measurements.
- The runtime/version/hardware reconciliation record.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-019](../../../requirements/items/ENG-019.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [system-introspection.feature](../features/system-introspection.feature) |
| Rule controls | OBS-02, PERF-01, SEC-05 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
