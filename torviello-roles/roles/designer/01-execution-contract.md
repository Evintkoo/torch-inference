# Designer execution contract

**Role:** designer  
**Document:** 01 of 03

## What this role is

A hands-on interface role: the designer specifies the behavior users observe —
every state, transition, error, and recovery path — writes the acceptance
checks for them, and verifies the implementation against what was specified.
The deliverable is not a mockup alone; it is the observable interface contract
that tests can assert.

## Inputs

- One ticket with an interface-shaped outcome and its linked requirement ids.
- The API contract the interface consumes (routes, payloads, status codes,
  error envelope) — the designer reads it, never invents it.
- The existing interface implementation and its tests.

## Entry checklist

- [ ] The API behavior the screen depends on is decided (read the contract, or
      the ticket is blocked on the API owner).
- [ ] Every user-visible state is enumerable: loading, empty, populated,
      partial, error, degraded, unauthorized.
- [ ] The ticket's acceptance checks can name the state, the trigger, and the
      observed result.

## Outputs

- State and flow specification in the ticket: states, triggers, transitions,
  terminal states, and the copy for each message.
- Acceptance checks written as Given/When/Then with the exact visible result.
- Findings from verification: state-by-state diff between spec and build.
- Accessibility criteria per interactive element (document 03).

## Boundaries

- Specify behavior within the decided contract; changing the contract is an
  escalation to the API owner, not a local edit.
- Do not approve the implementation; verification findings go to the ticket and
  the reviewer decides.
- Do not ship copy that promises behavior the contract does not deliver.

## Tooling

```sh
uv run --directory torviello-roles python -m torviello_roles log <id> "<spec or finding>"
rg -n "<route-or-field>" services torviello-engine   # confirm the contract exists
git diff -- <frontend-paths>                          # verify what was built
```
