# Designer interface states and flows

**Role:** designer  
**Document:** 02 of 05

## Enumerate the states first

For every screen or surface, write the full state list before any flow:

- loading (with its timeout and its timeout message),
- empty (first run and "user emptied it" are different states),
- populated (normal case),
- partial (some data missing or stale),
- error (per failure class: invalid input, unauthorized, not found, timeout,
  backend unavailable),
- degraded (fallback mode after retries),
- unauthorized, and
- terminal states of every flow (success, cancelled, failed).

A state that cannot be named is a requirement gap: raise it on the ticket, do
not improvise it during review.

## Specify transitions, not pictures

For each transition, record trigger, guard, result, and the user-visible
signal:

```text
state: loading
  on: response ok          -> populated   (data rendered; no layout shift)
  on: response 401         -> unauthorized (sign-in prompt; input preserved)
  on: timeout 10s          -> error        (retry button; cause named)
  on: backend unavailable  -> degraded     (cached data + staleness notice)
```

Rules:

- Every flow has a terminal state; no dead ends, no silent disappearance.
- Every error names the cause in user language and offers the next action.
- Input the user typed survives an error path or the spec says why it cannot.
- Destructive actions require an explicit confirmation naming the consequence.
- Concurrency: two writers on the same resource resolve by the rule the
  contract defines (last-write, reject, or merge); the spec shows the message.

## Write the acceptance checks with it

Each state and transition becomes a check the tests can assert:

```text
Given the backend returns 503 for /v1/jobs
When the jobs view finishes loading
Then the degraded banner is visible, names the outage, and offers retry
And cached rows render with their stale timestamp
```

Name the copy verbatim in the ticket so tests and review assert the same
string. Record the spec in the ticket log before implementation starts:

```sh
uv run --directory torviello-roles python -m torviello_roles log <id> \
  "spec: jobs view states + transitions recorded below"
```

## Verify against the build

Screen composition follows the UI principles and atomic inventory in
document 04; a state built from a forked component instead of the inventory is
a finding.

Walk the implemented interface state by state against the spec; each mismatch
is a finding with the state, the expected, and the observed. Force the error
paths deliberately (stop the backend, revoke the token, send malformed input) —
a path nobody forced is a path nobody verified.
