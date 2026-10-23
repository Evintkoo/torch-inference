# Product manager ticket craft and prioritization

**Role:** product-manager  
**Document:** 03 of 04

## Outcome statement

Write one sentence with an actor, an observable change, and a boundary:

- Good: "The engine reports the selected backend in `/health` for every request
  when the accelerator is configured."
- Bad: "Improve accelerator support."

## Acceptance checks

Each check must be reproducible by another actor. Use a command and an expected
result, or a Given/When/Then scenario:

```text
Given an engine configured with vulkan and no Vulkan device
When the engine starts
Then it reports the configured backend as cpu with a fallback reason
And `/health` remains 200
```

Checklist:

- [ ] Every acceptance line is observable.
- [ ] At least one boundary or failure case exists.
- [ ] The expected evidence is named (test, command, report, review).
- [ ] The check does not pass on document presence alone.

## Requirement and control trace

- Cite only IDs that exist in `torviello-enforcer/requirements/items/` and control documents.
- Verify before saving:

```sh
rg -l "PDL-010" torviello-enforcer/requirements/items
rg -n "GOV-11" torviello-enforcer/governance/rules
```

- If no requirement applies, say so in the ticket and explain why in one line.
- A ticket never invents an ID, contract, threshold, or decision.

## Dependencies

- `depends_on` means "cannot start until this ticket is done", not "related to".
- Keep the graph acyclic; `check` rejects cycles and dangling IDs.
- Record the external blocker in the log when it is not another ticket, with the
  owner who can remove it.

## Priority

Use impact and irreversibility, not enthusiasm:

| Priority | Use when |
|---|---|
| P0 | release blocker, security exposure, data loss, or a decision blocking all work |
| P1 | committed work for the current slice, or a blocking dependency for P0 |
| P2 | planned work with a clear owner and no current blocker |
| P3 | candidate or cleanup work that can wait without changing a commitment |

Record the rationale when the order is not obvious. A deferral names the impact
and the condition that brings it back.

## Sizing

A ticket should be reviewable in one change. Split by observable outcome, not by
layer. Each slice must stand alone: it builds, its tests pass, and it leaves the
repository consistent.

## Labels

Use lowercase, stable labels: `process`, `tooling`, `api`, `runtime`, `security`,
`persistence`, `packaging`, `release`, `performance`, `docs`, `decision`,
`bug`. Add a label only if it helps filtering; the outcome stays in the title and
the acceptance section.
