# Tickets

The ticket store: one Markdown file per tracked unit of work, named
`<id>-<slug>.md`. Files are the source of truth; every view is derived from them.

## Format

TOML front matter between `+++` lines, then Markdown:

```markdown
+++
id = "0001"
title = "Short outcome"
status = "ready"
priority = "P1"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["PDL-010"]
controls = ["GOV-11"]
depends_on = []
labels = ["process"]
+++

## Outcome

What becomes true.

## Acceptance

- [ ] An observable check.

## Log

- 2026-10-23 — created
```

## Rules

- Use the CLI for changes; hand-edit only to repair a broken file.
- Keep ids stable and sequential; never renumber or reuse an id.
- `owner` must resolve to a role directory under `roles/` with numbered documents.
- `done` requires a log entry containing `evidence:`.
- `depends_on` must reference existing tickets and must not form a cycle.
- `requirements` must resolve to `requirements/items/<ID>.md`.
- Append to the log; never delete an earlier entry.
- No secrets, tokens, personal data, or customer content.

`uv run python -m torviello_roles check` validates the whole store.
