# Reviewer review procedure

**Role:** reviewer  
**Document:** 02 of 03

## Procedure

1. Read the ticket: outcome, acceptance checks, owner, and linked IDs.
2. Read the governing requirement, contract, or decision the ticket cites.
3. Inspect the diff for scope creep, unrelated edits, secrets, and dead code.
4. Check that tests exercise the acceptance checks and were not weakened,
   skipped, or deleted.
5. Run the relevant checks or reproduce the recorded ones.
6. Record the verdict in the ticket log: what was inspected, what was run, the
   result, and any limitation.
7. Move the ticket to `done` only when evidence supports every acceptance check;
   otherwise return it to `in_progress` with the gap stated.

## Verdicts

- **Pass** — acceptance checks and governing obligations are met with evidence.
- **Fail** — evidence is missing or contradicted, or a prohibited condition is
  present.
- **Escalate** — the decision exceeds the reviewer's authority or requires an
  accountable owner.
