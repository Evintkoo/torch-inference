# AC-ENG-04 — Startup and health checks succeed with outbound network disabled.

**Check ID:** AC-ENG-04  
**Requirement:** PA-002  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Startup and health checks succeed with outbound network disabled. AC-ENG-04 verifies PA-002 and fails when the threshold below is not met.
- **Measurable:** 100% of local capabilities pass with egress blocked; zero external connections, DNS lookups, account checks, or control-plane calls; startup and health succeed in 100% of offline runs.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** PA-002; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### PA-002 — The system shall support standalone local inference without requiring a Torviello hosted account or remote control plane

**Priority:** MUST  
**Requirement document:** [PA-002](../../../torviello-enforcer/requirements/items/PA-002.md)

The system shall support standalone local inference without requiring a Torviello hosted account or remote control plane.

**Acceptance:** A documented local deployment can start, load a local model, and serve inference with outbound network access disabled after required artifacts are present.


## 2. Observable check

Startup and health checks succeed with outbound network disabled.

The check is satisfied only when the result is produced by the shipping configuration and is reproducible from the recorded procedure. A debug-only path, a unit-test double, or a documentation statement does not satisfy it.

## 3. Feature scenarios

Background shared by the scenarios:

```gherkin
Given a local TOML configuration for profile "local"
```

#### Report configured capabilities

```gherkin
Given the configuration declares model "tiny" with backend "cpu"
    When the engine starts successfully
    Then health reports status "ok" and the engine version
    And the model catalog lists model "tiny" with backend "cpu"
```

#### Reject unknown configuration keys

```gherkin
Given the configuration contains an unknown key "accelerator"
    When the engine starts
    Then startup fails with error code "config.unknown_key"
    And no server accepts requests
```

#### Empty model catalog is valid

```gherkin
Given the configuration declares no models
    When the engine starts successfully
    Then health reports status "ok"
    And the model catalog is empty
```

#### Local mode requires no network

```gherkin
Given all required model assets are present
    When the engine starts with outbound network access disabled
    Then health reports status "ok"
    And no account or control-plane call is attempted
```


## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| MON-01 | Product area ownership | [01-product-area-ownership.md](../../../torviello-enforcer/monorepo/rules/01-product-area-ownership.md) |
| MON-02 | Independent products and releases | [02-independent-products-and-releases.md](../../../torviello-enforcer/monorepo/rules/02-independent-products-and-releases.md) |
| ORG-04 | Spending Procurement and Organizational Commitments | [04-spending-procurement-and-organizational-commitments.md](../../../torviello-enforcer/organization/rules/04-spending-procurement-and-organizational-commitments.md) |
| EXT-01 | Customer User and Community Support Operations | [01-customer-user-and-community-support-operations.md](../../../torviello-enforcer/stakeholder-relations/rules/01-customer-user-and-community-support-operations.md) |
| VEND-01 | Stack selection and production limits | [01-stack-selection-and-production-limits.md](../../../torviello-enforcer/vendor-and-cost/rules/01-stack-selection-and-production-limits.md) |
| VEND-02 | Vendor exit and service continuity | [02-vendor-exit-and-continuity.md](../../../torviello-enforcer/vendor-and-cost/rules/02-vendor-exit-and-continuity.md) |
| VEND-03 | Unit economics, budgets, and capacity operations | [03-unit-economics-budget-and-capacity-operations.md](../../../torviello-enforcer/vendor-and-cost/rules/03-unit-economics-budget-and-capacity-operations.md) |
| VEND-04 | Provider selection, contracts, and risk review | [04-provider-selection-contracts-and-risk-review.md](../../../torviello-enforcer/vendor-and-cost/rules/04-provider-selection-contracts-and-risk-review.md) |
| VEND-05 | Exit, continuity, and provider failure | [05-exit-continuity-and-provider-failure.md](../../../torviello-enforcer/vendor-and-cost/rules/05-exit-continuity-and-provider-failure.md) |

#### MON-01.01 — Keep the inference engine/application, hosted platform, landing page, docs

The project MUST keep the inference engine/application, hosted platform, landing page, docs site, demos, and marketing media workflows as named product areas with clear owners and lifecycle.

#### MON-01.02 — Each product area MUST document its purpose, toolchain, dependencies

Each product area MUST document its purpose, toolchain, dependencies, build/test entry points, deployment target, and release cadence in its own directory documentation.

#### MON-01.03 — Shared contracts such as API schemas, model metadata, design

