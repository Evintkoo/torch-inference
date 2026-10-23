# AC-ENG-24 — Expose health, readiness, liveness, and bounded metrics

**Check ID:** AC-ENG-24  
**Requirement:** ENG-018  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Liveness, readiness, and health have distinct semantics, metrics are Prometheus-compatible and bounded, probes bypass inference limits, and dashboard streams are well-behaved. AC-ENG-24 verifies ENG-018 and fails when the threshold below is not met.
- **Measurable:** Liveness, readiness, and health are distinct in 100% of states; zero blocked probes under saturation; 100% Prometheus/OpenMetrics validation; zero unbounded labels; 100% OpenTelemetry 1.44.0 field conformance; zero user-controlled label values.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-018; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-018 — Expose health, readiness, liveness, and bounded metrics

**Priority:** MUST  
**Requirement document:** [ENG-018](../../../torviello-enforcer/requirements/items/ENG-018.md)

The engine MUST expose distinct liveness, readiness, and subsystem health, a Prometheus-compatible metrics endpoint with bounded cardinality, and a live dashboard stream, and it MUST keep probes available when inference traffic is saturated or rate limited.

**Acceptance summary:** Liveness returns 200 for a running process even when no model is loaded.

## 2. Observable check

Liveness, readiness, and health have distinct semantics, metrics are Prometheus-compatible and bounded, probes bypass inference limits, and dashboard streams are well-behaved.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `health-and-metrics.feature`

#### Liveness reflects the process

```gherkin
Scenario: Liveness reflects the process
    Given the engine process is running
    When the liveness probe runs
    Then it returns 200 while the runtime can accept work
    And it does not require a loaded model
```

#### Readiness reflects serving capability

```gherkin
Scenario: Readiness reflects serving capability
    Given required models are initialized
    When the readiness probe runs
    Then it returns 200 with status "ready"
    And it returns 503 with pending components when they are not ready
```

#### Health reports subsystem status

```gherkin
Scenario: Health reports subsystem status
    Given the engine is running
    When health is requested
    Then the response reports overall status, version, uptime, and per-subsystem checks
    And a failed optional subsystem does not report overall healthy
```

#### Metrics scrape is bounded

```gherkin
Scenario: Metrics scrape is bounded
    Given high request volume
    When /metrics is scraped
    Then the response follows Prometheus text format
    And label cardinality is bounded by documented dimensions
```

#### Health and metrics bypass rate limiting

```gherkin
Scenario: Health and metrics bypass rate limiting
    Given the client has exhausted its request budget
    When it calls /health or /metrics
    Then the request is served
    And the probe endpoints are not counted against the inference budget
```

#### Dashboard stream reflects current state

```gherkin
Scenario: Dashboard stream reflects current state
    Given a client subscribes to the dashboard stream
    When metrics change
    Then events are emitted on the documented interval
    And the stream closes cleanly on client disconnect
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| OBS-02 | Metrics, health, and Prometheus operations | [02-metrics-health-and-prometheus-operations.md](../../../torviello-enforcer/observability/rules/02-metrics-health-and-prometheus-operations.md) |
| OPS-01 | Service lifecycle and readiness | [01-service-lifecycle-and-readiness.md](../../../torviello-enforcer/operations/rules/01-service-lifecycle-and-readiness.md) |
| SEC-10 | Secure defaults and abuse resilience | [10-secure-defaults-and-abuse-resilience.md](../../../torviello-enforcer/security/rules/10-secure-defaults-and-abuse-resilience.md) |

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

## 5. Prohibited conditions

- Do not make liveness depend on model availability.
- Do not return ready while required components are pending.
- Do not add unbounded request IDs, prompts, or paths as metric labels.
- Do not block probes behind inference concurrency limits.
- Do not expose secrets or raw payloads in health or metrics.

## 6. Procedure

- 1. Probe liveness and readiness before, during, and after initialization.
- 2. Introduce a failed required component and inspect health aggregation.
- 3. Scrape metrics under load and validate format and label sets.
- 4. Exhaust the rate-limit budget and repeat probe and metrics calls.
- 5. Subscribe to the dashboard stream and disconnect.
- 6. Record responses, timings, and metric cardinality.

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

- Probe responses for each lifecycle stage.
- Health aggregation output for a failed component.
- Prometheus scrape validation and label inventory.
- Probe exemption evidence after rate-limit exhaustion.
- Dashboard event timing and disconnect behavior.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- The scrape output, naming/units report, and cardinality analysis.
- Probe latency and status under saturation.
- The metric-to-requirement and dashboard mapping.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-018](../../../torviello-enforcer/requirements/items/ENG-018.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [health-and-metrics.feature](../features/health-and-metrics.feature) |
| Rule controls | OBS-02, OPS-01, SEC-10 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
