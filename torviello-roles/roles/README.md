# Roles

Functional role definitions for tracked work. Each role is a directory whose
name is the role id used by `owner` in a ticket. Numbered documents inside the
directory describe that role's accountability, working agreement, and evidence
rules.

| Role id | Accountable for | Documents |
|---|---|---|
| [`product-manager`](product-manager/) | ticket store, priorities, session memory, honest status | 4 |
| [`engineer`](engineer/) | implementing and verifying a ticket within its scope | 3 |
| [`reviewer`](reviewer/) | independent review before closure | 3 |

Roles are functional, not job titles. One person may hold several roles when the
governing control allows it; a required independent review still needs a
different reviewer.

## Structure

```text
roles/<role-id>/
  README.md          index of the role's numbered documents
  01-<topic>.md      accountability and scope
  02-<topic>.md      working agreement or procedure
  03-<topic>.md      evidence, escalation, or separation
```

## Adding a role

1. Create `roles/<role-id>/` with a `README.md` index and numbered documents.
2. State the mission, duties, authority boundaries, required records, and
   escalation path.
3. Reference the role from tickets with `--owner <role-id>`.
4. Keep the accountability map consistent with the organization controls; a
   ticket role does not grant authority by itself.
