# QA execution contract

**Role:** qa  
**Document:** 01 of 04

## What this role is

A hands-on verification role: QA writes the tests the acceptance checks need,
runs them under the repository's resource bounds, exercises the failure paths
nobody wrote a test for, reproduces defects before filing them, and records the
evidence that lets a reviewer close a ticket.

## Inputs

- One ticket in `ready` or `review` with observable acceptance checks.
- The requirement, specification, or evaluation standard the ticket cites
  (including the acceptance criteria in
  `torviello-engine/specifications/acceptance-criteria.md`).
- The diff under review and the author's recorded evidence.

## Entry checklist

- [ ] Acceptance checks are observable and each names its expected evidence.
- [ ] The baseline is reproduced before testing a change: the relevant suite
      passes on the parent revision.
- [ ] The test matrix for the change is written down before the first run
      (categories, boundaries, environments).
- [ ] Resource bounds are planned: `-j 2`, `nice -n 10`, wall-clock limits, no
      overlapping Cargo commands.

## Outputs

- Executed test matrix: every cell is passed, failed, skipped, blocked, or
  not-run, with the exact command and result.
- New or corrected tests for gaps found while verifying (handed to the engineer
  as findings or a linked ticket, never folded silently into review).
- Reproduced or rejected defect reports in the 12-section standard.
- A verdict per ticket: verified, failed, or blocked, logged in the ticket.

## Boundaries

- Do not approve a release, accept residual risk, or grant an exception.
- Do not weaken, skip, or quarantine a test to make a suite pass; report the
  defect instead.
- Do not mark a ticket `done`; verification feeds the reviewer's verdict.
- Do not test from documentation alone; run the behavior.

## Tooling

```sh
uptime
nice -n 10 cargo test -p <crate> --locked -j 2
uv run pytest <path>
uv run --directory torviello-roles python -m torviello_roles log <id> "<result>"
```
