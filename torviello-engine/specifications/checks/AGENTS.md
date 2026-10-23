# Agents: torviello-engine/specifications/checks

Scope: one document per acceptance-check ID.

## Instructions

- Keep one document per stable check ID; update it with its requirement and acceptance criteria.
- Keep the observable result, pass/fail criteria, evidence, and requirement/rule traceability current.
- Do not weaken or delete a check to make an implementation pass; that requires explicit human authorization.
- Do not claim a check passed from document presence alone.

## Assurance gates

- Apply [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md) to every change in this directory.
- Update the affected requirement, feature, check, contract, code, test, evaluation, and evidence together; never weaken a threshold to make a change pass.
- Reject any change when a fatal criterion in [acceptance-criteria.md](../acceptance-criteria.md) applies. No waiver, skipped gate, or conditional pass is permitted.
- Run the applicable unit, contract, integration, security, and evaluation checks and report the actual commands, results, skips, assumptions, and limitations.
- Keep status honest: repository shape is not implementation, conformance, or performance evidence.
