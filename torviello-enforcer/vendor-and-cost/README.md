# vendor-and-cost domain

**Development stage:** SDD

This directory contains 5 normative control document(s) and the generated enforcement tests for the **vendor-and-cost** domain (Stack, vendor, and cost decisions). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| VEND-01 | [01-stack-selection-and-production-limits.md](rules/01-stack-selection-and-production-limits.md) | PA-001–PA-004, PA-024, RP-020–RP-024, ED-020–ED-024 | [tests/test_01_stack_selection_and_production_limits.py](tests/test_01_stack_selection_and_production_limits.py) | Stack selection and production limits |
| VEND-02 | [02-vendor-exit-and-continuity.md](rules/02-vendor-exit-and-continuity.md) | PA-001–PA-004, PA-024, RP-020–RP-024, ED-020–ED-024 | [tests/test_02_vendor_exit_and_continuity.py](tests/test_02_vendor_exit_and_continuity.py) | Vendor exit and service continuity |
| VEND-03 | [03-unit-economics-budget-and-capacity-operations.md](rules/03-unit-economics-budget-and-capacity-operations.md) | PA-001–PA-004, PA-024, RP-013, SO-032 | [tests/test_03_unit_economics_budget_and_capacity_operations.py](tests/test_03_unit_economics_budget_and_capacity_operations.py) | Unit economics, budgets, and capacity operations |
| VEND-04 | [04-provider-selection-contracts-and-risk-review.md](rules/04-provider-selection-contracts-and-risk-review.md) | PA-001–PA-004, PA-024, RP-021, SO-004, SO-012 | [tests/test_04_provider_selection_contracts_and_risk_review.py](tests/test_04_provider_selection_contracts_and_risk_review.py) | Provider selection, contracts, and risk review |
| VEND-05 | [05-exit-continuity-and-provider-failure.md](rules/05-exit-continuity-and-provider-failure.md) | PA-002–PA-004, PA-024, RP-021–RP-024, SO-030 | [tests/test_05_exit_continuity_and_provider_failure.py](tests/test_05_exit_continuity_and_provider_failure.py) | Exit, continuity, and provider failure |

## Detailed controls

### VEND-01 — Stack selection and production limits

**Objective.** These controls govern **stack selection and production limits**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** PA-001–PA-004, PA-024, RP-020–RP-024, ED-020–ED-024

**Normative requirements:**

- **VEND-01.01 — Prefer open standards, open source, and self-hostable tools when.** The project SHOULD prefer open standards, open source, and self-hostable tools when they meet support, security, privacy, reliability, and maintenance requirements.
- **VEND-01.02 — Before adopting a hosted or commercial dependency, record purpose.** Before adopting a hosted or commercial dependency, the project MUST record purpose, owner, data handled, security controls, uptime/dependency effects, current plan limits, cost, billing risk, region/account dependency, and exit path..
- **VEND-01.03 — Verify current free-tier limits and terms before relying on.** The project MUST verify current free-tier limits and terms before relying on them. A free tier is not a production capacity guarantee; document a paid, self-hosted, or migration path before usage can hit its limits.
- **VEND-01.04 — Include recurring costs such as domains, bandwidth, storage, certificates.** The project MUST include recurring costs such as domains, bandwidth, storage, certificates, CI, model hosting, monitoring retention, and support in deployment planning.
- **VEND-01.05 — Keep offline build and local operation possible without.** The project MUST keep offline build and local operation possible without a specific hosted Git, CI, registry, or telemetry provider where the selected product profile requires offline support.

**Rule document:** [rules/01-stack-selection-and-production-limits.md](rules/01-stack-selection-and-production-limits.md)

**Enforcement:** [tests/test_01_stack_selection_and_production_limits.py](tests/test_01_stack_selection_and_production_limits.py)

**Prohibited conditions:**

- The project MUST NOT promise unlimited/free capacity based on marketing pages or trial terms
- The project MUST NOT send user or model data to a third party without a documented, approved data flow
- The project MUST NOT make a single external provider a hidden dependency for local inference
### VEND-02 — Vendor exit and service continuity

**Objective.** These controls govern **vendor exit and service continuity**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** PA-001–PA-004, PA-024, RP-020–RP-024, ED-020–ED-024

**Normative requirements:**

