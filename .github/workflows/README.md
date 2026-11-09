# Workflows

Continuous integration and release workflows for the repository and its units.

## Contents

- `ci.yml` — rules-corpus and repository checks.
- `release.yml` — release publishing.
- `triage.yml` — issue triage.
- `deploy-landing.yml` — deploys the landing site by running the unit's own
  tooling (`torviello-landing/deploy/deploy.ts`) with repository secrets
  (`LANDING_DEPLOY_HOST`, `LANDING_DEPLOY_SSH_KEY`); manual dispatch supports
  `deploy` and `rollback` modes, and pushes to `main` touching
  `torviello-landing/**` deploy automatically. Setup runbook:
  `torviello-landing/deploy/server-setup.md`.

## Validation

Workflow syntax is checked by the repository's workflow linter before merge.
