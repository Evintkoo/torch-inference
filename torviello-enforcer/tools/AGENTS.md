# Agents: torviello-enforcer/tools

Scope: rule-test generation.

## Instructions

- Keep generated tests self-contained, repo-wide, and language-agnostic.
- Do not add a shared helper module or weaken an assertion to make a check pass.
- Keep the check mapping traceable to the rule documents and their clauses.
- Regenerate and run `uv run --locked pytest` after changing a bundle or mapping.
