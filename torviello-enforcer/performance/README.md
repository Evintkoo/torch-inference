# performance domain

**Development stage:** EDD

This directory contains 6 normative control document(s) and the generated enforcement tests for the **performance** domain (Performance and resource behavior). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| PERF-01 | [01-benchmark-method-and-performance-claims.md](rules/01-benchmark-method-and-performance-claims.md) | RP-010–RP-015, SO-032, PA-020–PA-021, ED-012 | [tests/test_01_benchmark_method_and_performance_claims.py](tests/test_01_benchmark_method_and_performance_claims.py) | Benchmark method and performance claims |
| PERF-02 | [02-resource-bounds-and-accelerator-tuning.md](rules/02-resource-bounds-and-accelerator-tuning.md) | RP-010–RP-015, SO-032, PA-020–PA-021, ED-012 | [tests/test_02_resource_bounds_and_accelerator_tuning.py](tests/test_02_resource_bounds_and_accelerator_tuning.py) | Resource bounds and accelerator tuning |
| PERF-03 | [03-resource-budgets-startup-and-idle-behavior.md](rules/03-resource-budgets-startup-and-idle-behavior.md) | RP-010–RP-013, SO-032 | [tests/test_03_resource_budgets_startup_and_idle_behavior.py](tests/test_03_resource_budgets_startup_and_idle_behavior.py) | Resource budgets, startup, and idle behavior |
| PERF-04 | [04-accelerator-backend-compatibility-and-fallback.md](rules/04-accelerator-backend-compatibility-and-fallback.md) | RP-010–RP-015 | [tests/test_04_accelerator_backend_compatibility_and_fallback.py](tests/test_04_accelerator_backend_compatibility_and_fallback.py) | Accelerator backends, compatibility, and fallback |
| PERF-05 | [05-throughput-latency-batching-and-model-quality.md](rules/05-throughput-latency-batching-and-model-quality.md) | RP-012–RP-013, ED-012 | [tests/test_05_throughput_latency_batching_and_model_quality.py](tests/test_05_throughput_latency_batching_and_model_quality.py) | Throughput, latency, batching, and model quality |
| PERF-06 | [06-competitive-performance-and-footprint.md](rules/06-competitive-performance-and-footprint.md) | RP-016–RP-017, ED-012, PA-021–PA-022 | [tests/test_06_competitive_performance_and_footprint.py](tests/test_06_competitive_performance_and_footprint.py) | Competitive performance and footprint |

## Detailed controls

### PERF-01 — Benchmark method and performance claims

**Objective.** These controls govern **benchmark method and performance claims**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** RP-010–RP-015, SO-032, PA-020–PA-021, ED-012

**Normative requirements:**

- **PERF-01.01 — Define the workload and target before optimizing: model, input.** The project MUST define the workload and target before optimizing: model, input size, concurrency, latency percentile, throughput, peak memory, CPU/GPU utilization, energy/idle draw, and binary/build cost as applicable.
- **PERF-01.02 — Record hardware, OS, compiler, runtime/provider, driver, model digest, input.** The project MUST record hardware, OS, compiler, runtime/provider, driver, model digest, input corpus, warmup, repetitions, concurrency, and measurement method. The project MUST report distributions and percentiles where latency matters.
- **PERF-01.03 — Keep benchmark code, harnesses, datasets, and reports under /benchmarks.** The project MUST keep benchmark code, harnesses, datasets, and reports under /benchmarks. The project MUST also keep benchmarks out of production source and normal app startup.
- **PERF-01.04 — Compare results to a versioned baseline on the same.** The project MUST compare results to a versioned baseline on the same reference environment. The project MUST also define regression thresholds and investigate material regressions before release.
- **PERF-01.05 — Profile to locate a bottleneck before changing algorithms.** The project MUST profile to locate a bottleneck before changing algorithms or adding concurrency. The project MUST report both the achieved improvement and any resource/correctness tradeoff.

**Rule document:** [rules/01-benchmark-method-and-performance-claims.md](rules/01-benchmark-method-and-performance-claims.md)

**Enforcement:** [tests/test_01_benchmark_method_and_performance_claims.py](tests/test_01_benchmark_method_and_performance_claims.py)

**Prohibited conditions:**

