# QA test execution and evidence

**Role:** qa  
**Document:** 03 of 04

## Before the first run

```sh
git status --short                 # know what revision you are testing
uptime                             # check load before any Cargo command
uv run --directory torviello-roles python -m torviello_roles show <id>
```

Reproduce the baseline on the parent revision when the suite is expected to be
green. A failure on the baseline is a blocked ticket, not a finding against the
change.

## Running suites within the repository bounds

```sh
nice -n 10 cargo test -p <crate> --locked -j 2      # ≤ 10 min incremental
nice -n 10 cargo test --workspace --locked -j 2     # ≤ 20 min, clean tree only
uv run pytest torviello-roles torviello-enforcer    # python suites
uv run ruff check torviello-roles
```

- Never overlap Cargo commands; one runs to completion or hits its limit.
- If the load exceeds twice the logical CPU count or the wall-clock limit is
  reached, stop, keep the completed output, and report the limit.
- Record the revision (`git rev-parse --short HEAD`) with every run.

## Recording results

For each matrix cell, append one ticket log line:

```text
- 2026-10-23 — matrix: integration/vulkan-off — nice -n 10 cargo test -p
  engine --locked -j 2 — 41 passed, 0 failed (rev 1a2b3c4)
```

A cell is one of exactly five states:

| State | Meaning |
|---|---|
| passed | command ran green on the recorded revision |
| failed | command ran red; defect report or finding required |
| skipped | conditional skip with reason; must cite its ticket |
| blocked | could not run; missing input, owner, and impact recorded |
| not-run | planned but not reached; listed in the verdict |

`passed` means the command ran on this revision in this session. Reusing a
previous session's output is `not-run` plus a citation, never `passed`.

## Flake handling

- Rerun once on the same revision. If it passes, record both runs and file a
  flake report (test name, both outputs, suspected coupling).
- A flaky test does not count as passing evidence for a closure.
- Quarantine requires a ticket and an expiry; the reviewer must see it.

## Verdict

End the verification pass with one ticket log entry:

```text
- 2026-10-23 — verified: 9/9 matrix cells passed (2 blocked cells listed) —
  evidence lines above — rev 1a2b3c4
```

`blocked` or failed cells go to the defect standard in document 04 before the
verdict is logged.
