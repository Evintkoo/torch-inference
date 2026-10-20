# Agents: torviello-engine/specifications/features

Scope: engine behavior scenarios.

## Instructions

- Write observable Given/When/Then scenarios and cite requirement IDs.
- Do not encode transport, storage, or backend implementation choices here.
- Do not weaken or delete an approved scenario to make an implementation pass; changes require explicit user authorization.
- Update the specification index when scenarios are added or removed.

## Assurance gates

- Apply [HPA-4](../../../requirements/assurance-standard.md) to every change in this directory.
- Update the affected requirement, feature, check, contract, code, test, evaluation, and evidence together; never weaken a threshold to make a change pass.
- Reject any change when a fatal criterion in [acceptance-criteria.md](../acceptance-criteria.md) applies. No waiver, skipped gate, or conditional pass is permitted.
- Run the applicable unit, contract, integration, security, and evaluation checks and report the actual commands, results, skips, assumptions, and limitations.
- Keep status honest: repository shape is not implementation, conformance, or performance evidence.
