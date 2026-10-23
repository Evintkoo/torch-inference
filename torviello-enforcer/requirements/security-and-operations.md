# Security and Operations Requirements

## Identity and authorization

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [SO-001](items/SO-001.md) | MUST | Authentication requirements shall be gathered for local users, hosted accounts, service identities, and engine-to-platform communication before expanding the existing auth implementation. | A reviewed auth specification defines actors, trust boundaries, enrollment, login, recovery, sessions, token/key lifecycle, revocation, roles, audit events, and offline behavior. |
| [SO-002](items/SO-002.md) | MUST | Local engine operation shall support an explicit authentication policy appropriate to its exposure. | Loopback-only local mode can be used without a hosted account; any network-exposed mode has an explicit authentication and access-control configuration with safe defaults. |
| [SO-003](items/SO-003.md) | MUST | Authorization shall enforce least privilege for inference, model administration, account administration, and system configuration. | Route/action permissions are documented and tested for allowed and denied roles; unauthenticated access is limited to explicitly public endpoints. |
| [SO-004](items/SO-004.md) | MUST | Secrets and credentials shall be protected throughout configuration, storage, logs, and transport. | Secrets are not committed or emitted in logs; password storage uses a suitable password hash; production signing keys are generated/stored securely and validated at startup; networked deployments document TLS termination. |
| [SO-005](items/SO-005.md) | SHOULD | API keys and tokens shall support expiry, rotation, revocation, scope, and auditability. | Operators can issue and revoke credentials, see last-use metadata where appropriate, and recover from key rotation without disabling unrelated identities. |

## Application security

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [SO-010](items/SO-010.md) | MUST | The application shall use a documented threat model covering network APIs, model files, uploads, dependencies, updates, and hosted control-plane interactions. | Each release review updates threat assumptions and records mitigations or accepted risks for high-impact findings. |
| [SO-011](items/SO-011.md) | MUST | All input paths shall validate size, type, format, path, and resource limits before expensive parsing or inference. | API boundaries enforce configured limits; malformed and oversized requests return safe errors without unbounded CPU, memory, disk, or queue growth. |
| [SO-012](items/SO-012.md) | MUST | Dependency and artifact integrity shall be checked for application releases and downloaded models. | Builds scan dependencies; model downloads verify pinned checksums or signatures before activation; failed verification does not replace a known-good model. |
| [SO-013](items/SO-013.md) | MUST | Security defects shall have a documented reporting, triage, remediation, and release process. | A security policy names a private reporting channel, response expectations, severity process, and supported-version patch policy. |
| [SO-014](items/SO-014.md) | SHOULD | Security controls shall be evaluated against relevant OWASP guidance for APIs, authentication, logging, and deployment. | A recurring review records the guidance version, scope, findings, owners, and resolved or accepted items. |

## Logging and observability

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [SO-020](items/SO-020.md) | MUST | Runtime services shall emit structured, configurable logs through the shared logging system. | Production request and service paths use structured logging with severity, timestamp, service, and correlation context; direct print calls do not carry runtime diagnostics. |
| [SO-021](items/SO-021.md) | MUST | Logs shall avoid secrets and unnecessary personal or request content. | Redaction rules cover credentials, tokens, sensitive headers, and configurable payload fields; tests verify representative redaction behavior. |
| [SO-022](items/SO-022.md) | MUST | The service shall expose operational health and metrics for readiness, failures, latency, throughput, saturation, model state, and resource use. | Operators can distinguish process liveness from ability to serve configured models; metrics have documented names, labels, and cardinality limits. |
| [SO-023](items/SO-023.md) | SHOULD | Monitoring guidance shall define production scrape security, retention, alerting, and dashboard expectations. | An operator can install the documented monitoring profile, restrict metrics access, configure service-level alerts, and verify a sample alert path. |
| [SO-024](items/SO-024.md) | SHOULD | Telemetry export shall be optional and configurable for offline or privacy-sensitive installations. | The default local profile makes no external telemetry connection; enabling export requires explicit endpoint and data configuration. |

## Operational resilience

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [SO-030](items/SO-030.md) | MUST | The service shall recover from expected process restarts and transient upstream/model failures without manual repair. | Restart and dependency failure scenarios are documented and exercised; readiness reflects recovery, and repeated failures are bounded with useful diagnostics. |
| [SO-031](items/SO-031.md) | MUST | Updates and configuration changes shall be validated before replacing active state and have a documented rollback path. | Failed updates preserve the previous working binary/configuration/model; rollback steps are tested on a representative deployment. |
| [SO-032](items/SO-032.md) | SHOULD | Resource limits and overload behavior shall be configurable and observable. | Operators can bound concurrent requests, queues, memory, model downloads, and request sizes; overload produces a documented status and metric. |
| [SO-033](items/SO-033.md) | SHOULD | Persistent service data shall be backed up and restorable according to defined recovery objectives. | Backup scope, frequency, retention, encryption, and restore time are documented and periodically verified. |