Shared contracts such as API schemas, model metadata, design tokens, and version policy MUST have one source of truth and a named owner.

#### MON-01.04 — Require an owner and a defined user or operational

The project MUST require an owner and a defined user or operational outcome before adding a new product area.

#### MON-02.01 — Define engine-only and full-package distributions by an explicit feature

The project MUST define engine-only and full-package distributions by an explicit feature and service matrix. The engine package contains only backend inference capabilities and dependencies needed for that profile; full package composition is listed separately.

#### MON-02.02 — Build and release each distribution independently, even when versions

The project MUST build and release each distribution independently, even when versions are coordinated. State version compatibility, model assets, service dependencies, upgrade path, and operating requirements.

#### MON-02.03 — Keep containers under /containers, packaging workflows under /packaging, performance

The project MUST keep containers under /containers, packaging workflows under /packaging, performance work under /benchmarks, documentation source under the docs area, and design assets under the design area.

#### MON-02.04 — Coordinate cross-area changes through versioned contracts, migration steps

The project MUST coordinate cross-area changes through versioned contracts, migration steps, and a rollout plan.

#### MON-02.05 — Keep local inference functional when hosted services, landing pages

The project MUST keep local inference functional when hosted services, landing pages, or remote telemetry are unavailable.

#### ORG-04.01 — The accountable business owner MUST define spending and commitment…

**Requirement:** The accountable business owner MUST define spending and commitment classes, approval limits, budget authority, required finance/legal/security/privacy/procurement review, evidence, and renewal authority. Thresholds MUST consider total lifecycle cost, data access, lock-in, user impact, and exit cost rather than initial price alone.

#### ORG-04.02 — Before a material purchase or external commitment…

**Requirement:** Before a material purchase or external commitment, the sponsor MUST state the business/user need, expected outcome, constraints, alternatives including no purchase, evaluation criteria, full cost, risks, and measurable acceptance conditions. Selection rationale MUST be retained.

#### ORG-04.03 — Before granting a supplier or contractor sensitive information…

**Requirement:** Before granting a supplier or contractor sensitive information, production access, code contribution, model/data access, or operational responsibility, review capability, security/privacy controls, licensing, subcontractors, continuity, incident duties, data return/deletion, and termination rights as applicable.

#### ORG-04.04 — Only designated roles MAY sign agreements, accept terms…

**Requirement:** Only designated roles MAY sign agreements, accept terms, quote prices, promise features or service levels, or represent a roadmap as committed. Review obligations, implied warranties, data rights, support burden, accessibility, export/retention, indemnity, renewal, and termination before acceptance.

#### ORG-04.05 — A service or commitment owner MUST track usage…

**Requirement:** A service or commitment owner MUST track usage, total spend, renewals, budget thresholds, owner, business value, and cost anomalies. Unused or over-provisioned resources MUST be removed or justified; cost-saving actions MUST be checked for security, reliability, and user impact.

#### ORG-04.06 — Material scope, price, data, access…

**Requirement:** Material scope, price, data, access, subprocessor, support, jurisdiction, or contract changes MUST trigger reassessment and approval before taking effect. Renewal decisions MUST compare current value and alternatives and include a tested exit or export path when lock-in risk is material.

#### ORG-04.07 — At contract or project end, revoke access…

**Requirement:** At contract or project end, revoke access, return or delete information, recover assets, stop recurring charges, retain required records, transfer ownership, and verify closure. Record any retained data or continuing duty and its owner.

#### EXT-01.01 — For each supported product profile, state supported audiences…

**Requirement:** For each supported product profile, state supported audiences, support channel, hours/response expectations, languages/accessibility options as applicable, supported versions, escalation boundaries, and what the channel cannot provide. Do not imply 24/7 or guaranteed response absent an approved staffed commitment.

#### EXT-01.02 — A support owner MUST capture a case identifier…

**Requirement:** A support owner MUST capture a case identifier, minimal contact/context, product/version/profile, impact, urgency, category, consent/data handling where relevant, owner, status, and next update. Classify security, privacy, safety, accessibility, billing, data-loss, outage, and ordinary usage cases distinctly.

#### EXT-01.03 — The responder MUST confirm receipt, explain next steps…

**Requirement:** The responder MUST confirm receipt, explain next steps and realistic response timing, and avoid promises beyond authority. If the issue is urgent or outside support competence, route it to the designated incident, privacy, security, legal, or product owner.

#### EXT-01.04 — Request only the diagnostic information needed; prefer synthetic…

