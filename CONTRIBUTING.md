# Contributing

Copyright (c) 2026 Torviello.

## Change flow

1. File or link an issue with a requirement ID, control ID, or explicit bug
   reproduction.
2. Write or update the specification and acceptance criteria.
3. Add a failing test, then the smallest implementation that passes it.
4. Update contracts, documentation, and evidence in the same change.
5. Run `just verify` and attach the command output to the review.

## Bug filing

Use `.github/ISSUE_TEMPLATE/bug_report.md` and the canonical 12-section standard in [bug-report-standard.md](docs/operations/bug-report-standard.md). Include:

- affected version and platform;
- minimal reproduction;
- expected and observed behavior;
- logs with secrets removed;
- severity and user impact.

The `triage` workflow validates required sections, labels incomplete reports
`needs-info`, and routes complete reports to triage. Automation never sets
final severity or closes a defect. Severity, priority, response targets, and
closure evidence are defined in
[docs/operations/bug-triage.md](docs/operations/bug-triage.md) and CHG-06.13.

## Review rules

A change is not complete until tests, contracts, and documentation agree.
Do not weaken a test or acceptance threshold to make a change pass. Security
reports follow [SECURITY.md](SECURITY.md), not the public bug queue.
