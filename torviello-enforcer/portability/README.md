# portability domain

**Development stage:** CDD

This directory contains 5 normative control document(s) and the generated enforcement tests for the **portability** domain (Portability and build profiles). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| PORT-01 | [01-supported-platform-matrix.md](rules/01-supported-platform-matrix.md) | RP-010–RP-015, RP-020, PA-010–PA-011, ED-013 | [tests/test_01_supported_platform_matrix.py](tests/test_01_supported_platform_matrix.py) | Supported platform matrix |
| PORT-02 | [02-feature-isolation-and-toolchain-compatibility.md](rules/02-feature-isolation-and-toolchain-compatibility.md) | RP-010–RP-015, RP-020, PA-010–PA-011, ED-013 | [tests/test_02_feature_isolation_and_toolchain_compatibility.py](tests/test_02_feature_isolation_and_toolchain_compatibility.py) | Feature isolation and toolchain compatibility |
| PORT-03 | [03-platform-support-contract-and-end-of-life.md](rules/03-platform-support-contract-and-end-of-life.md) | RP-010–RP-011, RP-020–RP-024, ED-013 | [tests/test_03_platform_support_contract_and_end_of_life.py](tests/test_03_platform_support_contract_and_end_of_life.py) | Platform support contract and end of life |
| PORT-04 | [04-cross-platform-filesystem-process-and-network-behavior.md](rules/04-cross-platform-filesystem-process-and-network-behavior.md) | RP-020–RP-024, RP-030 | [tests/test_04_cross_platform_filesystem_process_and_network_behavior.py](tests/test_04_cross_platform_filesystem_process_and_network_behavior.py) | Cross-platform filesystem, process, and network behavior |
| PORT-05 | [05-cross-compilation-abi-and-native-runtime-matrix.md](rules/05-cross-compilation-abi-and-native-runtime-matrix.md) | RP-010–RP-015, RP-020–RP-022 | [tests/test_05_cross_compilation_abi_and_native_runtime_matrix.py](tests/test_05_cross_compilation_abi_and_native_runtime_matrix.py) | Cross-compilation, ABI, and native-runtime matrix |

## Detailed controls

### PORT-01 — Supported platform matrix

**Objective.** These controls govern **supported platform matrix**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** RP-010–RP-015, RP-020, PA-010–PA-011, ED-013

**Normative requirements:**

- **PORT-01.01 — Publish a support matrix for each release: OS/version, architecture.** The project MUST publish a support matrix for each release: OS/version, architecture, minimum CPU/instruction set, memory/storage floor, compiler/toolchain, runtime libraries, GPU provider, driver, and model format.
- **PORT-01.02 — Support the CPU-only profile as the portable baseline.** The project MUST support the CPU-only profile as the portable baseline. Specialized CPU instructions are runtime-detected or excluded from targets that do not guarantee them.
- **PORT-01.03 — Claim Windows, macOS, Linux, CUDA, Metal, Vulkan, or AMD.** The project MUST claim Windows, macOS, Linux, CUDA, Metal, Vulkan, or AMD support only after building and running a profile-specific smoke test on a representative target.
- **PORT-01.04 — State unsupported combinations and degraded behavior clearly.** The project MUST state unsupported combinations and degraded behavior clearly. A compiled artifact alone does not establish a supported platform.
- **PORT-01.05 — Test both the oldest supported environment and a current.** The project MUST test both the oldest supported environment and a current environment on each declared architecture family.

**Rule document:** [rules/01-supported-platform-matrix.md](rules/01-supported-platform-matrix.md)

**Enforcement:** [tests/test_01_supported_platform_matrix.py](tests/test_01_supported_platform_matrix.py)

**Prohibited conditions:**

- The project MUST NOT say “works on any machine” without a support boundary
- The project MUST NOT assume GPU provider APIs or drivers exist on a target OS
- The project MUST NOT ship binaries with undocumented dynamic library requirements
### PORT-02 — Feature isolation and toolchain compatibility

**Objective.** These controls govern **feature isolation and toolchain compatibility**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** RP-010–RP-015, RP-020, PA-010–PA-011, ED-013

**Normative requirements:**

