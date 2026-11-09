# Agents: torviello-landing/contracts/deployment

torviello-landing — Public landing page and marketing site.

## Instructions

- Scope: the machine-readable interface contract of the unit's deploy tooling.
- Follow the repository root `AGENTS.md` and the normative controls in
  `torviello-enforcer/`, including `GOV-08` (contract-driven development).
- The contract precedes contract tests and implementation (GOV-08.07); a
  change to any contract field is a contract change: bump `version`, update
  `deploy/deploy.sh`, and keep
  `../tests/integration/deploy-script.test.ts` cross-checking both sides.
- Do not weaken the contract to match an implementation defect (GOV-08.06).
