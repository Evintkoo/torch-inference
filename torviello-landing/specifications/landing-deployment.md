# Landing deployment — Oracle server integration

**Unit:** torviello-landing
**Role:** engineer (ticket [0043](../../../torviello-roles/tickets/0043-integrate-landing-page-deployment-to-the-oracle-server.md))
**Owner direction:** repository owner, 2026-11-09 — deploy the landing page to
the Oracle server; answered the deployment questions: the Oracle Cloud VM
exists but SSH access is not set up yet; rsync plus nginx/Caddy chosen; the
domain points at the server, HTTP only for now, TLS later
**Requirements:** [SO-031](../../../torviello-enforcer/requirements/security-and-operations.md) (validated updates with a documented rollback path), [SO-012](../../../torviello-enforcer/requirements/security-and-operations.md) (artifact integrity checks), PDL-013 (traceability), PDL-014 (acceptance before implementation)
**Controls:** GOV-06–GOV-10 (development workflow), GOV-12 (unit packaging and deployment-artifact ownership)
**Interface contract:** [`contracts/deployment/deploy-contract.json`](../contracts/deployment/deploy-contract.json)
**Scope note:** this specification covers the *deployment integration* owned by
this unit: the deploy script, its contract, its tests, the server
configuration source, and the one-time setup runbook. The first real
deployment against the live VM is a separate acceptance item on ticket 0043
and stays blocked until the owner provisions SSH access.

## Goal

The landing site ships with one command from inside the unit, survives a bad
release with one rollback command, and never activates an unverified release.
HTTP-only first, with a documented one-line Caddy change to turn TLS on later.

## Use cases

### UC-LD-1 — Deploy the current landing build

The operator runs `deploy/deploy.sh deploy` (or just `deploy/deploy.sh`) with
`LANDING_DEPLOY_HOST` set. The script builds the static site
(`web/` → `bun run build` → `web/dist/`), stages the build output with a
SHA-256 integrity manifest, uploads it into a new immutable release directory
on the server, verifies the uploaded release on the server (checksums plus
`index.html` presence), and only then atomically repoints the `current`
symlink. Retention prunes older releases. Success prints the release id and
the deployed remote path.

### UC-LD-2 — Roll back to a previous release

The operator runs `deploy/deploy.sh rollback`. The script lists the releases
retained on the server, verifies the checksums of the target release
(default: the newest release that is not currently active), and then atomically
repoints `current` at it. `--into <release-id>` names an explicit target.
No upload happens; rollback reuses what is already on the server.

### UC-LD-3 — Provision the Oracle VM once

The operator follows `deploy/server-setup.md`: OCI security lists (22/80,
later 443), SSH key enrollment, package installation (`caddy`, `rsync`),
webroot creation, rendering the unit's `Caddyfile` with the real domain, and
DNS. This happens once, before the first deploy.

### UC-LD-4 — Turn TLS on later

The owner changes the Caddy site address from `http://<domain>` to
`<domain>`, opens TCP 443 in the OCI security list, and reloads Caddy;
Caddy then provisions ACME certificates automatically. Documented in
`deploy/server-setup.md`; no deploy-script change is required.

### UC-LD-5 — Preview a deploy without touching the server

The operator runs `deploy/deploy.sh deploy --dry-run`. The script performs the
full local path (build, stage, manifest) and passes `--dry-run` to rsync; no
SSH command mutates remote state. Output names the release id that *would* be
published.

## Requirements

- **LD-01 — Single-command deploy.** `deploy/deploy.sh` with
  `LANDING_DEPLOY_HOST` set performs build → stage → upload → verify →
  activate in one invocation, exiting non-zero if any stage fails.
- **LD-02 — Immutable release identity.** Each deploy publishes into
  `releases/<YYYYmmddHHMMSS>-<git-short-sha>/` under the webroot. Existing
  release directories are never rewritten by a later deploy;
  `LANDING_DEPLOY_RELEASE_ID` may override the id (deterministic runs in
  tests and CI). Outside a git worktree the id falls back to the `nogit`
  suffix instead of failing.
