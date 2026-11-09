+++
id = "0044"
title = "Replace landing deploy tooling with Bun TypeScript, ban committed shell scripts, and add the CI deploy workflow"
status = "review"
priority = "P1"
owner = "engineer"
created = "2026-11-09"
updated = "2026-11-09"
requirements = ["ED-022", "SO-031", "PDL-013", "PDL-014"]
controls = ["GOV-02", "GOV-07", "GOV-08", "GOV-09", "GOV-10", "GOV-11", "GOV-12", "GOV-13"]
depends_on = ["0043"]
labels = ["deployment", "landing", "governance", "ci"]
+++
## Outcome

the repository contains no committed shell script files: a new normative control GOV-13 prohibits committed .sh/.bash/.zsh files and shell-shebang script files repo-wide with an automated conformance check, the landing deploy kit is reimplemented as TypeScript executed by Bun (deploy/deploy.ts) behind the unchanged deployment contract (bumped to v1.1.0 for the invocation change), and a GitHub Actions deploy-landing workflow builds the site and runs the same deploy tooling with repository secrets so the owner can deploy and roll back from CI

## Acceptance

- [ ] GOV-13 rule document follows the control structure (objective
- [ ] applicability
- [ ] numbered requirements
- [ ] prohibited conditions
- [ ] assessment
- [ ] pass/fail
- [ ] evidence
- [ ] exception process) and records the owner direction of 2026-11-09 with ED-022 as the requirement trace
- [ ] the governance trail maps the new document to a source row and ED-022
- [ ] and uv run pytest torviello-enforcer/governance passes including the regenerated test_13 and trail tests
- [ ] the generator gains a no_shell_scripts bundle that fails on any committed .sh/.bash/.zsh file or shell-shebang script outside excluded paths
- [ ] wired to governance rule 13 in OVERRIDES
- [ ] torviello-landing/deploy/deploy.sh is deleted in the same change that lands GOV-13 and replaced by deploy/deploy.ts with identical interface semantics: commands deploy/rollback
- [ ] flags
- [ ] environment variables
- [ ] exit codes 0/2/3/4/5/6/7
- [ ] remote layout
- [ ] release id format
- [ ] and the TORVIELLO_RELEASE_OK verification marker
- [ ] the deployment contract is versioned to 1.1.0 with a compatibility note stating only the invocation changed (bash deploy.sh to bun deploy/deploy.ts) and the integration suite still cross-checks script against contract
- [ ] the integration tests are updated to the new invocation and observed failing before deploy.ts exists
- [ ] then passing after (GOV-09 order recorded in the ticket log)
- [ ] a real dry run of deploy.ts against the real build output and a fake remote root exits 0 with a full transcript and zero remote mutation
- [ ] recorded as evaluation evidence
- [ ] the deploy-landing workflow builds the landing site and invokes the unit deploy tooling with secrets LANDING_DEPLOY_HOST and LANDING_DEPLOY_SSH_KEY
- [ ] triggers on workflow_dispatch and on pushes to main touching torviello-landing
- [ ] uses a concurrency group
- [ ] and fails with actionable guidance when secrets are missing
- [ ] root-level workflow files stay thin invokers: all deployment manifests
- [ ] tooling
- [ ] and server configuration remain inside torviello-landing per GOV-12.04
- [ ] and the workflow file exception is recorded on this ticket as an owner decision
- [ ] root AGENTS.md and the deploy and unit READMEs and server-setup.md document the new invocation
- [ ] the CI secrets the owner must configure
- [ ] and the CI deploy key enrollment step
- [ ] uv run --locked pytest torviello-enforcer/governance torviello-roles and uv run --directory torviello-roles python -m torviello_roles check pass; uv run ruff check . shows no new findings beyond the pre-existing baseline

## Log

- 2026-11-09 — created
- 2026-11-09 — owner direction 2026-11-09: 'i think u can set those up for me tho, and ow i dont want any sh please add that to rules' - the owner asked for the CI deploy workflow to be set up and directed that the repository contain no shell scripts, with the preference added to the governance rules; scope agreed: GOV-13 control (no committed .sh/.bash/.zsh or shell-shebang script files, automated check), migration of torviello-landing/deploy/deploy.sh to deploy/deploy.ts behind the unchanged contract (v1.1.0), and a thin deploy-landing workflow invoker at .github/workflows while all deployment tooling stays inside the unit (GOV-12.04) - the workflow-file-at-root exception is recorded here as the owner decision
- 2026-11-09 — started
- 2026-11-09 — RED first (GOV-09): contract bumped to v1.1.0 (invocation change only, compatibility note recorded per GOV-08.03), deploy.sh removed via git rm, integration suite switched to spawn the real Bun binary on deploy/deploy.ts; cd torviello-landing && bun test tests/integration = 1 pass / 21 fail with deploy.ts absent - failures are the missing implementation
- 2026-11-09 — GREEN (GOV-09): bun test tests/integration = 22 pass / 0 fail (99 assertions) against deploy.ts; defects caught and fixed during the cycle: (1) dependency probes by spawning ssh --version polluted the hermetic invocation log - replaced with Bun.which PATH probes that execute nothing; (2) the TS port swallowed rsync stdout in spawnSync so the dry-run transcript vanished - rsync calls now stdio inherit while verification/flip ssh calls stay captured. Real dry run (AC): release 20261109153919-5b4ff7f with full build, exit 0, 44 itemized files, fake remote root 0 entries. Governance: GOV-13 rule document written with owner direction 2026-11-09 and ED-022 trace; generator gained the no_shell_scripts bundle (suffix scan + shell-shebang scan) wired to governance rule 13; tests regenerated; adverse case verified - a tracked scratch .sh makes test_13 fail, removing it passes; trail adds R7 source and the rule-mapping row; root AGENTS.md carries the GOV-13 clause. Regression battery: uv run --locked pytest torviello-enforcer/governance torviello-roles = 37 passed; web bun test src 90/0, interaction 7/0, typecheck clean; deploy-landing.yml YAML-validated (same parser behavior as ci.yml); ruff = the 5 pre-existing findings only; torviello_roles check ok 44 tickets. Governance artifacts land in the commit immediately following the landing rework so every revision stays green. Evaluation report: evaluations/reports/2026-11-09-landing-deploy-tooling-rework.md. Limitations: no live CI run yet (VM + secrets pending with the owner); deploy.ts verified by the integration suite, not a dedicated tsc pass
- 2026-11-09 — status -> review
