# verification domain

**Development stage:** TDD

This directory contains 6 normative control document(s) and the generated enforcement tests for the **verification** domain (Verification and quality gates). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| VER-01 | [01-test-strategy-and-test-boundaries.md](rules/01-test-strategy-and-test-boundaries.md) | ED-010–ED-014, CSC-009, ED-011 | [tests/test_01_test_strategy_and_test_boundaries.py](tests/test_01_test_strategy_and_test_boundaries.py) | Test strategy and boundaries |
| VER-02 | [02-ci-quality-gates-and-release-evidence.md](rules/02-ci-quality-gates-and-release-evidence.md) | ED-010–ED-014, CSC-009, ED-011 | [tests/test_02_ci_quality_gates_and_release_evidence.py](tests/test_02_ci_quality_gates_and_release_evidence.py) | CI gates and release evidence |
| VER-03 | [03-test-levels-contracts-and-deterministic-fixtures.md](rules/03-test-levels-contracts-and-deterministic-fixtures.md) | ED-010–ED-014, CSC-009 | [tests/test_03_test_levels_contracts_and_deterministic_fixtures.py](tests/test_03_test_levels_contracts_and_deterministic_fixtures.py) | Test levels, contracts, and deterministic fixtures |
| VER-04 | [04-security-robustness-and-failure-injection.md](rules/04-security-robustness-and-failure-injection.md) | ED-010–ED-014, SO-010–SO-014, SO-030–SO-032 | [tests/test_04_security_robustness_and_failure_injection.py](tests/test_04_security_robustness_and_failure_injection.py) | Security, robustness, and failure-injection testing |
| VER-05 | [05-model-quality-hardware-and-compatibility-verification.md](rules/05-model-quality-hardware-and-compatibility-verification.md) | RP-010–RP-015, RP-020, ED-012–ED-013 | [tests/test_05_model_quality_hardware_and_compatibility_verification.py](tests/test_05_model_quality_hardware_and_compatibility_verification.py) | Model quality, hardware, and compatibility verification |
| VER-06 | [06-ci-policy-flakiness-and-release-evidence.md](rules/06-ci-policy-flakiness-and-release-evidence.md) | ED-010–ED-014, ED-020–ED-023 | [tests/test_06_ci_policy_flakiness_and_release_evidence.py](tests/test_06_ci_policy_flakiness_and_release_evidence.py) | CI policy, flakiness, and release evidence |

## Detailed controls

### VER-01 — Test strategy and boundaries

**Objective.** These controls govern **test strategy and boundaries**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** ED-010–ED-014, CSC-009, ED-011

**Normative requirements:**

- **VER-01.01 — Keep unit, integration, end-to-end, security, compatibility, and benchmark checks.** The project MUST keep unit, integration, end-to-end, security, compatibility, and benchmark checks independently discoverable and runnable.
- **VER-01.02 — Unit tests MUST verify small-module behavior.** Unit tests MUST verify small-module behavior. Integration tests MUST verify service and persistence boundaries. End-to-end tests MUST verify user journeys. Benchmarks MUST measure performance and live under /benchmarks.
- **VER-01.03 — Every feature specification MUST state acceptance checks, expected outcomes.** Every feature specification MUST state acceptance checks, expected outcomes, prerequisites, and which checks are automated or manual.
- **VER-01.04 — Test public boundaries, failure cases, concurrency/resource limits, authorization denials.** The project MUST test public boundaries, failure cases, concurrency/resource limits, authorization denials, and recovery paths, not only the happy path.
- **VER-01.05 — Hardware- or model-dependent tests MUST state exact prerequisites.** Hardware- or model-dependent tests MUST state exact prerequisites and have a CI hardware job or release-qualification path.

**Rule document:** [rules/01-test-strategy-and-test-boundaries.md](rules/01-test-strategy-and-test-boundaries.md)

**Enforcement:** [tests/test_01_test_strategy_and_test_boundaries.py](tests/test_01_test_strategy_and_test_boundaries.py)

