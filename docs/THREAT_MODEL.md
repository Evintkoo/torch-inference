# Threat Model

Copyright (c) 2026 Torviello.

## Assets

- model weights and integrity metadata;
- operator credentials and bearer tokens;
- inference requests and bounded diagnostic logs;
- the local persistence store.

## Trust boundaries

The HTTP boundary, WebSocket upgrade, model download path, and administrative
registry API are untrusted. The process boundary and local model cache are
trusted only after checksum verification.

## Threats and controls

| Threat | Control |
|---|---|
| Unauthorized inference | JWT authentication and role checks |
| Path traversal | confined path resolution and input validation |
| Model substitution | HTTPS and SHA-256 verification before activation |
| Request flooding | rate limiting, body limits, bounded queues |
| Secret leakage | environment injection and log redaction |
| Supply-chain compromise | lockfiles, SBOM, signed release artifacts |

Residual risks are tracked in [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md) and
reviewed at each release gate.
