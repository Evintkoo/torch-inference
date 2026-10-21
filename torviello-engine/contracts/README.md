# torviello-engine/contracts

Part of **torviello-engine** — Core PyTorch inference runtime. Brand message: Inference built for AI-native systems.

## Purpose

Machine-readable interface and event contracts with versioning.

## Contents

- [openapi.yaml](openapi.yaml) — authoritative HTTP contract for health, catalog, acquisition, speech, vision, assistant proxy, observability, and administration. Success uses the result envelope; failure uses RFC 9457 `application/problem+json` with stable engine extensions.
- [schemas/](schemas/) — generated JSON Schema 2020-12, grouped by domain:
  - `common/` — envelope, error, HTTP status policy, and one response schema per assigned status under `common/status/`.
  - `health/`, `catalog/`, `models/`, `speech/`, `vision/`, `assistant/`, `system/` — reusable response and request components.
  - `operations/<domain>/` — one request/response schema set per OpenAPI operation, using the same domain names.
- [events/catalog.yaml](events/catalog.yaml) — normative event payload catalog.
  - `events/schemas/lifecycle/`, `configuration/`, `models/`, `inference/`, `streaming/`, `security/`, `limits/`, `operations/` — one generated schema per event.
- [events/asyncapi.yaml](events/asyncapi.yaml) — SSE and WebSocket transport contract referencing the event and component schemas.
- [traceability.md](traceability.md) — mapping from every feature specification to its HTTP operations, events, and schemas.
- [schemas/common/http-response-standards.md](schemas/common/http-response-standards.md), [schemas/common/http-status.yaml](schemas/common/http-status.yaml), and [schemas/common/status/](schemas/common/status/) — approved status-code policy for `1xx` through `5xx` and one generated JSON Schema per assigned status, with RFC citations, engine use, body shape, and required headers.
- [api-inventory.md](api-inventory.md) — route, authentication, requirement, check, limit, and error-status traceability, including versioned aliases and RFC 9457 error semantics.
- [tools/contracts.py](tools/contracts.py) — deterministic generator and staleness checker for the schema set.

## Contract rules

1. The OpenAPI document and the router must agree in both directions. A route missing from either side is a contract defect.
2. Alias routes resolve to the same handler and preserve status, headers, and body shape.
3. Adding a capability requires its requirement, check, route, schema, limit, and error mapping in the same change.
4. Event payloads are described in [`../domain/events.md`](../domain/events.md) and must not carry secrets or payload content.
5. Contract changes that remove a field, change a status, or rename an error code require a new version and a recorded decision.
6. The contract MUST be OpenAPI 3.2.1, pass lint and router parity, and produce zero unintended breaking diffs. Errors MUST be RFC 9457 `application/problem+json`; remote listeners MUST use TLS 1.3 and RFC 8725 asymmetric JWT algorithms. Evidence follows [HPA-4](../../requirements/assurance-standard.md).
7. Every OpenAPI operation MUST be exercised against the running router by `cargo test --test endpoint_usage`. The test fails on an unrouted operation, an undeclared status or media type, or a catalog header/body/error-code violation. Operations declaring `501` are reserved and MUST return `not_implemented`; all others MUST NOT.

## Validation

```sh
uv run python torviello-engine/contracts/tools/contracts.py check
uv run python torviello-engine/contracts/tools/status_tester.py
cargo test --locked --test endpoint_usage
uv run pytest -q torviello-enforcer/test_contract_artifacts.py
uv run pytest -q torviello-enforcer/test_status_tester.py
uv run pytest -q torviello-enforcer/test_requirement_documents.py
```

The checks validate the OpenAPI document and the HTTP status catalog, validate every JSON Schema against the 2020-12 metaschema, resolve every schema and AsyncAPI payload reference, compare every generated artifact against its source, verify event coverage against `../domain/events.md`, require a traceability row for every feature, and exercise every declared operation against the running router. Run `tools/contracts.py generate` after editing `openapi.yaml` or `events/catalog.yaml`; never edit generated files by hand.

## Status

The HTTP contract, standalone schema set, event catalog, AsyncAPI document, and feature traceability exist and validate structurally. `endpoint_usage` exercises all 32 declared operations and checks routing, declared status, operation-declared media type, and catalog response rules; 13 are implemented and 19 are reserved `501` responses. Generated schemas are still not evidence that every operation emits a conformant payload, and no event emission is implemented or tested. Event payload fields were derived from the domain event specification and require producer/consumer review before they are treated as agreed.
