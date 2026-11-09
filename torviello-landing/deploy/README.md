# Deploying the landing page

Part of **torviello-landing** — Public landing page and marketing site.

**Status:** integrated and verified hermetically (ticket
[0043](../../../torviello-roles/tickets/0043-integrate-landing-page-deployment-to-the-oracle-server.md)).
The first real deployment against the Oracle VM runs as soon as SSH access is
provisioned — follow [`server-setup.md`](server-setup.md).

## What lives here

| File | Purpose |
|---|---|
| `deploy.ts` | `bootstrap` (one-time server bring-up), build → stage → upload → verify → activate → prune, and `rollback` — TypeScript executed by Bun (GOV-13: no committed shell scripts) |
| `Caddyfile` | server configuration source of truth (HTTP today; TLS flip documented inside) |
| `server-setup.md` | one-time Oracle Cloud VM provisioning runbook (SSH, firewall, Caddy, DNS, first deploy, CI secrets, TLS upgrade) |
| `.staging/` | generated local staging output — gitignored, never committed |

**Contract:** [`../contracts/deployment/deploy-contract.json`](../contracts/deployment/deploy-contract.json)
(v1.1.0) — commands, flags, environment, exit codes, remote layout, release
identity, and invocation.
**Specification:** [`../specifications/landing-deployment.md`](../specifications/landing-deployment.md)
(LD-01…LD-08).
**Tests:** `bun test tests/integration` from the unit root — hermetic, no
network; the suite stubs `ssh`/`rsync`/`bun`.
**CI:** `.github/workflows/deploy-landing.yml` runs this same tooling with
repository secrets (see `server-setup.md` § 9 for the key enrollment and
secret names).

## Deploy

```sh
cd torviello-landing
LANDING_DEPLOY_HOST=<user>@<host> bun deploy/deploy.ts bootstrap          # one-time server bring-up (packages, webroot, firewall, caddy)
LANDING_DEPLOY_HOST=<user>@<host> bun deploy/deploy.ts deploy          # build + publish + verify + activate
LANDING_DEPLOY_HOST=<user>@<host> bun deploy/deploy.ts deploy --dry-run # local path + rsync preview, zero remote writes
LANDING_DEPLOY_HOST=<user>@<host> bun deploy/deploy.ts deploy --skip-build --keep 5
```

`bootstrap` renders the Caddyfile with the bare `:80` site address by default
(the pre-domain phase); pass `--domain <name>` once DNS exists and Caddy
provisions TLS automatically.

Environment: `LANDING_DEPLOY_HOST` (required), `LANDING_DEPLOY_SSH_PORT`
(22), `LANDING_DEPLOY_WEBROOT` (`/var/www/torviello-landing`),
`LANDING_DEPLOY_KEEP` (5; 0 disables pruning), `LANDING_DEPLOY_RELEASE_ID`
(override for deterministic runs), `LANDING_DEPLOY_SSH_OPTIONS` (extra ssh
arguments, e.g. `-i keyfile`; never commit key material).

Remote layout: `<webroot>/releases/<YYYYmmddHHMMSS>-<git-sha>/` (immutable,
with a `SHA256SUMS` manifest) and `<webroot>/current` →
`releases/<id>`, repointed atomically **only after** the uploaded release
passes on-server checksum verification and `index.html` presence
(LD-03/LD-04, SO-012/SO-031).

## Rollback

```sh
LANDING_DEPLOY_HOST=<user>@<host> bun deploy/deploy.ts rollback            # newest non-active release, verified first
LANDING_DEPLOY_HOST=<user>@<host> bun deploy/deploy.ts rollback --into <release-id>
LANDING_DEPLOY_HOST=<user>@<host> bun deploy/deploy.ts rollback --dry-run
```

Rollback re-verifies the target's checksums on the server before flipping
(LD-05, SO-031). The last `KEEP` releases (default 5) are always on the
server, so rollback never needs a rebuild or the local machine to be current.
Rollback is also available from CI: run the **Deploy landing** workflow with
`mode: rollback` (and optionally `into: <release-id>`).

## CI deployment

`.github/workflows/deploy-landing.yml` deploys on every push to `main` that
touches `torviello-landing/**`, and on manual dispatch with a `rollback`
mode. It runs the same `deploy.ts` tooling with repository secrets — nothing
about the release format, verification, or rollback differs from a local
deploy. The one-time enrollment is in `server-setup.md` § 9.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | success |
| 2 | usage error (bad flag/command, missing host, unsafe webroot/release id) |
| 3 | missing dependency (rsync, ssh, bun) |
| 4 | build failed |
| 5 | remote verification failed — active release untouched |
| 6 | rollback target missing or already active |
| 7 | local artifact integrity failure |

## Validation

```sh
cd torviello-landing && bun test tests/integration   # hermetic suite, 22 tests
cd web && bun run build                              # what deploy builds
```
