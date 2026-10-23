# Product manager session runbook

**Role:** product-manager  
**Document:** 02 of 04

## Start of session

Run these in order and record what changed:

```sh
uv run --directory torviello-roles python -m torviello_roles check
uv run --directory torviello-roles python -m torviello_roles brief
uv run --directory torviello-roles python -m torviello_roles list --all
git status --short
git log --oneline -5
```

Then:

1. Read the log of every `in_progress` and `blocked` ticket.
2. Reconcile the store with the worktree. Untracked or uncommitted work is
   either linked to a ticket or explicitly identified as out of scope in the
   session report.
3. Check that each ready ticket is actually ready: owner, outcome, acceptance,
   resolved dependencies.
4. Confirm the next action with the human owner. If no ticket is actionable,
   say so and record why in the blocking ticket.

## Triage

For each candidate item:

- If it changes a committed artifact and has no ticket, create one before work
  starts.
- If an acceptance check cannot be stated, leave it in `backlog` and record the
  missing decision.
- If the item is larger than one reviewable change, split it into vertical
  slices, each with its own observable outcome.
- If it depends on another ticket, record `--depends-on`; remove the dependency
  when it stops being true.
- If it is a question that needs an authorized owner, create the ticket as
  `blocked` with the decision, the owner, and the impact.

## During the session

- Move the selected ticket to `in_progress` before implementation starts.
- Append decisions, commands, and results as they happen; do not reconstruct the
  log at the end.
- When scope changes, split or create tickets instead of widening the current
  one.
- When evidence contradicts the recorded status, correct it with a new log entry
  immediately.

## End of session

```sh
uv run --directory torviello-roles python -m torviello_roles check
uv run --directory torviello-roles python -m torviello_roles brief
git add torviello-roles/tickets
git commit -m "<scope>: <what changed>"
```

The closing report states: tickets changed, evidence produced, checks run, what
is blocked, and the next owner.

## Reconciliation rule

If the store and the worktree disagree, the worktree wins for facts and the store
is corrected. Never leave a status that claims more than the committed evidence
supports.
