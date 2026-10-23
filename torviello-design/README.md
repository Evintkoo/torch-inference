# torviello-design

Brand identity, design tokens, UI components, and visual assets. Brand message: A precise, infrastructure-grade visual system.

## Layout

- `domain/` — domain model, invariants, and ownership.
- `specifications/` — use cases, requirement IDs, and acceptance criteria.
- `contracts/` — machine-readable interfaces and event schemas.
- `src/` — production implementation.
- `tests/` — unit, contract, and integration tests.
- `evaluations/` — plans, datasets, reports, and release decisions.
- `brand/` — approved brand board (`reference-board.png`) and brand assets
  (`logo-mark.svg` — vector interpretation of the board logo).

## Packaging

Per [GOV-12](../torviello-enforcer/governance/rules/12-independent-unit-packaging.md), this unit is packageable as an independent, versioned artifact (design-token and UI-component package); its packaging manifest, version, and build command live inside this unit, never at the repository root. Status: shape only — no packaging manifest or package evidence exists yet.

## Validation

Run this unit's test categories from `tests/`, then record evaluation evidence in `evaluations/`. Follow `GOV-06` through `GOV-10` in `torviello-enforcer/governance/`.

## Status

Active: the brand board, the design-token contract with parity and contrast
tests, the landing functional design, and the slice-one design sheets exist.
The landing implementation lives in torviello-landing.
