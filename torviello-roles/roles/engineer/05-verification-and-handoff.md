# Engineer verification and handoff

**Role:** engineer  
**Document:** 05 of 05

## Verification matrix

Run what the change touches; run the wider suite when it crosses a shared
boundary.

| Change | Required checks |
|---|---|
| Rust module or behavior | `cargo fmt --all --check`; clippy on the crate; `cargo test -p <crate> --locked -j 2` |
| API or contract | OpenAPI validation; contract tests; router parity check |
| Configuration | schema test; example config parse; environment override test |
| Persistence | migration test; rollback or downgrade note; integration test with the feature enabled |
| Packaging or release | `uv run python torviello-engine/packaging/torviello_package.py validate`; bundle plan or verify |
| Python tooling | `uv run pytest <path>`; `uv run ruff check <path>` |
| Security-relevant | the audit step; auth surface tests for the touched boundary |
| Cross-cutting rule | the generated conformance tests for the affected control |

Record each command and its observed result in the ticket. Distinguish passed,
failed, skipped, blocked, and not-run — five states, no "should be fine".

## Evidence rules

- Evidence names a revision, a command, and a result.
- Run the suite in a clean tree (stash or commit first); uncommitted state
  invalidates the run.
- A flaky or quarantined test is reported, not counted as passing.
- A check that could not run is a blocker or a recorded limitation, never a
  silent pass.

## Self-review before handoff

The author reviews the diff as if it were someone else's:

- [ ] Read the full diff once, top to bottom, on this revision.
- [ ] No debug artifacts, secrets, personal data, generated noise, or
      unrelated edits.
- [ ] Every acceptance check has a test or a recorded verification command.
- [ ] Reliability, security, and observability obligations (document 04) are
      met or their exceptions are stated on the ticket.
- [ ] Documentation, contract, and configuration examples match the behavior.
- [ ] The commit contains exactly the ticket's scope — artifact plus ticket
      update, nothing else.

## Commit and handoff

```sh
git add <artifact paths> torviello-roles/tickets/<ticket>.md
git commit -m "<scope>: <outcome in imperative mood>"
uv run --directory torviello-roles python -m torviello_roles move <id> review \
  --reason "checks green; needs review"
```

One logical change per commit, so every commit is a rollback point. The
message states the outcome, not the activity; the ticket carries the detail.

## When blocked

Append the exact missing input, the owner who can provide it, and the work
that can continue independently:

```sh
uv run --directory torviello-roles python -m torviello_roles block <id> \
  --reason "waiting for OD-004 API style decision"
```

Do not leave a partial change uncommitted without a ticket that names it.
