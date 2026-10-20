# Agents: torviello-engine

torviello-engine — Core PyTorch inference runtime.

## Instructions

- Follow the repository root `AGENTS.md` and the normative controls in `torviello-enforcer/`, including `GOV-06` through `GOV-10`.
- Keep changes inside this unit; cross-unit changes require an owner decision.
- Do not weaken tests, specifications, contracts, or evaluation thresholds to make a change pass.
- Keep the unit `README.md` aligned with the actual layout and validation commands.
- Report actual commands, results, skipped checks, assumptions, and limitations.

## Assurance gates

- Apply [HPA-4](../requirements/assurance-standard.md) to every change in this directory.
- Update the affected requirement, feature, check, contract, code, test, evaluation, and evidence together; never weaken a threshold to make a change pass.
- Reject any change when a fatal criterion in [acceptance-criteria.md](specifications/acceptance-criteria.md) applies. No waiver, skipped gate, or conditional pass is permitted.
- Run the applicable unit, contract, integration, security, and evaluation checks and report the actual commands, results, skips, assumptions, and limitations.
- Keep status honest: repository shape is not implementation, conformance, or performance evidence.
