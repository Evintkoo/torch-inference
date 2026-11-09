# Landing deployment evaluation — 2026-11-09

**Owner:** engineer (ticket [0043](../../../../torviello-roles/tickets/0043-integrate-landing-page-deployment-to-the-oracle-server.md))
**Scope:** torviello-landing deployment integration (LD-01…LD-08,
AC-LD-1…8 of
[`specifications/landing-deployment.md`](../../specifications/landing-deployment.md);
contract v1.0.0 of
[`contracts/deployment/deploy-contract.json`](../../contracts/deployment/deploy-contract.json))
— the deploy kit in `deploy/` (`deploy.sh`, `Caddyfile`,
`server-setup.md`) with hermetic integration tests and a real dry-run
transcript.
**Outcome:** pass for the integration scope — every threshold in AC-LD-1
through AC-LD-7 recorded with command and observed result. This is not a
release approval. AC-LD-8 (first real deployment against the Oracle VM) is
deferred and blocked on owner SSH access.

## Environment

- macOS (darwin), Bun 1.3.14, Vite 8, bash 3.2 (test child) and zsh (session)
- `/usr/bin/rsync` (openrsync) and `/usr/bin/ssh` exercised through stub
  wrappers that translate `host:/var/www/torviello-landing` onto a fake
  remote root; no network socket is opened anywhere in the suite
- Deploy target facts recorded from the owner 2026-11-09: Oracle Cloud VM
  exists, SSH access not yet provisioned; rsync + nginx/Caddy chosen; domain
  points at the server; HTTP only now, TLS later

## Thresholds and evidence

| # | Threshold (spec AC) | Command | Observed | Verdict |
|---|---|---|---|---|
| AC-LD-1 | Hermetic suite covers E1–E10 + LD-01/03/04 happy path | `cd torviello-landing && bun test tests/integration` | **22 pass / 0 fail**, 96 assertions; cases: contract cross-check, verified publish + atomic activation, dry-run purity (no SSH at all), E1 missing host (2), E2 missing deps (3), E3 build failure (4, remote untouched), E4 missing dist (7), E5 failed remote verification (5, `current` untouched, failed release kept), E6 no rollback candidate (6), E7 unknown `--into` (6), E8 `nogit` suffix, E10 unsafe webroot/id (2), retention keep=3 prunes 2 spares active, `--keep 0` disables pruning | pass |
| AC-LD-2 | RED before implementation, GREEN after (GOV-09) | same suite at both points | RED run recorded on ticket 0043: **1 pass / 21 fail** with `deploy.sh` absent (failures were the missing implementation); GREEN run: **22 pass / 0 fail** | pass |
| AC-LD-3 | Contract validated and cross-checked against the script | included in the suite (`deploy contract` tests) | contract parses, all sections present (commands/flags/env/exit codes 0,2,3,4,5,6,7/layout/marker/pattern); every command, flag, env var, exit path, `TORVIELLO_RELEASE_OK`, and the release-id pattern found in `deploy.sh` | pass |
| AC-LD-4 | Real dry run against the real build output, zero remote mutation | `web: bun run build`, then `deploy.sh deploy --dry-run --skip-build` with release `20261109151852-e21d0da` against a fake remote root | exit **0**; transcript: staged 45 files with `SHA256SUMS` (local integrity gate passed), rsync `--itemize-changes` listed `index.html`, all hashed assets, fonts, photos; final line `dry run complete: no remote state was touched`; fake remote root still **0 entries**; no SSH command executed | pass |
| AC-LD-5 | This report exists with per-threshold verdicts | — | this document | pass |
| AC-LD-6 | Deploy/rollback documented; packaging section names the deployment artifact | — | `deploy/README.md` (commands, env vars, exit codes, remote layout, validation), `deploy/server-setup.md` (OCI runbook incl. TLS upgrade), unit `README.md` layout + packaging sections updated | pass |
| AC-LD-7 | No secrets/hosts/IPs/keys committed | `grep` over added files | host values only ever appear as `LANDING_DEPLOY_HOST`/`--host`; the only domain in the tree is the placeholder `landing.example` in `Caddyfile` and `server-setup.md` render examples; no IP, key, or credential anywhere | pass |
| AC-LD-8 | First real deployment recorded with release id + verification output | **not runnable** — Oracle VM SSH access not provisioned | deferred, blocked on owner (runbook ready: `deploy/server-setup.md`) | deferred |

## Regression battery

| Check | Command | Result |
|---|---|---|
| Landing web suite | `cd torviello-landing/web && bun test src` | 90 pass / 0 fail |
| Interaction tests | `cd torviello-landing/web && bun run test:interaction` | 7 tests, 0 fail |
| Typecheck | `cd torviello-landing/web && bun run typecheck` | clean |
| Production build (deploy input) | `cd torviello-landing/web && bun run build` | green, 487 ms |
| Ticket store | `uv run --directory torviello-roles python -m torviello_roles check` | ok: 43 tickets |
| Roles tests | `uv run --locked pytest torviello-roles -q` | 19 passed |
| Lint baseline | `uv run ruff check . --output-format=concise` | the 5 pre-existing `torviello-design/tests/test_brand_assets.py` findings (B905 ×2, S603 ×2, S607) — no new findings |

## Defects found and fixed during the RED→GREEN cycle

1. Environment-variable prefixes (`VAR=x ssh host`) do not reach the remote
   command; remote scripts now inline strictly validated values.
2. `mv` without `-T` follows a symlink-to-directory: the second activation
   moved the temp link into the old release instead of replacing `current`.
   Fixed with `mv -Tf` plus a documented rm+rename fallback for platforms
   without `-T` (Linux deployment path stays atomic rename).
3. `mapfile` is unavailable in macOS bash 3.2; replaced with portable parsing.
4. Activation now creates the **relative** symlink `releases/<id>` per the
   contract instead of an absolute target.

## Limitations

- The on-server verification path (`sha256sum`/`shasum -c`, symlink flip,
  prune) runs against a fake remote root, not the real VM; AC-LD-8 records the
  live evidence once SSH access exists.
- macOS local runs take the non-atomic rm+rename fallback in the flip; the
  deployment platform (Ubuntu, GNU coreutils) takes the atomic `mv -T` path.
- HTTPS is not enabled by this work; the documented flip (UC-LD-4) is a
  one-line Caddyfile change after TCP 443 is opened in the OCI security list.
- The deploy script is untested on Windows; the landing deployment target is
  the Linux VM, and local development is macOS.

## Release decision

No release decision is made here. Per GOV-10.04 a named decision owner
records the release decision; this report is integration evidence for ticket
0043, which moves to review for independent verification.
