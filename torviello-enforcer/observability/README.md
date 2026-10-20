# observability domain

**Development stage:** EDD

This directory contains 5 normative control document(s) and the generated enforcement tests for the **observability** domain (Logging, metrics, traces, and health). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| OBS-01 | [01-secure-structured-logging-and-traces.md](rules/01-secure-structured-logging-and-traces.md) | SO-020–SO-024, SO-030–SO-032 | [tests/test_01_secure_structured_logging_and_traces.py](tests/test_01_secure_structured_logging_and_traces.py) | Secure structured logging and traces |
| OBS-02 | [02-metrics-health-and-prometheus-operations.md](rules/02-metrics-health-and-prometheus-operations.md) | SO-020–SO-024, SO-030–SO-032 | [tests/test_02_metrics_health_and_prometheus_operations.py](tests/test_02_metrics_health_and_prometheus_operations.py) | Metrics, health, and Prometheus operations |
| OBS-03 | [03-traces-context-propagation-and-telemetry-cost.md](rules/03-traces-context-propagation-and-telemetry-cost.md) | SO-020–SO-024 | [tests/test_03_traces_context_propagation_and_telemetry_cost.py](tests/test_03_traces_context_propagation_and_telemetry_cost.py) | Traces, context propagation, and telemetry cost |
| OBS-04 | [04-alerts-slos-dashboards-and-operator-actions.md](rules/04-alerts-slos-dashboards-and-operator-actions.md) | SO-022–SO-024, RP-030–RP-034 | [tests/test_04_alerts_slos_dashboards_and_operator_actions.py](tests/test_04_alerts_slos_dashboards_and_operator_actions.py) | Alerts, SLOs, dashboards, and operator actions |
| OBS-05 | [05-retention-privacy-and-diagnostic-access.md](rules/05-retention-privacy-and-diagnostic-access.md) | SO-020–SO-024, SO-004 | [tests/test_05_retention_privacy_and_diagnostic_access.py](tests/test_05_retention_privacy_and_diagnostic_access.py) | Retention, privacy, and diagnostic access |

## Detailed controls

### OBS-01 — Secure structured logging and traces

**Objective.** These controls govern **secure structured logging and traces**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** SO-020–SO-024, SO-030–SO-032

**Normative requirements:**

- **OBS-01.01 — Emit structured runtime logs through the shared logging system.** The project MUST emit structured runtime logs through the shared logging system. The project MUST also include timestamp, severity, service identity, event name, and correlation/trace context where available.
- **OBS-01.02 — Record operational and security events consistently: startup/shutdown, authentication.** The project MUST record operational and security events consistently: startup/shutdown, authentication and authorization outcomes, configuration changes, model installation/promotion, dependency failures, and request outcomes.
- **OBS-01.03 — Log passwords, tokens, API keys, private keys, database credentials.** The project MUST NOT log passwords, tokens, API keys, private keys, database credentials, full prompts, raw uploads, or unnecessary personal data. It MUST redact secrets at boundaries and sanitize untrusted values against log injection.
- **OBS-01.04 — Bound log volume and retention.** The project MUST bound log volume and retention. The project MUST also use rotation or external collection without allowing disk exhaustion to interfere with application state.
- **OBS-01.05 — Use OpenTelemetry semantic conventions for HTTP, service identity, exceptions.** The project MUST use OpenTelemetry semantic conventions for HTTP, service identity, exceptions, and resources. Propagate trace context across trusted service boundaries; never treat correlation identifiers as identity or authorization.
- **OBS-01.06 — Make telemetry export explicitly configurable and off by default.** The project SHOULD make telemetry export explicitly configurable and off by default in local/offline profiles. The project MUST also document all exported fields and endpoints.

**Rule document:** [rules/01-secure-structured-logging-and-traces.md](rules/01-secure-structured-logging-and-traces.md)

**Enforcement:** [tests/test_01_secure_structured_logging_and_traces.py](tests/test_01_secure_structured_logging_and_traces.py)

**Prohibited conditions:**

- The project MUST NOT use direct print calls for runtime service diagnostics
- The project MUST NOT attach prompts, model inputs, user IDs, email addresses, credentials, or request IDs as metric labels
- The project MUST NOT assume logs are harmless just because they are local files
### OBS-02 — Metrics, health, and Prometheus operations

**Objective.** These controls govern **metrics, health, and prometheus operations**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** SO-020–SO-024, SO-030–SO-032

**Normative requirements:**

