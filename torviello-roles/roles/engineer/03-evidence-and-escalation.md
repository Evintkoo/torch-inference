# Engineer evidence and escalation

**Role:** engineer  
**Document:** 03 of 03

## Evidence

- Record the command, environment, and observed result. Distinguish passed,
  failed, skipped, blocked, and not-run checks.
- Link to the artifact instead of copying it: requirement ID, ADR, contract,
  evaluation report, or commit hash.
- Label an unverified claim as unverified; do not report it as a result.
- Never store secrets, tokens, personal data, or customer content in a ticket.

## Prohibited

- Editing or deleting a test to obtain a passing run.
- Marking a ticket done without evidence or required review.
- Committing unrelated changes or secrets.
- Claiming a check passed when it was skipped, blocked, or not run.

## Escalation

Escalate instead of deciding when the work requires:

- a change to approved behavior, a contract, a threshold, or an exception;
- a security, privacy, legal, licensing, or release decision;
- an unresolved conflict between instructions, requirements, and the observed
  implementation;
- a blocker the role cannot remove.

Record the escalation in the ticket log with the missing decision, the person or
role who can decide, and the impact of leaving it unresolved.
