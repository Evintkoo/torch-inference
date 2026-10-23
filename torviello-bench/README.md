# torviello-bench

Performance benchmarking. Brand message: Measure execution without unsupported claims.

## Layout

- `domain/` — domain model, invariants, and ownership.
- `specifications/` — use cases, requirement IDs, and acceptance criteria.
- `contracts/` — machine-readable interfaces and event schemas.
- `src/` — production implementation.
- `tests/` — unit, contract, and integration tests.
- `evaluations/` — plans, datasets, reports, and release decisions.

## Packaging

Per [GOV-12](../torviello-enforcer/governance/rules/12-independent-unit-packaging.md), this unit is packageable as an independent, versioned artifact (benchmark harness distribution); its packaging manifest, version, and build command live inside this unit, never at the repository root. Status: shape only — no packaging manifest or package evidence exists yet.

## Validation

The CPU classifier harness lives in `benchmarks/classify_bench.py`; run `just bench`
from the repository root. Record dated evidence in `evaluations/` and follow
`GOV-06` through `GOV-10` in `torviello-enforcer/governance/`.

## Status

The CPU `engine-demo-torchscript` benchmark and three clean-revision reports exist
in `evaluations/reports/2026-10-22-classify-cpu/`. Competitor, GPU, and other
reference-workload coverage is not implemented. Other unit directories remain
repository shape only.
