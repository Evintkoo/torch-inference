# Product manager verification and handoff

**Role:** product-manager  
**Document:** 04 of 04

## Evidence audit before closure

For each acceptance check:

1. Find the log entry that names the command, artifact, or review.
2. Reproduce at least one command per ticket, or confirm that the reviewer did.
3. Confirm the result the log claims matches the result observed now.
4. Confirm the ticket update is in the same commit range as the artifact.

Commands:

```sh
uv run --directory torviello-roles python -m torviello_roles show <id>
git show --stat <commit>
git log --oneline -- <path-from-the-ticket>
```

Reject closure when:

- the evidence is a plan, a document, or "looks good";
- the command was skipped, blocked, or run on a different revision;
- the acceptance section was edited to match the implementation;
- a required review is missing or the reviewer authored the change.

## Closing

```sh
uv run --directory torviello-roles python -m torviello_roles done <id> \
  --evidence "uv run pytest <scope> — 27 passed (commit <sha>)"
```

The evidence string names the command and the observed result. If only a human
check was possible, name the reviewer and the record.

## Status report

Report from the store, never from recollection:

```text
Open: N (in progress: N, review: N, blocked: N)
Blocked: <id> — <missing decision> — owner <role>
Next: <id> — <outcome> — owner <role>
Risk: <ticket or decision that can invalidate the plan>
```

## Handoff package

A handoff is complete only with:

- the current `brief` output;
- the selected ticket and its full log;
- links to the governing requirement, contract, or decision;
- the exact commands already run and their results;
- the next action and its owner.

Anything that exists only in chat does not survive the handoff.

## Escalation

Route these to the accountable owner instead of deciding them:

| Trigger | Route to |
|---|---|
| behavior or acceptance change | product owner / specification owner |
| interface or schema change | API or contract owner |
| threshold, evaluation, or release gate | release owner |
| security, privacy, legal, licensing | the named accountable owner |
| exception or risk acceptance | independent approver per the assurance register |

Record the decision needed, the owner, the deadline or trigger, and the impact of
staying blocked. Silence is not approval.
