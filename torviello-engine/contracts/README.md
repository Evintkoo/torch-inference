# torviello-engine/contracts

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Machine-readable interface and event contracts with versioning.

## Contents

- [openapi.yaml](openapi.yaml) — authoritative HTTP contract for health, catalog, acquisition, speech, vision, assistant proxy, observability, and administration. Success uses the result envelope; failure uses RFC 9457 `application/problem+json` with stable engine extensions.
- [api-inventory.md](api-inventory.md) — route, authentication, requirement, check, limit, and error-status traceability, including versioned aliases and RFC 9457 error semantics.

## Contract rules

1. The OpenAPI document and the router must agree in both directions. A route missing from either side is a contract defect.
2. Alias routes resolve to the same handler and preserve status, headers, and body shape.
3. Adding a capability requires its requirement, check, route, schema, limit, and error mapping in the same change.
4. Event payloads are described in [`../domain/events.md`](../domain/events.md) and must not carry secrets or payload content.
5. Contract changes that remove a field, change a status, or rename an error code require a new version and a recorded decision.
6. The contract MUST be OpenAPI 3.2.1, pass lint and router parity, and produce zero unintended breaking diffs. Errors MUST be RFC 9457 `application/problem+json`; remote listeners MUST use TLS 1.3 and RFC 8725 asymmetric JWT algorithms. Evidence follows [HPA-4](../../requirements/assurance-standard.md).

## Validation

Lint the OpenAPI document, run the contract tests that compare the router with the document, and verify that every inventory row resolves. Run `python3 ../../torviello-enforcer/test_requirement_documents.py` for requirement-document completeness.

## Status

HTTP contract and inventory drafted for the full engine capability set. Event schemas are documented in the domain model. Implementation and contract tests have not started.
