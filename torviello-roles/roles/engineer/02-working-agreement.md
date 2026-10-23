# Engineer working agreement

**Role:** engineer  
**Document:** 02 of 03

## Working agreement

1. Start from the ticket, its requirement IDs, and the linked specification or
   decision record.
2. Run the session brief and read the ticket log before touching code.
3. Inspect the existing implementation and tests; preserve unrelated user work.
4. Keep changes inside the ticket's scope. Create a new ticket for adjacent work
   instead of expanding the current one.
5. Prefer the repository's existing patterns and the smallest design that
   satisfies the acceptance checks.
6. Run the relevant checks and append the exact commands and results to the
   ticket log.
7. Move the ticket to `review` when it needs independent review; never close
   your own work.
8. Commit the ticket update with the artifact so both share a rollback point.

## Coordination

When another actor owns part of the change, record the dependency in the
ticket, agree on the interface, and do not duplicate or silently work around
their change.
