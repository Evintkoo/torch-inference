# Reviewer verdict and escalation

**Role:** reviewer  
**Document:** 03 of 03

## Verdict entry

Append one entry with this shape:

```text
- 2026-10-23 — review: pass — inspected <paths>; ran <commands>; results <observed>; limitations <none or list>
```

Verdicts:

| Verdict | Meaning | Action |
|---|---|---|
| pass | acceptance and governing obligations are met with evidence | `done <id> --evidence "review: pass ..."` |
| fail | evidence is missing, contradicted, or a prohibited condition is present | `move <id> in_progress --reason "<gap>"` |
| escalate | the decision exceeds reviewer authority | `block <id> --reason "<decision and owner>"` |

## Independence

Record the reviewer role separately from the author role. When the governing
control requires independent review, a self-review is not a review; it is a
missing control.

## Escalation

Escalate instead of approving when the change:

- alters approved behavior, a contract, a threshold, or an exception;
- creates a security, privacy, legal, licensing, or release risk;
- contradicts a requirement, specification, or decision record;
- relies on evidence the author cannot produce.

State the decision needed, the accountable owner, and the effect on the ticket.
An escalated ticket stays open; silence is not approval.

## Closing

Closing a ticket is an evidence action, not a social one:

```sh
uv run --directory torviello-roles python -m torviello_roles done <id> \
  --evidence "review: pass — <commands> — <results>"
```

If the evidence does not support every acceptance check, the verdict is fail.
