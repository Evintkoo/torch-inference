# Engineer implementation loop

**Role:** engineer  
**Document:** 02 of 03

## 1. RED — observe the failure

Write or locate the test that expresses the acceptance check. Run it against the
current revision and record the failure:

```sh
uv run --directory torviello-roles python -m torviello_roles log <id> \
  "RED: cargo test -p torviello-engine <test> — failed: <observed assertion>"
```

The failure must be the one the ticket describes, not a compile error caused by
an unfinished test module.

## 2. GREEN — smallest correct implementation

- Follow the existing module boundaries and naming.
- Keep the change behind the right feature gate when the capability is optional.
- Return typed errors and map them to the documented status or exit code.
- Bound memory, request size, queue depth, and timeouts; never add an unbounded
  loop or an unbounded spawn.
- Use structured logging with redaction; never `print` or `println`.
- Keep every file under 500 lines; split by responsibility.
- No dead code, no broad warning suppression, no commented-out blocks.

Log the passing run:

```sh
uv run --directory torviello-roles python -m torviello_roles log <id> \
  "GREEN: cargo test -p torviello-engine <test> — 1 passed"
```

## 3. REFACTOR — clean without changing behavior

- Remove duplication introduced by the change.
- Recheck error paths and boundary cases.
- Update the contract, schema, configuration example, or documentation if the
  interface changed; contract first, then failing contract test, then provider.
- Add a migration and a rollback note when persisted data changes.

## 4. Broaden the checks

Run the narrowest useful checks first, then the shared ones:

```sh
cargo fmt --all --check
nice -n 10 cargo clippy -p <crate> --all-targets -- -D warnings
nice -n 10 cargo test -p <crate> --locked -j 2
uv run pytest <relevant-path>
uv run ruff check <relevant-path>
```

Record skipped checks with the reason; they are not evidence of passing.

## 5. Handoff

Move the ticket to `review` and append the commands, results, commit, and
remaining risk. If no independent review is required, close only with the
evidence the ticket names.