- **VEND-02.01 — The project MUST document how to export owned data.** For each critical hosted dependency, the project MUST document how to export owned data and configuration, restore service, rotate credentials, and migrate to a replacement or self-hosted alternative.
- **VEND-02.02 — Keep source, build recipes, release metadata, and critical configuration.** The project MUST keep source, build recipes, release metadata, and critical configuration in formats that can be used without a vendor-specific control plane wherever feasible.
- **VEND-02.03 — Assign an owner to monitor service changes, outages, end-of-life.** The project MUST assign an owner to monitor service changes, outages, end-of-life notices, quota changes, and security advisories.
- **VEND-02.04 — Classify which external services are required for build, release.** The project MUST classify which external services are required for build, release, runtime, updates, model downloads, licensing, and documentation. A failure in an optional service MUST NOT break unrelated local operation.

**Rule document:** [rules/02-vendor-exit-and-continuity.md](rules/02-vendor-exit-and-continuity.md)

**Enforcement:** [tests/test_02_vendor_exit_and_continuity.py](tests/test_02_vendor_exit_and_continuity.py)

**Prohibited conditions:**

- The project MUST NOT store the only copy of critical source, registry metadata, signing recovery information, or release manifests in a single hosted account
- The project MUST NOT claim provider independence without testing export and rebuild procedures
- The project MUST NOT use disposable/free domains for stable production identity without an ownership and renewal plan
### VEND-03 — Unit economics, budgets, and capacity operations

**Objective.** This control defines the intended outcome for **unit economics, budgets, and capacity operations** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** PA-001–PA-004, PA-024, RP-013, SO-032

**Normative requirements:**

- **VEND-03.01 — Each hosted or recurring product capability MUST identify….** **Requirement:** Each hosted or recurring product capability MUST identify the unit of value and cost driver, such as inference request, model storage, active user, build minute, bandwidth, or monitoring retention.
- **VEND-03.02 — Cost estimates MUST state workload assumptions, region….** **Requirement:** Cost estimates MUST state workload assumptions, region, provider plan, volume, growth, free-tier boundaries, taxes/egress where applicable, and uncertainty range.
- **VEND-03.03 — Production spend MUST have an owner, budget/forecast….** **Requirement:** Production spend MUST have an owner, budget/forecast, anomaly threshold, and action path. Alerts MUST distinguish expected burst/scale events from waste or runaway usage.
- **VEND-03.04 — Architecture reviews MUST compare total cost of ownership across….** **Requirement:** Architecture reviews MUST compare total cost of ownership across hosted, self-hosted, and local execution where the deployment choice affects users; include staffing, upgrades, security, data transfer, storage, and failure recovery.
- **VEND-03.05 — User-facing tiers and quotas MUST map to enforced technical….** **Requirement:** User-facing tiers and quotas MUST map to enforced technical limits and clear usage semantics; avoid promises that depend on unbounded external quotas or undocumented provider behavior.
- **VEND-03.06 — Cost optimization MUST preserve security, accessibility, reliability….** **Requirement:** Cost optimization MUST preserve security, accessibility, reliability, support, and data-residency requirements; disclose the affected tradeoff and measured result.
- **VEND-03.07 — Financial records and provider usage data MUST be access-controlled….** **Requirement:** Financial records and provider usage data MUST be access-controlled and retained only as long as needed for billing, forecasting, and audit.

**Rule document:** [rules/03-unit-economics-budget-and-capacity-operations.md](rules/03-unit-economics-budget-and-capacity-operations.md)

**Enforcement:** [tests/test_03_unit_economics_budget_and_capacity_operations.py](tests/test_03_unit_economics_budget_and_capacity_operations.py)

**Prohibited conditions:**

- Do not classify a service as free-to-operate based only on a trial or current free tier.
- Do not reduce resilience or retention below approved objectives solely to meet a cost target.
### VEND-04 — Provider selection, contracts, and risk review

**Objective.** This control defines the intended outcome for **provider selection, contracts, and risk review** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** PA-001–PA-004, PA-024, RP-021, SO-004, SO-012

**Normative requirements:**