- **OBS-02.01 — Expose bounded metrics for request volume, failures, latency distributions.** The project MUST expose bounded metrics for request volume, failures, latency distributions, saturation, active work, queue depth, model load/readiness, resource use, and upstream failures.
- **OBS-02.02 — Give each metric one meaning and unit.** The project MUST give each metric one meaning and unit. The project MUST also use standard base units and type suffixes where appropriate. The project MUST also use labels for bounded dimensions only; review multiplicative cardinality before adding labels.
- **OBS-02.03 — Distinguish process liveness from readiness to serve the selected.** The project MUST distinguish process liveness from readiness to serve the selected product profile. A live process with required models unavailable is not ready.
- **OBS-02.04 — Restrict metrics endpoints to trusted monitoring networks or protect.** The project MUST restrict metrics endpoints to trusted monitoring networks or protect them using deployment-supported authentication and TLS. The project MUST NOT expose Prometheus admin/lifecycle endpoints publicly.
- **OBS-02.05 — Monitoring profiles MUST document scrape intervals/timeouts, target discovery, authentication/TLS.** Monitoring profiles MUST document scrape intervals/timeouts, target discovery, authentication/TLS, storage retention, dashboards, alert thresholds, ownership, and runbooks. Scrape timeout MUST NOT exceed scrape interval.
- **OBS-02.06 — Validate Prometheus configuration and alert/recording rules with official tooling.** The project MUST validate Prometheus configuration and alert/recording rules with official tooling before deployment. Configuration changes are reviewed and rolled back on failed validation.
- **OBS-02.07 — Alerts MUST focus on user-visible symptoms, saturation, and recovery.** Alerts MUST focus on user-visible symptoms, saturation, and recovery failure. Each production alert MUST have severity, owner, action, and a test path.

**Rule document:** [rules/02-metrics-health-and-prometheus-operations.md](rules/02-metrics-health-and-prometheus-operations.md)

**Enforcement:** [tests/test_02_metrics_health_and_prometheus_operations.py](tests/test_02_metrics_health_and_prometheus_operations.py)

**Prohibited conditions:**

- The project MUST NOT generate metric names procedurally
- The project MUST NOT use unbounded labels or high-cardinality per-user/per-request dimensions
- The project MUST NOT expose host details, model paths, secrets, or sensitive configuration in health responses
### OBS-03 — Traces, context propagation, and telemetry cost

**Objective.** This control defines the intended outcome for **traces, context propagation, and telemetry cost** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** SO-020–SO-024

**Normative requirements:**

- **OBS-03.01 — Trace context MUST propagate across API handling, queues….** **Requirement:** Trace context MUST propagate across API handling, queues, model loading, inference, persistence, and external calls where causal relationships exist, using supported W3C trace context or an explicitly documented equivalent.
- **OBS-03.02 — Incoming trace context MUST be validated and treated as….** **Requirement:** Incoming trace context MUST be validated and treated as untrusted. It MUST NOT authorize access, select an arbitrary exporter, or cause unbounded trace state or baggage growth.
- **OBS-03.03 — Spans MUST represent operations with meaningful duration or cross-boundary….** **Requirement:** Spans MUST represent operations with meaningful duration or cross-boundary causality. Attributes MUST use stable semantic names, bounded values, documented units, and approved redaction rules.
- **OBS-03.04 — Telemetry sampling MUST define head/tail behavior, error….** **Requirement:** Telemetry sampling MUST define head/tail behavior, error and latency retention, per-profile defaults, and operator controls. Sampling MUST NOT create an unbounded memory buffer or delay request completion.
- **OBS-03.05 — Export MUST be optional for local/offline deployments. Exporter….** **Requirement:** Export MUST be optional for local/offline deployments. Exporter destination, TLS/authentication, data categories, sampling, retry buffer, and shutdown flush timeout MUST be configurable.
- **OBS-03.06 — Telemetry failures MUST not fail inference or block readiness….** **Requirement:** Telemetry failures MUST not fail inference or block readiness unless telemetry is explicitly a required product dependency. Export queues MUST have bounded size and drop behavior with a metric.
- **OBS-03.07 — Changes to semantic conventions MUST document migration and compatibility….** **Requirement:** Changes to semantic conventions MUST document migration and compatibility because dashboards and alert rules can consume the emitted names.

**Rule document:** [rules/03-traces-context-propagation-and-telemetry-cost.md](rules/03-traces-context-propagation-and-telemetry-cost.md)

**Enforcement:** [tests/test_03_traces_context_propagation_and_telemetry_cost.py](tests/test_03_traces_context_propagation_and_telemetry_cost.py)

**Prohibited conditions:**

- Do not place prompts, uploads, credentials, raw model output, or high-cardinality identifiers in trace attributes by default.
- Do not let an exporter retry queue grow without a hard bound.
### OBS-04 — Alerts, SLOs, dashboards, and operator actions

**Objective.** This control defines the intended outcome for **alerts, slos, dashboards, and operator actions** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** SO-022–SO-024, RP-030–RP-034

**Normative requirements:**

