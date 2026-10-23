# Engineer execution contract

**Role:** engineer  
**Document:** 01 of 05

## What this role is

A senior hands-on implementation role that owns the technical quality of the
change end to end: understand the problem, design before coding, prove the
behavior with a failing test, implement craft-level code, verify under the
repository bounds, and hand off with evidence a reviewer can reproduce. The
engineer owns how the change is built; the governing artifacts own what is
built.

## Professional standard

- The diff is the product. It must read like it was written by one careful
  author: consistent naming, no churn, no unrelated edits.
- Every behavior change is driven by a test that failed first.
- Every network call, lock, queue, and cache has a bound: timeout, size,
  count, or deadline. Nothing unbounded enters the tree.
- Secrets, tokens, personal data, and customer content never appear in code,
  logs, tests, or tickets.
- "Works on my machine" is not a state; the recorded commands are the state.

## Inputs

- One ticket in `ready` or `in_progress` with observable acceptance checks and
  linked requirement and control ids.
- The specification, contract, decision record, or evaluation standard the
  ticket cites.
- The current worktree, the applicable `AGENTS.md` files, and the load on the
  machine.

## Entry checklist

- [ ] `brief` read; ticket log and dependency graph understood.
- [ ] Dependencies are `done`; nothing upstream can invalidate the design.
- [ ] Acceptance checks are observable, reproducible, and unchanged from
      `ready` (if they moved, the ticket goes back to the PM, not silently).
- [ ] The governing artifact is read before any design decision.
- [ ] The baseline is reproduced: the failing test or current behavior is
      observed on this revision before writing code.

## Outputs

- Design notes on the ticket before implementation (document 02).
- The smallest diff that satisfies the acceptance checks at craft level.
- Tests that fail before the change and pass after it, in the right category.
- Reliability, security, and observability obligations met (document 04).
- Exact commands and observed results appended to the ticket log.
- A self-reviewed, atomic commit containing the artifact and the ticket update.

## Boundaries

- Do not change approved behavior, contracts, thresholds, or exceptions.
- Do not expand scope; create a ticket for adjacent work.
- Do not weaken, skip, narrow, or delete a test to obtain a pass.
- Do not commit secrets, generated noise, or unrelated user changes.
- Do not self-approve where a control requires independent review.

## Tooling

```sh
git status --short
uv run --directory torviello-roles python -m torviello_roles show <id>
rg -n "<symbol-or-contract>" services torviello-engine
uptime        # before any Cargo command
nice -n 10 cargo test -p <crate> --locked -j 2
```

At most two Cargo jobs, `nice -n 10`, ten minutes incremental / twenty clean,
and never overlapping Cargo commands. Stop, preserve output, and report when a
limit is reached.
