# Agents: torviello-engine/contracts/schemas/common/status

torviello-engine — Core PyTorch inference runtime.

## Instructions

- Scope: One JSON Schema per assigned HTTP status code, derived from the approved status policy.
- Follow the repository root `AGENTS.md` and the normative controls in `torviello-enforcer/`, including `GOV-06` through `GOV-10`.
- Keep changes inside this unit and stage; move artifacts across units only with an owner decision.
- Do not weaken tests, specifications, contracts, or evaluation thresholds to make a change pass.
- Generated `*.schema.json` files MUST NOT be edited by hand; change the source and run `uv run python torviello-engine/contracts/tools/contracts.py generate`.
- Update this directory's `README.md` when its contents, generation, or validation steps change.
- Run the checks named in the README and report the actual commands, results, skipped checks, assumptions, and limitations.

## Assurance gates

- Apply [HPA-4](../../../../../requirements/assurance-standard.md) to every change in this directory.
- Update the affected requirement, feature, check, contract, schema, test, and evidence together; never weaken a threshold to make a change pass.
- Reject any change when a fatal criterion in `../../../../specifications/acceptance-criteria.md` applies when reachable from this unit. No waiver, skipped gate, or conditional pass is permitted.
- Run the applicable contract checks and report the actual commands, results, skips, assumptions, and limitations.
- Keep status honest: generated artifact presence is not implementation, conformance, or performance evidence.
