# torviello-landing/tests/integration

Part of **torviello-landing** — Public landing page and marketing site. Brand message: The execution layer for AI.

## Purpose

Integration and end-to-end behavior tests.

## Expected contents

Tests that exercise real adapters, processes, or deployment boundaries.

## Validation

Prerequisites are documented and the environment is reported with results.

## Status

Active — the deployment integration suite lives here: `deploy-script.test.ts`
(22 hermetic tests: contract cross-check, deploy happy path, dry-run purity,
edge cases E1–E10, verified rollback, retention). Verified 2026-11-09 on
ticket [0043](../../../torviello-roles/tickets/0043-integrate-landing-page-deployment-to-the-oracle-server.md);
run with `bun test tests/integration` from the unit root.
