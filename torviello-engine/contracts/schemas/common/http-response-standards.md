# HTTP response standards

**Status:** Approved for contract use by the project owner on 2026-10-21. This is policy, not evidence that a handler emits the status.

This document defines the complete response content contract for every engine HTTP and WebSocket response. It is governed by [HPA-4](../../../../requirements/assurance-standard.md). The machine-readable source is [http-status.yaml](http-status.yaml) (`version 2.0.0`), validated by [http-status.catalog.schema.json](../../http-status.catalog.schema.json). The generated per-status JSON Schemas are under [`status/`](status/).

## 1. Scope and conformance

The key words MUST, MUST NOT, REQUIRED, SHOULD, SHOULD NOT, MAY, and OPTIONAL are to be interpreted as described in RFC 2119.

1. A response is conformant only when its status, media type, body schema, required headers, cache policy, and retry semantics all match this document and the operation's OpenAPI response.
2. The status code alone is not the contract. Two responses with the same code may have different schemas, headers, or retry rules per operation.
3. This document does not claim handler behavior. Passing contract checks is necessary, not sufficient, for conformance.
4. Project policy may narrow a standard status but MUST NOT redefine its RFC meaning.

## 2. Normative sources

Precedence is the order below.

1. [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html), especially [§15 Status Codes](https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes).
2. [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html).
3. [RFC 9111 — HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111.html) for `304`.
4. Extension RFCs named in the detailed contract.
5. [IANA HTTP Status Code Registry](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml).

Gateway, proxy, and HTTP/1.1 message semantics follow RFC 9110 and RFC 9112. The engine never invents private status codes.

## 3. Response contract model

Every assigned status entry declares:

- `trigger`: the condition that permits the status;
- `content_type` and `schema`: the exact representation;
- `required_headers` and `optional_headers`: headers that are part of the response contract;
- `cache_control` and `retry`: caching and retry semantics;
- `body_fields` and `forbidden_body_fields`: required and prohibited body members;
- `error_codes`, `error_category`, and `retryable`: stable problem-details semantics.

An implementation MUST NOT emit a status whose `trigger` does not apply. An implementation MUST NOT omit a required header or required body field.

## 4. Body selection

| Body kind | Media type | Schema | Rule |
|---|---|---|---|
| `envelope` | `application/json; charset=utf-8` | `Envelope` | Every JSON capability result, including `data` and `meta`. |
| `problem+json` | `application/problem+json` | `ErrorEnvelope` | Every `4xx`/`5xx` on the engine surface, except `503` responses whose operation declares readiness or metrics content. |
| `none` | none | none | `204`, `101`, and interim responses; no body and no `Content-Type`. |
| `location` | none or text | none | Prohibited on the engine surface; aliases are served directly. |
| `upgrade` | none | none | `101` only; no JSON envelope. |
| `per-operation` | operation-declared | operation schema | `200` and `503` where readiness, metrics, and problem representations differ; the operation MUST declare the exact media type and schema. |
| `text`, `binary`, `sse` | operation-declared | operation schema | Metrics, audio, or event streams; declared per operation. |

A `2xx` JSON response MUST use `Envelope`. A `2xx` non-JSON response MUST use the media type declared by the operation. A `4xx` or `5xx` response MUST use `ErrorEnvelope` unless the status is `101`, `503` with operation-declared content, or a bodyless framework rejection.

## 5. Success envelope content contract

`Envelope` requires `data` and `meta`. `data` is operation-specific. `meta` is always present for JSON capabilities.

| Field | Type | Required | Constraint |
|---|---|---|---|
| `data` | any JSON | yes | Operation payload; `null` only when the operation schema permits it. |
| `meta.latency_ms` | integer >= 0 | yes | Server-observed latency. |
| `meta.model_id` | string | yes | Empty only for catalog-only responses. |
| `meta.postprocessing_applied` | boolean | yes | Whether postprocessing altered the result. |
| `meta.version` | string | yes | Engine API version. |
| `meta.request_id` | string | yes | Correlation ID for the request. |
| `meta.backend` | string | no | Selected backend, e.g. `cpu`. |
| `meta.postprocess_steps` | string[] | no | Applied steps in order. |
| `meta.warnings` | string[] | no | Safe non-fatal warnings. |

The envelope MUST NOT contain `type`, `code`, `category`, or other problem-details fields. Unknown members are allowed only where the operation schema declares them.