- The project MUST NOT present a single best measurement as a production guarantee
- The project MUST NOT compare measurements from different hardware as equivalent
- The project MUST NOT add an optimization catch-all module or file; keep tuning with the owning component
### PERF-02 — Resource bounds and accelerator tuning

**Objective.** These controls govern **resource bounds and accelerator tuning**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** RP-010–RP-015, SO-032, PA-020–PA-021, ED-012

**Normative requirements:**

- **PERF-02.01 — Bound request concurrency, queue depth, batch size, model count.** The project MUST bound request concurrency, queue depth, batch size, model count, model memory, download size, temporary disk, and request execution time. Defaults MUST be safe on the minimum supported machine.
- **PERF-02.02 — Make tradeoffs between throughput, tail latency, memory, CPU load.** The project MUST make tradeoffs between throughput, tail latency, memory, CPU load, GPU utilization, energy use, and idle power explicit in profiles or configuration.
- **PERF-02.03 — Maintain a backend matrix for CPU, CUDA, Metal, Vulkan.** The project MUST maintain a backend matrix for CPU, CUDA, Metal, Vulkan, and AMD paths. Each claimed combination lists provider/runtime/driver versions, hardware, build flags, support level, and known limits.
- **PERF-02.04 — Backend selection MUST be observable and deterministic.** Backend selection MUST be observable and deterministic. Fallback MUST be allowed only when configured and MUST report why the requested provider was unavailable.
- **PERF-02.05 — Use load shedding and backpressure rather than allowing unbounded.** The project MUST use load shedding and backpressure rather than allowing unbounded queues. Overload has a documented client response, metric, and recovery condition.
- **PERF-02.06 — Preserve a CPU-only baseline and validate inference correctness on.** The project MUST preserve a CPU-only baseline and validate inference correctness on every advertised backend before performance tuning.

**Rule document:** [rules/02-resource-bounds-and-accelerator-tuning.md](rules/02-resource-bounds-and-accelerator-tuning.md)

**Enforcement:** [tests/test_02_resource_bounds_and_accelerator_tuning.py](tests/test_02_resource_bounds_and_accelerator_tuning.py)

**Prohibited conditions:**

- The project MUST NOT enable a backend because compile succeeded alone
- The project MUST NOT optimize average latency while hiding degraded tail latency or resource exhaustion
- The project MUST NOT sacrifice correctness or isolation to improve benchmark numbers
### PERF-03 — Resource budgets, startup, and idle behavior

**Objective.** This control defines the intended outcome for **resource budgets, startup, and idle behavior** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-010–RP-013, SO-032

**Normative requirements:**

- **PERF-03.01 — Each supported profile MUST declare startup time, steady-state….** **Requirement:** Each supported profile MUST declare startup time, steady-state and peak memory, CPU utilization, disk/cache growth, network behavior, and accelerator memory expectations for named workloads.
- **PERF-03.02 — User-visible latency MUST be decomposed into queue wait….** **Requirement:** User-visible latency MUST be decomposed into queue wait, preprocessing, model load, transfer, inference, postprocessing, and response delivery where the system can instrument those stages.
- **PERF-03.03 — Startup optimization MUST preserve integrity checks, configuration validation….** **Requirement:** Startup optimization MUST preserve integrity checks, configuration validation, and readiness semantics. Lazy initialization MUST expose loading state and bound the first-request penalty.
- **PERF-03.04 — Idle CPU/GPU power behavior MUST be measured on representative….** **Requirement:** Idle CPU/GPU power behavior MUST be measured on representative hardware after an explicit idle interval. Background polling, telemetry, model eviction, and keep-alive work MUST have documented intervals and operator controls.
- **PERF-03.05 — Memory admission MUST account for model weights, runtime….** **Requirement:** Memory admission MUST account for model weights, runtime workspace, activation/sequence growth, concurrent batches, allocator fragmentation, and transient model replacement overlap.
- **PERF-03.06 — Caching MUST define key identity, maximum size….** **Requirement:** Caching MUST define key identity, maximum size, eviction, invalidation, privacy boundaries, and disk persistence. Cache miss or corruption MUST not change correctness.
- **PERF-03.07 — Performance defaults MUST be chosen from measured workloads….** **Requirement:** Performance defaults MUST be chosen from measured workloads and remain overrideable within safe hard bounds; tuning changes MUST state throughput, latency, quality, memory, power, and portability tradeoffs.

**Rule document:** [rules/03-resource-budgets-startup-and-idle-behavior.md](rules/03-resource-budgets-startup-and-idle-behavior.md)

