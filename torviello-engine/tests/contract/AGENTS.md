# Agents: torviello-engine/tests/contract

torviello-engine — Core PyTorch inference runtime.

## Instructions

- Scope: Contract tests for interfaces and events.
- Follow the repository root `AGENTS.md` and the normative controls in `torviello-enforcer/`, including the development-workflow controls `GOV-06` through `GOV-10`.
- Keep changes inside this unit and stage; move artifacts across units only with an owner decision.
- Do not weaken tests, specifications, contracts, or evaluation thresholds to make a change pass.
- Update this directory's `README.md` when its contents, interfaces, or validation steps change.
- Run the checks named in the README and report the actual commands, results, and skipped checks.

## Assurance gates

- Apply [HPA-4](../../../requirements/assurance-standard.md) to every change in this directory.
- Update the affected requirement, feature, check, contract, code, test, evaluation, and evidence together; never weaken a threshold to make a change pass.
- Reject any change when a fatal criterion in [acceptance-criteria.md](../../specifications/acceptance-criteria.md) applies. No waiver, skipped gate, or conditional pass is permitted.
- Run the applicable unit, contract, integration, security, and evaluation checks and report the actual commands, results, skips, assumptions, and limitations.
- Keep status honest: repository shape is not implementation, conformance, or performance evidence.
