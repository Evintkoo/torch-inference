# Workflows

Continuous integration and release workflows for the repository and its units.

## Contents

- `ci.yml` — rules-corpus and repository checks.
- `release.yml` — release publishing.
- `triage.yml` — issue triage.
- `deploy-landing.yml` — two jobs: `publish-pages` publishes the built
  landing site to GitHub Pages on every push to `main` touching
  `torviello-landing/**` (live at
  https://evintkoo.github.io/torch-inference/), and `landing-deploy` runs the
  unit's SSH deploy tooling (`torviello-landing/deploy/deploy.ts`) against
  the Oracle VM with repository secrets (`LANDING_DEPLOY_HOST`,
  `LANDING_DEPLOY_SSH_KEY`) once provisioned — manual dispatch supports
  `deploy` and `rollback` modes. Setup runbook:
  `torviello-landing/deploy/server-setup.md`.

## Validation

Workflow syntax is checked by the repository's workflow linter before merge.