## 6. Problem details content contract

Every `4xx`/`5xx` response that carries problem details uses `application/problem+json` and `ErrorEnvelope`; operation-declared `503` readiness and metrics responses are the narrow exception.

| Field | Type | Required | Constraint |
|---|---|---|---|
| `type` | URI | yes | Stable problem-class URI; must resolve to documentation. |
| `title` | string | yes | Short human-readable summary; must not vary per occurrence. |
| `status` | integer 400–599 | yes | MUST equal the HTTP status line. |
| `code` | string | yes | Stable engine code from the detailed contract below. |
| `category` | enum | yes | One of validation, authentication, authorization, not_found, conflict, limit, unavailable, upstream, internal. |
| `detail` | string | no | Safe occurrence explanation; no paths, prompts, tokens, or stack traces. |
| `instance` | URI reference | no | `urn:torviello:request:<request_id>`. |
| `request_id` | string | no | Correlation ID; MUST equal the response `X-Request-Id` when that header is present. |
| `retryable` | boolean | no | True only for retryable conditions; pairs with `retry_after_ms`. |
| `retry_after_ms` | integer >= 0 | no | Present only when `retryable` is true; MUST agree with `Retry-After` seconds. |
| `errors` | array | no | Field-level validation failures with `field`, `code`, optional `detail`. |

`status` MUST equal the HTTP status. `code` MUST be one of the codes declared for that status below. `detail` MUST NOT contain host paths, prompts, transcripts, audio, images, tokens, credentials, or stack traces. `retry_after_ms` MUST be present only when `retryable` is true and MUST agree with `Retry-After`.

Example:

```json
{
  "type": "https://torviello.local/problems/model-not-found",
  "title": "Model not found",
  "status": 404,
  "code": "model.not_found",
  "category": "not_found",
  "detail": "The requested model is not registered.",
  "instance": "urn:torviello:request:00000000-0000-4000-8000-000000000000",
  "request_id": "00000000-0000-4000-8000-000000000000",
  "retryable": false
}
```

## 7. Header contract

| Header | Grammar | Value | Rule |
|---|---|---|---|
| `Allow` | 1#method | Comma-separated methods registered for the request target. | Every method declared for the path MUST appear; HEAD is implied by GET. |
| `Connection` | token | Upgrade | Required with 101 and an Upgrade header. |
| `Location` | URI-reference | Root-relative or absolute URI of the created resource. | Required on 201. Must not contain credentials. |
| `Retry-After` | delta-seconds | Non-negative integer seconds until the caller may retry. | HTTP-date form is not used. Required on 429 and retryable 503. |
| `Upgrade` | 1#protocol | websocket for 101; the required protocol token for 426. | Must name a protocol the server is willing to switch to. |
| `WWW-Authenticate` | challenge | Bearer realm="torviello" | Add error="invalid_token" for malformed or expired credentials; never echo the token. |

Header names are case-insensitive. Values are emitted in the canonical form above. A required header is part of the status contract even when the body is empty.

## 8. Cache and retry

- `Cache-Control: no-store` is required for every problem response, authentication response, model mutation, and SSE stream.
- Catalog reads MAY use `Cache-Control: public, max-age=60`; the operation contract decides.
- `Retry-After` is a whole number of seconds. The engine does not emit the HTTP-date form.
- A retryable response MUST set `retryable: true` and `retry_after_ms` in the body when a problem body is present.
- `429` and retryable `503` MUST include `Retry-After`; `500`, `501`, and non-retryable `503` MUST NOT invite an immediate retry.

## 9. Assigned status summary

`Engine` values: **used** (emitted by at least one operation declared in `openapi.yaml`), **conditional** (protocol- or framework-generated only; not required in `openapi.yaml`), **not-used** (prohibited on the engine surface).

### 1xx Informational
| Code | Name | Standard | Engine | Response |
|---|---|---|---|---|
| 100 | Continue | RFC 9110 §15.2.1 | not-used | No body. |
| 101 | Switching Protocols | RFC 9110 §15.2.2 | conditional | Switching from HTTP/1.1 to the WebSocket protocol. |
| 102 | Processing | RFC 2518 §10.1 | not-used | No body. |
| 103 | Early Hints | RFC 8297 §2 | not-used | No body. |
| 104 | Upload Resumption Supported | draft-ietf-httpbis-resumable-upload-05 | not-used | No body. |

