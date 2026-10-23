# Privacy and Data Minimization

Copyright (c) 2026 Torviello.

Torviello Engine processes inference payloads locally. Request content is not
used to train models and is not sent to a remote service unless the operator
explicitly configures an upstream assistant proxy.

## Data classes

| Class | Retention | Access |
|---|---|---|
| Request payload | memory only unless diagnostics enabled | request owner |
| Diagnostic log | 7 days, rotated at 100 MB | operator |
| Model metadata | until model removal | registry owner |
| Audit event | 90 days | security owner |

Logs redact authorization headers, cookies, API keys, and model paths.
Operators can delete diagnostic logs through the audited administrative API.
Data-subject requests are handled by the privacy owner and recorded in the
assurance register.