**Requirement:** Request only the diagnostic information needed; prefer synthetic or redacted data. Provide a secure transfer path for necessary sensitive files, restrict case access, set retention, and never ask users to send passwords, private keys, or unnecessary inference content.

#### EXT-01.05 — Support responses MUST distinguish verified facts, hypotheses…

**Requirement:** Support responses MUST distinguish verified facts, hypotheses, workarounds, and commitments; explain limitations plainly; preserve user dignity; and provide accessible alternatives where a product barrier blocks use.

#### EXT-01.06 — The case owner MUST record diagnosis, workaround/fix…

**Requirement:** The case owner MUST record diagnosis, workaround/fix, affected versions, user communication, residual risk, escalation, and closure. For unresolved issues, state owner, next update, and safe workaround; closure MUST NOT mean merely that a ticket was transferred.

#### EXT-01.07 — Repeated complaints, confusing behavior, support workarounds…

**Requirement:** Repeated complaints, confusing behavior, support workarounds, accessibility barriers, unsafe use, and common failures MUST be summarized for accountable product and engineering owners. Convert recurring risks into requirements, defects, documentation, controls, or product decisions with traceable follow-up.

#### EXT-01.08 — Support measures MAY include response and resolution times…

**Requirement:** Support measures MAY include response and resolution times, backlog age, reopen rate, user impact, and satisfaction, but MUST be interpreted with case complexity, safety, fairness, and quality. Do not reward fast closure at the expense of accurate diagnosis or user outcome.

#### VEND-01.01 — Prefer open standards, open source, and self-hostable tools when

The project SHOULD prefer open standards, open source, and self-hostable tools when they meet support, security, privacy, reliability, and maintenance requirements.

#### VEND-01.02 — Before adopting a hosted or commercial dependency, record purpose

Before adopting a hosted or commercial dependency, the project MUST record purpose, owner, data handled, security controls, uptime/dependency effects, current plan limits, cost, billing risk, region/account dependency, and exit path..

#### VEND-01.03 — Verify current free-tier limits and terms before relying on

The project MUST verify current free-tier limits and terms before relying on them. A free tier is not a production capacity guarantee; document a paid, self-hosted, or migration path before usage can hit its limits.

#### VEND-01.04 — Include recurring costs such as domains, bandwidth, storage, certificates

The project MUST include recurring costs such as domains, bandwidth, storage, certificates, CI, model hosting, monitoring retention, and support in deployment planning.

#### VEND-01.05 — Keep offline build and local operation possible without

The project MUST keep offline build and local operation possible without a specific hosted Git, CI, registry, or telemetry provider where the selected product profile requires offline support.

#### VEND-02.01 — The project MUST document how to export owned data

For each critical hosted dependency, the project MUST document how to export owned data and configuration, restore service, rotate credentials, and migrate to a replacement or self-hosted alternative.

#### VEND-02.02 — Keep source, build recipes, release metadata, and critical configuration

The project MUST keep source, build recipes, release metadata, and critical configuration in formats that can be used without a vendor-specific control plane wherever feasible.

#### VEND-02.03 — Assign an owner to monitor service changes, outages, end-of-life

The project MUST assign an owner to monitor service changes, outages, end-of-life notices, quota changes, and security advisories.

#### VEND-02.04 — Classify which external services are required for build, release

The project MUST classify which external services are required for build, release, runtime, updates, model downloads, licensing, and documentation. A failure in an optional service MUST NOT break unrelated local operation.

#### VEND-03.01 — Each hosted or recurring product capability MUST identify…

**Requirement:** Each hosted or recurring product capability MUST identify the unit of value and cost driver, such as inference request, model storage, active user, build minute, bandwidth, or monitoring retention.

#### VEND-03.02 — Cost estimates MUST state workload assumptions, region…

**Requirement:** Cost estimates MUST state workload assumptions, region, provider plan, volume, growth, free-tier boundaries, taxes/egress where applicable, and uncertainty range.

#### VEND-03.03 — Production spend MUST have an owner, budget/forecast…

**Requirement:** Production spend MUST have an owner, budget/forecast, anomaly threshold, and action path. Alerts MUST distinguish expected burst/scale events from waste or runaway usage.

#### VEND-03.04 — Architecture reviews MUST compare total cost of ownership across…

**Requirement:** Architecture reviews MUST compare total cost of ownership across hosted, self-hosted, and local execution where the deployment choice affects users; include staffing, upgrades, security, data transfer, storage, and failure recovery.

