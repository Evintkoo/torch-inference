# operations domain

**Development stage:** EDD

This directory contains 6 normative control document(s) and the generated enforcement tests for the **operations** domain (Deployment and operations). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| OPS-01 | [01-service-lifecycle-and-readiness.md](rules/01-service-lifecycle-and-readiness.md) | RP-030–RP-031, RP-034, SO-022–SO-024, SO-030–SO-033 | [tests/test_01_service_lifecycle_and_readiness.py](tests/test_01_service_lifecycle_and_readiness.py) | Service lifecycle and readiness |
| OPS-02 | [02-reliability-slos-and-recovery.md](rules/02-reliability-slos-and-recovery.md) | RP-030–RP-031, RP-034, SO-022–SO-024, SO-030–SO-033 | [tests/test_02_reliability_slos_and_recovery.py](tests/test_02_reliability_slos_and_recovery.py) | Reliability objectives and recovery |
| OPS-03 | [03-installation-service-managers-and-deployment-profiles.md](rules/03-installation-service-managers-and-deployment-profiles.md) | RP-020–RP-024, RP-030 | [tests/test_03_installation_service_managers_and_deployment_profiles.py](tests/test_03_installation_service_managers_and_deployment_profiles.py) | Installation, service managers, and deployment profiles |
| OPS-04 | [04-incident-response-and-operational-recovery.md](rules/04-incident-response-and-operational-recovery.md) | SO-013, SO-030–SO-033, RP-030–RP-034 | [tests/test_04_incident_response_and_operational_recovery.py](tests/test_04_incident_response_and_operational_recovery.py) | Incident response and operational recovery |
| OPS-05 | [05-capacity-readiness-and-operator-change-management.md](rules/05-capacity-readiness-and-operator-change-management.md) | RP-030–RP-034, SO-022, SO-030–SO-032 | [tests/test_05_capacity_readiness_and_operator_change_management.py](tests/test_05_capacity_readiness_and_operator_change_management.py) | Capacity, readiness, and operator change management |
| OPS-06 | [06-operational-roles-coverage-handover-and-human-continuity.md](rules/06-operational-roles-coverage-handover-and-human-continuity.md) | ORG-001, ORG-011, ORG-022–ORG-023, ORG-042, RP-030–RP-034, SO-030–SO-033 | [tests/test_06_operational_roles_coverage_handover_and_human_continuity.py](tests/test_06_operational_roles_coverage_handover_and_human_continuity.py) | Operational Roles Coverage Handover and Human Continuity |

## Detailed controls

### OPS-01 — Service lifecycle and readiness

**Objective.** These controls govern **service lifecycle and readiness**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** RP-030–RP-031, RP-034, SO-022–SO-024, SO-030–SO-033

**Normative requirements:**

- **OPS-01.01 — Document and support installation, start, stop, restart, readiness, liveness.** The project MUST document and support installation, start, stop, restart, readiness, liveness, logs, configuration, upgrade, rollback, and uninstall for each declared deployment profile.
- **OPS-01.02 — Startup MUST validate configuration and required runtime prerequisites before.** Startup MUST validate configuration and required runtime prerequisites before readiness becomes true. Readiness MUST reflect whether configured capabilities can serve; liveness MUST reflect whether the process can continue operating.
- **OPS-01.03 — Shutdown MUST stop accepting work, drain or cancel requests.** Shutdown MUST stop accepting work, drain or cancel requests within a defined deadline, flush required state, and release model/runtime resources. Repeated signals and abrupt termination MUST have bounded behavior.
- **OPS-01.04 — Configure process supervision or container restart behavior with bounded.** The project MUST configure process supervision or container restart behavior with bounded retry/backoff and visible failure state. Endless restart loops MUST NOT hide invalid configuration or unavailable required models.
- **OPS-01.05 — Keep the local engine usable without a hosted account.** The project MUST keep the local engine usable without a hosted account, hosted registry, or telemetry endpoint unless the selected profile explicitly requires that service.

**Rule document:** [rules/01-service-lifecycle-and-readiness.md](rules/01-service-lifecycle-and-readiness.md)

