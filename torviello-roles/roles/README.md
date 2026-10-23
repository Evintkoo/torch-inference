# Roles

Functional role definitions for tracked work. Each role is a directory whose
name is the role id used by `owner` in a ticket. Numbered documents inside the
directory describe that role's accountability, working agreement, and evidence
rules.

| Role id | Executes | Documents |
|---|---|---|
| [`product-manager`](product-manager/) | ticket craft, prioritization, dependency graph, evidence audit, report building, session memory | 5 |
| [`engineer`](engineer/) | design before code, implementation craftsmanship, reliability and security, verification, handoff | 5 |
| [`designer`](designer/) | interface states and flows, UI principles and atomic composition, WCAG 2.2 AA and usability evidence | 4 |
| [`quality-assurance`](quality-assurance/) | test strategy and execution, ISO 25010 mapping, defect reproduction and reporting | 4 |
| [`reviewer`](reviewer/) | independent diff review, reproduced checks, verdict | 3 |

Roles are hands-on: each one names the artifacts it produces and the commands it
runs. Roles are functional, not job titles. One person may hold several roles
when the governing control allows it; a required independent review still needs a
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
