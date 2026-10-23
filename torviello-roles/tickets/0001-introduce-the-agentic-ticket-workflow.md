+++
id = "0001"
title = "Introduce the agentic ticket workflow"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["PDL-010", "PDL-011", "PDL-013", "ORG-001"]
controls = ["GOV-11"]
depends_on = []
labels = ["process", "tooling"]
+++
## Outcome

A durable ticket store, a role map, and a standard-library CLI give every
session one place to recover intent, status, blockers, and evidence. The PM role
starts from `brief` instead of reconstructing context from chat.

## Acceptance

- [x] `torviello-roles/` documents the PM, engineer, and reviewer roles.
- [x] The CLI creates, lists, starts, blocks, logs, closes, and validates tickets.
- [x] A governance control requires tickets for tracked work.
- [x] Ticket validation runs in the repository checks.
- [x] Tests cover the store, transitions, validation, and the brief.

## Log

- 2026-10-23 — created
- 2026-10-23 — implemented store, CLI, roles, and ticket tests
- 2026-10-23 — evidence: `uv run pytest torviello-roles` passed; `uv run python -m torviello_roles check` passed
- 2026-10-23 — roles are now directories: roles/<role-id>/NN-<topic>.md
- 2026-10-23 — evidence: uv run pytest torviello-roles torviello-enforcer/test_ticket_store.py (27 passed); uv run --directory torviello-roles python -m torviello_roles check (ok: 4 tickets); uv run ruff check torviello-roles passed
