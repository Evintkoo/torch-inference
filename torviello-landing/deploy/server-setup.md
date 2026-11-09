# One-time server setup — Oracle Cloud VM

**Unit:** torviello-landing (GOV-12.04 — deployment runbook owned by the
deployed component's unit)
**Ticket:** [0043](../../../torviello-roles/tickets/0043-integrate-landing-page-deployment-to-the-oracle-server.md)
**Specification:** [`specifications/landing-deployment.md`](../specifications/landing-deployment.md) (UC-LD-3 provisioning, UC-LD-4 TLS upgrade)
**Contract:** [`contracts/deployment/deploy-contract.json`](../contracts/deployment/deploy-contract.json)

State when this runbook was written (owner direction 2026-11-09): the Oracle
Cloud VM exists but SSH access is not set up yet; the domain points at the
server; HTTP only for now, TLS later. This document is the one-time path from
"instance exists" to "first deploy lands". Placeholder values —
`landing.example` (domain), `<vm-public-ip>` (OCI public IP) — are filled in
here and nowhere committed to the repository.

## 1. SSH access (local machine)

```sh
# one-time, on your machine; never commit the private key
ssh-keygen -t ed25519 -C "torviello-landing deploy" -f ~/.ssh/torviello_landing
```

Add the public key (`~/.ssh/torviello_landing.pub`) to the OCI instance:
either paste it at instance creation (SSH keys step) or, if the instance
already runs, use the OCI console's "Add public key" for the instance. Then
add an `~/.ssh/config` entry so the deploy host resolves locally:

```sshconfig
Host torviello-landing
    HostName <vm-public-ip>
    User ubuntu
    IdentityFile ~/.ssh/torviello_landing
    IdentitiesOnly yes
```

Verify: `ssh torviello-landing 'echo ok'` prints `ok`.

## 2. OCI firewall (cloud side)

In the OCI console, the instance's subnet security list (or NSG) needs these
ingress rules:

| Port | Source | State | Purpose |
|---|---|---|---|
| TCP 22 | your IP / office range | allow | SSH (already there by default) |
| TCP 80 | 0.0.0.0/0 | allow | HTTP today |
| TCP 443 | 0.0.0.0/0 | allow later | TLS upgrade (UC-LD-4) — add when TLS is switched on |

OCI instances also have an in-OS firewall on some images; Ubuntu's default
`ufw` is inactive, so usually nothing to do. Check with
`sudo iptables -L -n` if port 80 is unreachable despite the security list.

## 3. Server packages and webroot (on the VM)

```sh
ssh torviello-landing
sudo apt update && sudo apt install -y caddy rsync
sudo mkdir -p /var/www/torviello-landing/releases
sudo chown -R ubuntu:ubuntu /var/www/torviello-landing
```

The `ubuntu` user is the deploy user: `deploy/deploy.sh` uploads as
`LANDING_DEPLOY_HOST=ubuntu@…` (or the `torviello-landing` ssh-config alias)
and needs no sudo — everything happens under the webroot, and Caddy reads the
`current` symlink as any user.

## 4. Caddy configuration (on the VM)

Render the unit-owned Caddyfile with the real domain — never hand-edit a
copy on the server, so the repository stays the source of truth:

```sh
# from this repository, on your machine
scp torviello-landing/deploy/Caddyfile torviello-landing:/tmp/caddy-torviello-landing
ssh torviello-landing 'sed "s/landing.example/your-domain.example/" /tmp/caddy-torviello-landing | sudo tee /etc/caddy/Caddyfile >/dev/null && rm /tmp/caddy-torviello-landing'
ssh torviello-landing 'sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy'
```

The rendered site block serves `http://<domain>` on port 80 only.

## 5. DNS

Create/point an `A` record for your domain at `<vm-public-ip>` at your DNS
provider. OCI also offers a DNS zone service if the domain is managed there.
Verify from your machine once the record resolves:

```sh
dig +short your-domain.example   # -> <vm-public-ip>
```

## 6. First deploy

```sh
cd torviello-landing
LANDING_DEPLOY_HOST=torviello-landing bun deploy/deploy.ts deploy
```

Then check:

```sh
curl -fsS http://your-domain.example/ | head   # renders the page
ssh torviello-landing 'ls -l /var/www/torviello-landing/current'  # -> releases/<id>
```

Record the release id and verification output on ticket 0043 (AC-LD-8).

## 7. Turning TLS on later (UC-LD-4)

1. Open TCP 443 in the OCI security list (table above).
2. On your machine, change the Caddyfile site address from
   `http://landing.example` to `landing.example` (drop the `http://` prefix)
   in `torviello-landing/deploy/Caddyfile`, re-render per step 4, reload.
3. Caddy obtains and renews a Let's Encrypt certificate automatically; HTTP
   requests redirect to HTTPS. Verify: `curl -fsSI https://your-domain.example/`.

No deploy-script change is involved: releases, verification, and the `current`
symlink are identical under TLS.

## 8. Rollback

```sh
cd torviello-landing
LANDING_DEPLOY_HOST=torviello-landing bun deploy/deploy.ts rollback            # previous release
LANDING_DEPLOY_HOST=torviello-landing bun deploy/deploy.ts rollback --into <release-id>
LANDING_DEPLOY_HOST=torviello-landing bun deploy/deploy.ts rollback --dry-run  # preview
```

Rollback re-verifies the target's checksums on the server before flipping
(LD-05, SO-031). The last `KEEP` releases (default 5) are always on the
server, so rollback never needs a rebuild or the local machine to be current.

## 9. CI deployment (GitHub Actions)

`.github/workflows/deploy-landing.yml` deploys automatically on pushes to
`main` touching `torviello-landing/**`, and supports manual dispatch with
`deploy`/`rollback` modes. It runs the same unit tooling
(`bun deploy/deploy.ts`) on GitHub's runners. One-time setup:

1. **Dedicated CI key** — generate a keypair used *only* by CI, separate from
   your personal key:

   ```sh
   ssh-keygen -t ed25519 -C "torviello-landing CI deploy" -f ~/.ssh/torviello_landing_ci
   ```

   Append `~/.ssh/torviello_landing_ci.pub` to
   `~/.ssh/authorized_keys` on the VM (same `ubuntu` user). Never reuse your
   personal key for CI; the CI key can be revoked independently by removing
   its line from `authorized_keys`.

2. **Repository secrets** — under *Settings → Secrets and variables →
   Actions*, add:

   | Secret | Value |
   |---|---|
   | `LANDING_DEPLOY_HOST` | the SSH destination, e.g. `ubuntu@<vm-public-ip>` |
   | `LANDING_DEPLOY_SSH_KEY` | the full contents of `~/.torviello_landing_ci` private key (PEM) |
   | `LANDING_DEPLOY_SSH_PORT` | optional; only when not `22` |

   Secrets are write-only in GitHub; this repository's code never stores
   them (LD-08, GOV-13: the workflow writes the key to a `0600` file at run
   time and deletes it after).

3. **First CI run** — *Actions → Deploy landing → Run workflow* with
   `mode: deploy`. The run fails with actionable guidance if the secrets are
   missing. Host-key verification uses `StrictHostKeyChecking=accept-new`;
   for stricter checking, pre-seed a `LANDING_DEPLOY_KNOWN_HOSTS` secret and
   extend the workflow.

## 10. Troubleshooting

| Symptom | Exit code | Where to look |
|---|---|---|
| `LANDING_DEPLOY_HOST is not set` | 2 | export it or pass `--host` |
| `missing dependency: rsync/ssh/bun` | 3 | install locally (bun only needed without `--skip-build`) |
| `remote verification failed` | 5 | the failed release stays in `releases/`; `current` untouched; ssh to the VM and run `cd <webroot>/releases/<id> && sha256sum -c SHA256SUMS` |
| `nothing to roll back to` | 6 | only one release exists |
| ssh hangs at deploy | — | `BatchMode=yes` is forced: keys must be agent-loaded or configured; no interactive prompts |