- **VEND-04.01 — Before adopting a critical provider, the project MUST….** **Requirement:** Before adopting a critical provider, the project MUST document service purpose, data classes, regions, identity/auth model, retention, subprocessors, service limits, outage history/commitments, price model, support, and termination/export terms.
- **VEND-04.02 — Provider review MUST assess security assurance, vulnerability disclosure….** **Requirement:** Provider review MUST assess security assurance, vulnerability disclosure, encryption/key control, auditability, incident notification, backup/recovery, regulatory/jurisdiction exposure, and dependency concentration.
- **VEND-04.03 — Integration contracts MUST define API versioning, timeout/retry behavior….** **Requirement:** Integration contracts MUST define API versioning, timeout/retry behavior, idempotency, quotas, error semantics, data deletion, and a tested degraded mode.
- **VEND-04.04 — Provider credentials MUST be scoped per service and environment….** **Requirement:** Provider credentials MUST be scoped per service and environment, rotated, monitored, and revocable without disabling unrelated local operation.
- **VEND-04.05 — Critical external service dependencies MUST be classified as build-time….** **Requirement:** Critical external service dependencies MUST be classified as build-time, release-time, runtime, update-time, licensing, telemetry, or documentation dependencies and listed in the deployment architecture.
- **VEND-04.06 — Provider terms, prices, compatibility, and security….** **Requirement:** Provider terms, prices, compatibility, and security posture MUST be reviewed before production reliance and whenever the provider announces a material change.
- **VEND-04.07 — An owner MUST monitor end-of-life, API changes….** **Requirement:** An owner MUST monitor end-of-life, API changes, security advisories, quota changes, billing changes, and incidents for each critical provider.

**Rule document:** [rules/04-provider-selection-contracts-and-risk-review.md](rules/04-provider-selection-contracts-and-risk-review.md)

**Enforcement:** [tests/test_04_provider_selection_contracts_and_risk_review.py](tests/test_04_provider_selection_contracts_and_risk_review.py)

**Prohibited conditions:**

- Do not send user or model data to a provider without an approved data flow and user-facing disclosure where required.
- Do not let one provider become an undocumented dependency for local inference.
### VEND-05 — Exit, continuity, and provider failure

**Objective.** This control defines the intended outcome for **exit, continuity, and provider failure** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** PA-002–PA-004, PA-024, RP-021–RP-024, SO-030

**Normative requirements:**

- **VEND-05.01 — Each critical provider MUST have an exit plan identifying….** **Requirement:** Each critical provider MUST have an exit plan identifying export format, data/configuration completeness, alternate provider or self-hosted path, credential/key transition, DNS/domain ownership, and required user communication.
- **VEND-05.02 — Export and rebuild procedures MUST be tested before….** **Requirement:** Export and rebuild procedures MUST be tested before an outage or contract termination. Record elapsed time, missing fields, manual steps, and integrity checks.
- **VEND-05.03 — Local inference MUST continue without hosted account, registry….** **Requirement:** Local inference MUST continue without hosted account, registry, telemetry, or documentation services after required artifacts have been installed, except where a separately approved entitlement policy explicitly constrains operation.
- **VEND-05.04 — Provider outage handling MUST define bounded timeouts, retry/backoff….** **Requirement:** Provider outage handling MUST define bounded timeouts, retry/backoff, circuit breaking, cached data freshness, and operator-visible degraded state.
- **VEND-05.05 — Critical source, release metadata, signing recovery procedures….** **Requirement:** Critical source, release metadata, signing recovery procedures, and required configuration MUST have protected copies outside a single provider account while preserving access control.
- **VEND-05.06 — Domain names, package namespaces, signing identities….** **Requirement:** Domain names, package namespaces, signing identities, and update endpoints MUST have renewal and recovery ownership; transfer or loss of a stable identity MUST have a migration plan.
- **VEND-05.07 — Provider termination or material security incident MUST trigger….** **Requirement:** Provider termination or material security incident MUST trigger an impact review across affected product profiles, data, users, releases, and update channels.

**Rule document:** [rules/05-exit-continuity-and-provider-failure.md](rules/05-exit-continuity-and-provider-failure.md)

**Enforcement:** [tests/test_05_exit_continuity_and_provider_failure.py](tests/test_05_exit_continuity_and_provider_failure.py)

**Prohibited conditions:**

- Do not claim provider independence until export, rebuild, and restore have been demonstrated.
- Do not store the only copy of owned operational data or recovery material in the provider whose failure it is meant to mitigate.

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/vendor-and-cost
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