**Prohibited conditions:**

- The project MUST NOT place non-unit tests and benchmarks inside production src paths
- The project MUST NOT write tests that only duplicate implementation details or assert private call order without a behavioral need
- The project MUST NOT silently skip required checks because a local machine lacks a model or accelerator
### VER-02 — CI gates and release evidence

**Objective.** These controls govern **ci gates and release evidence**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** ED-010–ED-014, CSC-009, ED-011

**Normative requirements:**

- **VER-02.01 — CI MUST run formatting, lint, compile, unit, integration, frontend.** CI MUST run formatting, lint, compile, unit, integration, frontend checks, API contract validation, and security/dependency scans relevant to each changed area.
- **VER-02.02 — Required gates MUST fail visibly and produce actionable diagnostics.** Required gates MUST fail visibly and produce actionable diagnostics. Optional expensive jobs MUST have explicit triggers and MUST NOT be mistaken for passed checks when skipped
- **VER-02.03 — Test the supported OS, architecture, and build-profile matrix according.** The project MUST test the supported OS, architecture, and build-profile matrix according to risk and release commitment. At minimum, release qualification covers each advertised row.
- **VER-02.04 — Track flaky failures and quarantine only with an owner.** The project MUST track flaky failures and quarantine only with an owner, reason, issue, and expiry. A quarantined check does not count as passing evidence.
- **VER-02.05 — Preserve release evidence: source revision, tool versions, test results.** The project MUST preserve release evidence: source revision, tool versions, test results, artifact metadata, SBOM, provenance, and signatures/checksums.
- **VER-02.06 — Use deterministic fixtures and safe test data.** The project MUST use deterministic fixtures and safe test data. CI artifacts MUST NOT contain production secrets or real personal/model payloads.

**Rule document:** [rules/02-ci-quality-gates-and-release-evidence.md](rules/02-ci-quality-gates-and-release-evidence.md)

**Enforcement:** [tests/test_02_ci_quality_gates_and_release_evidence.py](tests/test_02_ci_quality_gates_and_release_evidence.py)

**Prohibited conditions:**

- The project MUST NOT merge or release while required checks are red or unknown without a documented exception
- The project MUST NOT disable a security or compatibility gate to reduce pipeline time without an equivalent control
- The project MUST NOT publish unredacted test artifacts containing secrets or user data
### VER-03 — Test levels, contracts, and deterministic fixtures

**Objective.** This control defines the intended outcome for **test levels, contracts, and deterministic fixtures** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-010–ED-014, CSC-009

**Normative requirements:**

- **VER-03.01 — Unit tests MUST validate deterministic logic at module boundaries….** **Requirement:** Unit tests MUST validate deterministic logic at module boundaries; integration tests MUST validate adapters, persistence, and service contracts; end-to-end tests MUST validate representative user/operator journeys; system tests MUST validate deployment and resource behavior.
- **VER-03.02 — Test ownership MUST follow product-area ownership. A shared….** **Requirement:** Test ownership MUST follow product-area ownership. A shared contract change MUST include consumer contract tests for every supported implementation or deployment profile that relies on it.
- **VER-03.03 — Test names and directory placement MUST expose the behavior….** **Requirement:** Test names and directory placement MUST expose the behavior and level under test; tests MUST not depend on incidental private call order unless that order is a public invariant.
- **VER-03.04 — Fixtures MUST be deterministic, versioned where behavior depends….** **Requirement:** Fixtures MUST be deterministic, versioned where behavior depends on them, licensed, and free of production secrets or user content. Randomized/property tests MUST record seeds when reproducing failures.
- **VER-03.05 — Each acceptance criterion MUST map to one or more….** **Requirement:** Each acceptance criterion MUST map to one or more tests or an explicitly assigned manual assessment with owner, procedure, expected result, and release gate.
- **VER-03.06 — Test isolation MUST prevent parallel tests from sharing mutable….** **Requirement:** Test isolation MUST prevent parallel tests from sharing mutable filesystem, database, port, model cache, credentials, or GPU state unless concurrency is itself under test.
- **VER-03.07 — Test failure output MUST preserve enough context to debug….** **Requirement:** Test failure output MUST preserve enough context to debug without printing sensitive payloads or making success depend on external service availability.

