# torviello-media

Product demo and marketing video production. Brand message: Show real behavior, not simulated capability.

All media, brand, and demo artifacts live in this unit — never at the
repository root. See the root `README.md` root-hygiene section and root
`AGENTS.md`.

## Layout

- `assets/landing/` — generated photography for the landing showcase cards,
  imported by `torviello-landing/web` through the `@torviello/media` alias
  (GOV-12.07 pattern: import from the owning unit, never copy); provenance in
  [assets/landing/README.md](assets/landing/README.md).
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

Partial. The unit owns its first artifacts: the generated landing showcase
photography under `assets/landing/` (ticket 0038, AI-generated for this
project — no stock licensing constraints). No implementation, contract, test,
or evaluation evidence exists yet beyond the asset provenance record.