### 2xx Successful
| Code | Name | Standard | Engine | Response |
|---|---|---|---|---|
| 200 | OK | RFC 9110 §15.3.1 | used | Result envelope; see content contract. |
| 201 | Created | RFC 9110 §15.3.2 | used | Result envelope; see content contract. |
| 202 | Accepted | RFC 9110 §15.3.3 | used | Result envelope; see content contract. |
| 203 | Non-Authoritative Information | RFC 9110 §15.3.4 | not-used | Result envelope; see content contract. |
| 204 | No Content | RFC 9110 §15.3.5 | used | No body. |
| 205 | Reset Content | RFC 9110 §15.3.6 | not-used | No body. |
| 206 | Partial Content | RFC 9110 §15.3.7 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 207 | Multi-Status | RFC 4918 §11.1 | not-used | Result envelope; see content contract. |
| 208 | Already Reported | RFC 5842 §7.1 | not-used | No body. |
| 226 | IM Used | RFC 3229 §10.4.1 | not-used | Result envelope; see content contract. |

### 3xx Redirection
| Code | Name | Standard | Engine | Response |
|---|---|---|---|---|
| 300 | Multiple Choices | RFC 9110 §15.4.1 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 301 | Moved Permanently | RFC 9110 §15.4.2 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 302 | Found | RFC 9110 §15.4.3 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 303 | See Other | RFC 9110 §15.4.4 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 304 | Not Modified | RFC 9110 §15.4.5 | not-used | No body. |
| 305 | Use Proxy | RFC 9110 §15.4.6 | not-used | No body. |
| 306 | (Unused) | RFC 9110 §15.4.7 | not-used | No body. |
| 307 | Temporary Redirect | RFC 9110 §15.4.8 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 308 | Permanent Redirect | RFC 9110 §15.4.9 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |

### 4xx Client Error
| Code | Name | Standard | Engine | Response |
|---|---|---|---|---|
| 400 | Bad Request | RFC 9110 §15.5.1 | used | Request syntax, path, parameter, model name, or source is invalid. |
| 401 | Unauthorized | RFC 9110 §15.5.2 | used | A protected route received no credential or an invalid/expired bearer token. |
| 402 | Payment Required | RFC 9110 §15.5.3 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 403 | Forbidden | RFC 9110 §15.5.4 | used | The authenticated principal lacks the required role or scope. |
| 404 | Not Found | RFC 9110 §15.5.5 | used | The path, model, acquisition job, or loaded slot does not exist. |
| 405 | Method Not Allowed | RFC 9110 §15.5.6 | conditional | The path exists but does not allow the request method. |
| 406 | Not Acceptable | RFC 9110 §15.5.7 | conditional | No representation matching Accept is available for the operation. |
| 407 | Proxy Authentication Required | RFC 9110 §15.5.8 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 408 | Request Timeout | RFC 9110 §15.5.9 | conditional | The server closed an idle or over-deadline request before completion. |
| 409 | Conflict | RFC 9110 §15.5.10 | used | The request conflicts with model, job, capacity, or unload state. |
| 410 | Gone | RFC 9110 §15.5.11 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 411 | Length Required | RFC 9110 §15.5.12 | conditional | A request that requires a framing length omitted Content-Length or chunked framing. |
| 412 | Precondition Failed | RFC 9110 §15.5.13 | conditional | A declared precondition such as If-Match failed. |
| 413 | Content Too Large | RFC 9110 §15.5.14 | used | The request body, batch, frame, or artifact exceeds the configured limit. |
| 414 | URI Too Long | RFC 9110 §15.5.15 | conditional | The request target exceeds the server URI length limit. |
| 415 | Unsupported Media Type | RFC 9110 §15.5.16 | used | The request Content-Type or Content-Encoding is not supported by the operation. |
| 416 | Range Not Satisfiable | RFC 9110 §15.5.17 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 417 | Expectation Failed | RFC 9110 §15.5.18 | conditional | An Expect header expectation cannot be met. |
| 418 | (Unused) | RFC 9110 §15.5.19 | not-used | No body. |
| 421 | Misdirected Request | RFC 9110 §15.5.20 | conditional | The connection authority does not match the request target authority. |
| 422 | Unprocessable Content | RFC 9110 §15.5.21 | conditional | The syntax is valid but semantic validation of the document failed. |
| 423 | Locked | RFC 4918 §11.3 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 424 | Failed Dependency | RFC 4918 §11.4 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 425 | Too Early | RFC 8470 §5.2 | conditional | Replay-unsafe early data arrived before the TLS handshake completed. |
| 426 | Upgrade Required | RFC 9110 §15.5.22 | conditional | The profile requires TLS 1.3 or a protocol upgrade before the request can proceed. |
| 428 | Precondition Required | RFC 6585 §3 | conditional | The operation requires a conditional request but none was supplied. |
| 429 | Too Many Requests | RFC 6585 §4 | used | The caller exceeded the configured request budget for the route or principal. |
| 431 | Request Header Fields Too Large | RFC 6585 §5 | conditional | Request header fields exceed the configured size limit. |
| 451 | Unavailable For Legal Reasons | RFC 7725 §3 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |

### 5xx Server Error
| Code | Name | Standard | Engine | Response |
|---|---|---|---|---|
| 500 | Internal Server Error | RFC 9110 §15.6.1 | used | An unhandled internal failure occurred; no internal detail is exposed. |
| 501 | Not Implemented | RFC 9110 §15.6.2 | used | The route is reserved by the contract but its capability is not implemented. |
| 502 | Bad Gateway | RFC 9110 §15.6.3 | used | An optional upstream returned an invalid response or failed before completion. |
| 503 | Service Unavailable | RFC 9110 §15.6.4 | used | A required model, backend, or dependency is unavailable. |
| 504 | Gateway Timeout | RFC 9110 §15.6.5 | used | An execution or upstream deadline expired. |
| 505 | HTTP Version Not Supported | RFC 9110 §15.6.6 | conditional | The request used an unsupported HTTP major version. |
| 506 | Variant Also Negotiates | RFC 2295 §8.1 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 507 | Insufficient Storage | RFC 4918 §11.5 | conditional | The managed asset store cannot accept the write because storage is exhausted. |
| 508 | Loop Detected | RFC 5842 §7.2 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 510 | Not Extended (Obsoleted) | RFC 2774 §7 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |
| 511 | Network Authentication Required | RFC 6585 §6 | not-used | Prohibited on the engine surface; no handler or framework fallback may emit this status. |

## 10. Detailed content contract

Each row is normative for the status. `—` means the member is not part of the contract. `Problem` rows use `ErrorEnvelope`; `Envelope` rows use `Envelope`.