- **PORT-02.01 — Keep optional runtime dependencies behind explicit Cargo features.** The project MUST keep optional runtime dependencies behind explicit Cargo features or target-specific dependencies. Default profiles include only intended capabilities.
- **PORT-02.02 — Use additive features with documented dependencies and user-visible effects.** The project MUST use additive features with documented dependencies and user-visible effects. The project MUST also avoid relying on default feature behavior of transitive dependencies.
- **PORT-02.03 — Declare the minimum supported Rust and frontend toolchain.** The project MUST declare the minimum supported Rust and frontend toolchain and use it in at least one CI job. The project MUST also pin release toolchains and record build flags.
- **PORT-02.04 — Test no-default-features, minimal CPU, production, and each important backend.** The project MUST test no-default-features, minimal CPU, production, and each important backend combination. The project MUST also avoid an unbounded exhaustive matrix; select profiles by support commitments and risk.
- **PORT-02.05 — Keep build caches and generated artifacts target-specific.** The project MUST keep build caches and generated artifacts target-specific. The project MUST NOT reuse incompatible outputs across OS, architecture, feature, or toolchain changes.

**Rule document:** [rules/02-feature-isolation-and-toolchain-compatibility.md](rules/02-feature-isolation-and-toolchain-compatibility.md)

**Enforcement:** [tests/test_02_feature_isolation_and_toolchain_compatibility.py](tests/test_02_feature_isolation_and_toolchain_compatibility.py)

**Prohibited conditions:**

- The project MUST NOT let test-only or benchmark dependencies enable optional runtime features in release artifacts
- The project MUST NOT make unsupported feature combinations silently compile with missing behavior
- The project MUST NOT use unpinned moving toolchains for release qualification
### PORT-03 — Platform support contract and end of life

**Objective.** This control defines the intended outcome for **platform support contract and end of life** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-010–RP-011, RP-020–RP-024, ED-013

**Normative requirements:**

- **PORT-03.01 — Every supported target MUST specify OS edition/version, architecture/ABI….** **Requirement:** Every supported target MUST specify OS edition/version, architecture/ABI, CPU baseline and required instruction sets, compiler/toolchain, libc/runtime, service manager, graphics/accelerator prerequisites, and support level.
- **PORT-03.02 — Support status MUST distinguish compile-only, build-and-test, release-qualified….** **Requirement:** Support status MUST distinguish compile-only, build-and-test, release-qualified, and best-effort targets. Borrow Rust target tiers as evidence about toolchain support only; they do not prove application support.
- **PORT-03.03 — Each advertised target MUST have an owner, CI….** **Requirement:** Each advertised target MUST have an owner, CI or release-qualification evidence, known limitations, minimum resources, install/uninstall process, and end-of-life policy.
- **PORT-03.04 — Adding or removing a target MUST assess users affected….** **Requirement:** Adding or removing a target MUST assess users affected, dependency support, artifact signing, update channel, compatibility, security patch availability, and migration path.
- **PORT-03.05 — Unsupported host detection MUST fail with actionable diagnostics….** **Requirement:** Unsupported host detection MUST fail with actionable diagnostics or choose a tested portable fallback; it MUST NOT execute binaries built for unsupported ISA or ABI assumptions.
- **PORT-03.06 — Platform support claims MUST match downloadable artifacts and published….** **Requirement:** Platform support claims MUST match downloadable artifacts and published documentation at each release. Feature-specific targets MUST be identified rather than implied by a general OS badge.
- **PORT-03.07 — End-of-life changes MUST be announced before removal when feasible….** **Requirement:** End-of-life changes MUST be announced before removal when feasible and state the final supported release and security-maintenance period.

**Rule document:** [rules/03-platform-support-contract-and-end-of-life.md](rules/03-platform-support-contract-and-end-of-life.md)

**Enforcement:** [tests/test_03_platform_support_contract_and_end_of_life.py](tests/test_03_platform_support_contract_and_end_of_life.py)

**Prohibited conditions:**

- Do not infer full product support from a compiler target existing or building.
- Do not advertise “any machine” without explicit minimum requirements and tested baseline hardware.
### PORT-04 — Cross-platform filesystem, process, and network behavior

**Objective.** This control defines the intended outcome for **cross-platform filesystem, process, and network behavior** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-020–RP-024, RP-030

**Normative requirements:**