**Enforcement:** [tests/test_01_service_lifecycle_and_readiness.py](tests/test_01_service_lifecycle_and_readiness.py)

**Prohibited conditions:**

- The project MUST NOT report ready before required models and listeners are usable
- The project MUST NOT require an operator to manually repair transient failures that the service can recover from safely
- The project MUST NOT make a hosted control plane a hidden startup dependency for local inference
### OPS-02 — Reliability objectives and recovery

**Objective.** These controls govern **reliability objectives and recovery**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** RP-030–RP-031, RP-034, SO-022–SO-024, SO-030–SO-033

**Normative requirements:**

- **OPS-02.01 — Define service-level objectives for availability, latency, and error rate.** The project MUST define service-level objectives for availability, latency, and error rate for each production deployment profile. State measurement windows, exclusions, and alert thresholds.
- **OPS-02.02 — Bound request concurrency, queues, model downloads, memory, disk.** The project MUST bound request concurrency, queues, model downloads, memory, disk, and timeouts. The project MUST also define backpressure and overload responses before exposure to production traffic.
- **OPS-02.03 — Changes to configuration, models, and registry state MUST validate.** Changes to configuration, models, and registry state MUST validate a candidate before activation and retain a known-good rollback point.
- **OPS-02.04 — The project MUST define backup scope, frequency, retention, encryption.** For persistent deployments, the project MUST define backup scope, frequency, retention, encryption, access, recovery point objective, and recovery time objective.
- **OPS-02.05 — Provide runbooks for the highest-impact failure modes, including model.** The project MUST provide runbooks for the highest-impact failure modes, including model unavailable/corrupt, disk full, GPU lost, database unavailable, credentials expired, and upstream outage.
- **OPS-02.06 — Verify backup restore and release rollback periodically.** The project MUST verify backup restore and release rollback periodically; a backup that has never been restored is unverified.

**Rule document:** [rules/02-reliability-slos-and-recovery.md](rules/02-reliability-slos-and-recovery.md)

**Enforcement:** [tests/test_02_reliability_slos_and_recovery.py](tests/test_02_reliability_slos_and_recovery.py)

**Prohibited conditions:**

- The project MUST NOT define success only as process uptime while users cannot complete inference
- The project MUST NOT retry non-idempotent operations indefinitely
- The project MUST NOT claim self-maintaining service behavior without recovery evidence and alerting for unrecoverable failures
### OPS-03 — Installation, service managers, and deployment profiles

**Objective.** This control defines the intended outcome for **installation, service managers, and deployment profiles** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-020–RP-024, RP-030

**Normative requirements:**

- **OPS-03.01 — Every supported deployment profile MUST state target OS/architecture….** **Requirement:** Every supported deployment profile MUST state target OS/architecture, prerequisites, filesystem paths, service identity, required ports, data directories, model storage, configuration source, and network dependencies.
- **OPS-03.02 — Install and upgrade procedures MUST be repeatable from….** **Requirement:** Install and upgrade procedures MUST be repeatable from a clean machine and MUST distinguish administrator actions from service-user actions. The service MUST run with least privilege and writable paths limited to documented state/cache locations.
- **OPS-03.03 — Service definitions MUST set restart policy, startup ordering….** **Requirement:** Service definitions MUST set restart policy, startup ordering, graceful stop timeout, environment/config source, resource limits, and log routing appropriate to the target service manager.
- **OPS-03.04 — Container images MUST pin base image identity, use….** **Requirement:** Container images MUST pin base image identity, use non-root execution where feasible, include only runtime artifacts, define health checks, and avoid embedding secrets or mutable model downloads in image layers.
- **OPS-03.05 — Network listeners MUST bind to the intended interface by….** **Requirement:** Network listeners MUST bind to the intended interface by default. Remote exposure MUST require an explicit deployment choice and documented authentication, TLS termination, firewall, and proxy trust policy.
- **OPS-03.06 — First startup MUST distinguish missing prerequisites from corrupt state….** **Requirement:** First startup MUST distinguish missing prerequisites from corrupt state and transient dependency failures; automated restart MUST use backoff and MUST not create a restart loop that hides permanent configuration errors.
- **OPS-03.07 — Installation MUST preserve user data and configuration on upgrade….** **Requirement:** Installation MUST preserve user data and configuration on upgrade; uninstall MUST explain which state is retained or removed and require explicit confirmation before destructive deletion.