**Rule document:** [rules/03-test-levels-contracts-and-deterministic-fixtures.md](rules/03-test-levels-contracts-and-deterministic-fixtures.md)

**Enforcement:** [tests/test_03_test_levels_contracts_and_deterministic_fixtures.py](tests/test_03_test_levels_contracts_and_deterministic_fixtures.py)

**Prohibited conditions:**

- Do not classify a test as end-to-end merely because it starts a process; it must exercise a user-visible contract.
- Do not silently skip required suites when hardware, models, or external services are unavailable.
### VER-04 — Security, robustness, and failure-injection testing

**Objective.** This control defines the intended outcome for **security, robustness, and failure-injection testing** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-010–ED-014, SO-010–SO-014, SO-030–SO-032

**Normative requirements:**

- **VER-04.01 — Every trust boundary MUST have negative tests for malformed….** **Requirement:** Every trust boundary MUST have negative tests for malformed, unauthorized, oversized, replayed, stale, concurrent, and unavailable inputs relevant to that boundary.
- **VER-04.02 — Parsers for HTTP bodies, TOML, model metadata….** **Requirement:** Parsers for HTTP bodies, TOML, model metadata, archives, image/audio formats, and update manifests MUST be tested for malformed structures, truncation, extreme nesting, integer overflow, decompression expansion, path escape, and resource exhaustion as applicable.
- **VER-04.03 — Failure injection MUST cover network timeout/reset, DNS/TLS failure….** **Requirement:** Failure injection MUST cover network timeout/reset, DNS/TLS failure, disk full, database unavailable, partial write, process restart, accelerator loss, model load failure, and cancellation for profiles that depend on those components.
- **VER-04.04 — Confirmed security defects MUST produce minimized regression fixtures….** **Requirement:** Confirmed security defects MUST produce minimized regression fixtures and tests that fail on the vulnerable behavior and pass on the fix.
- **VER-04.05 — Fuzz and property-based tests MUST enforce execution and memory….** **Requirement:** Fuzz and property-based tests MUST enforce execution and memory budgets, preserve seed/corpus provenance, and avoid access to production credentials or network targets.
- **VER-04.06 — Dynamic security testing MUST use an isolated environment….** **Requirement:** Dynamic security testing MUST use an isolated environment, synthetic accounts/data, explicit target authorization, and controlled cleanup; test findings MUST be triaged before release.
- **VER-04.07 — Fault tests MUST verify recovery and cleanup as well….** **Requirement:** Fault tests MUST verify recovery and cleanup as well as detection: no leaked work, stale readiness, partially published state, corrupted registry, or silent data loss.

**Rule document:** [rules/04-security-robustness-and-failure-injection.md](rules/04-security-robustness-and-failure-injection.md)

**Enforcement:** [tests/test_04_security_robustness_and_failure_injection.py](tests/test_04_security_robustness_and_failure_injection.py)

**Prohibited conditions:**

- Do not fuzz arbitrary third-party production endpoints or use real user data as a test corpus without authorization.
- Do not treat fault detection alone as successful recovery.
### VER-05 — Model quality, hardware, and compatibility verification

**Objective.** This control defines the intended outcome for **model quality, hardware, and compatibility verification** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-010–RP-015, RP-020, ED-012–ED-013

**Normative requirements:**

