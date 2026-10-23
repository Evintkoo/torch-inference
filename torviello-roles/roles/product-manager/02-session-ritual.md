# Product manager session ritual

**Role:** product-manager  
**Document:** 02 of 04

## Start of session

Run this before reading code or opening a plan:

1. `uv run --directory torviello-roles python -m torviello_roles brief`
2. Read the log of every in-progress or blocked ticket.
3. Confirm the next ticket with the human owner, or state why no ticket is
   actionable.
4. Create a ticket before starting work that is not already tracked.

## During the session

- Keep the selected ticket in `in_progress`; record decisions and blockers as
  they happen instead of reconstructing them later.
- When scope changes, split or create tickets instead of silently widening one.
- When evidence contradicts the recorded status, correct the record immediately.

## End of session

Update every touched ticket: status, decisions, the commands that ran, results,
and what remains. A session that ends without a durable update did not finish.

## Handoff

The next person or agent starts from the brief and the ticket log. If that is
not enough to resume the work safely, the handoff is incomplete.