- **PORT-04.01 — Filesystem code MUST handle platform path separators, case….** **Requirement:** Filesystem code MUST handle platform path separators, case sensitivity, Unicode normalization, reserved names, maximum path lengths, permissions, atomic rename limits, and removable/network-mounted filesystems where supported.
- **PORT-04.02 — User-controlled paths MUST be canonicalized and checked against allowed….** **Requirement:** User-controlled paths MUST be canonicalized and checked against allowed roots after symlink resolution when confinement is required; checks MUST resist time-of-check/time-of-use races.
- **PORT-04.03 — Process execution MUST use argument arrays and explicit working….** **Requirement:** Process execution MUST use argument arrays and explicit working directory/environment. Shell interpretation MUST NOT be used for untrusted values; child process handles, exit codes, signals, timeouts, and cleanup MUST be managed on every target.
- **PORT-04.04 — Network behavior MUST state proxy support, DNS resolution….** **Requirement:** Network behavior MUST state proxy support, DNS resolution, TLS trust-store source, IPv4/IPv6 behavior, timeout, retry, and offline mode. Optional service discovery MUST degrade safely when outbound access is disabled.
- **PORT-04.05 — Package installation MUST account for Windows ACLs, Unix….** **Requirement:** Package installation MUST account for Windows ACLs, Unix ownership/modes, macOS signing/notarization, antivirus quarantine, and platform-specific application data directories as applicable.
- **PORT-04.06 — Line endings, locale, timezone, decimal formats….** **Requirement:** Line endings, locale, timezone, decimal formats, and environment variable case sensitivity MUST not alter serialized configuration or protocol behavior.
- **PORT-04.07 — Cross-platform tests MUST cover path creation and cleanup….** **Requirement:** Cross-platform tests MUST cover path creation and cleanup, atomic update, Unicode names, process cancellation, permissions, and offline startup on each claimed OS family.

**Rule document:** [rules/04-cross-platform-filesystem-process-and-network-behavior.md](rules/04-cross-platform-filesystem-process-and-network-behavior.md)

**Enforcement:** [tests/test_04_cross_platform_filesystem_process_and_network_behavior.py](tests/test_04_cross_platform_filesystem_process_and_network_behavior.py)

**Prohibited conditions:**

- Do not assume POSIX path, permission, process-signal, or symlink behavior on all targets.
- Do not store user state beside a read-only application binary unless the platform contract guarantees writability.
### PORT-05 — Cross-compilation, ABI, and native-runtime matrix

**Objective.** This control defines the intended outcome for **cross-compilation, abi, and native-runtime matrix** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-010–RP-015, RP-020–RP-022

**Normative requirements:**

- **PORT-05.01 — Cross-compilation MUST declare host and target triples, linker….** **Requirement:** Cross-compilation MUST declare host and target triples, linker, SDK, sysroot, native libraries, code-signing stage, and which tests can run on target hardware.
- **PORT-05.02 — Artifacts MUST not accidentally link host libraries or inherit….** **Requirement:** Artifacts MUST not accidentally link host libraries or inherit host CPU features when they claim a portable target baseline.
- **PORT-05.03 — Native backend/runtime versions MUST be pinned or constrained….** **Requirement:** Native backend/runtime versions MUST be pinned or constrained to a documented compatible range and tested with the supported driver matrix.
- **PORT-05.04 — ABI and C/FFI boundaries MUST validate structure layout….** **Requirement:** ABI and C/FFI boundaries MUST validate structure layout, calling convention, integer widths, alignment, symbol versions, and allocator ownership for every target.
- **PORT-05.05 — CPU-specific optimization MUST use runtime feature detection or separately….** **Requirement:** CPU-specific optimization MUST use runtime feature detection or separately named artifacts with explicit minimum CPU requirements; generic builds MUST preserve the declared baseline.
- **PORT-05.06 — Cross-compiled release binaries MUST receive target-side smoke tests on….** **Requirement:** Cross-compiled release binaries MUST receive target-side smoke tests on real hardware or a documented emulator/virtualization environment; compilation alone is insufficient.
- **PORT-05.07 — Toolchain updates MUST rerun portability, binary inspection….** **Requirement:** Toolchain updates MUST rerun portability, binary inspection, startup, and installer checks before release.

**Rule document:** [rules/05-cross-compilation-abi-and-native-runtime-matrix.md](rules/05-cross-compilation-abi-and-native-runtime-matrix.md)

**Enforcement:** [tests/test_05_cross_compilation_abi_and_native_runtime_matrix.py](tests/test_05_cross_compilation_abi_and_native_runtime_matrix.py)

**Prohibited conditions:**

- Do not distribute a binary with host-specific native library paths or an untested CPU instruction requirement.
- Do not assume a container image removes host GPU driver or kernel compatibility constraints.

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/portability
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