- **LD-03 — Integrity manifest and remote verification (SO-012, SO-031).**
  The staging step writes a `SHA256SUMS` manifest of every published file.
  Before activation the script verifies the uploaded release *on the server*:
  checksums must match and `index.html` must exist. A failed verification
  aborts the deploy with the active release untouched.
- **LD-04 — Atomic activation.** Activation replaces the `current` symlink by
  rename (atomic on the target platform). No deploy step ever mutates the
  release directory the `current` symlink points at.
- **LD-05 — Verified rollback.** `rollback` verifies the target release's
  checksums on the server before repointing `current`, refuses to "roll back"
  to the currently active release when a better candidate exists, and exits
  non-zero when no candidate exists. The active release directory is never
  pruned.
- **LD-06 — Bounded retention.** After a successful activation the script
  prunes release directories beyond the newest `LANDING_DEPLOY_KEEP`
  (default 5; `--keep 0` disables pruning), always sparing the active one.
- **LD-07 — Dry-run purity.** `--dry-run` makes no remote mutation: no
  directory creation, no upload, no verification run, no symlink change, no
  pruning; it exercises the full local path and prints the would-be release
  id.
- **LD-08 — Secret hygiene and one-time server setup.** Host, port, and
  webroot come from environment variables or flags; no host, IP, key, or
  credential is committed. `deploy/server-setup.md` documents the one-time
  OCI provisioning (UC-LD-3) and the TLS upgrade (UC-LD-4). The webroot must
  match `[A-Za-z0-9/._-]+` (shell-safe) and the release id
  `[A-Za-z0-9._-]+`; anything else is a usage error.

## Interface

The machine-readable interface — commands, flags, environment variables,
exit codes, remote layout, release-id format — is defined in
[`contracts/deployment/deploy-contract.json`](../contracts/deployment/deploy-contract.json).
The contract is versioned; changes to it are contract changes under GOV-08.

## Edge cases

| # | Case | Required behavior |
|---|---|---|
| E1 | `LANDING_DEPLOY_HOST` unset, no `--host` | exit 2, message names the variable |
| E2 | `rsync`, `ssh`, or `bun` (when building) missing | exit 3, message names the tool |
| E3 | build fails (non-zero `bun run build`) | exit 4, remote untouched |
| E4 | `--skip-build` but `web/dist/index.html` missing | exit 7, remote untouched |
| E5 | remote verification fails (checksum mismatch or missing `index.html`) | exit 5, `current` unchanged, failed release left in place for inspection |
| E6 | rollback with zero or one release (no better candidate) | exit 6, remote untouched |
| E7 | rollback `--into` names an unknown release | exit 6, remote untouched |
| E8 | deploy outside a git worktree | release id uses `nogit` suffix, deploy proceeds |
| E9 | interrupted earlier deploy left an orphan release directory | later deploys and prunes ignore it; `current` was never moved |
| E10 | webroot or release id with unsafe characters | exit 2 (LD-08 validation) |

## Acceptance criteria

- **AC-LD-1** — The integration test suite runs hermetically (stubbed
  `ssh`/`rsync`/`bun`, no network, no real host) and covers every edge case
  E1–E10 plus the LD-01/03/04 happy path: a deploy publishes a checksummed
  release and flips `current` only after remote verification passes.
  *Evidence:* test command output in the evaluation report.
- **AC-LD-2** — The tests are written and observed failing before
  `deploy.sh` exists, then passing after implementation (GOV-09 order).
  *Evidence:* dated ticket log entries quoting both runs.
- **AC-LD-3** — The contract test validates
  `contracts/deployment/deploy-contract.json` (parse + schema checks) and
  cross-checks the script against it: every exit code, command, flag, and
  environment variable named in the contract appears in the script.
  *Evidence:* test command output.
- **AC-LD-4** — A real local dry run (`deploy.sh deploy --dry-run` against
  the real build output and a fake remote root) produces a full transcript
  showing the would-be release id and rsync file list, with zero remote
  mutation. *Evidence:* transcript archived in the evaluation report.
- **AC-LD-5** — The evaluation report
  `evaluations/reports/2026-11-09-landing-deployment.md` records every AC
  here with the command run and an explicit pass/fail.
