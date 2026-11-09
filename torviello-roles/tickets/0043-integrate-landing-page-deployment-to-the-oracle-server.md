+++
id = "0043"
title = "Integrate landing page deployment to the Oracle server"
status = "review"
priority = "P1"
owner = "engineer"
created = "2026-11-09"
updated = "2026-11-09"
requirements = ["SO-031", "SO-012", "PDL-013", "PDL-014"]
controls = ["GOV-06", "GOV-07", "GOV-08", "GOV-09", "GOV-10", "GOV-12"]
depends_on = ["0041"]
labels = ["deployment", "landing", "operations"]
+++
## Outcome

the landing page ships to the Oracle Cloud VM through a single rsync-based deploy command owned by torviello-landing: the script builds the static site, publishes a checksum-verified release under a releases directory, atomically flips the current symlink only after remote verification passes, supports one-command rollback to any retained release, and a documented one-time server setup runbook covers the OCI instance (SSH keys, firewall, Caddy HTTP now with a documented one-line TLS upgrade path) so a real deploy runs as soon as the owner provisions the VM

## Acceptance

- [ ] specifications/landing-deployment.md defines the use cases
- [ ] requirement ids LD-01..LD-08
- [ ] edge cases
- [ ] acceptance criteria AC-LD-1..7
- [ ] and the verification plan before implementation
- [ ] contracts/deployment/deploy-contract.json defines the deploy script interface (inputs
- [ ] environment
- [ ] exit codes
- [ ] remote layout
- [ ] release id format) and the contract test validates it
- [ ] tests/integration/deploy-script.test.ts runs hermetically against stubbed ssh/rsync/bun (no network
- [ ] no real host) and covers: config validation failure
- [ ] dry-run makes no remote mutation
- [ ] deploy publishes a verified release and flips current only after remote verification passes
- [ ] failed remote verification aborts without flipping
- [ ] rollback relinks the previous release
- [ ] prune keeps the N newest releases
- [ ] tests run RED before deploy.sh exists and GREEN after implementation (GOV-09 order recorded in the ticket log)
- [ ] deploy.sh --dry-run against the real local build output and a fake remote root records a full dry-run transcript as evaluation evidence without touching any real server
- [ ] evaluations/reports/2026-11-09-landing-deployment.md records every threshold from AC-LD-1..7 with the command run
- [ ] the observed result
- [ ] and an explicit pass or fail
- [ ] torviello-landing/README.md and deploy/README.md document the deploy and rollback commands
- [ ] the remote layout
- [ ] and the TLS upgrade path; the unit packaging section names the deployment artifact form
- [ ] uv run pytest torviello-roles and uv run python -m torviello_roles check pass; uv run ruff check . shows no new findings beyond the pre-existing baseline
- [ ] first real deployment to the Oracle VM is recorded here with the VM hostname
- [ ] release id
- [ ] and verification output once the owner provisions SSH access (blocked on owner; not part of this integration)
- [ ] no secrets
- [ ] hosts
- [ ] keys
- [ ] or IPs are committed: the host comes from the LANDING_DEPLOY_HOST environment variable or an uncommitted local override

## Log

- 2026-11-09 — created
- 2026-11-09 — owner direction 2026-11-09: deploy the landing page to the Oracle server; owner answered the deployment questions - Oracle Cloud VM exists but SSH access is not set up yet, rsync plus nginx/Caddy chosen, domain points at the server with HTTP only for now and TLS later; scope agreed as the deployment integration inside torviello-landing with the one-time VM setup runbook so the first real deploy follows as soon as SSH access exists
- 2026-11-09 — started
- 2026-11-09 — spec and contract first: specifications/landing-deployment.md written (UC-LD-1..5, LD-01..08, edge cases E1..E10, AC-LD-1..8, verification plan) before implementation, and contracts/deployment/deploy-contract.json v1.0.0 defines the script interface (GOV-07.01, GOV-08.07). RED first (GOV-09): tests/integration/deploy-script.test.ts written with stubbed ssh/rsync/bun (hermetic, no network); cd torviello-landing && bun test tests/integration = 1 pass / 21 fail with deploy.sh absent - failures are the missing implementation (exitCode undefined), the one pass is the contract-document parse check
- 2026-11-09 — GREEN (GOV-09): implemented deploy/deploy.sh against the contract; cd torviello-landing && bun test tests/integration = 22 pass / 0 fail (96 assertions). Defects the tests caught during implementation: (1) env-var prefixes do not propagate through ssh - remote scripts now inline strictly validated values; (2) mv without -T follows a symlink-to-directory and moves the temp link into the old release on the second flip - flip now uses mv -Tf with a documented rm+rename fallback off Linux; (3) mapfile is unavailable in macOS bash 3.2 - replaced with grep/sed parsing; (4) release activation creates the relative symlink releases/<id> per the contract. Hermetic: fake ssh executes remote scripts locally against a fake remote root, fake rsync runs the real rsync binary after host:prefix translation, fake bun produces a deterministic dist; no network sockets anywhere
- 2026-11-09 — evaluation 2026-11-09 (GOV-10): report at torviello-landing/evaluations/reports/2026-11-09-landing-deployment.md; AC-LD-1 integration suite 22 pass / 0 fail (96 assertions) covering E1-E10 plus deploy happy path, dry-run purity, verified rollback, retention; AC-LD-2 RED (1 pass / 21 fail, deploy.sh absent) recorded before GREEN (22/0); AC-LD-3 contract v1.0.0 validated and cross-checked against deploy.sh in-suite; AC-LD-4 real dry run of release 20261109151852-e21d0da against the real build output and a fake remote root: exit 0, 45 staged files with SHA256SUMS, full itemized upload transcript, zero remote mutation, zero ssh executions; AC-LD-5 report written; AC-LD-6 deploy/README.md + server-setup.md + unit README updated; AC-LD-7 no hosts, IPs, keys, or secrets committed (placeholder landing.example only); AC-LD-8 deferred and blocked on owner SSH access for the first real deployment; regression battery: web bun test src 90/0, interaction 7/0, typecheck clean, build green 487ms, torviello_roles check ok 43 tickets, pytest torviello-roles 19 passed, ruff = the 5 pre-existing test_brand_assets.py findings, none new; gitignore gained torviello-landing/deploy/.staging (GOV-12.05)
- 2026-11-09 — status -> review
- 2026-11-09 — owner direction 2026-11-09: no committed shell scripts; the deploy.sh implementation shipped by this ticket is superseded by ticket 0044 (deploy.ts rework + GOV-13 rule + CI workflow); this ticket remains in review for its original integration evidence
