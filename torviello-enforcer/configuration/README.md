# configuration domain

**Development stage:** CDD

This directory contains 5 normative control document(s) and the generated enforcement tests for the **configuration** domain (Configuration). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| CFG-01 | [01-canonical-format-schema-and-precedence.md](rules/01-canonical-format-schema-and-precedence.md) | RP-001–RP-003, SO-004 | [tests/test_01_canonical_format_schema_and_precedence.py](tests/test_01_canonical_format_schema_and_precedence.py) | Canonical format, schema, and precedence |
| CFG-02 | [02-secrets-and-runtime-configuration.md](rules/02-secrets-and-runtime-configuration.md) | RP-001–RP-003, SO-004 | [tests/test_02_secrets_and_runtime_configuration.py](tests/test_02_secrets_and_runtime_configuration.py) | Secrets and runtime changes |
| CFG-03 | [03-configuration-lifecycle-and-safe-reload.md](rules/03-configuration-lifecycle-and-safe-reload.md) | RP-001–RP-003, RP-030–RP-031 | [tests/test_03_configuration_lifecycle_and_safe_reload.py](tests/test_03_configuration_lifecycle_and_safe_reload.py) | Configuration lifecycle and safe reload |
| CFG-04 | [04-setting-sources-precedence-and-environment.md](rules/04-setting-sources-precedence-and-environment.md) | RP-001–RP-003, SO-004 | [tests/test_04_setting_sources_precedence_and_environment.py](tests/test_04_setting_sources_precedence_and_environment.py) | Setting sources, precedence, and environment |
| CFG-05 | [05-secret-configuration-and-operator-controls.md](rules/05-secret-configuration-and-operator-controls.md) | SO-004–SO-005, RP-002, RP-030 | [tests/test_05_secret_configuration_and_operator_controls.py](tests/test_05_secret_configuration_and_operator_controls.py) | Secret configuration and operator controls |

## Detailed controls

### CFG-01 — Canonical format, schema, and precedence

**Objective.** These controls govern **canonical format, schema, and precedence**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** RP-001–RP-003, SO-004

**Normative requirements:**

- **CFG-01.01 — TOML MUST be the single canonical human-edited application configuration.** TOML MUST be the single canonical human-edited application configuration format. JSON MAY be used for wire protocols and generated machine data, but MUST NOT be a second user configuration format.
- **CFG-01.02 — Keep one typed configuration schema with documented defaults, valid.** The project MUST keep one typed configuration schema with documented defaults, valid ranges, units, examples, and compatibility rules. Configuration docs and packaged examples MUST be generated from or checked against the same schema.
- **CFG-01.03 — Define precedence in one order and apply it consistently.** The project MUST define precedence in one order and apply it consistently: built-in defaults, selected configuration file, environment overrides, then command-line overrides. The project MUST also document any intentional exception.
- **CFG-01.04 — Parse and validate the complete candidate configuration before binding.** The project MUST parse and validate the complete candidate configuration before binding network ports, loading models, or replacing active state. Unknown keys, invalid enum values, unsupported paths, and contradictory settings fail with a setting-specific message.
- **CFG-01.05 — Include an explicit schema version or a compatibility mechanism.** The project MUST include an explicit schema version or a compatibility mechanism. The project MUST provide a migration/deprecation path for changed fields and reject unsupported versions clearly.

**Rule document:** [rules/01-canonical-format-schema-and-precedence.md](rules/01-canonical-format-schema-and-precedence.md)

**Enforcement:** [tests/test_01_canonical_format_schema_and_precedence.py](tests/test_01_canonical_format_schema_and_precedence.py)

**Prohibited conditions:**

- The project MUST NOT maintain YAML and TOML versions of the same application settings
- The project MUST NOT rely on implicit coercion, silent fallback, or environment variable guesses
- The project MUST NOT echo secret values in validation errors or configuration dumps
### CFG-02 — Secrets and runtime changes

**Objective.** These controls govern **secrets and runtime changes**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** RP-001–RP-003, SO-004

**Normative requirements:**