**Rule document:** [rules/03-installation-service-managers-and-deployment-profiles.md](rules/03-installation-service-managers-and-deployment-profiles.md)

**Enforcement:** [tests/test_03_installation_service_managers_and_deployment_profiles.py](tests/test_03_installation_service_managers_and_deployment_profiles.py)

**Prohibited conditions:**

- Do not run production services as root/administrator without a documented platform requirement and compensating controls.
- Do not expose a development server or unauthenticated admin endpoint through a production profile.
### OPS-04 — Incident response and operational recovery

**Objective.** This control defines the intended outcome for **incident response and operational recovery** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** SO-013, SO-030–SO-033, RP-030–RP-034

**Normative requirements:**

- **OPS-04.01 — Operational incidents MUST have severity levels based on user….** **Requirement:** Operational incidents MUST have severity levels based on user impact, data/security impact, service degradation, and recovery urgency, with an incident lead and escalation path.
- **OPS-04.02 — Runbooks MUST cover model corruption/unavailability, accelerator loss….** **Requirement:** Runbooks MUST cover model corruption/unavailability, accelerator loss, resource exhaustion, disk full, persistence failure, credential/key expiry, unsafe update, telemetry outage, and upstream outage for profiles where each dependency exists.
- **OPS-04.03 — Incident procedures MUST preserve evidence, protect user data….** **Requirement:** Incident procedures MUST preserve evidence, protect user data, bound destructive remediation, and distinguish containment from full recovery. Security incidents MUST follow private evidence handling and coordinated disclosure policy.
- **OPS-04.04 — Recovery procedures MUST state safe ordering for service….** **Requirement:** Recovery procedures MUST state safe ordering for service, database, registry, model artifacts, credentials, and dependent services; include integrity checks before restoring traffic.
- **OPS-04.05 — Backups and rollback artifacts MUST be isolated from….** **Requirement:** Backups and rollback artifacts MUST be isolated from the failure mode they mitigate, access-controlled, integrity-checked, and available for the required recovery objective.
- **OPS-04.06 — Each production release MUST provide a tested rollback path….** **Requirement:** Each production release MUST provide a tested rollback path for binaries, configuration/schema, model registry, and compatible model assets, or document why rollback is unsafe and define forward recovery.
- **OPS-04.07 — After a material incident, the owner MUST record….** **Requirement:** After a material incident, the owner MUST record timeline, impact, detection, contributing conditions, recovery actions, and corrective items without blame; corrective actions MUST have owners and verification.

**Rule document:** [rules/04-incident-response-and-operational-recovery.md](rules/04-incident-response-and-operational-recovery.md)

**Enforcement:** [tests/test_04_incident_response_and_operational_recovery.py](tests/test_04_incident_response_and_operational_recovery.py)

**Prohibited conditions:**

- Do not declare recovery complete until readiness and representative user transactions have been verified.
- Do not restore untrusted backups or model artifacts without integrity and version checks.
### OPS-05 — Capacity, readiness, and operator change management

**Objective.** This control defines the intended outcome for **capacity, readiness, and operator change management** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-030–RP-034, SO-022, SO-030–SO-032

**Normative requirements:**

