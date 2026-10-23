# AC-ENG-07 — Resolve, validate, and report one effective configuration

**Check ID:** AC-ENG-07  
**Requirement:** ENG-001  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** A single typed TOML candidate is validated before binding, precedence is deterministic across defaults, file, environment, and command line, and effective output reports sources with secrets redacted. AC-ENG-07 verifies ENG-001 and fails when the threshold below is not met.
- **Measurable:** 100% of precedence truth-table cases pass; property testing over randomized source combinations is 100%; 24 CPU-hours of parser fuzzing produce zero crash, hang, or unbounded allocation; mutation score ≥90% for precedence/validation/redaction; zero secret findings.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-001; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-001 — Resolve, validate, and report one effective configuration

**Priority:** MUST  
**Requirement document:** [ENG-001](../../../torviello-enforcer/requirements/items/ENG-001.md)

The engine MUST load one typed TOML configuration, apply the documented precedence of built-in defaults, file values, environment overrides, and command-line overrides, validate the complete candidate before binding a listener, and report the effective values with their sources while redacting secrets.

**Acceptance summary:** Starting with no file yields documented defaults and does not create or rewrite a file.

## 2. Observable check

A single typed TOML candidate is validated before binding, precedence is deterministic across defaults, file, environment, and command line, and effective output reports sources with secrets redacted.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `configuration.feature`

#### Built-in defaults apply when no file exists

```gherkin
Scenario: Built-in defaults apply when no file exists
    Given the operator starts the engine without a configuration file
    When startup validation completes
    Then the effective configuration reports every default value and its source as "default"
    And no configuration file is created or rewritten
```

#### File values override defaults deterministically

```gherkin
Scenario: File values override defaults deterministically
    Given a TOML file sets server.port to 9100 and auth.enabled to false
    When the engine loads the configuration
    Then the effective server.port is 9100 and its source is "file"
    And every unset key retains its documented default
```

#### Unknown keys and invalid ranges fail before binding

```gherkin
Scenario: Unknown keys and invalid ranges fail before binding
    Given a TOML file contains an unknown key performance.turbo and server.port 0
    When the engine loads the configuration
    Then startup fails with setting-specific errors for both keys
    And no listener accepts requests
```

#### Environment overrides are namespaced and validated

```gherkin
Scenario: Environment overrides are namespaced and validated
    Given the environment sets TORVIELLO_SERVER__PORT to "not-a-number"
    When the engine loads the configuration
    Then startup fails naming TORVIELLO_SERVER__PORT and the expected type
    And the failure does not echo unrelated environment values
```

#### Invalid authentication configuration is rejected

```gherkin
Scenario: Invalid authentication configuration is rejected
    Given auth.enabled is true and jwt_secret is a checked-in placeholder
    When the engine loads the configuration
    Then startup fails with an actionable secret error
    And the secret value does not appear in the error text or logs
```

#### Effective configuration output is redacted

```gherkin
Scenario: Effective configuration output is redacted
    Given a valid TOML file contains an authentication secret
    When an operator reads the effective configuration endpoint
    Then secret-bearing fields are reported as redacted
    And non-secret values retain their resolved values and sources
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| CFG-01 | Canonical format, schema, and precedence | [01-canonical-format-schema-and-precedence.md](../../../torviello-enforcer/configuration/rules/01-canonical-format-schema-and-precedence.md) |
| CFG-03 | Configuration lifecycle and safe reload | [03-configuration-lifecycle-and-safe-reload.md](../../../torviello-enforcer/configuration/rules/03-configuration-lifecycle-and-safe-reload.md) |
| CFG-04 | Setting sources, precedence, and environment | [04-setting-sources-precedence-and-environment.md](../../../torviello-enforcer/configuration/rules/04-setting-sources-precedence-and-environment.md) |
| SEC-05 | Secrets, cryptography, and sensitive data | [05-secrets-cryptography-and-sensitive-data.md](../../../torviello-enforcer/security/rules/05-secrets-cryptography-and-sensitive-data.md) |

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

- Do not maintain YAML and TOML descriptions of the same application settings.
- Do not accept unknown keys or silently coerce invalid values.
- Do not echo a secret, token, or credential in a validation error or configuration dump.
- Do not bind a public interface with authentication disabled by default.
- Do not apply a partially validated candidate or leave components on incompatible snapshots.

## 6. Procedure

- 1. Prepare fixtures for defaults-only, valid file, unknown key, invalid range, malformed environment override, and invalid authentication secret.
- 2. Run the shipping binary with each fixture and capture the exit status, stderr, and whether a listener was created.
- 3. Read the effective-configuration endpoint or the documented startup report and compare each value with the expected source and resolved value.
- 4. Attempt to read a known secret through the effective-configuration endpoint and through logs.
- 5. Repeat with an environment override to confirm precedence and validation parity with file values.
- 6. Record the revision, fixture, command, observed status, and any setting that could not be exercised.

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

- The configuration fixtures and the exact startup commands.
- Exit status and setting-specific diagnostics for each invalid case.
- Effective-configuration output showing values and sources with secrets redacted.
- A listener check proving invalid configuration never bound a port.
- The redaction inspection result for logs and error bodies.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- A precedence truth table and the reference-model property report.
- The fuzz corpus, 24-hour run log, and the redaction report with zero findings.
- The rejected-configuration matrix showing setting IDs and exit status.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- AC-ENG-01 — see [AC-ENG-01](AC-ENG-01.md)
- AC-ENG-02 — see [AC-ENG-02](AC-ENG-02.md)

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-001](../../../torviello-enforcer/requirements/items/ENG-001.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [configuration.feature](../features/configuration.feature) |
| Rule controls | CFG-01, CFG-03, CFG-04, SEC-05 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
