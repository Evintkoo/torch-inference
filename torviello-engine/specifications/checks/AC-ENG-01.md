# AC-ENG-01 — The loader accepts only TOML configuration and reports the format in use.

**Check ID:** AC-ENG-01  
**Requirement:** RP-001  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** The loader accepts only TOML configuration and reports the format in use. AC-ENG-01 verifies RP-001 and fails when the threshold below is not met.
- **Measurable:** 100% of accepted configurations are TOML; 100% of non-TOML inputs are rejected with a stable code; the active format is reported; zero files are written on validation failure.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** RP-001; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### RP-001 — TOML shall be the one canonical human-edited application configuration format, consistent with the current Rust stack and existing `config.toml`

**Priority:** MUST  
**Requirement document:** [RP-001](../../../torviello-enforcer/requirements/items/RP-001.md)

TOML shall be the one canonical human-edited application configuration format, consistent with the current Rust stack and existing `config.toml`.

**Acceptance:** Documentation, examples, packaged defaults, and runtime parsing agree on TOML. If migration is needed, legacy input has a documented deprecation path and clear errors.


## 2. Observable check

The loader accepts only TOML configuration and reports the format in use.

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
| CFG-01 | Canonical format, schema, and precedence | [01-canonical-format-schema-and-precedence.md](../../../torviello-enforcer/configuration/rules/01-canonical-format-schema-and-precedence.md) |
| CFG-02 | Secrets and runtime changes | [02-secrets-and-runtime-configuration.md](../../../torviello-enforcer/configuration/rules/02-secrets-and-runtime-configuration.md) |
| CFG-03 | Configuration lifecycle and safe reload | [03-configuration-lifecycle-and-safe-reload.md](../../../torviello-enforcer/configuration/rules/03-configuration-lifecycle-and-safe-reload.md) |
| CFG-04 | Setting sources, precedence, and environment | [04-setting-sources-precedence-and-environment.md](../../../torviello-enforcer/configuration/rules/04-setting-sources-precedence-and-environment.md) |

#### CFG-01.01 — TOML MUST be the single canonical human-edited application configuration

TOML MUST be the single canonical human-edited application configuration format. JSON MAY be used for wire protocols and generated machine data, but MUST NOT be a second user configuration format.

#### CFG-01.02 — Keep one typed configuration schema with documented defaults, valid

The project MUST keep one typed configuration schema with documented defaults, valid ranges, units, examples, and compatibility rules. Configuration docs and packaged examples MUST be generated from or checked against the same schema.

#### CFG-01.03 — Define precedence in one order and apply it consistently

The project MUST define precedence in one order and apply it consistently: built-in defaults, selected configuration file, environment overrides, then command-line overrides. The project MUST also document any intentional exception.

#### CFG-01.04 — Parse and validate the complete candidate configuration before binding

The project MUST parse and validate the complete candidate configuration before binding network ports, loading models, or replacing active state. Unknown keys, invalid enum values, unsupported paths, and contradictory settings fail with a setting-specific message.

#### CFG-01.05 — Include an explicit schema version or a compatibility mechanism

The project MUST include an explicit schema version or a compatibility mechanism. The project MUST provide a migration/deprecation path for changed fields and reject unsupported versions clearly.

#### CFG-02.01 — Keep secret values out of checked-in files, sample configuration

The project MUST keep secret values out of checked-in files, sample configuration, screenshots, logs, diagnostics, and support bundles. Examples use obviously invalid placeholders.

#### CFG-02.02 — Load secrets from an OS credential store, orchestrator secret

The project MUST load secrets from an OS credential store, orchestrator secret, protected file, or environment mechanism appropriate to the deployment. The project MUST also document precedence and file permissions.

#### CFG-02.03 — Redact secret-bearing fields from debug output and configuration inspection

The project MUST redact secret-bearing fields from debug output and configuration inspection. The project MUST NOT serialize a fully resolved configuration if it contains credentials.

#### CFG-02.04 — Configuration that requires restart MUST say so

Configuration that requires restart MUST say so. Hot reload MUST be permitted only when a complete candidate can be validated and atomically activated; on failure, the system MUST retain the last known-good configuration.

#### CFG-02.05 — Separate user-editable settings from generated runtime state and default

The project MUST separate user-editable settings from generated runtime state and default templates. The project MUST NOT overwrite user state during package upgrade without explicit migration behavior.

#### CFG-03.01 — Configuration MUST be parsed into one typed candidate…

**Requirement:** Configuration MUST be parsed into one typed candidate and validated completely before the application binds public listeners, activates models, or mutates persistent state.

#### CFG-03.02 — Validation MUST report the setting name and a safe…

**Requirement:** Validation MUST report the setting name and a safe corrective action without echoing secret values or exposing internal paths. Multiple errors SHOULD be reported together when doing so does not expose sensitive material.

#### CFG-03.03 — Configuration reload MUST be atomic: build and validate…

