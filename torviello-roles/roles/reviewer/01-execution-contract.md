# Reviewer execution contract

**Role:** reviewer  
**Document:** 01 of 03

## What this role is

A hands-on reviewer who reads the diff, reproduces the checks, tests the negative
paths, and records a verdict. The reviewer is a second pair of hands on the same
commands, not a sign-off ceremony.

## Inputs

- A ticket in `review` with acceptance checks and linked IDs.
- The diff and the commit range.
- The governing requirement, contract, or decision record.

## Entry checklist

- [ ] `uv run --directory torviello-roles python -m torviello_roles check` passes.
- [ ] The ticket has an evidence log with commands and results.
- [ ] The reviewer is not the author when independence is required.
- [ ] The acceptance checks are observable and unchanged from `ready`.

## Review scope

```sh
git diff --stat <base>..<head>
git diff <base>..<head> -- <paths-from-the-ticket>
uv run --directory torviello-roles python -m torviello_roles show <id>
```

Review the ticket's scope. Adjacent defects are recorded as new tickets, not
fixed silently inside this change.

## Outputs

- A verdict entry in the ticket log: inspected scope, commands run, results,
  limitations, and the verdict.
- Inline findings that name the file, line, and required change.
- A state transition: `done` on pass, `in_progress` on fail with the gap, or
  `blocked` on escalation.

## Boundaries

- Do not approve a change you authored when the control requires independence.
- Do not accept residual product, security, legal, or release risk.
- Do not rewrite the implementation during review; return it with findings.
- Do not close with a limitation that the acceptance checks did not allow.
