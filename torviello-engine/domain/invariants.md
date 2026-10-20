# Engine invariants

Invariants are conditions that must hold in every reachable engine state. They are stronger than acceptance criteria because a violation is a defect even when no scenario observes it. Each invariant names the stable rule in [business-rules.md](business-rules.md) and the requirements that operationalize it.

## Identity and catalog

| ID | Invariant | Trace |
|---|---|---|
| INV-01 | A model ID identifies exactly one descriptor within a profile; no two descriptors share an ID. | ENG-RULE-001, ENG-004 |
| INV-02 | A model ID never changes when an asset is relocated, downloaded, or reloaded. | ENG-RULE-001, ENG-004 |
| INV-03 | Catalog presence, local availability, download state, and load state are independent facts and cannot be inferred from one another. | ENG-RULE-040, ENG-004 |
| INV-04 | A catalog response contains no absolute host path, credential, or signed URL. | ENG-RULE-010, ENG-004 |

## Model lifecycle and concurrency

| ID | Invariant | Trace |
|---|---|---|
| INV-05 | A model slot is in exactly one lifecycle state at a time, and every transition follows the declared state machine. | ENG-RULE-036, ENG-006 |
| INV-06 | A slot cannot become `ready` before initialization succeeds. | ENG-RULE-036, ENG-006 |
| INV-07 | At most one initialization runs for a model ID; concurrent loads observe the same outcome. | ENG-RULE-036, ENG-006 |
| INV-08 | A slot with a non-zero inference reference count cannot be freed or replaced. | ENG-RULE-036, ENG-006 |
| INV-09 | Every acquired model reference is released exactly once, including on cancellation and error. | ENG-RULE-036, ENG-022 |
| INV-10 | A configured capacity limit is either enforced or explicitly recorded as disabled; it is never silently ignored. | ENG-RULE-036, ENG-006 |

## Acquisition and assets

| ID | Invariant | Trace |
|---|---|---|
| INV-11 | No path derived from a client request can resolve outside the configured model root. | ENG-RULE-037, ENG-005 |
| INV-12 | An asset is activated only after its declared digest or signature verifies. | ENG-RULE-037, ENG-005 |
| INV-13 | A partially written or failed asset is never listed as available or loadable. | ENG-RULE-037, ENG-005 |
| INV-14 | Deletion and cleanup remove only assets recorded as managed by the engine. | ENG-RULE-037, ENG-005 |

## Inference correctness

| ID | Invariant | Trace |
|---|---|---|
| INV-15 | Each caller receives exactly its own result and metadata; coalescing and batching cannot cross caller identities. | ENG-RULE-018, ENG-RULE-019, ENG-014 |
| INV-16 | Batch and streaming outputs preserve the order required by the capability and the original input indices. | ENG-RULE-014, ENG-RULE-019, ENG-010 |
| INV-17 | A cache key includes every input and parameter that can change the result, including model ID and backend-visible parameters. | ENG-RULE-018, ENG-014 |
| INV-18 | An expired, partial, or failed result is never served as a cache hit. | ENG-RULE-018, ENG-014 |
| INV-19 | A success response always carries model ID, backend, latency, version, postprocessing state, and request ID. | ENG-RULE-011, ENG-007 |
| INV-20 | A failed inference never returns a success-shaped payload or a partial result presented as complete. | ENG-RULE-041, ENG-017 |

## Limits and resource ownership

| ID | Invariant | Trace |
|---|---|---|
| INV-21 | Every size, duration, count, and concurrency limit is enforced before the allocation or dispatch it protects. | ENG-RULE-020, ENG-015 |
| INV-22 | Every deadline that owns a worker, permit, or connection releases it on expiry, success, cancellation, or error. | ENG-RULE-021, ENG-022 |
| INV-23 | Queues and channels for inference, downloads, and streaming are bounded. | ENG-RULE-021, ENG-022 |
| INV-24 | No blocking model, codec, or filesystem operation runs on the transport reactor. | ENG-RULE-031, ENG-022 |
| INV-25 | A disconnected client stops work that is not explicitly detached and bounded. | ENG-RULE-031, ENG-013 |

## Security and trust boundaries

