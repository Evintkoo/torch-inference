# Agents: torviello-landing/deploy

torviello-landing — Public landing page and marketing site.

## Instructions

- Scope: deployment tooling for this unit — the deploy tool (`deploy.ts`),
  its server configuration source, the one-time setup runbook, and
  operational docs.
- Follow the repository root `AGENTS.md` and the normative controls in
  `torviello-enforcer/`, including the development-workflow controls `GOV-06`
  through `GOV-10`, `GOV-12`, and `GOV-13` (no committed shell scripts; this
  tool is TypeScript executed by Bun).
- The tool interface is contracted in
  `../contracts/deployment/deploy-contract.json`; interface changes are
  contract changes under GOV-08, and the contract test in
  `../tests/integration/deploy-script.test.ts` must stay green.
- Never commit hosts, IPs, keys, credentials, or rendered Caddyfiles with real
  domains; the destination comes from `LANDING_DEPLOY_HOST` or `--host`.
- `.staging/` is generated output (GOV-12.05): gitignored, never committed.
- Keep this directory's `README.md` and `server-setup.md` aligned with the
  tool and the contract; report actual commands and results, not intentions.
