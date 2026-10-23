# Agents: torviello-roles

Read the repository-root `AGENTS.md`, the governing controls, and this file
before changing the ticket store, role definitions, or CLI.

## Instructions

- Start tracked work by running `uv run python -m torviello_roles brief` and
  reading the log of every in-progress or blocked ticket. Treat the brief as
  current state, not as a plan.
- Create or select a ticket before implementing tracked work. A ticket records
  the outcome, acceptance checks, owner, and linked requirement and control IDs.
- Update the ticket log in the same change as the work. Record the exact
  commands and observed results; never claim a check that did not run.
- Close a ticket only with evidence. Move work that needs independent review to
  `review`; do not self-approve when the governing control requires separation.
- Keep tickets append-only. Correct a mistake with a new log entry instead of
  rewriting history.
- Never store secrets, tokens, personal data, or customer content in a ticket.
  Record that evidence exists and where an authorized reviewer can find it.
- A ticket is a tracking record, not a specification, contract, decision record,
  or exception. Use the governing artifact for those decisions.
- Preserve the store format. Change `store.py`, the tests, this documentation,
  and the governing rule together when the format or lifecycle changes.
- Run `uv run pytest torviello-roles`, `uv run python -m torviello_roles check`,
  and `uv run ruff check torviello-roles` after a change.