#### VEND-03.05 — User-facing tiers and quotas MUST map to enforced technical…

**Requirement:** User-facing tiers and quotas MUST map to enforced technical limits and clear usage semantics; avoid promises that depend on unbounded external quotas or undocumented provider behavior.

#### VEND-03.06 — Cost optimization MUST preserve security, accessibility, reliability…

**Requirement:** Cost optimization MUST preserve security, accessibility, reliability, support, and data-residency requirements; disclose the affected tradeoff and measured result.

#### VEND-03.07 — Financial records and provider usage data MUST be access-controlled…

**Requirement:** Financial records and provider usage data MUST be access-controlled and retained only as long as needed for billing, forecasting, and audit.

#### VEND-04.01 — Before adopting a critical provider, the project MUST…

**Requirement:** Before adopting a critical provider, the project MUST document service purpose, data classes, regions, identity/auth model, retention, subprocessors, service limits, outage history/commitments, price model, support, and termination/export terms.

#### VEND-04.02 — Provider review MUST assess security assurance, vulnerability disclosure…

**Requirement:** Provider review MUST assess security assurance, vulnerability disclosure, encryption/key control, auditability, incident notification, backup/recovery, regulatory/jurisdiction exposure, and dependency concentration.

#### VEND-04.03 — Integration contracts MUST define API versioning, timeout/retry behavior…

**Requirement:** Integration contracts MUST define API versioning, timeout/retry behavior, idempotency, quotas, error semantics, data deletion, and a tested degraded mode.

#### VEND-04.04 — Provider credentials MUST be scoped per service and environment…

**Requirement:** Provider credentials MUST be scoped per service and environment, rotated, monitored, and revocable without disabling unrelated local operation.

#### VEND-04.05 — Critical external service dependencies MUST be classified as build-time…

**Requirement:** Critical external service dependencies MUST be classified as build-time, release-time, runtime, update-time, licensing, telemetry, or documentation dependencies and listed in the deployment architecture.

#### VEND-04.06 — Provider terms, prices, compatibility, and security…

**Requirement:** Provider terms, prices, compatibility, and security posture MUST be reviewed before production reliance and whenever the provider announces a material change.

#### VEND-04.07 — An owner MUST monitor end-of-life, API changes…

**Requirement:** An owner MUST monitor end-of-life, API changes, security advisories, quota changes, billing changes, and incidents for each critical provider.

#### VEND-05.01 — Each critical provider MUST have an exit plan identifying…

**Requirement:** Each critical provider MUST have an exit plan identifying export format, data/configuration completeness, alternate provider or self-hosted path, credential/key transition, DNS/domain ownership, and required user communication.

#### VEND-05.02 — Export and rebuild procedures MUST be tested before…

**Requirement:** Export and rebuild procedures MUST be tested before an outage or contract termination. Record elapsed time, missing fields, manual steps, and integrity checks.

#### VEND-05.03 — Local inference MUST continue without hosted account, registry…

**Requirement:** Local inference MUST continue without hosted account, registry, telemetry, or documentation services after required artifacts have been installed, except where a separately approved entitlement policy explicitly constrains operation.

#### VEND-05.04 — Provider outage handling MUST define bounded timeouts, retry/backoff…

**Requirement:** Provider outage handling MUST define bounded timeouts, retry/backoff, circuit breaking, cached data freshness, and operator-visible degraded state.

#### VEND-05.05 — Critical source, release metadata, signing recovery procedures…

**Requirement:** Critical source, release metadata, signing recovery procedures, and required configuration MUST have protected copies outside a single provider account while preserving access control.

#### VEND-05.06 — Domain names, package namespaces, signing identities…

**Requirement:** Domain names, package namespaces, signing identities, and update endpoints MUST have renewal and recovery ownership; transfer or loss of a stable identity MUST have a migration plan.

#### VEND-05.07 — Provider termination or material security incident MUST trigger…

**Requirement:** Provider termination or material security incident MUST trigger an impact review across affected product profiles, data, users, releases, and update channels.

## 5. Prohibited conditions