- **AC-LD-6** — `deploy/README.md` and the unit `README.md` document the
  deploy/rollback commands, remote layout, environment variables, exit codes,
  and the TLS upgrade path; the unit packaging section names the deployment
  artifact form.
- **AC-LD-7** — No secrets, hostnames, IPs, or keys are committed: the host
  reaches the script only via `LANDING_DEPLOY_HOST` or `--host`. *Evidence:*
  repository grep for the placeholder domain and host strings.
- **AC-LD-8 (deferred, blocked on owner)** — First real deployment against
  the Oracle VM is recorded on ticket 0043 with the release id and
  verification output once SSH access exists. Not part of this integration.

## Verification plan

| Check | Command | Threshold |
|---|---|---|
| Deploy integration tests | `cd torviello-landing && bun test tests/integration` | all pass, zero network use |
| Contract validation | included in the integration suite | contract parses; script/contract cross-check passes |
| Unit web suite still green | `cd torviello-landing/web && bun test src` | no regression from deployment work |
| Dry run against real build | `torviello-landing/deploy/deploy.sh deploy --dry-run --host deploy-test.invalid --skip-build` | exits 0, no mutation, transcript captured |
| Ticket store | `uv run python -m torviello_roles check` | ok |
| Python/ruff baseline | `uv run pytest torviello-roles`, `uv run ruff check .` | no new findings beyond the pre-existing baseline |

## Amendment — 2026-11-09, second pass (owner direction, GOV-07.05)

Owner authority (recorded on tickets 0043 and 0044): "i dont want any sh
please add that to rules" — no committed shell scripts in the repository.
Consequences for this specification, applied by ticket
[0044](../../../torviello-roles/tickets/0044-replace-landing-deploy-tooling-with-bun-typescript-ban-commi.md):

- **Tooling form (all LD references to `deploy.sh`):** the deploy tool is
  `deploy/deploy.ts`, TypeScript executed by Bun (`bun deploy/deploy.ts`),
  replacing the deleted `deploy/deploy.sh`. Every LD-01…LD-08 requirement
  reads `deploy.ts` wherever it names the deploy script; the semantics —
  build, stage with `SHA256SUMS`, upload, on-server verification, atomic
  relative-symlink activation, verified rollback, bounded retention,
  dry-run purity — are unchanged. The new normative control
  [GOV-13](../../../torviello-enforcer/governance/rules/13-no-committed-shell-scripts.md)
  carries the repository-wide prohibition; the remote command strings the
  tool constructs at runtime and passes to SSH are not committed files
  (GOV-13.03).
- **Contract:** `deploy-contract.json` is versioned to **1.1.0**; only the
  invocation changed (`bash deploy/deploy.sh` → `bun deploy/deploy.ts`);
  every interface field is unchanged.
- **CI (UC-LD-6 extension):** `.github/workflows/deploy-landing.yml` runs
  the same tooling with repository secrets (`LANDING_DEPLOY_HOST`,
  `LANDING_DEPLOY_SSH_KEY`); enrollment is documented in
  `deploy/server-setup.md` § 9. The workflow file is a thin invoker; all
  deployment manifests and tooling remain inside this unit (GOV-12.04).
- **Verification plan commands:** every occurrence of
  `torviello-landing/deploy/deploy.sh` in the table above reads
  `bun deploy/deploy.ts` from the unit root.
- **Scope note:** `tests/integration/deploy-script.test.ts` keeps the name it
  has had since 0043; "deploy-script" now refers to `deploy.ts`.

## Search-engine readiness (SEO-01…SEO-08)

**Amendment — 2026-11-09/10 (owner direction "fix the urls", GOV-07.05):**
the canonical base is **driven by `web/.env` (`VITE_SITE_URL`) — the single
source of truth** consumed by the built head (`%VITE_SITE_URL%` replacement),
`robots.txt`, and `sitemap.xml` (both generated by the prebuild and
gitignored, GOV-12.05). The interim value is the live
`https://evintkoo.github.io/torch-inference`; the declared
`https://torviello.dev/` is restored in that one file once the domain is
registered and wired as the Pages custom domain. SEO-02, SEO-04, SEO-05,
SEO-06, and SEO-07 read the base from `.env` rather than the literal
torviello.dev written above.

