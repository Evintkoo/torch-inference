# Engineer verification and handoff

**Role:** engineer  
**Document:** 03 of 03

## Verification matrix

Run what the change touches; run the wider suite when it crosses a shared
boundary.

| Change | Required checks |
|---|---|
| Rust module or behavior | `cargo fmt --all --check`; clippy on the crate; `cargo test -p <crate> --locked -j 2` |
| API or contract | OpenAPI validation; contract tests; router parity check |
| Configuration | schema test; example config parse; environment override test |
| Persistence | migration test; rollback or downgrade note; integration test with the feature enabled |
| Packaging or release | `uv run python packaging/torviello_package.py validate`; bundle plan or verify |
| Python tooling | `uv run pytest <path>`; `uv run ruff check <path>` |
| Cross-cutting rule | the generated conformance tests for the affected control |

Record each command and its observed result in the ticket. Distinguish passed,
failed, skipped, blocked, and not-run.

## Evidence rules

- Evidence names a revision, a command, and a result.
- A screenshot or a document is not a substitute for a check that can run.
- A flaky or quarantined test is reported, not counted as passing.
- A check that could not run is a blocker or a recorded limitation, never a
  silent pass.

## Commit and handoff

```sh
git add <artifact paths> torviello-roles/tickets/<ticket>.md
git commit -m "<scope>: <outcome>"
uv run --directory torviello-roles python -m torviello_roles move <id> review --reason "checks green; needs review"
```

The commit message states the outcome, not the activity. The ticket carries the
detail: what changed, the commands, the results, and the residual risk.

## When blocked

Append the exact missing input, the owner who can provide it, and the work that
can continue independently. Move the ticket to `blocked`:

```sh
uv run --directory torviello-roles python -m torviello_roles block <id> \
  --reason "waiting for OD-004 API style decision"
```

Do not leave a partial change uncommitted without a ticket that names it.
