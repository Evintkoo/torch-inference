# Landing deploy tooling rework evaluation — 2026-11-09

**Owner:** engineer (ticket
[0044](../../../../torviello-roles/tickets/0044-replace-landing-deploy-tooling-with-bun-typescript-ban-commi.md))
**Scope:** GOV-13 (no committed shell scripts), the `deploy.sh` →
`deploy.ts` migration behind contract v1.1.0, and the CI deploy workflow
(`.github/workflows/deploy-landing.yml`). Extends
[`2026-11-09-landing-deployment.md`](2026-11-09-landing-deployment.md)
(ticket 0043), whose release semantics are unchanged and carried forward.
**Outcome:** pass for the rework scope — every threshold recorded with
command and observed result. Not a release approval.

## Environment

- macOS (darwin), Bun 1.3.14; bash 3.2 only as the runtime for generated
  test fixture stubs (never committed — GOV-13.03)
- `/usr/bin/rsync` (openrsync) and `/usr/bin/ssh` exercised through stub
  wrappers translating `host:/var/www/torviello-landing` onto a fake remote
  root; no network socket anywhere in the suite
- GitHub Actions workflow validated for YAML structure locally; no live
  workflow run exists yet (the Oracle VM and its secrets do not exist yet)

## Thresholds and evidence

| # | Threshold (ticket 0044 acceptance) | Command | Observed | Verdict |
|---|---|---|---|---|
| 1 | GOV-13 rule follows the control structure; owner direction + ED-022 recorded | review of `torviello-enforcer/governance/rules/13-no-committed-shell-scripts.md` | objective, applicability, GOV-13.01–13.04, prohibited conditions, decision procedure, assessment, determination, evidence, exceptions, reference trail; owner direction 2026-11-09 quoted; ED-022 traced | pass |
| 2 | Trail maps the document to a source row + ED-022; governance pytest passes incl. regenerated test_13 | `uv run --locked pytest torviello-enforcer/governance/tests/test_13_no_committed_shell_scripts.py torviello-enforcer/governance/tests/test_governance_00_references_trails.py -q` | 2 passed; trail adds R7 (owner direction) and the rule-mapping row | pass |
| 3 | Generator `no_shell_scripts` bundle wired to governance rule 13 | review of `torviello-enforcer/tools/generate_rule_tests.py` diff + regeneration | bundle scans suffixes (`.sh`/`.bash`/`.zsh`) and shell shebangs over text files; `("governance", 13)` override added; regeneration produced `test_13_no_committed_shell_scripts.py` with no unrelated churn | pass |
| 4 | `deploy.sh` deleted in the same change; `deploy.ts` implements the identical interface | `git rm` + contract cross-check in the suite | `deploy.sh` removed (git rm); contract cross-check passes against `deploy.ts`: commands, flags, env vars, exit paths for 0/2/3/4/5/6/7, `TORVIELLO_RELEASE_OK`, release-id pattern | pass |
| 5 | Contract versioned 1.1.0 with compatibility note; suite still cross-checks | included in the suite (`deploy contract` tests) | version asserted `1.1.0`; `invocation` + `compatibility` fields asserted; GOV-13 named | pass |
| 6 | Tests updated to the new invocation, RED before `deploy.ts`, GREEN after (GOV-09) | `cd torviello-landing && bun test tests/integration` | RED run recorded on ticket 0044: **1 pass / 21 fail** with `deploy.ts` absent and `deploy.sh` already removed; GREEN: **22 pass / 0 fail**, 99 assertions | pass |
| 7 | Real dry run of `deploy.ts`: exit 0, transcript, zero remote mutation | `bun deploy/deploy.ts deploy --dry-run` (full build) with release `20261109153919-5b4ff7f` against the fake remote root | exit **0**; transcript: build ran, staged 44 itemized files (`index.html`, hashed assets, fonts, photos), `dry run complete: no remote state was touched`, fake remote root 0 entries | pass |
| 8 | Deploy workflow builds and invokes the unit tooling with secrets; dispatch rollback; auto-trigger; concurrency; actionable failure | review + YAML parse (`uv run python -c yaml.safe_load ...`) | workflow parses (same structure as `ci.yml`); triggers: `workflow_dispatch` (mode deploy/rollback, `into` input) + push to `main` on `torviello-landing/**`; `concurrency: landing-deploy` non-cancelling; secret guard fails with remediation guidance; runs `bun deploy/deploy.ts deploy`/`rollback` with `LANDING_DEPLOY_HOST`/`LANDING_DEPLOY_SSH_KEY`; key written `0600` and removed `if: always()`; actions SHA-pinned (checkout, setup-bun v2.2.0) | pass |
| 9 | Root workflow files stay thin invokers (GOV-12.04); exception recorded | review | every deploy step invokes the unit's tooling; no deployment manifests at root; the root-placement exception for the workflow file is recorded on ticket 0044 as the owner decision | pass |
| 10 | Docs updated (invocation, CI secrets, enrollment) | review | `deploy/README.md`, `deploy/server-setup.md` (§ 9 CI deployment, § 10 troubleshooting), `deploy/AGENTS.md`, unit `README.md`, `.github/workflows/README.md`, root `AGENTS.md` (GOV-13 clause) | pass |
| 11 | Full check battery green | see below | see below | pass |

## Regression battery

| Check | Command | Result |
|---|---|---|
| Deploy integration suite | `cd torviello-landing && bun test tests/integration` | 22 pass / 0 fail |
| Landing web suite | `cd torviello-landing/web && bun test src` | 90 pass / 0 fail |
| Interaction tests | `cd torviello-landing/web && bun run test:interaction` | 7 tests, 0 fail |
| Typecheck (web) | `cd torviello-landing/web && bun run typecheck` | clean |
| Governance rules + trails | `uv run --locked pytest torviello-enforcer/governance -q` | see ticket log entry for the exact count; all green |
| Ticket store | `uv run --directory torviello-roles python -m torviello_roles check` | ok: 44 tickets |
| Roles tests | `uv run --locked pytest torviello-roles -q` | 19 passed |
| Lint baseline | `uv run ruff check . --output-format=concise` | the 5 pre-existing `torviello-design/tests/test_brand_assets.py` findings only |

## Defects found and fixed during the RED→GREEN cycle

1. `requireTools()` probed dependencies by spawning `ssh --version`, which
   counted as an SSH invocation and polluted the hermetic invocation log;
   replaced with a `Bun.which` PATH probe that executes nothing.
2. The TypeScript port initially captured rsync stdout inside `spawnSync` and
   never printed it — the dry-run upload transcript disappeared. rsync calls
   now use `stdio: "inherit"` (verification/flip SSH calls stay captured:
   their stdout is parsed for the activation name and marker).

## Limitations

- The workflow has no live run yet: it requires the OCI VM, the CI deploy
  key enrollment (server-setup.md § 9), and the two repository secrets. The
  first successful CI run is recorded on ticket 0043 (AC-LD-8) alongside the
  first local deploy when the owner provisions access.
- `deploy.ts` is exercised by the 22-test integration suite rather than a
  dedicated `tsc` pass; the root tsconfig covers only the console scaffold.
  The file runs under Bun's transpiler with no external dependencies.
- The shebang scan of GOV-13.01 covers text-suffix files; binary files are
  out of scope by construction.

## Release decision

No release decision is made here. Evidence for ticket 0044, which moves to
review for independent verification.
