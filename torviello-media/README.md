# torviello-media

Product demo and marketing video production. Brand message: Show real behavior, not simulated capability.

All media, brand, and demo artifacts live in this unit — never at the
repository root. See the root `README.md` root-hygiene section and root
`AGENTS.md`.

## Layout

- `domain/` — domain model, invariants, and ownership.
- `specifications/` — use cases, requirement IDs, and acceptance criteria.
- `contracts/` — machine-readable interfaces and event schemas.
- `src/` — production implementation.
- `tests/` — unit, contract, and integration tests.
- `evaluations/` — plans, datasets, reports, and release decisions.

## Packaging

Per [GOV-12](../torviello-enforcer/governance/rules/12-independent-unit-packaging.md), this unit is packageable as an independent, versioned artifact (produced media asset bundle); its packaging manifest, version, and build command live inside this unit, never at the repository root. Status: shape only — no packaging manifest or package evidence exists yet.

## Validation

Run this unit's test categories from `tests/`, then record evaluation evidence in `evaluations/`. Follow `GOV-06` through `GOV-10` in `torviello-enforcer/governance/`.

## Status

Repository shape only. No implementation, contract, test, or evaluation evidence exists yet.
