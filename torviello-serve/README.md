# torviello-serve

Model serving layer. Brand message: Serve models with predictable behavior.

Deployment and serving artifacts for this unit — container images, compose or
deploy manifests, environment and runtime configuration, monitoring dashboards
— live inside this unit, never at the repository root. See the root `README.md`
root-hygiene section and root `AGENTS.md`.

## Layout

- `domain/` — domain model, invariants, and ownership.
- `specifications/` — use cases, requirement IDs, and acceptance criteria.
- `contracts/` — machine-readable interfaces and event schemas.
- `src/` — production implementation.
- `tests/` — unit, contract, and integration tests.
- `evaluations/` — plans, datasets, reports, and release decisions.

## Validation

Run this unit's test categories from `tests/`, then record evaluation evidence in `evaluations/`. Follow `GOV-06` through `GOV-10` in `torviello-enforcer/governance/`.

## Status

Repository shape only. No implementation, contract, test, or evaluation evidence exists yet.
