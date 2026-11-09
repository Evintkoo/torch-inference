+++
id = "0046"
title = "Add a bootstrap command to the deploy tool for zero-touch server bring-up"
status = "review"
priority = "P1"
owner = "engineer"
created = "2026-11-09"
updated = "2026-11-09"
requirements = ["SO-031", "PDL-013", "PDL-014"]
controls = ["GOV-07", "GOV-08", "GOV-09", "GOV-10", "GOV-13"]
depends_on = ["0044", "0045"]
labels = ["deployment", "landing"]
+++
## Outcome

the deploy tool gains bun deploy/deploy.ts bootstrap: one command installs caddy and rsync, creates the webroot, fixes the OCI iptables INPUT chain for ports 80 and 443 with persistence, renders the unit Caddyfile either for the VM IP (:80, the pre-domain phase the owner chose) or for a domain with auto-TLS via --domain, enables the caddy service, and verifies itself - so the first deployment after SSH access is bootstrap followed by deploy with no manual server steps

## Acceptance

- [ ] the deployment specification gains UC-LD-6 and LD-09 for bootstrap before implementation
- [ ] and the contract is versioned 1.2.0 with a compatibility note (added command
- [ ] existing commands unchanged)
- [ ] integration tests are added RED first (observed failing) then GREEN: happy path runs the apt/webroot/caddy/iptables script and requires the TORVIELLO_BOOTSTRAP_OK marker
- [ ] IP mode renders ':80 {' and --domain mode renders the domain site address
- [ ] remote failure exits 5
- [ ] and usage validation is inherited
- [ ] bun test tests/integration stays fully green (all suites) and the contract cross-check covers the new command and flag
- [ ] deploy/server-setup.md documents the IP-first bring-up (bootstrap then deploy) and records the Cloud Shell one-paste alternative for SSH key enrollment and security-list updates
- [ ] uv run --locked pytest torviello-enforcer/governance torviello-roles and torviello_roles check pass; uv run ruff check . shows no new findings
- [ ] GOV-13 holds: bootstrap remote commands are runtime strings
- [ ] no committed shell scripts
- [ ] the real bootstrap and first real deployment are recorded on tickets 0043/0046 once the owner provides the VM public IP (blocked with owner; IP not discoverable from this machine - verified against ssh config
- [ ] known_hosts
- [ ] and shell history)

## Log

- 2026-11-09 — created
- 2026-11-09 — owner direction 2026-11-09: torviello.dev registration deferred, do the rest; recon re-verified the VM IP is not discoverable locally (ssh config has no oci/oracle hosts, history only shows other providers like idcloudhost 103.23.199.101 for the lumi project, known_hosts unrelated) so the single remaining owner input is the VM public IP from the Cloud Shell script or console; meanwhile this ticket removes every other manual step by making server bring-up a deploy-tool command
- 2026-11-09 — started
- 2026-11-09 — spec amendment (UC-LD-6 + LD-09) and contract v1.2.0 (added bootstrap command + --domain flag + TORVIELLO_BOOTSTRAP_OK marker, compatibility note recorded per GOV-08.03) written before implementation. RED first (GOV-09): bootstrap describe block added with mock-mode ssh stub (Linux remote commands cannot execute on macOS - content assertions on the invocation log); bun test tests/integration/deploy-script.test.ts = 22 pass / 5 fail, failures are the missing bootstrap implementation
- 2026-11-09 — GREEN: bun test tests/integration = 40 pass / 0 fail (150 assertions; 22 deploy incl. 5 bootstrap + 13 seo). Implemented bootstrap (UC-LD-6/LD-09): installs caddy+rsync, creates the webroot owned by the ssh user, fixes the OCI iptables INPUT chain for 80/443 ahead of the default REJECT with netfilter-persistent persistence, renders the unit Caddyfile locally (bare :80 default for the pre-domain phase, --domain form for the auto-TLS flip), validates with caddy validate, enables and restarts caddy, and requires the TORVIELLO_BOOTSTRAP_OK marker (exit 5 when absent); idempotent guards; dry-run prints the full remote script without any ssh. Contract v1.2.0 cross-check covers the new command, flag, and markers. Cycle defects: two test-side fixes (quote style in the log assertion, and the contract cross-check reading marker keys not descriptions). Docs: server-setup.md gains the IP-first fast path (section 0) with the Cloud Shell one-paste enrollment + firewall script and the two-command bootstrap+deploy flow; deploy README documents bootstrap. Regression: web bun test src 90/0, typecheck clean, pytest governance+roles 37 passed, ruff 5 pre-existing only, torviello_roles check ok 46 tickets. Remaining blocked-with-owner input: the VM public IP (not discoverable locally); then bootstrap + deploy + gh secret set run without further manual steps
- 2026-11-09 — status -> review