**Requirement:** Configuration reload MUST be atomic: build and validate a complete candidate, verify its dependencies, then switch active state at a defined boundary. If any step fails, the running system MUST retain the last known-good configuration and report the reload failure.

#### CFG-03.04 — Each setting MUST declare whether it is startup-only…

**Requirement:** Each setting MUST declare whether it is startup-only, reloadable, or dynamically sampled. A reload MUST NOT leave components using incompatible snapshots unless the consistency model is explicitly designed and tested.

#### CFG-03.05 — Configuration watchers MUST debounce partial file writes, handle…

**Requirement:** Configuration watchers MUST debounce partial file writes, handle rename-based replacement, permission changes, deletion, and invalid intermediate files, and MUST avoid unbounded reload loops.

#### CFG-03.06 — Configuration schema evolution MUST define defaulting, deprecation…

**Requirement:** Configuration schema evolution MUST define defaulting, deprecation, migration, unknown-field, and downgrade behavior. A newer binary MUST NOT silently rewrite a file such that the prior supported version cannot start unless that migration is explicit and backed up.

#### CFG-03.07 — Operator-facing effective-configuration output MUST redact credentials, identify source…

**Requirement:** Operator-facing effective-configuration output MUST redact credentials, identify source and precedence for each value, and distinguish explicit values from defaults without exposing secret contents.

#### CFG-04.01 — The documented precedence MUST be deterministic across every executable…

**Requirement:** The documented precedence MUST be deterministic across every executable and deployment profile. The current product requirement is built-in defaults, TOML file, environment overrides, then command-line overrides; any change MUST be approved and reflected in examples and tests.

#### CFG-04.02 — Environment variable names MUST be namespaced, documented…

**Requirement:** Environment variable names MUST be namespaced, documented, and parsed by the same typed validation rules as file values. Ambiguous aliases, silent coercion, and undocumented environment discovery MUST be rejected.

#### CFG-04.03 — Command-line overrides MUST be visible in help output…

**Requirement:** Command-line overrides MUST be visible in help output, validated identically to file settings, and excluded from process listings or logs when values are sensitive.

#### CFG-04.04 — Path-valued settings MUST define resolution base, canonicalization…

**Requirement:** Path-valued settings MUST define resolution base, canonicalization, symlink behavior, permissions, and behavior when parent directories do not exist. User-supplied output paths MUST NOT escape an explicitly confined workspace when confinement is required.

#### CFG-04.05 — Default configuration MUST be safe for local use…

**Requirement:** Default configuration MUST be safe for local use and MUST NOT expose network listeners, enable telemetry, grant administrative access, or select a non-local provider without explicit operator action.

#### CFG-04.06 — Configuration examples MUST be syntactically valid TOML, use…

**Requirement:** Configuration examples MUST be syntactically valid TOML, use non-secret placeholders, and remain checked against the schema and shipped defaults.

#### CFG-04.07 — Deployment-specific configuration MUST separate product policy from secrets…

**Requirement:** Deployment-specific configuration MUST separate product policy from secrets and generated state; package upgrades MUST preserve operator-owned settings unless a versioned migration explicitly changes them.

## 5. Prohibited conditions

- [CFG-01] The project MUST NOT maintain YAML and TOML versions of the same application settings
- [CFG-01] The project MUST NOT rely on implicit coercion, silent fallback, or environment variable guesses
- [CFG-01] The project MUST NOT echo secret values in validation errors or configuration dumps
- [CFG-02] The project MUST NOT set production signing keys, database passwords, API tokens, or cloud credentials to built-in defaults
- [CFG-02] The project MUST NOT update only part of active configuration and leave the process in a mixed state
- [CFG-02] The project MUST NOT treat a secrets manager as a substitute for access control and rotation
- [CFG-03] Do not apply a partially valid configuration.
- [CFG-03] Do not restart or replace the service silently when a reload can be rejected safely.
- [CFG-04] Do not allow environment variables to silently override values without a discoverable name and precedence rule.
- [CFG-04] Do not put secret defaults in sample TOML or install images.

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

- [CFG-01] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [CFG-01] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [CFG-01] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [CFG-02] A reviewable change or design artifact identifying the applicable control IDs and requirement IDs.
- [CFG-02] Automated test, CI result, or documented manual assessment showing the expected behavior, including relevant negative cases.
- [CFG-02] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a control cannot be met.
- [CFG-03] Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- [CFG-03] Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- [CFG-03] Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.
- [CFG-04] Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- [CFG-04] Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- [CFG-04] Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this first-slice check additionally requires a reproducible run against the shipping artifact, schema validation where a contract is involved, and a retained report naming the revision, configuration, command, observed result, and limitation. Security-relevant cases MUST be assessed against OWASP ASVS 5.0.0 Level 3. A happy-path-only result or a summary without retained measurements fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [RP-001](../../../torviello-enforcer/requirements/items/RP-001.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Rule controls | CFG-01, CFG-02, CFG-03, CFG-04 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule control, or acceptance criteria. Do not weaken the observable result, a scenario, or an evidence requirement to make an implementation pass.
