# torviello-roles

Durable work memory and role definitions for the Torviello delivery process.

A ticket is one Markdown file with TOML front matter under
[`tickets/`](tickets/). The standard-library CLI derives every view from those
files, so there is no index to keep in sync. Role definitions under
[`roles/`](roles/) are execution contracts: each role names the artifacts it
produces, the commands it runs, and the evidence it must leave behind.

## Why it exists

Sessions, agents, and context windows end. The ticket store keeps the current
intent, owner, status, blockers, decisions, and evidence in git, next to the
code. The product-manager role starts every session from the same brief instead
of reconstructing state from chat.

Tickets do not replace specifications, contracts, decision records, rule
controls, or release approval. A ticket may cite them; it must not restate or
override them.

## Layout

- [`roles/`](roles/) — one directory per role (`roles/<role-id>/NN-<topic>.md`); the directory name is the role id.
- [`tickets/`](tickets/) — the ticket store (source of truth).
- [`torviello_roles/`](torviello_roles/) — the CLI and store implementation.
- [`tests/`](tests/) — store, CLI, and validation tests.

## CLI

Run from the repository root:

```sh
uv run python -m torviello_roles brief
uv run python -m torviello_roles new "Short outcome" --owner engineer --priority P1
uv run python -m torviello_roles list
uv run python -m torviello_roles show 0001
uv run python -m torviello_roles start 0001
uv run python -m torviello_roles log 0001 "Ran the contract tests"
uv run python -m torviello_roles block 0001 --reason "Waiting for the API decision"
uv run python -m torviello_roles report --since 2026-10-16
uv run python -m torviello_roles done 0001 --evidence "uv run pytest passed"
uv run python -m torviello_roles check
```

`brief` is the session start: open counts, in-progress and blocked work, ready
work in priority order, the next ticket, and recent activity. `report` builds a
shareable Markdown (or `--format json`) status report: summary counts, active
and blocked work, the next ticket, and completed work since `--since` (default:
seven days back from today) with its evidence lines. `check` validates
the store and exits non-zero on a defect.

Use `--json` on `list`, `show`, `brief`, and `report --format json` for agent
consumption.

## Ticket lifecycle

`backlog → ready → in_progress → review → done`

A ticket may move to `blocked` from `ready`, `in_progress`, or `review`, and
back when the blocker clears. `cancelled` records abandoned work; it is never
deleted. `done` requires an evidence entry.

## Packaging

Per [GOV-12](../torviello-enforcer/governance/rules/12-independent-unit-packaging.md), this unit is packageable as an independent, versioned artifact: the standard-library CLI in `torviello_roles/` runs in place via `uv run --directory torviello-roles`. Status: no package manifest or published artifact exists yet.

## Validation

```sh
uv run pytest torviello-roles
uv run python -m torviello_roles check
uv run ruff check torviello-roles
```

## Status

The store and CLI are implemented and tested. The seeded tickets record the
first tracked work items; they do not claim that the described outcomes are
complete.
