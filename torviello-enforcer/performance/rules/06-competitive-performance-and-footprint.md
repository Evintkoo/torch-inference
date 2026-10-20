# Competitive performance and footprint

**Control family:** performance  
**Control document:** PERF-06  
**Requirement trace:** RP-016–RP-017, ED-012, PA-021–PA-022  
**Status:** Normative project control

## Control objective

These controls govern competitive performance and footprint claims. The intended outcome is that Torviello earns "fastest and lightest" only inside a declared, reproducible envelope, and that release artifacts carry enforced budgets rather than aspirational marketing language.

## Applicability

This control applies to every benchmark, performance or footprint claim, release artifact, dependency and feature selection, default configuration, and optimization that affects latency, throughput, memory, startup, idle cost, or artifact size. It applies to engine, serving, packaging, and evaluation work.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### PERF-06.01 — Declare the competitor set and claim envelope before measuring

The project MUST name the competitors and pinned versions, hardware, operating system, runtime and driver, model digests, input distributions, batch and sequence lengths, precision, concurrency, and metric definitions before running a comparison. The project MUST state whether the claim is fastest, lightest, or parity and the allowed statistical margin. The project MUST NOT claim a universal ranking across all hardware, models, or workloads.

### PERF-06.02 — Measure every contender through one harness and environment

The project MUST use one versioned harness, identical warmup, repetitions, percentiles, telemetry, and isolation for every contender. The project MUST record failures, exclusions, and configuration differences. The project MUST NOT treat vendor-published numbers and locally measured numbers as equivalent without a documented reconciliation.

### PERF-06.03 — Measure the full latency, throughput, and footprint vector

The project MUST report p50, p95, and p99 latency; throughput at defined concurrency; peak RSS and VRAM; cold-start time; idle CPU and GPU cost; artifact size; and dependency count. The project MUST also verify output quality on the same workload so that speed cannot be purchased with incorrect or degraded results.

### PERF-06.04 — Enforce footprint and performance budgets in CI

The project MUST define numeric budgets for minimal-profile artifact size, cold start, idle RSS and CPU, peak memory at the reference workload, and regression tolerance. The project MUST fail the release gate when a budget or threshold is exceeded, and MUST keep the budgets in versioned configuration with an owner and review date.

### PERF-06.05 — Publish reproducible evidence and requalify stale claims

The project MUST publish the harness revision, commands, environment manifest, raw results, and analysis for every competitive claim. The project MUST re-run the comparison for each release and whenever a competitor, runtime, driver, or reference model changes. The project MUST retract or requalify a claim when its evidence is stale or no longer reproducible.

### PERF-06.06 — Keep marketing and documentation aligned with evidence

The project MUST link every public "fastest" or "lightest" statement to its evidence record and scope. The project MUST state conditions, caveats, and measurement date. The project MUST NOT imply superiority outside the tested envelope or omit losing results and material regressions.

## Prohibited conditions

- The project MUST NOT claim "fastest" or "lightest" without a current, reproducible evidence record
- The project MUST NOT compare results across different hardware, precision, batch size, sequence length, or concurrency as equivalent
- The project MUST NOT include optional backends, models, datasets, telemetry, or hosted dependencies in the minimal CPU baseline
- The project MUST NOT weaken correctness, output quality, safety, or security to improve a benchmark result
- The project MUST NOT hide losing results, exclusions, regressions, or stale evidence

## Implementation guidance

Implementation MUST satisfy the applicable requirements at the boundary where the claim is made and the budget is enforced. A marketing page, a single best-case run, or a benchmark that bypasses the shipping configuration does not satisfy this control. Keep the harness, environment manifest, budgets, and published analysis in `torviello-bench/`; keep product defaults and feature gates in the owning unit.

## Assessment procedure

Assess both design and operation. Use the methods below and retain enough context for another reviewer to reproduce the determination.

### Examine

- Inspect the harness, environment manifest, competitor versions, reference workloads, budget configuration, CI gate, release notes, and public claims.
- Confirm every claim maps to a dated evidence record and every budget has an owner, threshold, and regression policy.

### Interview

- When a claim depends on an external competitor or vendor configuration, interview the accountable benchmark owner and confirm the contender was configured fairly and the evidence is reproducible.
- An interview alone does not establish a performance or footprint result.

### Test

- Re-run the reference comparison from the recorded commands and environment; confirm the reported percentiles, throughput, memory, startup, idle cost, and artifact size within the stated tolerance.
- Confirm that exceeding a budget fails the release gate, and that a degraded-quality configuration is rejected rather than counted as a win.
- Record the command or procedure, tested revision and environment, result, and any limitation. A skipped check is not passing evidence.

## Assessment determination

A control document passes only when every applicable MUST requirement is implemented and supported by current evidence, each applicable SHOULD deviation has a documented rationale, and no unapproved or expired exception remains. A requirement fails when implementation is absent, behavior contradicts the requirement, evidence is missing or stale, or the assessment cannot reproduce the claimed result. Record **pass**, **fail**, or **not applicable** per control ID; "not applicable" requires a stated condition and reviewer rationale.

## Required evidence

- The competitor set, pinned versions, hardware and runtime manifest, reference workload definitions, and claim envelope.
- Harness source and revision, raw measurements, percentile analysis, quality check, and reproduction commands.
- Budget configuration, CI gate output, regression reports, and the dated public claim with its scope and caveats.
- A recorded exception with owner, rationale, compensating measures, approval, and expiry when a budget or claim cannot be met.

## Exceptions and nonconformance

A deviation from a MUST requirement requires explicit approval from the accountable product or engineering owner before release. The exception record MUST identify affected controls, scope, risk, compensating measures, remediation owner, and expiry or review date. A SHOULD deviation MUST include a rationale and impact in the change record. Unapproved or expired deviations are nonconformances and MUST block the affected release when the requirement is release-critical. A competitive claim without current evidence is a nonconformance and MUST be removed or qualified.

## Reference trail

R1 defines benchmark instrumentation and R3 defines accelerator measurement practice; the requirement mapping and additional sources are in [00-references-trails.md](../trails/00-references-trails.md).
