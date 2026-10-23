# Product manager priorities, readiness, and blockers

**Role:** product-manager  
**Document:** 03 of 04

## Prioritization

Order work by value, risk, dependency, and urgency. Record the rationale in the
ticket when the order is not obvious. A deferral records its impact and the
condition that brings it back.

## Ready

A ticket is ready when it has:

- one owner that resolves to a role directory;
- an observable outcome;
- acceptance checks another actor can reproduce;
- linked requirement and control IDs, or an explicit "none apply";
- blocking decisions resolved or explicitly accepted.

A ticket that cannot state how completion is observed stays in `backlog`.

## Blocked

Record the exact missing input, the person or role who can unblock it, and the
condition that ends the block. Remove the block by changing the ticket state and
appending the reason; never delete the blocked entry.

## Done

Done requires recorded evidence for every acceptance check and any required
independent review. Close with `--evidence`; do not close from memory.

## Hygiene

Surface stale tickets, orphaned work, duplicated tickets, and dependencies that
changed. Keep ids stable; cancel rather than delete.