- [MON-01] The project MUST NOT let the frontend, marketing, or hosted control-plane toolchain become a dependency of the standalone inference engine
- [MON-01] The project MUST NOT copy shared contracts into separate projects and allow them to drift
- [MON-01] The project MUST NOT add a directory that has no owner, lifecycle, or build/test path
- [MON-02] The project MUST NOT force all users to install the full monorepo stack for standalone inference
- [MON-02] The project MUST NOT release a product artifact without identifying included components and support boundaries
- [MON-02] The project MUST NOT share mutable build outputs between incompatible products or targets
- [ORG-04] Do not use a personal account, card, or unapproved free tier to bypass procurement, security, licensing, or data review.
- [ORG-04] Do not permit the same person to create and approve a material purchase without a documented compensating review.
- [ORG-04] Do not make a public or customer commitment based only on an internal proposal or prototype.
- [EXT-01] Do not close a case solely because ownership was transferred.
- [EXT-01] Do not request secrets, unrestricted production access, or real user data when safer diagnostic evidence is sufficient.
- [EXT-01] Do not make a support promise or product roadmap commitment without the authorized owner.
- [VEND-01] The project MUST NOT promise unlimited/free capacity based on marketing pages or trial terms
- [VEND-01] The project MUST NOT send user or model data to a third party without a documented, approved data flow
- [VEND-01] The project MUST NOT make a single external provider a hidden dependency for local inference
- [VEND-02] The project MUST NOT store the only copy of critical source, registry metadata, signing recovery information, or release manifests in a single hosted account
- [VEND-02] The project MUST NOT claim provider independence without testing export and rebuild procedures
- [VEND-02] The project MUST NOT use disposable/free domains for stable production identity without an ownership and renewal plan
- [VEND-03] Do not classify a service as free-to-operate based only on a trial or current free tier.
- [VEND-03] Do not reduce resilience or retention below approved objectives solely to meet a cost target.
- [VEND-04] Do not send user or model data to a provider without an approved data flow and user-facing disclosure where required.
- [VEND-04] Do not let one provider become an undocumented dependency for local inference.
- [VEND-05] Do not claim provider independence until export, rebuild, and restore have been demonstrated.
- [VEND-05] Do not store the only copy of owned operational data or recovery material in the provider whose failure it is meant to mitigate.

## 6. Procedure

1. Prepare the configuration, fixture, model, environment, or operating condition required by the scenarios and the observable check.
2. Execute the check through the shipping path, using the exact command or procedure that will be recorded as evidence.
3. Observe the result required by section 2, including the applicable negative, boundary, or failure case from the scenarios.
4. Confirm that no prohibited condition from section 5 occurs.
5. Record the revision, environment, result, limitations, and any skipped step.

## 7. Pass criteria

- The observable check in section 2 is satisfied.
- Every applicable requirement in section 1 is met through the mapped rule obligations.
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
- A required negative or boundary case is untested, skipped, or bypassed.
- A prohibited condition occurs.
- Evidence is stale or the implementation changed without re-running the check.
- An exception is unapproved, expired, or missing compensating measures.

- Highest-standard assurance evidence is missing, stale, or below the recorded threshold.

## 9. Required evidence

- The command, procedure, or inspection that exercises the check, including its environment and revision.
- The observed result required by section 2.
- The result of each applicable negative or boundary case.
- A link from the change, evaluation, or assurance record to that evidence.
- For an unmet check: an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

- [MON-01] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [MON-01] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [MON-01] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [MON-02] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [MON-02] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [MON-02] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [ORG-04] Workflow record identifying applicable ORG-04 controls, functional owners, approvals, affected requirements, and outcome.
- [ORG-04] Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- [ORG-04] Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.
- [EXT-01] Workflow record identifying applicable EXT-01 controls, functional owners, approvals, affected requirements, and outcome.
- [EXT-01] Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- [EXT-01] Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.
- [VEND-01] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [VEND-01] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [VEND-01] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [VEND-02] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [VEND-02] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [VEND-02] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [VEND-03] Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- [VEND-03] Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- [VEND-03] Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.
- [VEND-04] Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- [VEND-04] Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- [VEND-04] Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.
- [VEND-05] Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- [VEND-05] Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- [VEND-05] Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this first-slice check additionally requires a reproducible run against the shipping artifact, schema validation where a contract is involved, and a retained report naming the revision, configuration, command, observed result, and limitation. Security-relevant cases MUST be assessed against OWASP ASVS 5.0.0 Level 3. A happy-path-only result or a summary without retained measurements fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [PA-002](../../../torviello-enforcer/requirements/items/PA-002.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Rule controls | MON-01, MON-02, ORG-04, EXT-01, VEND-01, VEND-02, VEND-03, VEND-04, VEND-05 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule control, or acceptance criteria. Do not weaken the observable result, a scenario, or an evidence requirement to make an implementation pass.
