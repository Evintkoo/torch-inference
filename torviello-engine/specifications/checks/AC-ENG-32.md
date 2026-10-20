# AC-ENG-32 — Declare and enforce supported build and platform profiles

**Check ID:** AC-ENG-32  
**Requirement:** ENG-026  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Platform support and build profiles are explicit, optional dependencies do not leak into the minimal profile, declared targets are verified, and unsupported targets fail clearly. AC-ENG-32 verifies ENG-026 and fails when the threshold below is not met.
- **Measurable:** 100% of declared target/profile combinations build, start, and pass a probe; zero undeclared optional dependencies in the minimal profile; 100% SLSA v1.2 Build Level 3 and signed SBOM verification; 100% bit-for-bit reproducible rebuild.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-026; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-026 — Declare and enforce supported build and platform profiles

**Priority:** MUST  
**Requirement document:** [ENG-026](../../../requirements/items/ENG-026.md)

The engine MUST publish a supported platform matrix, provide minimal, CPU, and accelerator build profiles with explicit contents, keep optional providers out of the minimal profile, and fail unsupported targets or unavailable providers with a documented reason.

**Acceptance summary:** The minimal artifact contains no accelerator or optional service dependencies.

## 2. Observable check

Platform support and build profiles are explicit, optional dependencies do not leak into the minimal profile, declared targets are verified, and unsupported targets fail clearly.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `platform-and-build-profiles.feature`

#### Minimal profile excludes optional backends

```gherkin
Scenario: Minimal profile excludes optional backends
    Given the minimal profile is selected
    When the artifact is built
    Then accelerator and optional service dependencies are absent
    And the engine still serves CPU inference for supported capabilities
```

#### Optional backend failure does not break the build

```gherkin
Scenario: Optional backend failure does not break the build
    Given the CPU profile is selected on a host without accelerators
    When the workspace builds and tests run
    Then optional provider code is not required
    And CPU tests pass
```

#### Declared target matrix is enforced

```gherkin
Scenario: Declared target matrix is enforced
    Given a target in the supported matrix
    When CI builds it
    Then the build and smoke test pass or the target is explicitly unsupported
    And the support status is published
```

#### Accelerator profile is available only when declared

```gherkin
Scenario: Accelerator profile is available only when declared
    Given the accelerator profile is selected
    When the provider runtime is missing at startup
    Then startup fails with "backend.unavailable"
    And a CPU fallback is used only if configuration permits it
```

#### Artifact metadata identifies contents

```gherkin
Scenario: Artifact metadata identifies contents
    Given a release artifact
    When an operator inspects its metadata
    Then it names the profile, version, commit, and included backends
    And the same metadata appears in the SBOM
```

#### Unsupported platform fails clearly

