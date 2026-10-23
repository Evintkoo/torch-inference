# Quality assurance defect reporting and triage

**Role:** quality-assurance  
**Document:** 04 of 04

## Reproduce first

A defect report without a reproduction is a hypothesis. Before filing:

1. Re-run on a clean tree at the recorded revision.
2. Reduce the case to the smallest command that fails.
3. Capture the exact command, the exact output, and the revision.
4. Check `git log` for a recent change that could explain it; say so if found.

If it does not reproduce, record the two runs and the environmental difference.
Do not file intermittent behavior as deterministic.

## The 12-section report

File every defect with all twelve sections (repository standard:
`docs/operations/bug-report-standard.md`, `CHG-06.13`). A missing section makes
the report invalid:

1. Title — one line: area, behavior, deviation.
2. Summary — what is broken, in one paragraph.
3. Environment — revision, platform, configuration, feature flags.
4. Preconditions — state, data, or setup required.
5. Steps to reproduce — the exact commands in order.
6. Expected result — from the requirement, contract, or acceptance check, with
   its id.
7. Actual result — the observed output, quoted.
8. Evidence — logs, test output, traces; referenced by path, never secrets.
9. Regression? — whether this worked before, and the suspect revision.
10. Impact — who is affected and how; safety, data, security, availability.
11. Severity and priority — proposed, with rationale (a human owner sets the
    final severity).
12. Suggested next step — fix, guard, document, or investigate.

Open the report as a ticket (`new "..." --label bug --status ready`) and link
the requirement or contract id the behavior violates.

## Severity and priority

Propose severity by impact and priority by urgency, independently — a severe
bug with a workaround can be low priority; a trivial bug on a release path can
be high:

| Severity | Definition |
|---|---|
| S1 | data loss, security exposure, safety issue, or the product is unusable |
| S2 | core flow broken; workaround exists but is costly |
| S3 | degraded behavior or an unhandled edge; workaround is cheap |
| S4 | cosmetic or documentation drift |

The human owner sets the final severity and priority; the report proposes,
it does not decide.

## Triage rules

- Every defect has one owner role and one linked ticket; duplicates are merged,
  not deleted.
- A defect found in review returns the ticket to `in_progress` with the report
  attached; it does not silently ride along in the next change.
- A defect that questions an approved contract, threshold, or decision is
  escalated to the accountable owner, not argued to closure in the ticket.
- An escaped defect (found after release or closure) gets a brief root-cause
  note on its report: why the existing tests did not catch it, and which
  technique (boundary, state transition, failure injection) now covers it.

## Regression control

- Every accepted fix adds the failing-first regression test named in the report.
- The regression test cites the defect ticket id in its name or docstring.
- When a fix cannot add a test (hardware, timing), the report records the manual
  reproduction and the reviewer acknowledges the coverage gap in the verdict.
