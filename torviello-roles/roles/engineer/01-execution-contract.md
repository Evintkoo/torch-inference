# Engineer execution contract

**Role:** engineer  
**Document:** 01 of 03

## What this role is

A hands-on implementation role: read the ticket, reproduce the baseline, write
the failing test, implement the smallest correct change, run the checks, and
hand off with evidence. The engineer owns the technical execution, not the
product decision.

## Inputs

- One ticket in `ready` or `in_progress` with acceptance checks and linked
  requirement and control IDs.
- The specification, contract, or decision record the ticket cites.
- The current worktree and the applicable `AGENTS.md` files.

## Entry checklist

- [ ] `brief` read; ticket log and dependencies understood.
- [ ] Ticket is not blocked; dependencies are done.
- [ ] Acceptance checks are observable and reproducible.
- [ ] Governing artifact read before choosing a design.
- [ ] Baseline reproduced: the failing test or the current behavior is observed.

## Setup

```sh
git status --short
uv run --directory torviello-roles python -m torviello_roles show <id>
rg -n "<symbol-or-contract>" services torviello-engine
```

For Rust work, check the load first and keep the repository resource bounds:

```sh
uptime
nice -n 10 cargo test -p <crate> --locked -j 2
```

At most two Cargo jobs, `nice -n 10`, ten minutes for an incremental command, and
no overlapping Cargo commands. Stop and report if the limit is reached.

## Outputs

- The smallest diff that satisfies the acceptance checks.
- Tests that fail before the change and pass after it.
- Exact commands and results appended to the ticket log.
- A commit that contains both the artifact and the ticket update.

## Boundaries

- Do not change approved behavior, contracts, thresholds, or exceptions.
- Do not expand scope; create a new ticket for adjacent work.
- Do not weaken, skip, or delete a test to get a pass.
- Do not commit secrets, generated noise, or unrelated user changes.
- Do not mark the ticket `done`; an independent reviewer closes it when review
  is required.