| Code | Trigger | Media type | Body contract | Headers | Cache / retry | Error codes / category |
|---|---|---|---|---|---|---|
| 100 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | none (no body) | — | —; never | —; not retryable |
| 101 | Switching from HTTP/1.1 to the WebSocket protocol. | — | upgrade (no JSON envelope) | Upgrade, Connection | —; never | —; not retryable |
| 102 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | none (no body) | — | —; never | —; not retryable |
| 103 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | none (no body) | — | —; never | —; not retryable |
| 104 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | none (no body) | — | —; never | —; not retryable |
| 200 | Operation completed and returned its declared representation. | per-operation | `Envelope`; required: data, meta | — | per-operation; never | —; not retryable |
| 201 | A model registration created a new resource. | application/json | `Envelope`; required: data, meta | Location | no-store; never | —; not retryable |
| 202 | Acquisition or load work was accepted but is not complete. | application/json | `Envelope`; required: data, meta | — | no-store; never | —; not retryable |
| 203 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `Envelope`; required: data, meta | — | —; never | —; not retryable |
| 204 | Delete or clear operation completed; no representation is returned. | — | — (no body) | — | —; never | —; not retryable |
| 205 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | none (no body) | — | —; never | —; not retryable |
| 206 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | binary (no JSON envelope) | — | —; never | —; not retryable |
| 207 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `Envelope`; required: data, meta | — | —; never | —; not retryable |
| 208 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | none (no body) | — | —; never | —; not retryable |
| 226 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `Envelope`; required: data, meta | — | —; never | —; not retryable |
| 300 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | location (no JSON envelope) | — | —; never | —; not retryable |
| 301 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | location (no JSON envelope) | — | —; never | —; not retryable |
| 302 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | location (no JSON envelope) | — | —; never | —; not retryable |
| 303 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | location (no JSON envelope) | — | —; never | —; not retryable |
| 304 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | none (no body) | — | —; never | —; not retryable |
| 305 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | none (no body) | — | —; never | —; not retryable |
| 306 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | none (no body) | — | —; never | —; not retryable |
| 307 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | location (no JSON envelope) | — | —; never | —; not retryable |
| 308 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | location (no JSON envelope) | — | —; never | —; not retryable |
| 400 | Request syntax, path, parameter, model name, or source is invalid. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | `invalid_input`, `model.invalid_name`, `model.invalid_source`, `model.path_outside_root`; category `validation`; not retryable |
| 401 | A protected route received no credential or an invalid/expired bearer token. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | WWW-Authenticate | no-store; never | `unauthorized`; category `authentication`; not retryable |
| 402 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `ErrorEnvelope`; required: ; forbidden: — | — | —; never | —; not retryable |
| 403 | The authenticated principal lacks the required role or scope. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | `forbidden`; category `authorization`; not retryable |
| 404 | The path, model, acquisition job, or loaded slot does not exist. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | `not_found`, `model.not_found`; category `not_found`; not retryable |
| 405 | The path exists but does not allow the request method. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | Allow | no-store; never | `method_not_allowed`; category `not_found`; not retryable |
| 406 | No representation matching Accept is available for the operation. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | —; not retryable |
| 407 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `ErrorEnvelope`; required: ; forbidden: — | — | —; never | —; not retryable |
| 408 | The server closed an idle or over-deadline request before completion. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | —; not retryable |
| 409 | The request conflicts with model, job, capacity, or unload state. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | `model.digest_mismatch`, `model.not_ready`, `model.busy`, `model.capacity_exceeded`, `model.download_in_progress`; category `conflict`; not retryable |
| 410 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `ErrorEnvelope`; required: ; forbidden: — | — | —; never | —; not retryable |
| 411 | A request that requires a framing length omitted Content-Length or chunked framing. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | —; not retryable |
| 412 | A declared precondition such as If-Match failed. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | —; not retryable |
| 413 | The request body, batch, frame, or artifact exceeds the configured limit. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | `payload_too_large`, `model.too_large`; category `validation`; not retryable |
| 414 | The request target exceeds the server URI length limit. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | —; not retryable |
| 415 | The request Content-Type or Content-Encoding is not supported by the operation. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | `unsupported_media_type`; category `validation`; not retryable |
| 416 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `ErrorEnvelope`; required: ; forbidden: — | — | —; never | —; not retryable |
| 417 | An Expect header expectation cannot be met. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | —; not retryable |
| 418 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | none (no body) | — | —; never | —; not retryable |
| 421 | The connection authority does not match the request target authority. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | —; not retryable |
| 422 | The syntax is valid but semantic validation of the document failed. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | —; not retryable |
| 423 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `ErrorEnvelope`; required: ; forbidden: — | — | —; never | —; not retryable |
| 424 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `ErrorEnvelope`; required: ; forbidden: — | — | —; never | —; not retryable |
| 425 | Replay-unsafe early data arrived before the TLS handshake completed. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | —; not retryable |
| 426 | The profile requires TLS 1.3 or a protocol upgrade before the request can proceed. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | Upgrade | no-store; never | —; not retryable |
| 428 | The operation requires a conditional request but none was supplied. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | —; not retryable |
| 429 | The caller exceeded the configured request budget for the route or principal. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | Retry-After | no-store; retry-after | `rate_limited`; category `limit`; retryable |
| 431 | Request header fields exceed the configured size limit. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | —; not retryable |
| 451 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `ErrorEnvelope`; required: ; forbidden: — | — | —; never | —; not retryable |
| 500 | An unhandled internal failure occurred; no internal detail is exposed. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; conditional | `internal`; category `internal`; not retryable |
| 501 | The route is reserved by the contract but its capability is not implemented. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | `not_implemented`; category `not_found`; not retryable |
| 502 | An optional upstream returned an invalid response or failed before completion. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; conditional | `model.source_unavailable`; category `upstream`; retryable |
| 503 | A required model, backend, or dependency is unavailable. | per-operation | operation-declared (`Readiness`, `ErrorEnvelope`, or text) | Retry-After | no-store; retry-after | —; category `unavailable`; retryable |
| 504 | An execution or upstream deadline expired. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; conditional | `timeout`; category `upstream`; retryable |
| 505 | The request used an unsupported HTTP major version. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; never | —; not retryable |
| 506 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `ErrorEnvelope`; required: ; forbidden: — | — | —; never | —; not retryable |
| 507 | The managed asset store cannot accept the write because storage is exhausted. | application/problem+json | `ErrorEnvelope`; required: type, title, status, code, category, detail, instance, request_id, retryable; forbidden: data | — | no-store; conditional | —; not retryable |
| 508 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `ErrorEnvelope`; required: ; forbidden: — | — | —; never | —; not retryable |
| 510 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `ErrorEnvelope`; required: ; forbidden: — | — | —; never | —; not retryable |
| 511 | Prohibited on the engine surface; no handler or framework fallback may emit this status. | — | `ErrorEnvelope`; required: ; forbidden: — | — | —; never | —; not retryable |