**Enforcement:** [tests/test_03_resource_budgets_startup_and_idle_behavior.py](tests/test_03_resource_budgets_startup_and_idle_behavior.py)

**Prohibited conditions:**

- Do not optimize one benchmark by disabling validation, observability, or safe resource bounds.
- Do not claim low idle use from a process that has not been measured after warm-up and device initialization.
### PERF-04 — Accelerator backends, compatibility, and fallback

**Objective.** This control defines the intended outcome for **accelerator backends, compatibility, and fallback** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-010–RP-015

**Normative requirements:**

- **PERF-04.01 — Each accelerator backend MUST publish a tested compatibility tuple….** **Requirement:** Each accelerator backend MUST publish a tested compatibility tuple covering hardware generation, OS/kernel, driver, runtime/provider, compiler/toolchain, model format, build feature, and precision modes.
- **PERF-04.02 — Capability discovery MUST report device identity, available memory….** **Requirement:** Capability discovery MUST report device identity, available memory, supported operations/precision, driver/runtime version, and rejection reason without requiring model execution or exposing unstable device secrets.
- **PERF-04.03 — Provider selection MUST be deterministic for a configured policy….** **Requirement:** Provider selection MUST be deterministic for a configured policy. Auto-selection MUST document priority, tie-breaking, and behavior when multiple devices or providers are present.
- **PERF-04.04 — Fallback to CPU or another provider MUST be explicit….** **Requirement:** Fallback to CPU or another provider MUST be explicit, observable, and validated for output correctness, numerical tolerance, performance expectations, and resource impact. Unsupported forced-provider requests MUST fail clearly.
- **PERF-04.05 — Backend initialization and runtime errors MUST identify whether….** **Requirement:** Backend initialization and runtime errors MUST identify whether the failure is transient, device-specific, model-specific, or unsupported; recovery MUST release partially initialized handles and not poison unrelated providers.
- **PERF-04.06 — Build profiles MUST exclude disabled accelerator dependencies and runtime….** **Requirement:** Build profiles MUST exclude disabled accelerator dependencies and runtime libraries. Binary packaging MUST include only legally redistributable libraries and state external driver/runtime prerequisites.
- **PERF-04.07 — Provider-specific optimizations MUST be gated by capability detection….** **Requirement:** Provider-specific optimizations MUST be gated by capability detection and have a correct baseline path; an optimization MUST not silently depend on undocumented hardware behavior.

**Rule document:** [rules/04-accelerator-backend-compatibility-and-fallback.md](rules/04-accelerator-backend-compatibility-and-fallback.md)

**Enforcement:** [tests/test_04_accelerator_backend_compatibility_and_fallback.py](tests/test_04_accelerator_backend_compatibility_and_fallback.py)

**Prohibited conditions:**

- Do not advertise Metal, CUDA, Vulkan, or AMD support based on successful compilation alone.
- Do not silently change precision, deterministic behavior, or fallback provider after a runtime error.
### PERF-05 — Throughput, latency, batching, and model quality

**Objective.** This control defines the intended outcome for **throughput, latency, batching, and model quality** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** RP-012–RP-013, ED-012

**Normative requirements:**

- **PERF-05.01 — Concurrency and batching policies MUST state maximum batch size….** **Requirement:** Concurrency and batching policies MUST state maximum batch size, queue deadline, batching delay, fairness, cancellation behavior, and interaction with memory limits.
- **PERF-05.02 — Batching MUST preserve request/response identity and ordering guarantees….** **Requirement:** Batching MUST preserve request/response identity and ordering guarantees. A cancellation or malformed request within a batch MUST not corrupt unrelated requests or silently discard completed results.
- **PERF-05.03 — Throughput claims MUST report sustained and burst workload….** **Requirement:** Throughput claims MUST report sustained and burst workload, request mix, concurrency, warm-up, provider, model digest, input size, precision, hardware, and error/drop rate.
- **PERF-05.04 — Latency claims MUST report distributions and tail percentiles separately….** **Requirement:** Latency claims MUST report distributions and tail percentiles separately for successful, rejected, and failed requests; averages alone MUST NOT support an interactive latency claim.
- **PERF-05.05 — Quantization, lower precision, kernel fusion….** **Requirement:** Quantization, lower precision, kernel fusion, and approximate execution MUST be evaluated for quality as well as speed using fixed model/task-specific acceptance metrics.
- **PERF-05.06 — Adaptive tuning MUST have bounded exploration, stable observability….** **Requirement:** Adaptive tuning MUST have bounded exploration, stable observability, operator override, and safe rollback. Online tuning MUST not change user-visible model quality or behavior without an explicit policy.
- **PERF-05.07 — Performance regression thresholds MUST account for variance and hardware….** **Requirement:** Performance regression thresholds MUST account for variance and hardware differences. A threshold breach MUST trigger investigation before release, not automatic dismissal as noise.