**Amendment — 2026-11-09, third pass (owner direction, GOV-07.05):** the
owner wants the site "ready to do SEO stuffs". The canonical base is
**`https://torviello.dev/`** — note the `.dev` TLD is HSTS-preloaded, so the
site serves HTTPS from day one once the domain is registered; until then the
public link is the VM's HTTP address. Chosen scope: the full static SEO
package without prerendering (client-rendered app; prerendering remains a
future option). Requirement IDs, tracked by ticket
[0045](../../../torviello-roles/tickets/0045-make-the-landing-page-search-engine-ready.md):

- **SEO-01 — Primary meta.** The built `index.html` ships a document title
  and a meta description (≥ 50 characters) in the static head.
- **SEO-02 — Canonical.** `<link rel="canonical" href="https://torviello.dev/" />`
  is present in the built HTML.
- **SEO-03 — Indexing.** `<meta name="robots" content="index, follow" />` is
  present; `robots.txt` allows all agents and names the sitemap.
- **SEO-04 — Open Graph.** `og:url` equals the canonical; `og:image` is an
  absolute URL at the base with declared width/height and honest alt text;
  `og:locale` is `en_US`.
- **SEO-05 — Twitter card.** `summary_large_image` card with title,
  description, and image at the base URL.
- **SEO-06 — Structured data.** A JSON-LD `@graph` declares `Organization`
  and `WebSite` entities anchored at the canonical base, with no claims
  beyond the truthfulness rules (no fabricated ratings, reviews, or metrics).
- **SEO-07 — Crawler files.** The build output contains `robots.txt`
  (allow-all + sitemap) and `sitemap.xml` listing the canonical URL, plus a
  stable unhashed `favicon.svg` in the static head.
- **SEO-08 — Shared-asset sync (GOV-12.07).** The og image and favicon are
  published into the build by the unit's own prebuild step
  (`web/scripts/seo-assets.ts`) from the owning units
  (`torviello-media`, `torviello-design`); the published bytes MUST equal the
  owning assets — the sync test proves equality and a stale copy is a
  finding. The generated copies are gitignored (GOV-12.05).

Verification: `bun test tests/integration/seo.test.ts` builds the site into
an isolated `dist-seo` directory and asserts every requirement above against
the built bytes.

## Bootstrap bring-up (UC-LD-6, LD-09)

**Amendment — 2026-11-09, fourth pass (owner direction, GOV-07.05):** the
owner deferred the domain registration ("torviello.dev will go after") and
asked for the rest to be done for them. The pre-domain phase is therefore
explicit: the site first serves from the VM's bare address (`:80`), and the
domain + auto-TLS flip happens when the owner registers it (UC-LD-4).

- **UC-LD-6 — Bootstrap the server.** `bun deploy/deploy.ts bootstrap`
  performs the one-time server bring-up over SSH: install `caddy` and
  `rsync`, create the webroot (`releases/` owned by the SSH user), correct
  the OCI iptables INPUT chain so ports 80/443 are accepted ahead of the
  default REJECT rule and persisted, render the unit `Caddyfile` into
  `/etc/caddy/Caddyfile`, enable and restart Caddy, and verify itself. By
  default the site address is bare `:80`; `--domain <name>` renders the
  domain form (auto-TLS via ACME) for the registered-domain flip.
- **LD-09 — Bootstrap verification.** The remote script ends by echoing the
  `TORVIELLO_BOOTSTRAP_OK` marker only after every step succeeded (apt,
  webroot, firewall, render, service); the tool exits 5 when the marker is
  absent. Idempotent: re-running a bootstrap is safe (apt and firewall steps
  are guarded).

## Out of scope

- CI/CD automation (GitHub Actions deploy workflow) — a later ticket may add
  it on top of this script; the contract is designed to allow it.
- HTTPS/TLS activation itself (documented path only; owner flips it when the
  domain and firewall are ready).
- Multi-site or multi-unit server configuration; the Caddyfile serves this
  landing unit's root only.