- **VER-05.01 — Every claimed OS/architecture/profile/backend combination MUST have a recorded build….** **Requirement:** Every claimed OS/architecture/profile/backend combination MUST have a recorded build and runtime test result or be labeled unverified/unsupported.
- **VER-05.02 — Model evaluation MUST pin model digest, runtime/provider….** **Requirement:** Model evaluation MUST pin model digest, runtime/provider, preprocessing, tokenizer, dataset split, metric implementation, parameters, hardware, and test harness revision.
- **VER-05.03 — Numerical correctness MUST use documented tolerances for each supported….** **Requirement:** Numerical correctness MUST use documented tolerances for each supported precision/provider and include edge inputs, empty/large tensors, batch changes, and deterministic mode where promised.
- **VER-05.04 — Backend adapter conformance MUST test load/readiness/inference/cancel/unload/error semantics against….** **Requirement:** Backend adapter conformance MUST test load/readiness/inference/cancel/unload/error semantics against the same contract suite.
- **VER-05.05 — Performance tests MUST be separate from correctness acceptance unless….** **Requirement:** Performance tests MUST be separate from correctness acceptance unless the feature explicitly promises a performance bound; report latency distributions, throughput, quality, memory, and device conditions.
- **VER-05.06 — Compatibility qualification MUST cover upgrade from supported prior versions….** **Requirement:** Compatibility qualification MUST cover upgrade from supported prior versions, configuration/schema migration, model reuse, and rollback, not only clean installation.
- **VER-05.07 — When physical hardware is scarce, emulation or mocks….** **Requirement:** When physical hardware is scarce, emulation or mocks MAY support early development but MUST NOT substitute for release evidence on advertised accelerator targets.

**Rule document:** [rules/05-model-quality-hardware-and-compatibility-verification.md](rules/05-model-quality-hardware-and-compatibility-verification.md)

**Enforcement:** [tests/test_05_model_quality_hardware_and_compatibility_verification.py](tests/test_05_model_quality_hardware_and_compatibility_verification.py)

**Prohibited conditions:**

- Do not infer model quality from a successful load or a single happy-path output.
- Do not mark an untested backend supported because another provider uses a similar API.
### VER-06 — CI policy, flakiness, and release evidence

**Objective.** This control defines the intended outcome for **ci policy, flakiness, and release evidence** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-010–ED-014, ED-020–ED-023

**Normative requirements:**

- **VER-06.01 — CI MUST define required checks by change class….** **Requirement:** CI MUST define required checks by change class and product area, protect release branches, and ensure required workflows cannot be bypassed by path filters, job cancellation, or missing credentials.
- **VER-06.02 — Every required job MUST publish tool versions, command….** **Requirement:** Every required job MUST publish tool versions, command, target/profile, result, and machine-readable test or artifact metadata sufficient to reproduce its outcome.
- **VER-06.03 — Flaky tests MUST be tracked with owner, issue….** **Requirement:** Flaky tests MUST be tracked with owner, issue, failure signature, quarantine scope, expiry, and remediation target. Quarantined tests MUST remain visible and MUST not count as passing coverage.
- **VER-06.04 — Build caches MUST be keyed by source, toolchain….** **Requirement:** Build caches MUST be keyed by source, toolchain, target, features, and relevant environment inputs; untrusted jobs MUST not write cache entries consumed by privileged release jobs.
- **VER-06.05 — Release evidence MUST bind source revision, workflow/builder identity….** **Requirement:** Release evidence MUST bind source revision, workflow/builder identity, resolved dependencies, test results, artifact digests, SBOM, provenance, signatures, and approval to one immutable release candidate.
- **VER-06.06 — CI artifacts MUST have retention and access policies….** **Requirement:** CI artifacts MUST have retention and access policies; logs and test outputs MUST redact secrets and sensitive payloads before upload.
- **VER-06.07 — A release MUST fail closed when a required check….** **Requirement:** A release MUST fail closed when a required check is unknown, missing, stale, or executed against a different candidate digest.

**Rule document:** [rules/06-ci-policy-flakiness-and-release-evidence.md](rules/06-ci-policy-flakiness-and-release-evidence.md)

**Enforcement:** [tests/test_06_ci_policy_flakiness_and_release_evidence.py](tests/test_06_ci_policy_flakiness_and_release_evidence.py)

**Prohibited conditions:**

- Do not suppress or retry a flaky test until green without preserving the original failure evidence.
- Do not share privileged signing credentials with general test jobs.

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/verification
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
