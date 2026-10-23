# AC-ENG-08 — Start, signal readiness, and stop in bounded stages

**Check ID:** AC-ENG-08  
**Requirement:** ENG-002  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Startup, readiness, and shutdown are distinct observable stages; readiness reflects serving capability, and shutdown drains or cancels work within the configured deadline. AC-ENG-08 verifies ENG-002 and fails when the threshold below is not met.
- **Measurable:** TLA+ model checking finds zero invariant violations across every lifecycle state; 100% of guarded transitions match the model; readiness is false in 100% of pending/failed states; shutdown completes within the configured grace window in 100% of runs or records a forced exit.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-002; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-002 — Start, signal readiness, and stop in bounded stages

**Priority:** MUST  
**Requirement document:** [ENG-002](../../../torviello-enforcer/requirements/items/ENG-002.md)

The engine MUST separate process start, dependency initialization, readiness, and shutdown; readiness MUST reflect the ability to serve the configured workload, and shutdown MUST stop admission, drain or cancel in-flight work within a deadline, and report a terminal status.

**Acceptance summary:** A valid engine reports liveness before readiness and readiness only after required initialization.

## 2. Observable check

Startup, readiness, and shutdown are distinct observable stages; readiness reflects serving capability, and shutdown drains or cancels work within the configured deadline.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `startup-lifecycle.feature`

#### Validation precedes listener binding

```gherkin
Scenario: Validation precedes listener binding
    Given the configuration is valid
    When the engine starts
    Then it validates configuration and required paths before binding the socket
    And it reports the bound address only after the listener is active
```

#### Readiness follows engine initialization

```gherkin
Scenario: Readiness follows engine initialization
    Given the engine has bound its listener but has not initialized required models
    When a readiness probe runs
    Then readiness reports "not_ready" with the pending stage
    And the liveness probe still reports "alive"
```

#### Ready engine serves requests

```gherkin
Scenario: Ready engine serves requests
    Given all required models are initialized
    When the readiness probe runs
    Then readiness reports "ready"
    And the response names the engine version and selected backend
```

#### A failed optional model does not crash the process

```gherkin
Scenario: A failed optional model does not crash the process
    Given one optional model fails to initialize
    When the engine finishes startup
    Then the process remains alive and readiness reflects degraded capability
    And the failure is reported with the model ID and a stable error code
```

#### Graceful shutdown drains in-flight work

```gherkin
Scenario: Graceful shutdown drains in-flight work
    Given a long-running inference request is active
    When the engine receives a termination signal
    Then it stops accepting new connections
    And it completes or cancels the request within the shutdown deadline
    And it exits with a recorded status
```

#### Shutdown deadline is enforced

```gherkin
Scenario: Shutdown deadline is enforced
    Given a request ignores cancellation past the shutdown deadline
    When the engine receives a termination signal
    Then the process exits within the configured grace window
    And the forced termination is recorded as an operational event
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| OPS-01 | Service lifecycle and readiness | [01-service-lifecycle-and-readiness.md](../../../torviello-enforcer/operations/rules/01-service-lifecycle-and-readiness.md) |
| ARC-04 | Boundaries, failures, and resource ownership | [04-boundaries-failures-and-resource-ownership.md](../../../torviello-enforcer/architecture/rules/04-boundaries-failures-and-resource-ownership.md) |
| OBS-02 | Metrics, health, and Prometheus operations | [02-metrics-health-and-prometheus-operations.md](../../../torviello-enforcer/observability/rules/02-metrics-health-and-prometheus-operations.md) |

#### OPS-01.01 — Document and support installation, start, stop, restart, readiness, liveness

The project MUST document and support installation, start, stop, restart, readiness, liveness, logs, configuration, upgrade, rollback, and uninstall for each declared deployment profile.

#### OPS-01.02 — Startup MUST validate configuration and required runtime prerequisites before

Startup MUST validate configuration and required runtime prerequisites before readiness becomes true. Readiness MUST reflect whether configured capabilities can serve; liveness MUST reflect whether the process can continue operating.

#### OPS-01.03 — Shutdown MUST stop accepting work, drain or cancel requests

Shutdown MUST stop accepting work, drain or cancel requests within a defined deadline, flush required state, and release model/runtime resources. Repeated signals and abrupt termination MUST have bounded behavior.

#### OPS-01.04 — Configure process supervision or container restart behavior with bounded

The project MUST configure process supervision or container restart behavior with bounded retry/backoff and visible failure state. Endless restart loops MUST NOT hide invalid configuration or unavailable required models.

#### OPS-01.05 — Keep the local engine usable without a hosted account

The project MUST keep the local engine usable without a hosted account, hosted registry, or telemetry endpoint unless the selected profile explicitly requires that service.

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

## 5. Prohibited conditions

- Do not report ready solely because the HTTP listener bound.
- Do not use liveness to restart the process because an optional model is absent.
- Do not wait indefinitely for a stuck model or device operation during shutdown.
- Do not drop in-flight work without recording it as cancelled or forced.
- Do not start model downloads or initialization before configuration validation.

## 6. Procedure

- 1. Start with a valid configuration and poll liveness and readiness through each startup stage.
- 2. Introduce an optional model failure and repeat the probes; inspect health and the process state.
- 3. Start a long request, send a termination signal, and measure admission stop, drain completion, and exit time.
- 4. Force a request beyond the drain window and inspect the terminal record.
- 5. Start with invalid configuration and confirm the process exits before binding.
- 6. Record revision, commands, timings, and observed statuses.

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

- Probe transcripts for liveness and readiness at each stage.
- Health output for the failed optional model showing degraded status and model ID.
- Timing record for admission stop, drain, and exit.
- The structured startup and shutdown records.
- Exit status for invalid configuration and a listener check.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- The TLA+ specification, model-checking log, and invariant-to-requirement map.
- The signal-injection matrix with observed transitions, exit codes, and forced-exit records.
- A shutdown timeline showing admission stop, drain duration, and resource release.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-002](../../../torviello-enforcer/requirements/items/ENG-002.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [startup-lifecycle.feature](../features/startup-lifecycle.feature) |
| Rule controls | OPS-01, ARC-04, OBS-02 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