**Rule document:** [rules/05-throughput-latency-batching-and-model-quality.md](rules/05-throughput-latency-batching-and-model-quality.md)

**Enforcement:** [tests/test_05_throughput_latency_batching_and_model_quality.py](tests/test_05_throughput_latency_batching_and_model_quality.py)

**Prohibited conditions:**

- Do not compare different models or preprocessing paths as if the benchmark measured only a runtime backend.
- Do not permit one tenant/request class to monopolize accelerator queues without an approved priority policy.
### PERF-06 — Competitive performance and footprint

**Objective.** These controls govern competitive performance and footprint claims. The intended outcome is that Torviello earns "fastest and lightest" only inside a declared, reproducible envelope, and that release artifacts carry enforced budgets rather than aspirational marketing language.

**Requirements traced:** RP-016–RP-017, ED-012, PA-021–PA-022

**Normative requirements:**

- **PERF-06.01 — Declare the competitor set and claim envelope before measuring.** The project MUST name the competitors and pinned versions, hardware, operating system, runtime and driver, model digests, input distributions, batch and sequence lengths, precision, concurrency, and metric definitions before running a comparison. The project MUST state whether the claim is fastest, lightest, or parity and the allowed statistical margin. The project MUST NOT claim a universal ranking across all hardware, models, or workloads.
- **PERF-06.02 — Measure every contender through one harness and environment.** The project MUST use one versioned harness, identical warmup, repetitions, percentiles, telemetry, and isolation for every contender. The project MUST record failures, exclusions, and configuration differences. The project MUST NOT treat vendor-published numbers and locally measured numbers as equivalent without a documented reconciliation.
- **PERF-06.03 — Measure the full latency, throughput, and footprint vector.** The project MUST report p50, p95, and p99 latency; throughput at defined concurrency; peak RSS and VRAM; cold-start time; idle CPU and GPU cost; artifact size; and dependency count. The project MUST also verify output quality on the same workload so that speed cannot be purchased with incorrect or degraded results.
- **PERF-06.04 — Enforce footprint and performance budgets in CI.** The project MUST define numeric budgets for minimal-profile artifact size, cold start, idle RSS and CPU, peak memory at the reference workload, and regression tolerance. The project MUST fail the release gate when a budget or threshold is exceeded, and MUST keep the budgets in versioned configuration with an owner and review date.
- **PERF-06.05 — Publish reproducible evidence and requalify stale claims.** The project MUST publish the harness revision, commands, environment manifest, raw results, and analysis for every competitive claim. The project MUST re-run the comparison for each release and whenever a competitor, runtime, driver, or reference model changes. The project MUST retract or requalify a claim when its evidence is stale or no longer reproducible.
- **PERF-06.06 — Keep marketing and documentation aligned with evidence.** The project MUST link every public "fastest" or "lightest" statement to its evidence record and scope. The project MUST state conditions, caveats, and measurement date. The project MUST NOT imply superiority outside the tested envelope or omit losing results and material regressions.

**Rule document:** [rules/06-competitive-performance-and-footprint.md](rules/06-competitive-performance-and-footprint.md)

**Enforcement:** [tests/test_06_competitive_performance_and_footprint.py](tests/test_06_competitive_performance_and_footprint.py)

**Prohibited conditions:**

- The project MUST NOT claim "fastest" or "lightest" without a current, reproducible evidence record
- The project MUST NOT compare results across different hardware, precision, batch size, sequence length, or concurrency as equivalent
- The project MUST NOT include optional backends, models, datasets, telemetry, or hosted dependencies in the minimal CPU baseline
- The project MUST NOT weaken correctness, output quality, safety, or security to improve a benchmark result
- The project MUST NOT hide losing results, exclusions, regressions, or stale evidence

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/performance
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