- **CFG-02.01 — Keep secret values out of checked-in files, sample configuration.** The project MUST keep secret values out of checked-in files, sample configuration, screenshots, logs, diagnostics, and support bundles. Examples use obviously invalid placeholders.
- **CFG-02.02 — Load secrets from an OS credential store, orchestrator secret.** The project MUST load secrets from an OS credential store, orchestrator secret, protected file, or environment mechanism appropriate to the deployment. The project MUST also document precedence and file permissions.
- **CFG-02.03 — Redact secret-bearing fields from debug output and configuration inspection.** The project MUST redact secret-bearing fields from debug output and configuration inspection. The project MUST NOT serialize a fully resolved configuration if it contains credentials.
- **CFG-02.04 — Configuration that requires restart MUST say so.** Configuration that requires restart MUST say so. Hot reload MUST be permitted only when a complete candidate can be validated and atomically activated; on failure, the system MUST retain the last known-good configuration.
- **CFG-02.05 — Separate user-editable settings from generated runtime state and default.** The project MUST separate user-editable settings from generated runtime state and default templates. The project MUST NOT overwrite user state during package upgrade without explicit migration behavior.

**Rule document:** [rules/02-secrets-and-runtime-configuration.md](rules/02-secrets-and-runtime-configuration.md)

**Enforcement:** [tests/test_02_secrets_and_runtime_configuration.py](tests/test_02_secrets_and_runtime_configuration.py)

**Prohibited conditions:**

- The project MUST NOT set production signing keys, database passwords, API tokens, or cloud credentials to built-in defaults
- The project MUST NOT update only part of active configuration and leave the process in a mixed state
- The project MUST NOT treat a secrets manager as a substitute for access control and rotation
### CFG-03 — Configuration lifecycle and safe reload

**Objective.** This control defines the intended outcome for **configuration lifecycle and safe reload** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-001–RP-003, RP-030–RP-031

**Normative requirements:**

- **CFG-03.01 — Configuration MUST be parsed into one typed candidate….** **Requirement:** Configuration MUST be parsed into one typed candidate and validated completely before the application binds public listeners, activates models, or mutates persistent state.
- **CFG-03.02 — Validation MUST report the setting name and a safe….** **Requirement:** Validation MUST report the setting name and a safe corrective action without echoing secret values or exposing internal paths. Multiple errors SHOULD be reported together when doing so does not expose sensitive material.
- **CFG-03.03 — Configuration reload MUST be atomic: build and validate….** **Requirement:** Configuration reload MUST be atomic: build and validate a complete candidate, verify its dependencies, then switch active state at a defined boundary. If any step fails, the running system MUST retain the last known-good configuration and report the reload failure.
- **CFG-03.04 — Each setting MUST declare whether it is startup-only….** **Requirement:** Each setting MUST declare whether it is startup-only, reloadable, or dynamically sampled. A reload MUST NOT leave components using incompatible snapshots unless the consistency model is explicitly designed and tested.
- **CFG-03.05 — Configuration watchers MUST debounce partial file writes, handle….** **Requirement:** Configuration watchers MUST debounce partial file writes, handle rename-based replacement, permission changes, deletion, and invalid intermediate files, and MUST avoid unbounded reload loops.
- **CFG-03.06 — Configuration schema evolution MUST define defaulting, deprecation….** **Requirement:** Configuration schema evolution MUST define defaulting, deprecation, migration, unknown-field, and downgrade behavior. A newer binary MUST NOT silently rewrite a file such that the prior supported version cannot start unless that migration is explicit and backed up.
- **CFG-03.07 — Operator-facing effective-configuration output MUST redact credentials, identify source….** **Requirement:** Operator-facing effective-configuration output MUST redact credentials, identify source and precedence for each value, and distinguish explicit values from defaults without exposing secret contents.

**Rule document:** [rules/03-configuration-lifecycle-and-safe-reload.md](rules/03-configuration-lifecycle-and-safe-reload.md)

**Enforcement:** [tests/test_03_configuration_lifecycle_and_safe_reload.py](tests/test_03_configuration_lifecycle_and_safe_reload.py)

**Prohibited conditions:**

- Do not apply a partially valid configuration.
- Do not restart or replace the service silently when a reload can be rejected safely.
### CFG-04 — Setting sources, precedence, and environment

**Objective.** This control defines the intended outcome for **setting sources, precedence, and environment** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-001–RP-003, SO-004

**Normative requirements:**

