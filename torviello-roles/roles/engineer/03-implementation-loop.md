# Engineer implementation loop

**Role:** engineer  
**Document:** 03 of 05

## 1. RED — observe the failure

Write or locate the test that expresses the acceptance check. Run it against
the current revision and record the failure on the ticket:

```sh
uv run --directory torviello-roles python -m torviello_roles log <id> \
  "RED: cargo test -p torviello-engine <test> — failed: <observed assertion>"
```

The failure must be the one the ticket describes — not a compile error from an
unfinished test module, not an unrelated pre-existing red.

## 2. GREEN — the smallest correct implementation

Craft rules, enforced in this order of importance:

- Correctness first: the test passes for the reason the ticket names.
- Naming: names state intent; a reader should not need the diff to understand
  a function. Rename legacy names you touch when the meaning changed.
- Functions do one thing; branches stay shallow. If a function needs a
  paragraph comment to explain what it does, split it. Target cyclomatic
  complexity ≤ 10; exceed it only with a recorded reason.
- Duplication: wait for the third occurrence (rule of three), then factor it
  away; premature abstraction is worse than repetition.
- Errors are typed and mapped to the documented status, exit code, or
  envelope; no stringly-typed errors, no swallowed results, no panics on
  invalid input paths.
- Concurrency: no shared mutable state without an ownership or locking rule;
  no lock held across await or I/O; every channel and queue bounded.
- Resource bounds: timeouts, max sizes, max counts, deadlines — set at the
  boundary, not hoped for at the callee.
- Structured logging with redaction; never `print`/`println` in runtime paths.
- Feature gates for optional capability; defaults safe and documented.
- No dead code, no `allow(dead_code)`, no broad warning suppression, no
  commented-out blocks, no debug artifacts.
- Files stay under 500 lines; split by responsibility, not by size.

Log the passing run:

```sh
uv run --directory torviello-roles python -m torviello_roles log <id> \
  "GREEN: cargo test -p torviello-engine <test> — 1 passed"
```

## 3. REFACTOR — clean without changing behavior

- Remove the duplication and clumsy seams the change introduced.
- Re-read the diff as its reviewer: confusing names, missing edge cases,
  misleading comments.
- Comments explain why (constraints, invariants, links to requirement ids),
  never narrate what.
- Update the contract, schema, configuration example, and documentation if the
  interface changed; contract first, then failing contract test, then provider.
- Persisted data changes add the migration and its rollback note.

## 4. Broaden the checks

Narrow first, then shared:

```sh
cargo fmt --all --check
nice -n 10 cargo clippy -p <crate> --all-targets -- -D warnings
nice -n 10 cargo test -p <crate> --locked -j 2
uv run pytest <relevant-path>
uv run ruff check <relevant-path>
```

A skipped check is recorded with its reason; it is never evidence of passing.

## 5. Handoff

Move the ticket to `review` only after the self-review in document 05. The
ticket log carries commands, results, commit, and residual risk — the reviewer
re-runs evidence, they do not reconstruct it.
