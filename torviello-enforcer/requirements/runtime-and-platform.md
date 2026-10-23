# Runtime and Platform Requirements

## Configuration

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [RP-001](items/RP-001.md) | MUST | TOML shall be the one canonical human-edited application configuration format, consistent with the current Rust stack and existing `config.toml`. | Documentation, examples, packaged defaults, and runtime parsing agree on TOML. If migration is needed, legacy input has a documented deprecation path and clear errors. |
| [RP-002](items/RP-002.md) | MUST | Configuration precedence and validation shall be predictable. | Defaults, config file, environment overrides, and command-line overrides have a documented order; invalid, conflicting, or unknown values fail with actionable diagnostics before serving traffic. |
| [RP-003](items/RP-003.md) | SHOULD | The configuration schema shall be versioned or otherwise support safe upgrades. | A newer binary can detect unsupported configuration and provide a migration or compatibility explanation. |

## Inference and hardware

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [RP-010](items/RP-010.md) | MUST | CPU inference shall remain a supported baseline on declared operating systems and hardware. | CI builds and smoke tests the minimum supported CPU profile on each declared OS/architecture; requirements state memory and instruction-set assumptions. |
| [RP-011](items/RP-011.md) | SHOULD | The engine shall provide optional acceleration for CUDA, Apple Metal, Vulkan, and AMD hardware through supported runtime backends. | A backend support matrix names runtime/provider versions, hardware and OS coverage, build flags, known limitations, and a smoke-test result for each claimed target. |
| [RP-012](items/RP-012.md) | MUST | Backend selection shall be explicit, observable, and safely fall back when configured to allow fallback. | Startup and health diagnostics identify the chosen provider and reason; unsupported device requests fail clearly; fallback behavior is covered by provider-specific acceptance checks. |
| [RP-013](items/RP-013.md) | SHOULD | Runtime tuning shall account for throughput, latency, memory use, and idle power across CPU and GPU paths. | Representative benchmarks report methodology and results for defined workloads; tuning defaults are evidence-based and operators can set resource limits. |
| [RP-014](items/RP-014.md) | MUST | Model loading and execution shall be isolated behind stable module interfaces. | Each backend adapter accepts a versioned model descriptor and exposes consistent load, readiness, inference, and failure behavior. |
| [RP-015](items/RP-015.md) | SHOULD | Capability selection shall allow minimal, CPU, and accelerator-enabled build profiles. | Build documentation lists profiles and resulting features; CI verifies that a minimal profile does not pull optional backend dependencies. |
| [RP-016](items/RP-016.md) | MUST | The engine shall substantiate any "fastest" claim against a declared competitor set, on identical hardware and workloads, for latency, throughput, memory, startup, idle cost, and artifact size. | A dated evidence record names competitors and versions, hardware, OS, runtime/driver, model digests, input corpus, batch/sequence, precision, concurrency, metric definitions, and allowed margin; the same harness measures every contender; public claims state the tested envelope and are retracted or requalified when stale. |
| [RP-017](items/RP-017.md) | MUST | The default installation and idle runtime shall be the lightest configuration that preserves supported behavior, with enforced footprint budgets. | The minimal CPU profile excludes optional backends, models, datasets, telemetry, and hosted dependencies; versioned budgets cover artifact size, cold start, idle RSS/CPU, and peak memory; CI fails the release gate when a budget or regression threshold is exceeded. |

## Portability and packaging

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [RP-020](items/RP-020.md) | MUST | Supported releases shall build and install on the declared Windows, macOS, and Linux targets. | A target matrix lists architecture, OS version, toolchain, and runtime prerequisites; CI builds and smoke-tests every release target or documents a specific exception. |
| [RP-021](items/RP-021.md) | MUST | Release packaging shall be driven by reproducible, cross-platform automation rather than platform-specific shell scripts as the sole workflow. | A clean offline build can create each supported artifact from pinned inputs; automation runs on Windows, macOS, and Linux. Ansible or another candidate may be selected after an implementation comparison. |
| [RP-022](items/RP-022.md) | MUST | A release build shall be reproducible from checked-in source, pinned dependencies, and documented inputs, without depending on a hosted service at build time. | A documented offline release exercise succeeds from a clean checkout and a prepared artifact cache; checksums and build metadata identify the inputs. |
| [RP-023](items/RP-023.md) | MUST | Engine-only and full-package artifacts shall be separately named, versioned, and documented. | Release metadata states included modules, service dependencies, model handling, upgrade path, and supported platforms for each artifact. |
| [RP-024](items/RP-024.md) | SHOULD | Container build definitions and Compose environments shall use the dedicated container directory and offer clear development, production, and accelerator profiles. | From the documented directory, an operator can build and start each supported profile; images run as non-root where feasible and expose health checks. |

## Service, registry, and persistence

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [RP-030](items/RP-030.md) | MUST | The standalone engine shall be deployable as a managed service with documented start, stop, restart, readiness, liveness, and upgrade behavior. | Supported service managers or container deployments have tested examples; interrupted startup, shutdown, and model-loading states are observable and recoverable. |
| [RP-031](items/RP-031.md) | SHOULD | A hosted registry service shall support authenticated administration of model and service configuration. | Admins can inspect, validate, update, audit, and roll back registry configuration through a documented API or controlled file workflow; authorization is enforced for every mutation. |
| [RP-032](items/RP-032.md) | MUST | The system shall define which state must persist and where it is stored before choosing a database. | A data inventory identifies users, licenses, registry/configuration, audit records, model metadata, and transient inference state, with retention and availability needs. |
| [RP-033](items/RP-033.md) | SHOULD | Persistent state shall use a supported database with backup, restore, migration, and integrity procedures. | A database decision record compares embedded and server databases against deployment scale and offline needs; migration and restore are demonstrated before production use. |
| [RP-034](items/RP-034.md) | MUST | Local inference shall not require a database when the selected local profile has no persistent account or hosted-management needs. | The minimal engine profile starts without provisioning a database; persistent local features state their database dependency explicitly. |
| [RP-035](items/RP-035.md) | MUST | Persistent data models shall be derived from approved data needs, invariants, access patterns, and lifecycle constraints before implementation. | A schema design identifies entities/records, keys, relationships, constraints, indexes justified by queries, transaction boundaries, concurrency behavior, classification, retention/deletion, migration, and recovery requirements. |