- **CFG-04.01 — The documented precedence MUST be deterministic across every executable….** **Requirement:** The documented precedence MUST be deterministic across every executable and deployment profile. The current product requirement is built-in defaults, TOML file, environment overrides, then command-line overrides; any change MUST be approved and reflected in examples and tests.
- **CFG-04.02 — Environment variable names MUST be namespaced, documented….** **Requirement:** Environment variable names MUST be namespaced, documented, and parsed by the same typed validation rules as file values. Ambiguous aliases, silent coercion, and undocumented environment discovery MUST be rejected.
- **CFG-04.03 — Command-line overrides MUST be visible in help output….** **Requirement:** Command-line overrides MUST be visible in help output, validated identically to file settings, and excluded from process listings or logs when values are sensitive.
- **CFG-04.04 — Path-valued settings MUST define resolution base, canonicalization….** **Requirement:** Path-valued settings MUST define resolution base, canonicalization, symlink behavior, permissions, and behavior when parent directories do not exist. User-supplied output paths MUST NOT escape an explicitly confined workspace when confinement is required.
- **CFG-04.05 — Default configuration MUST be safe for local use….** **Requirement:** Default configuration MUST be safe for local use and MUST NOT expose network listeners, enable telemetry, grant administrative access, or select a non-local provider without explicit operator action.
- **CFG-04.06 — Configuration examples MUST be syntactically valid TOML, use….** **Requirement:** Configuration examples MUST be syntactically valid TOML, use non-secret placeholders, and remain checked against the schema and shipped defaults.
- **CFG-04.07 — Deployment-specific configuration MUST separate product policy from secrets….** **Requirement:** Deployment-specific configuration MUST separate product policy from secrets and generated state; package upgrades MUST preserve operator-owned settings unless a versioned migration explicitly changes them.

**Rule document:** [rules/04-setting-sources-precedence-and-environment.md](rules/04-setting-sources-precedence-and-environment.md)

**Enforcement:** [tests/test_04_setting_sources_precedence_and_environment.py](tests/test_04_setting_sources_precedence_and_environment.py)

**Prohibited conditions:**

- Do not allow environment variables to silently override values without a discoverable name and precedence rule.
- Do not put secret defaults in sample TOML or install images.
### CFG-05 — Secret configuration and operator controls

**Objective.** This control defines the intended outcome for **secret configuration and operator controls** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** SO-004–SO-005, RP-002, RP-030

**Normative requirements:**

- **CFG-05.01 — Secrets MUST use an approved source for the deployment….** **Requirement:** Secrets MUST use an approved source for the deployment profile: OS credential store, orchestrator secret, protected file, or explicitly configured environment input. Documentation MUST state the storage threat model and required file permissions.
- **CFG-05.02 — Production secrets MUST be validated for presence, format….** **Requirement:** Production secrets MUST be validated for presence, format, purpose, and minimum strength at startup. Missing or invalid required credentials MUST fail closed before the service accepts traffic.
- **CFG-05.03 — Secret rotation MUST support overlap or coordinated replacement where….** **Requirement:** Secret rotation MUST support overlap or coordinated replacement where clients require it, identify active key version, define rollback, and revoke compromised material without restoring the compromised value.
- **CFG-05.04 — Configuration inspection, diagnostic endpoints, support bundles….** **Requirement:** Configuration inspection, diagnostic endpoints, support bundles, crash reports, and debug logging MUST redact secret-bearing fields recursively, including nested structures and secret references.
- **CFG-05.05 — Operator controls MUST distinguish read-only inspection from mutating actions….** **Requirement:** Operator controls MUST distinguish read-only inspection from mutating actions, authenticate and authorize remote changes, audit actor/target/outcome, and prevent lost-update races with version checks or equivalent concurrency control.
- **CFG-05.06 — Configuration files and generated state MUST have explicit ownership….** **Requirement:** Configuration files and generated state MUST have explicit ownership and permissions. The service MUST detect unexpected symlinks, world-readable credentials, or writable-by-untrusted-user files where those conditions weaken the deployment threat model.
- **CFG-05.07 — Each setting with security or availability impact MUST document….** **Requirement:** Each setting with security or availability impact MUST document its default, valid range, effect, reloadability, and operational recovery path.

**Rule document:** [rules/05-secret-configuration-and-operator-controls.md](rules/05-secret-configuration-and-operator-controls.md)

**Enforcement:** [tests/test_05_secret_configuration_and_operator_controls.py](tests/test_05_secret_configuration_and_operator_controls.py)

**Prohibited conditions:**

- Do not expose secret references if they reveal a provider name, path, or identity that is itself sensitive.
- Do not accept remote administrative configuration updates without authorization, audit, and concurrency protection.

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/configuration
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
