# Deploying the landing page

Part of **torviello-landing** — Public landing page and marketing site.

**Status:** integrated and verified hermetically (ticket
[0043](../../../torviello-roles/tickets/0043-integrate-landing-page-deployment-to-the-oracle-server.md)).
The first real deployment against the Oracle VM runs as soon as SSH access is
provisioned — follow [`server-setup.md`](server-setup.md).

## What lives here

| File | Purpose |
|---|---|
| `deploy.sh` | build → stage → upload → verify → activate → prune; `rollback` |
| `Caddyfile` | server configuration source of truth (HTTP today; TLS flip documented inside) |
| `server-setup.md` | one-time Oracle Cloud VM provisioning runbook (SSH, firewall, Caddy, DNS, first deploy, TLS upgrade) |
| `.staging/` | generated local staging output — gitignored, never committed |

**Contract:** [`../contracts/deployment/deploy-contract.json`](../contracts/deployment/deploy-contract.json)
(v1.0.0) — commands, flags, environment, exit codes, remote layout.
**Specification:** [`../specifications/landing-deployment.md`](../specifications/landing-deployment.md)
(LD-01…LD-08).
**Tests:** `bun test tests/integration` from the unit root — hermetic, no
network; the suite stubs `ssh`/`rsync`/`bun`.

## Deploy

```sh
cd torviello-landing
LANDING_DEPLOY_HOST=<user>@<host> deploy/deploy.sh deploy          # build + publish + verify + activate
LANDING_DEPLOY_HOST=<user>@<host> deploy/deploy.sh deploy --dry-run # local path + rsync preview, zero remote writes
LANDING_DEPLOY_HOST=<user>@<host> deploy/deploy.sh deploy --skip-build --keep 5
```

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
LANDING_DEPLOY_HOST=<user>@<host> deploy/deploy.sh rollback            # newest non-active release, verified first
LANDING_DEPLOY_HOST=<user>@<host> deploy/deploy.sh rollback --into <release-id>
LANDING_DEPLOY_HOST=<user>@<host> deploy/deploy.sh rollback --dry-run
```

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
