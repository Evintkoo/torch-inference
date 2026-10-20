# Agents: torviello-enforcer/portability

Scope: the **portability** rule domain (development stage CDD) — its normative controls and the generated tests that enforce them.

## Instructions

- Read `trails/00-references-trails.md` and every numbered document relevant to the task before editing.
- Keep control IDs, clause IDs, required sections, requirement traces, and trail mappings consistent.
- Do not add product implementation code under `torviello-enforcer/`.
- Do not hand-edit `tests/test_*.py`; change the rule document or `tools/generate_rule_tests.py` and regenerate.
- Do not weaken a control, its evidence requirements, or its assessment criteria to make a change pass; such a change requires explicit user authorization.
- Run `uv run --locked pytest torviello-enforcer/portability` and report the actual result.
