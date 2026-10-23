# Agents: tickets

- Change tickets through `uv run python -m torviello_roles`; do not hand-edit
  front matter except to repair a file that the CLI cannot parse.
- Keep the log append-only and dated. Record commands, results, decisions, and
  blockers.
- Never close a ticket without `--evidence`.
- Keep requirement and control ids resolvable; do not invent ids.
- Do not put secrets or personal data in a ticket.
- Run `check` after bulk changes.
