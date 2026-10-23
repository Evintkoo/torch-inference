# Standardized Bug Reporting Format

Copyright (c) 2026 Torviello.

This is the repository standard for engineering, QA, infrastructure, AI, and
analytics defects. It is normative through CHG-06.13. A report must let an
engineer reproduce the defect, separate confirmed observations from
hypotheses, and verify the fix objectively.

## Twelve required sections

| Section | Purpose | Requirement |
|---|---|---|
| 1. Issue Metadata | identification, ownership, severity, priority | required |
| 2. Summary | concise problem statement | required |
| 3. Preconditions | state required to trigger the issue | when relevant |
| 4. Steps to Reproduce | exact sequence of actions | required |
| 5. Expected Behavior | correct outcome | required |
| 6. Actual Behavior | observed incorrect outcome | required |
| 7. Reproducibility | frequency and consistency | required |
| 8. Environment | platform, version, deployment | required where known |
| 9. Evidence | screenshots, logs, identifiers | required when available |
| 10. Impact Assessment | user and business consequences | required |
| 11. Technical Investigation | diagnostic data and hypotheses | optional at filing |
| 12. Verification Criteria | conditions to confirm resolution | required before closure |

The first nine sections establish a usable report. The final three improve
prioritization, investigation, and closure.

## Severity and priority

Severity measures technical or user-facing impact. Priority determines how
urgently the team should act. They are separate fields and must not be
collapsed into one value.

| Severity | Definition |
|---|---|
| S1 Critical | system unavailable, serious data loss or corruption, or major security impact |
| S2 High | major functionality broken, or materially incorrect output in an important workflow |
| S3 Medium | partial failure with an acceptable workaround |
| S4 Low | minor visual or functional defect with limited impact |

| Priority | Definition |
|---|---|
| P0 Immediate | immediate investigation and response |
| P1 High | address in the current engineering cycle |
| P2 Normal | schedule through the regular backlog |
| P3 Low | defer until capacity is available |

## AI-native diagnostics

AI and analytics reports must add:

- exact prompt and conversation context;
- model and version;
- retrieval context;
- tool calls and arguments;
- source-data version;
- generated artifacts;
- ground-truth reference;
- evaluation or validation result.

These fields must distinguish confirmed observations from hypotheses. A
plausible root cause is not a verified finding.

## Lifecycle

```text
new -> triaged -> accepted -> in-progress -> verification -> closed
                         ^                         |
                         +---- failed verification-+
```

A failed verification reopens the defect to `in-progress` and retains the
failed evidence. Duplicate, invalid, deferred, and risk-accepted reports record
a disposition and reason. The triage workflow may label and route a report but
must not set final severity, accept risk, or close the issue.

## Closure rule

An issue closes only when the original reproduction no longer fails, expected
behavior is verified against an authoritative reference, regression tests
pass, related workflows are checked, verification is performed in the affected
environment, and evidence is attached. The record must name the fix revision,
fixed version, verifier, verification date, and final status.