- **OPS-05.01 — Each production profile MUST state capacity assumptions for concurrent….** **Requirement:** Each production profile MUST state capacity assumptions for concurrent requests, model count, model sizes, queue depth, memory, CPU, accelerator memory, disk, network, and startup time.
- **OPS-05.02 — Admission control MUST reject or defer work before resource….** **Requirement:** Admission control MUST reject or defer work before resource exhaustion. Queue capacity, fairness, request deadline, cancellation, overload response, and recovery behavior MUST be explicit and observable.
- **OPS-05.03 — Readiness MUST reflect ability to serve the configured profile….** **Requirement:** Readiness MUST reflect ability to serve the configured profile, including required models and data stores. Liveness MUST remain independent from optional providers so transient optional failure does not trigger restart storms.
- **OPS-05.04 — Operator changes to configuration, models, registry….** **Requirement:** Operator changes to configuration, models, registry, credentials, or deployment topology MUST be attributable, validated before activation, auditable, and reversible where possible.
- **OPS-05.05 — Capacity alerts MUST warn before service objectives are breached….** **Requirement:** Capacity alerts MUST warn before service objectives are breached and identify the constrained resource and safe mitigation; capacity plans MUST consider burst load, cold starts, fragmentation, and model replacement overlap.
- **OPS-05.06 — Operational toil MUST be measured where repeated manual repair….** **Requirement:** Operational toil MUST be measured where repeated manual repair occurs; recurring recovery actions SHOULD be automated only after failure modes and guardrails are understood.
- **OPS-05.07 — Profile changes that alter network exposure, persistence….** **Requirement:** Profile changes that alter network exposure, persistence, auth, telemetry, or resource ceilings MUST undergo a risk review and restart/reload qualification.

**Rule document:** [rules/05-capacity-readiness-and-operator-change-management.md](rules/05-capacity-readiness-and-operator-change-management.md)

**Enforcement:** [tests/test_05_capacity_readiness_and_operator_change_management.py](tests/test_05_capacity_readiness_and_operator_change_management.py)

**Prohibited conditions:**

- Do not report readiness solely because the process is alive.
- Do not automatically retry unbounded queued work after overload recovery.
### OPS-06 — Operational Roles Coverage Handover and Human Continuity

**Objective.** Operational resilience depends on people knowing who is on duty, what they may do, how to hand work over, and how the service remains safe when a key person or supplier is unavailable. Coverage must match the service commitment without inventing unsupported staffing promises.

**Requirements traced:** ORG-001, ORG-011, ORG-022–ORG-023, ORG-042, RP-030–RP-034, SO-030–SO-033

**Normative requirements:**

- **OPS-06.01 — Each production profile MUST identify service owner, incident….** **Requirement:** Each production profile MUST identify service owner, incident lead, deploy/release authority, security escalation, data/persistence owner, customer communication owner, and backup/delegate as applicable. State whether each function is staffed continuously, during defined hours, or on best-effort basis.
- **OPS-06.02 — For supported operational channels, state hours, severity….** **Requirement:** For supported operational channels, state hours, severity classes, response targets, escalation contacts, and fallback when the primary owner is unreachable. Public service promises MUST match actual staffing, monitoring, and recovery capability.
- **OPS-06.03 — An operational handover MUST include current service health….** **Requirement:** An operational handover MUST include current service health, open incidents/changes, customer impact, risks, pending actions, access used, deadlines, and next decision. The receiving owner MUST acknowledge material risk and understand their authority.
- **OPS-06.04 — Coverage MUST use named identities and pre-authorized delegates….** **Requirement:** Coverage MUST use named identities and pre-authorized delegates with time-bounded access. Never share accounts or keys to cover an absent operator; emergency access uses the security break-glass process and post-use review.
- **OPS-06.05 — For critical operations, identify single-person and supplier dependencies….** **Requirement:** For critical operations, identify single-person and supplier dependencies, recovery documentation, alternate contacts, and minimum competent coverage. Exercise absence, simultaneous incident, and unavailability of a key vendor at a frequency proportional to impact.
- **OPS-06.06 — Operational processes MUST allow responders to escalate unsafe workload….** **Requirement:** Operational processes MUST allow responders to escalate unsafe workload, conflicting incident tasks, or insufficient authority. Rotate or hand off duties as needed under approved work policies; do not use undocumented availability expectations as a service guarantee.
- **OPS-06.07 — Changes to service hours, product scope, team….** **Requirement:** Changes to service hours, product scope, team structure, vendor, incident severity, or recovery process MUST trigger review of roles, contacts, runbooks, training, and support commitments.

**Rule document:** [rules/06-operational-roles-coverage-handover-and-human-continuity.md](rules/06-operational-roles-coverage-handover-and-human-continuity.md)

**Enforcement:** [tests/test_06_operational_roles_coverage_handover_and_human_continuity.py](tests/test_06_operational_roles_coverage_handover_and_human_continuity.py)

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/operations
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