```gherkin
Scenario: Unsupported platform fails clearly
    Given an unsupported OS and architecture pair
    When installation is attempted
    Then the failure names the unsupported target
    And it does not install a partially functional binary
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| PORT-01 | Supported platform matrix | [01-supported-platform-matrix.md](../../../torviello-enforcer/portability/rules/01-supported-platform-matrix.md) |
| PORT-02 | Feature isolation and toolchain compatibility | [02-feature-isolation-and-toolchain-compatibility.md](../../../torviello-enforcer/portability/rules/02-feature-isolation-and-toolchain-compatibility.md) |
| ARC-02 | Optional capabilities and build profiles | [02-optional-capabilities-and-build-profiles.md](../../../torviello-enforcer/architecture/rules/02-optional-capabilities-and-build-profiles.md) |

#### PORT-01.01 — Publish a support matrix for each release: OS/version, architecture

The project MUST publish a support matrix for each release: OS/version, architecture, minimum CPU/instruction set, memory/storage floor, compiler/toolchain, runtime libraries, GPU provider, driver, and model format.

#### PORT-01.02 — Support the CPU-only profile as the portable baseline

The project MUST support the CPU-only profile as the portable baseline. Specialized CPU instructions are runtime-detected or excluded from targets that do not guarantee them.

#### PORT-01.03 — Claim Windows, macOS, Linux, CUDA, Metal, Vulkan, or AMD

The project MUST claim Windows, macOS, Linux, CUDA, Metal, Vulkan, or AMD support only after building and running a profile-specific smoke test on a representative target.

#### PORT-01.04 — State unsupported combinations and degraded behavior clearly

The project MUST state unsupported combinations and degraded behavior clearly. A compiled artifact alone does not establish a supported platform.

#### PORT-01.05 — Test both the oldest supported environment and a current

The project MUST test both the oldest supported environment and a current environment on each declared architecture family.

#### PORT-02.01 — Keep optional runtime dependencies behind explicit Cargo features

The project MUST keep optional runtime dependencies behind explicit Cargo features or target-specific dependencies. Default profiles include only intended capabilities.

#### PORT-02.02 — Use additive features with documented dependencies and user-visible effects

The project MUST use additive features with documented dependencies and user-visible effects. The project MUST also avoid relying on default feature behavior of transitive dependencies.

#### PORT-02.03 — Declare the minimum supported Rust and frontend toolchain

The project MUST declare the minimum supported Rust and frontend toolchain and use it in at least one CI job. The project MUST also pin release toolchains and record build flags.

#### PORT-02.04 — Test no-default-features, minimal CPU, production, and each important backend

The project MUST test no-default-features, minimal CPU, production, and each important backend combination. The project MUST also avoid an unbounded exhaustive matrix; select profiles by support commitments and risk.

#### PORT-02.05 — Keep build caches and generated artifacts target-specific

The project MUST keep build caches and generated artifacts target-specific. The project MUST NOT reuse incompatible outputs across OS, architecture, feature, or toolchain changes.

#### ARC-02.01 — Make hardware backends and large optional runtimes selectable capabilities

The project MUST make hardware backends and large optional runtimes selectable capabilities. Disabled capabilities MUST NOT pull their runtime dependencies into a minimal profile.

#### ARC-02.02 — Use additive Cargo features named after user-visible capabilities

The project MUST use additive Cargo features named after user-visible capabilities and document their dependency effects. It MUST NOT use features that silently change unrelated behavior.

#### ARC-02.03 — Publish build profiles for minimal CPU, supported CPU features

The project MUST publish build profiles for minimal CPU, supported CPU features, and each supported accelerator family. The matrix states exact OS, architecture, runtime, driver, and toolchain requirements.

#### ARC-02.04 — Each adapter MUST implement the same model lifecycle contract

Each adapter MUST implement the same model lifecycle contract: capability discovery, load, readiness, inference, cancellation, shutdown, and typed failure

#### ARC-02.05 — Record architecture decisions for module boundaries, backend interfaces, serialization

The project MUST record architecture decisions for module boundaries, backend interfaces, serialization, persistence, or compatibility, including alternatives and migration cost.

## 5. Prohibited conditions

- Do not claim support for a target that is not built and smoke-tested.
- Do not let optional providers leak into the minimal profile.
- Do not install a binary that cannot start on the target.
- Do not omit backend contents from artifact metadata.
- Do not silently change the meaning of a profile between releases.

## 6. Procedure

- 1. Build each declared profile from a clean checkout.
- 2. Inspect dependency and artifact contents for optional components.
- 3. Run the profile smoke test on each declared target or review the approved exception.
- 4. Attempt an accelerator profile without its runtime.
- 5. Inspect artifact metadata and SBOM.
- 6. Record commands, artifact inventories, and results.

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

- Profile build logs and dependency inventories.
- Smoke-test results per target.
- Startup failure for a missing required provider.
- Artifact metadata and SBOM entries.
- Unsupported-target failure output.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../requirements/assurance-standard.md), this check additionally requires:

- SLSA v1.2 provenance attestations and signature-verification logs.
- The signed CycloneDX SBOM and dependency inventory.
- The reproducible rebuild digests and target-matrix results.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-026](../../../requirements/items/ENG-026.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [platform-and-build-profiles.feature](../features/platform-and-build-profiles.feature) |
| Rule controls | PORT-01, PORT-02, ARC-02 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
