# Incident Response

Copyright (c) 2026 Torviello.

## Severity

- SEV-1: safety, security, or full outage.
- SEV-2: degraded inference or failed model activation.
- SEV-3: limited defect with a workaround.

## Response steps

1. Acknowledge and assign an incident commander.
2. Contain the impact; preserve logs and audit evidence.
3. Restore service with the rollback runbook.
4. Notify affected users and, for security events, publish an advisory.
5. Record timeline, root cause, and corrective actions.

Security incidents follow [SECURITY.md](../SECURITY.md). Bug reports that are
not security-sensitive go through [bug triage](operations/bug-triage.md).
