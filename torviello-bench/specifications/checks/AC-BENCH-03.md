# AC-BENCH-03 — Published results report latency percentiles, throughput, peak RSS/VRAM, cold start, idle cost, and artifact size with reproduction commands.

**Check ID:** AC-BENCH-03  
**Requirement:** RP-016  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

## 1. Requirement

### RP-016 — The engine shall substantiate any "fastest" claim against a declared competitor set, on identical hardware and workloads, for latency, throughput, memory, startup, idle cost, and artifact size

**Priority:** MUST  
**Requirement document:** [RP-016](../../../torviello-enforcer/requirements/items/RP-016.md)

The engine shall substantiate any "fastest" claim against a declared competitor set, on identical hardware and workloads, for latency, throughput, memory, startup, idle cost, and artifact size.

**Acceptance:** A dated evidence record names competitors and versions, hardware, OS, runtime/driver, model digests, input corpus, batch/sequence, precision, concurrency, metric definitions, and allowed margin; the same harness measures every contender; public claims state the tested envelope and are retracted or requalified when stale.


## 2. Observable check

Published results report latency percentiles, throughput, peak RSS/VRAM, cold start, idle cost, and artifact size with reproduction commands.

The check is satisfied only when the result is produced by the shipping configuration and is reproducible from the recorded procedure. A debug-only path, a unit-test double, or a documentation statement does not satisfy it.

## 3. Feature scenarios

Background shared by the scenarios:

```gherkin
Given a versioned competitor set and reference hardware manifest
    And the minimal CPU profile for the release under test
```

#### Claim only inside the tested envelope

```gherkin
Given every contender runs through the same harness and environment
    When the reference workload completes at the declared concurrency
    Then results report p50, p95, and p99 latency, throughput, peak memory, cold start, idle cost, and artifact size
    And any "fastest" or "lightest" claim states the tested models, hardware, precision, batch, and date
```

#### Fail the release when a footprint budget regresses

```gherkin
Given a budget for minimal-profile artifact size, cold start, idle RSS, and peak memory
    When a release exceeds a budget or its regression tolerance
    Then the release gate fails
    And the regression is reported with the measured and budgeted values
```

#### Reject a speedup that degrades output quality

```gherkin
Given a configuration that improves latency by reducing output quality or correctness
    When the benchmark quality check runs on the same workload
    Then the result is rejected as non-comparable
    And it is not published as a performance win
```

#### Retract a stale competitive claim

```gherkin
Given a published claim whose evidence predates the current competitor or runtime version
    When the claim is reviewed for release
    Then the claim is retracted or requalified with a new measured result
    And the evidence record states the reason for the change
```

#### Compare vendor numbers only with a documented reconciliation

```gherkin
Given a competitor publishes vendor benchmark numbers
    When those numbers are cited alongside local measurements
    Then the evidence records the environment and methodology differences
    And no equivalence is asserted without a reconciliation run
```


## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| PERF-06 | Competitive performance and footprint | [06-competitive-performance-and-footprint.md](../../../torviello-enforcer/performance/rules/06-competitive-performance-and-footprint.md) |

#### PERF-06.01 — Declare the competitor set and claim envelope before measuring

The project MUST name the competitors and pinned versions, hardware, operating system, runtime and driver, model digests, input distributions, batch and sequence lengths, precision, concurrency, and metric definitions before running a comparison. The project MUST state whether the claim is fastest, lightest, or parity and the allowed statistical margin. The project MUST NOT claim a universal ranking across all hardware, models, or workloads.

#### PERF-06.02 — Measure every contender through one harness and environment

The project MUST use one versioned harness, identical warmup, repetitions, percentiles, telemetry, and isolation for every contender. The project MUST record failures, exclusions, and configuration differences. The project MUST NOT treat vendor-published numbers and locally measured numbers as equivalent without a documented reconciliation.

#### PERF-06.03 — Measure the full latency, throughput, and footprint vector

The project MUST report p50, p95, and p99 latency; throughput at defined concurrency; peak RSS and VRAM; cold-start time; idle CPU and GPU cost; artifact size; and dependency count. The project MUST also verify output quality on the same workload so that speed cannot be purchased with incorrect or degraded results.

#### PERF-06.04 — Enforce footprint and performance budgets in CI

The project MUST define numeric budgets for minimal-profile artifact size, cold start, idle RSS and CPU, peak memory at the reference workload, and regression tolerance. The project MUST fail the release gate when a budget or threshold is exceeded, and MUST keep the budgets in versioned configuration with an owner and review date.

#### PERF-06.05 — Publish reproducible evidence and requalify stale claims

The project MUST publish the harness revision, commands, environment manifest, raw results, and analysis for every competitive claim. The project MUST re-run the comparison for each release and whenever a competitor, runtime, driver, or reference model changes. The project MUST retract or requalify a claim when its evidence is stale or no longer reproducible.

#### PERF-06.06 — Keep marketing and documentation aligned with evidence

The project MUST link every public "fastest" or "lightest" statement to its evidence record and scope. The project MUST state conditions, caveats, and measurement date. The project MUST NOT imply superiority outside the tested envelope or omit losing results and material regressions.

## 5. Prohibited conditions

- [PERF-06] The project MUST NOT claim "fastest" or "lightest" without a current, reproducible evidence record
- [PERF-06] The project MUST NOT compare results across different hardware, precision, batch size, sequence length, or concurrency as equivalent
- [PERF-06] The project MUST NOT include optional backends, models, datasets, telemetry, or hosted dependencies in the minimal CPU baseline
- [PERF-06] The project MUST NOT weaken correctness, output quality, safety, or security to improve a benchmark result
- [PERF-06] The project MUST NOT hide losing results, exclusions, regressions, or stale evidence

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

## 8. Fail criteria

- The observable result is absent, contradictory, or not reproducible.
- The check passes only through a debug path, test double, or non-shipping configuration.
- A required negative or boundary case is untested, skipped, or bypassed.
- A prohibited condition occurs.
- Evidence is stale or the implementation changed without re-running the check.
- An exception is unapproved, expired, or missing compensating measures.

## 9. Required evidence

- The command, procedure, or inspection that exercises the check, including its environment and revision.
- The observed result required by section 2.
- The result of each applicable negative or boundary case.
- A link from the change, evaluation, or assurance record to that evidence.
- For an unmet check: an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

- [PERF-06] The competitor set, pinned versions, hardware and runtime manifest, reference workload definitions, and claim envelope.
- [PERF-06] Harness source and revision, raw measurements, percentile analysis, quality check, and reproduction commands.
- [PERF-06] Budget configuration, CI gate output, regression reports, and the dated public claim with its scope and caveats.
- [PERF-06] A recorded exception with owner, rationale, compensating measures, approval, and expiry when a budget or claim cannot be met.

## 10. Related checks

- [AC-BENCH-01](./AC-BENCH-01.md)
- [AC-BENCH-02](./AC-BENCH-02.md)
- [AC-BENCH-06](./AC-BENCH-06.md)
- [AC-BENCH-07](./AC-BENCH-07.md)

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [RP-016](../../../torviello-enforcer/requirements/items/RP-016.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Rule controls | PERF-06 |
| Unit | torviello-bench |

## 12. Change control

Update this check in the same change as its requirement, rule control, or acceptance criteria. Do not weaken the observable result, a scenario, or an evidence requirement to make an implementation pass.
