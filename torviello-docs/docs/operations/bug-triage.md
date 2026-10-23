# Bug Filing and Triage Workflow

Copyright (c) 2026 Torviello.

## Filing

Use the bug report issue template. The canonical 12-section standard is
[bug-report-standard.md](bug-report-standard.md); it is normative through
CHG-06.13. Every report must include the affected version, environment,
reproduction, expected versus actual result, impact, and redacted evidence.
Security reports use the private path in [SECURITY.md](../../SECURITY.md).

## Triage

The `triage` GitHub workflow labels new reports and assigns the initial
owner. A human triager confirms severity within one business day:

| Severity | Meaning | Response |
|---|---|---|
| S1 | data loss, security, or full outage | immediate |
| S2 | major feature unavailable | 1 business day |
| S3 | limited defect with workaround | 3 business days |
| S4 | cosmetic or documentation | next planning cycle |

## Lifecycle

`new -> triaged -> accepted -> in-progress -> verification -> closed`

AI and analytics reports must also record prompt/context, model version,
retrieval context, tool calls, source-data version, generated artifacts,
ground-truth reference, and evaluation result where applicable. Severity and
priority are separate fields.

A bug closes only when the fix is merged, a regression test exists, and the
reporter or owner confirms the result. Duplicate, invalid, and deferred
reports record the disposition and reason. Security defects additionally
require an advisory and a CVE decision.
