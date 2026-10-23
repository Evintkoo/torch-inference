# Security Policy

Copyright (c) 2026 Torviello.

## Supported versions

Security fixes are provided for the current minor release and the previous
minor release. End-of-life dates are recorded in
[docs/SUPPORTED_PLATFORMS.md](torviello-docs/docs/SUPPORTED_PLATFORMS.md).

## Reporting a vulnerability

Do not open a public bug for a suspected vulnerability. Send a private report
to the security owner with the affected version, reproduction steps, impact,
and any known workaround. Encrypt sensitive evidence when requested.

## Vulnerability response

1. Acknowledge the report within two business days.
2. Triage severity and assign a control owner.
3. Reproduce and contain the issue.
4. Prepare a fix, regression test, and advisory.
5. Publish a CVE or GitHub security advisory after affected users can upgrade.
6. Record the response, root cause, and follow-up controls.

The response process follows the assurance register and is reviewed at each
release gate. Emergency publication follows the rollback and incident
runbook in [docs/INCIDENT_RESPONSE.md](torviello-docs/docs/INCIDENT_RESPONSE.md).

## Bug reports

Non-security defects use the bug report issue template. The triage workflow,
severity matrix, and closure evidence are documented in
[docs/operations/bug-triage.md](torviello-docs/docs/operations/bug-triage.md).