| ID | Invariant | Trace |
|---|---|---|
| INV-26 | Local defaults bind loopback and never expose unauthenticated administrative mutation. | ENG-RULE-023, ENG-016 |
| INV-27 | Protected routes execute no handler logic before authentication succeeds. | ENG-RULE-024, ENG-016 |
| INV-28 | Administrative mutation requires administrative authority, not merely a valid token. | ENG-RULE-024, ENG-025 |
| INV-29 | Secrets, tokens, prompts, audio, images, and raw payloads never enter logs, error envelopes, metrics labels, or diagnostic exports. | ENG-RULE-029, ENG-020 |
| INV-30 | Client-controlled forwarding headers cannot establish rate-limit identity outside a declared trusted-proxy policy. | ENG-RULE-023, ENG-016 |
| INV-31 | An optional upstream service cannot gate readiness or local inference availability. | ENG-RULE-016, ENG-024 |

## Observability and contract

| ID | Invariant | Trace |
|---|---|---|
| INV-32 | Liveness, readiness, and subsystem health answer different questions and cannot be substituted for one another. | ENG-RULE-026, ENG-018 |
| INV-33 | Probe endpoints remain available when inference admission is saturated or rate limited. | ENG-RULE-026, ENG-018 |
| INV-34 | Metric label sets are bounded; no request ID, prompt, path, or model input becomes a label value. | ENG-RULE-027, ENG-018 |
| INV-35 | Percentiles and throughput report a stated window and sample basis. | ENG-RULE-028, ENG-019 |
| INV-36 | Every public route appears in the API contract, and every documented route resolves to a handler. | ENG-RULE-030, ENG-021 |
| INV-37 | Versioned and unversioned aliases of the same capability produce the same status and body shape. | ENG-RULE-030, ENG-021 |

## Lifecycle

| ID | Invariant | Trace |
|---|---|---|
| INV-38 | No listener accepts requests before configuration and path validation succeeds. | ENG-RULE-038, ENG-002 |
| INV-39 | Readiness is false while any required component is pending or failed. | ENG-RULE-038, ENG-018 |
| INV-40 | Shutdown stops admission, drains or cancels work, and exits within the configured grace window. | ENG-RULE-042, ENG-002 |
| INV-41 | A restart reconstructs catalog identity and model state from durable descriptors and managed assets, not from in-memory display text. | ENG-RULE-001, ENG-004 |
| INV-42 | A build profile contains only the optional providers and services it declares. | ENG-RULE-035, ENG-026 |

## Assurance

Governed by [HPA-4](../../requirements/assurance-standard.md) and the [engine acceptance criteria](../specifications/acceptance-criteria.md). An invariant that is not checked at the boundary where it can be violated is not enforced; a violation without a defined failure response fails acceptance.

| ID | Invariant | Trace |
|---|---|---|
| INV-43 | Every MUST clause has a reproducible check, and no requirement or check is an orphan. | ENG-RULE-043, ENG-RULE-044, HPA-4 |
| INV-44 | Lifecycle and concurrency invariants have a checkable formal model whose checked scope is stated. | ENG-RULE-045, ENG-002, ENG-006, ENG-013, ENG-014, ENG-022 |
| INV-45 | Every untrusted parser has a retained fuzz corpus, and critical modules meet the mutation-score floor. | ENG-RULE-046, HPA-4 |
| INV-46 | Production surfaces are assessed against ASVS 5.0.0 Level 3 and API Top 10 2023, with model-supply surfaces against AISVS 1.01 Level 3. | ENG-RULE-047, HPA-4 |
| INV-47 | Every failure is RFC 9457 `application/problem+json` with a stable engine code and exhaustive status mapping. | ENG-RULE-048, ENG-017 |
| INV-48 | No non-loopback listener lacks TLS 1.3, and no remote profile trusts a shared-secret JWT algorithm. | ENG-RULE-049, ENG-016 |
| INV-49 | Shipped artifacts have verified SLSA v1.2 Build Level 3 provenance, a signed SBOM, and a bit-for-bit rebuild. | ENG-RULE-051, ENG-026 |
| INV-50 | No conformance claim exceeds the retained evidence, and every exception has an owner and expiry. | ENG-RULE-052, HPA-4 |

## How invariants are verified

An invariant is not verified by a documentation statement. Verification uses one or more of:

- A state-machine test that attempts an invalid transition and asserts rejection.
- A concurrency test that interleaves load, infer, unload, and eviction.
- A malformed-input test that asserts rejection before allocation or dispatch.
- A redaction inspection across responses, logs, metrics, and exports.
- A contract test comparing router entries with the published OpenAPI document.

When an invariant cannot be tested directly, the specification must state the observation that would falsify it and the manual procedure used instead. An invariant with no possible observation is not a usable rule.
