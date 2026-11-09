# One-time server setup — Oracle Cloud VM

**Unit:** torviello-landing (GOV-12.04 — deployment runbook owned by the
deployed component's unit)
**Ticket:** [0043](../../../torviello-roles/tickets/0043-integrate-landing-page-deployment-to-the-oracle-server.md)
**Specification:** [`specifications/landing-deployment.md`](../specifications/landing-deployment.md) (UC-LD-3 provisioning, UC-LD-4 TLS upgrade)
**Contract:** [`contracts/deployment/deploy-contract.json`](../contracts/deployment/deploy-contract.json)

State when this runbook was written (owner direction 2026-11-09): the Oracle
Cloud VM exists but SSH access is not set up yet; the domain (torviello.dev)
is **not registered yet** — registration is deferred, so the site first
serves from the VM's bare address over `:80` (LD-09 bootstrap), and the
domain + auto-TLS flip follows when it is registered (UC-LD-4). Placeholder
values — `landing.example` (domain), `<vm-public-ip>` (OCI public IP) — are
filled in here and nowhere committed to the repository.

## 0. Fast path — Cloud Shell enrollment and firewall (no local credentials)

If you prefer CLI over console clicks, paste this into **OCI Cloud Shell**
(Developer tools → Cloud Shell; it is pre-authenticated as you). It enrolls
the deploy key via the instance agent's Run Command, opens TCP 80/443 in the
subnet security list, and prints the public IP the deploy tool needs:

```bash
set -e
KEY="ssh-ed25519 REPLACE_WITH_THE_PUBLISHED_DEPLOY_KEY torviello-landing deploy key"
COMP_IDS=("$OCI_TENANCY" $(oci iam list-compartments --all --access-level ANY \
  --query "data[?\"lifecycle-state\"=='ACTIVE'].id" --raw-output | tr -d '[],"'))
INST=""; C=""
for c in "${COMP_IDS[@]}"; do
  I=$(oci compute instance list --compartment-id "$c" --lifecycle-state RUNNING \
      --query 'data | sort_by(@, &"time-created") | [0]' --raw-output 2>/dev/null || true)
  [ -n "$I" ] && [ "$I" != "null" ] && { INST="$I"; C="$c"; break; }
done
[ -n "$INST" ] || { echo "No RUNNING instance found"; exit 1; }
IID=$(jq -r .id <<<"$INST")
VA=$(oci compute vnic-attachment list --compartment-id "$C" --instance-id "$IID" \
     --query 'data[0]."vnic-id"' --raw-output)
IP=$(oci network vnic get --vnic-id "$VA" --query 'data."public-ip"' --raw-output)
echo "instance public IP: $IP"
printf 'mkdir -p /home/ubuntu/.ssh && chmod 700 /home/ubuntu/.ssh && echo "%s" >> /home/ubuntu/.ssh/authorized_keys; chmod 600 /home/ubuntu/.ssh/authorized_keys; chown -R ubuntu:ubuntu /home/ubuntu/.ssh\n' "$KEY" > /tmp/enroll.sh
oci compute instance run-command create --instance-id "$IID" --compartment-id "$C" \
  --display-name enroll-deploy-key --content-file /tmp/enroll.sh \
  --execution-timeout-in-seconds 60 >/dev/null && echo "key enrollment scheduled (~30s)"
SUB=$(oci network vnic get --vnic-id "$VA" --query 'data."subnet-id"' --raw-output)
SL=$(oci network subnet get --subnet-id "$SUB" --query 'data."security-list-ids"[0]' --raw-output)
oci network security-list update --security-list-id "$SL" --force --add-security-rules \
  '[{"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","source-type":"CIDR_BLOCK","tcp-options":{"destination-port-range":{"min":80,"max":80}},"description":"landing HTTP"},{"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","source-type":"CIDR_BLOCK","tcp-options":{"destination-port-range":{"min":443,"max":443}},"description":"landing HTTPS"}]' >/dev/null
echo "ports 80+443 open"
```

Then bring the server up and deploy — two commands from the unit root, no
manual server steps (`bootstrap` covers § 3 and § 4 automatically, including
the OCI iptables fix):

```sh
cd torviello-landing
LANDING_DEPLOY_HOST=ubuntu@<vm-public-ip> bun deploy/deploy.ts bootstrap   # one-time
LANDING_DEPLOY_HOST=ubuntu@<vm-public-ip> bun deploy/deploy.ts deploy      # publishes the site
```

Verify: `curl -fsI http://<vm-public-ip>/ | head`. When the domain is later
registered and DNS points at the VM, re-run bootstrap with
`--domain your-domain.example` — Caddy then provisions TLS automatically.

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