## 11. Selection rules

1. Choose the most specific standard code; do not collapse distinct failures into `400` or `500`.
2. Validation failures are `400`; semantic validation after syntax is `422` when the operation declares it.
3. Missing or invalid credentials are `401`; insufficient scope is `403`; never `404`. A declared path with an unsupported method is `405` with `Allow`; an unknown path is `404` with problem details.
4. Unknown resources are `404`; state conflicts are `409`; unsupported media is `415`.
5. Size and item-count limits are `413`; rate budgets are `429` with `Retry-After`.
6. Unavailable model/backend is `503`; upstream timeout is `504`; invalid upstream response is `502`.
7. Every `4xx` and `5xx` body is problem details with the stable engine `code` and `category`, except `503` responses whose operation declares readiness or metrics content. `status` in the body MUST equal the HTTP status. Every **used** code MUST appear in `openapi.yaml`; conditional transport-generated codes are documented exceptions.
8. Every response carries `request_id` in the body or `X-Request-Id`; errors always carry it in the problem document when assigned.
9. A status with `engine: not-used` MUST NOT be emitted, even if a framework default would produce it; map it to the nearest allowed problem response.

## 12. Prohibited conditions

- Emitting an unassigned status, a private status, `418`, or an obsoleted status.
- Redirecting API calls; aliases resolve to the same handler with the same status and shape.
- Returning the success envelope with a `4xx` or `5xx` status, or problem details with `2xx`.
- Adding a body to `1xx`, `101`, `204`, or `304`.
- Omitting `WWW-Authenticate` on `401`, `Allow` on `405`, or `Retry-After` on a retryable `429`/`503`.
- Leaking host paths, prompts, transcripts, audio, images, tokens, credentials, or stack traces in any status.
- Emitting a status whose body fields, media type, cache policy, or retry rule do not match this document.

## 13. Operation usage and runtime conformance

Every operation declared in `openapi.yaml` MUST be exercised against the running router by a contract integration test. The operation is not "used" merely because it appears in OpenAPI, has a generated schema, or is mounted as a route.

The integration test MUST fail when:

- an operation falls through to the unknown-path fallback;
- the returned status is not declared for that operation;
- the returned media type is not declared for that operation;
- a required catalog header, cache policy, body field, or allowed error code is missing or violated;
- an operation declaring `501` returns anything other than the `not_implemented` problem response;
- an operation not declaring `501` returns `501`.

`501` is the reserved-operation marker. Implemented and reserved operations MUST both be exercised; reserved operations are not exempt from routing or response-contract checks. `503` is `per-operation`: readiness returns its `Readiness` JSON, metrics may return text, and problem-details operations return `ErrorEnvelope`; every `503` still carries `Retry-After` and verifies the operation-declared media type.

```sh
uv run python torviello-engine/contracts/tools/status_tester.py
cargo test --locked --test endpoint_usage
```

## 14. Validation and change control

```sh
uv run pytest -q torviello-enforcer/test_contract_artifacts.py
python torviello-engine/contracts/tools/contracts.py check
```

The check verifies that the catalog covers every code from `100` through `599` exactly once, validates the catalog against its JSON Schema, checks that every OpenAPI response status is declared as used or conditional, checks that this document lists every assigned code and its detailed content row, verifies required headers and error codes, and checks that generated schemas are current. Passing the check does not prove handler behavior; the runtime operation-usage test supplies the provider-side evidence.

Any change to a status trigger, body, header, retry rule, or error code requires updating `http-status.yaml`, this document, the generated schemas, and the affected OpenAPI responses in the same change. Any operation added to OpenAPI MUST be added to the runtime operation-usage test in the same change.
