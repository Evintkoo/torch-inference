# Designer functional design

**Role:** designer  
**Document:** 05 of 05

Functional design defines **what a capability does** — who may trigger it,
what the system does in response, and how the user knows it worked — before
any state machine (document 02) or visual composition (document 04) is
written. Visual work that starts without a functional design is decoration of
an undecidinated behavior.

## 1. Capability statement

One sentence per capability, naming the actor, the action, and the observable
result:

> "An operator can restart a failed ingestion job, and the jobs view shows the
> job returning to the queued state."

If the sentence needs a second "and", it is two capabilities — decompose.

## 2. Functional decomposition

Break the capability into numbered functions (F-01, F-02, …). Each function is
one user-perceivable behavior small enough to accept and verify alone. The
decomposition goes on the ticket, and every downstream artifact (states,
sheets, checks) cites function numbers.

## 3. Interaction contract per function

For each function, write trigger → response → outcome:

```text
F-02 restart failed job
  trigger:    operator activates "Restart" on a job in the failed state
  guard:      operator holds the jobs.restart permission; job is failed
  response:   system calls POST /v1/jobs/{id}/restart (contract v1)
  outcome:    job enters queued; the row shows the queued state and a
              confirmation notice states the job id
  invariants: a running or queued job exposes no restart control;
              concurrent restarts are rejected by the contract and the UI
              shows the contract's 409 message verbatim
```

Rules:

- Guards, permissions, and limits are stated, not implied; they come from the
  contract or the requirement, never invented locally.
- Every trigger has a visible response within the feedback budget the spec
  defines (loading, success, failure — never silence).
- The user can always tell whether the action worked: completion criteria are
  part of the function, not an afterthought.

## 4. Data needs

Per function: what data it displays, where it comes from (contract endpoint or
computed), what it must persist, and what it must never display (secrets,
other tenants' data). A function whose data has no contract is blocked on the
API owner — record it, do not mock silently.

## 5. Exceptions and degraded behavior

Enumerate the failure modes of the function and the functional response to
each: invalid input (inline validation message), unauthorized (explained, with
the legitimate path), not found, timeout, backend unavailable (retry? cached?
queue for later?). The states document turns these into UI states; functional
design decides what the system *does*, functionally, in each case.

## 6. Mapping to acceptance and requirements

- Every function maps to at least one acceptance check on the ticket, stated
  as command-plus-result or Given/When/Then.
- Every function cites the requirement id it serves; a function serving no
  requirement is scope creep and is removed or escalated.
- Functional changes are requirement-level decisions: if the behavior itself
  must change, that goes to the product owner per the escalation matrix —
  the designer adjusts the record, not the decision.

## Ordering

Functional design (this document) → states and flows (document 02) → design
sheets and composition (document 04) → accessibility and usability evidence
(document 03) → verification against the build. Skipping a stage is a finding;
the reviewer checks the chain in the ticket log.