- **OBS-04.01 — Each production service profile MUST define service indicators….** **Requirement:** Each production service profile MUST define service indicators and objectives for user-visible availability, latency, and correctness or error rate where measurable; state measurement population, window, exclusions, and objective owner.
- **OBS-04.02 — Alert thresholds MUST be derived from user impact….** **Requirement:** Alert thresholds MUST be derived from user impact, saturation, error-budget consumption, or recovery failure. Each actionable alert MUST include severity, owner, runbook, expected response, and a test or simulation path.
- **OBS-04.03 — Alerts MUST distinguish symptoms requiring immediate intervention from diagnostic….** **Requirement:** Alerts MUST distinguish symptoms requiring immediate intervention from diagnostic conditions suitable for dashboards or tickets. Avoid paging on a single noisy host or raw dependency metric when service behavior remains healthy.
- **OBS-04.04 — Dashboards MUST show request traffic, successful and failed….** **Requirement:** Dashboards MUST show request traffic, successful and failed latency distributions, error rate, saturation, queueing, model/backend state, resource utilization, and dependency health for the selected service profile.
- **OBS-04.05 — Alert and dashboard queries MUST use bounded labels….** **Requirement:** Alert and dashboard queries MUST use bounded labels and preserve distinctions between failed and successful request latency. Missing telemetry MUST be visible rather than rendered as healthy zero.
- **OBS-04.06 — Prometheus scrape and alert configuration MUST be syntax-validated….** **Requirement:** Prometheus scrape and alert configuration MUST be syntax-validated and rule-tested before deployment; scrape timeout MUST not exceed interval and scrape/authentication settings MUST match the exposed target.
- **OBS-04.07 — Runbooks MUST explain detection, impact, first safe….** **Requirement:** Runbooks MUST explain detection, impact, first safe action, escalation, rollback/recovery, verification of recovery, and evidence to retain.

**Rule document:** [rules/04-alerts-slos-dashboards-and-operator-actions.md](rules/04-alerts-slos-dashboards-and-operator-actions.md)

**Enforcement:** [tests/test_04_alerts_slos_dashboards_and_operator_actions.py](tests/test_04_alerts_slos_dashboards_and_operator_actions.py)

**Prohibited conditions:**

- Do not page on a condition with no owner or safe next action.
- Do not interpret absence of samples as zero errors or full availability.
### OBS-05 — Retention, privacy, and diagnostic access

**Objective.** This control defines the intended outcome for **retention, privacy, and diagnostic access** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** SO-020–SO-024, SO-004

**Normative requirements:**

- **OBS-05.01 — Logs, traces, metrics, crash reports….** **Requirement:** Logs, traces, metrics, crash reports, and support bundles MUST each have a stated purpose, data classification, retention period, storage location, access policy, and deletion mechanism.
- **OBS-05.02 — Inference prompts, completions, uploaded files, model….** **Requirement:** Inference prompts, completions, uploaded files, model outputs, credentials, and direct identifiers MUST not be collected by default for diagnostics. Any opt-in collection MUST disclose fields, purpose, destination, retention, and how to disable/delete it.
- **OBS-05.03 — Structured fields MUST use an allowlist or explicit classification….** **Requirement:** Structured fields MUST use an allowlist or explicit classification policy. Redaction MUST occur before persistence or export, and tests MUST cover nested fields, exception strings, URLs, query parameters, and malformed input.
- **OBS-05.04 — Diagnostic access MUST be least-privilege and audited when it….** **Requirement:** Diagnostic access MUST be least-privilege and audited when it permits viewing security events, user identifiers, or sensitive inference content.
- **OBS-05.05 — Log rotation and storage limits MUST prevent disk exhaustion….** **Requirement:** Log rotation and storage limits MUST prevent disk exhaustion; behavior when storage is full MUST preserve service safety and surface a bounded alert.
- **OBS-05.06 — Telemetry pseudonyms and correlation identifiers MUST have bounded lifetime….** **Requirement:** Telemetry pseudonyms and correlation identifiers MUST have bounded lifetime and MUST NOT be reused as authentication credentials or stable cross-service user profiles.
- **OBS-05.07 — Support bundles MUST be previewable or field-selectable before export….** **Requirement:** Support bundles MUST be previewable or field-selectable before export and MUST exclude secrets and user payloads unless explicitly selected under an approved support workflow.

**Rule document:** [rules/05-retention-privacy-and-diagnostic-access.md](rules/05-retention-privacy-and-diagnostic-access.md)

**Enforcement:** [tests/test_05_retention_privacy_and_diagnostic_access.py](tests/test_05_retention_privacy_and_diagnostic_access.py)

**Prohibited conditions:**

- Do not treat local log files as inherently private or safe.
- Do not retain sensitive telemetry indefinitely because storage is inexpensive.

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/observability
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
