# Reviewer technical checklist

**Role:** reviewer  
**Document:** 02 of 03

## Scope and diff

- [ ] The diff matches the ticket outcome; no unrelated edits, formatting churn,
      or deleted files without a reason.
- [ ] The ticket update is in the same commit range as the artifact.
- [ ] No secrets, tokens, personal data, or customer content appear in the diff.

## Behavior

- [ ] Every acceptance check maps to an observed result.
- [ ] Boundary and failure cases behave as specified: empty, maximum, malformed,
      unauthorized, timeout, and unavailable dependency.
- [ ] Errors are typed and mapped to the documented status, exit code, or envelope.
- [ ] Retries, fallbacks, and timeouts are bounded and observable.

## Tests

- [ ] A failing-first run is recorded for the new behavior.
- [ ] Assertions test the outcome, not the implementation detail.
- [ ] No test is skipped, quarantined, narrowed, or deleted.
- [ ] Tests are deterministic: no unbounded sleep, network, or shared state.
- [ ] Tests live in the correct unit, contract, or integration category.

## Security

- [ ] Authentication and authorization are enforced at the boundary the control
      requires; not only in a UI or wrapper (OWASP ASVS L2 for auth surfaces).
- [ ] Input is validated and bounded before allocation or execution.
- [ ] Logs redact secrets and avoid unnecessary personal data.
- [ ] New dependencies are pinned, licensed, justified, and pass the audit
      step.
- [ ] WCAG 2.2 AA criteria hold for user-facing changes (with the designer's
      evidence).

## Data and compatibility

- [ ] Migrations are reversible or have a documented rollback.
- [ ] Schema or contract changes are versioned with consumer impact stated.
- [ ] Feature flags default to the safe state and are documented.

## Performance and operations

- [ ] New work is bounded by size, count, and time.
- [ ] Metrics, health, and structured logs cover the new failure mode.
- [ ] A performance claim cites a dated measurement, not an assumption.
- [ ] Graceful shutdown and startup behavior still hold.

## Repository rules

- [ ] Files stay under 500 lines; no dead code or `allow(dead_code)`.
- [ ] No `print`/`println` in runtime paths.
- [ ] Requirement and control IDs resolve.
- [ ] Documentation, contract, and configuration examples are updated.

## Reproduction

```sh
nice -n 10 cargo test -p <crate> --locked -j 2
cargo fmt --all --check
uv run pytest <relevant-path>
uv run ruff check <relevant-path>
uv run --directory torviello-roles python -m torviello_roles check
```

At least one command per acceptance check must be run by the reviewer or
reproduced from the recorded evidence with a revision match.
