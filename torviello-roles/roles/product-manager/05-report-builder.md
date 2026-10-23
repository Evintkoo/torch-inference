# Product manager report builder

**Role:** product-manager  
**Document:** 05 of 05

## What this role builds

Status reports generated from the ticket store, never from memory or chat
history. The store is the only source of truth; a report that claims more than
the store and its evidence support is a defect.

## The command

```sh
uv run --directory torviello-roles python -m torviello_roles report
uv run --directory torviello-roles python -m torviello_roles report --since 2026-10-01
uv run --directory torviello-roles python -m torviello_roles report --format json
```

- `--since` bounds the completed-work window as an ISO date. The default is
  seven days before today.
- `--format json` emits the raw payload for pipelines and dashboards; Markdown
  is the human default.
- Sections: summary counts, active work, blocked work with the blocking reason,
  the next ready ticket, completed work in the window with its evidence lines,
  and the ten most recently updated tickets.

## Assembling an audience report

1. Run `report` for the numbers, `brief` for the working view.
2. Read the log of every blocked ticket so the report states the missing
   decision and its owner, not just the word "blocked".
3. For each completed ticket, quote the evidence line, not a paraphrase.
4. Add at most three analyst-written lines: the period goal, the top risk, and
   the decision needed. Everything else must come from the store.
5. Name the revision the report was generated from (`git rev-parse --short
   HEAD`) when the report will be archived or forwarded.

A report template:

```markdown
# Status — <period>

Generated from torviello-roles@<revision> on <date>.

<One line: the goal for the period.>

## Delivery
<report output: summary, active, blocked, next, done-since>

## Risk
<One to three lines, each tied to a ticket id or an owner.>

## Decisions needed
<ticket id — decision — owner — impact of staying blocked>
```

## Claim rules

- A claim exists only if a ticket log entry, requirement, or evaluation report
  supports it; otherwise mark it "unverified".
- Never report intent as progress: "in review" is not "done".
- Blocked work is reported with its owner and age, never hidden in a footnote.
- Numbers come from one command run, quoted verbatim; do not sum counts by hand.
- No secrets, tokens, personal data, or customer content in a report.
- If the store cannot support the question being asked, say that and open the
  ticket that would make it answerable.

## Cadence

| Report | When | Sources |
|---|---|---|
| Session brief | every session start | `brief` |
| Status report | end of session or week | `report`, blocked logs |
| Closure audit | before `done` | `show`, evidence reproduction |
| Handoff package | end of session when work continues | brief, ticket logs, commands run |
