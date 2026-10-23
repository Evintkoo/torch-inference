# Engine Runtime Requirements

These requirements define the behavior of the Torviello engine as a local, attributable inference runtime. They derive from the observed reference implementation in `../torch-inference-main` and from the normative controls in `../torviello-enforcer/`; they describe intended outcomes and do not claim that the current repository already conforms. The set is assessed at **HPA-4**, the Highest Practical Assurance level defined in [assurance-standard.md](assurance-standard.md): ISO/IEC/IEEE 29148 quality gates, OWASP ASVS 5.0.0 Level 3, OWASP API Security Top 10 2023, NIST SSDF 1.1, OpenAPI 3.2.1 with RFC 9457 errors, OpenTelemetry 1.44.0, SLSA v1.2 Build Level 3, and formal, property, fuzz, and mutation evidence thresholds.

## Reading this set

Each row links to a per-requirement document under [`items/`](items/README.md). The requirement documents carry the normative statement, purpose, scope, full mapped control clauses, acceptance criteria, prohibited conditions, verification procedure, evidence, failure conditions, and traceability. Acceptance checks live under `../torviello-engine/specifications/acceptance-criteria.md` with one document per check ID.

Priorities follow the repository convention: **MUST** is needed for the stated behavior or a safe release; **SHOULD** is expected unless a documented tradeoff justifies deferral; **COULD** requires product or technical validation.

## Requirements

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| [ENG-001](items/ENG-001.md) | MUST | Resolve, validate, and report one effective configuration | Starting with no file yields documented defaults and does not create or rewrite a file. |
| [ENG-002](items/ENG-002.md) | MUST | Start, signal readiness, and stop in bounded stages | A valid engine reports liveness before readiness and readiness only after required initialization. |
| [ENG-003](items/ENG-003.md) | MUST | Detect execution backends and report capabilities truthfully | An auto start with a usable accelerator selects it and records the reason. |
| [ENG-004](items/ENG-004.md) | MUST | Maintain stable model identity and a truthful catalog | A registry entry with no local asset reports not_downloaded and loaded false. |
| [ENG-005](items/ENG-005.md) | MUST | Acquire, verify, and remove model assets safely | A valid source creates a task ID and advances through documented states. |
| [ENG-006](items/ENG-006.md) | MUST | Load models with bounded lifecycle, isolation, and capacity policy | A load advances through loading to ready and supports inference. |
| [ENG-007](items/ENG-007.md) | MUST | Attach one inference envelope to every successful result | A successful classification response contains data and meta with all required fields. |
| [ENG-008](items/ENG-008.md) | MUST | Synthesize speech with bounded streaming and deterministic selection | Full synthesis returns audio/wav with a valid header at the documented rate and layout. |
| [ENG-009](items/ENG-009.md) | MUST | Transcribe and validate audio within explicit ingress bounds | A valid WAV transcribes with text, language, and confidence. |
| [ENG-010](items/ENG-010.md) | MUST | Classify images with bounded batches and progressive results | A three-image batch returns three result lists in the same order. |
| [ENG-011](items/ENG-011.md) | MUST | Detect objects with validated model selection and thresholds | A valid image returns detections with count, class names, confidences, and boxes. |
| [ENG-012](items/ENG-012.md) | SHOULD | Proxy assistant traffic without inventing compatibility | A healthy upstream chat completion passes through with its status and JSON body. |
| [ENG-013](items/ENG-013.md) | SHOULD | Serve realtime WebSocket sessions with bounded framing | An audio upgrade receives a ready frame and accepts a control frame. |
| [ENG-014](items/ENG-014.md) | MUST | Batch, cache, and coalesce work without changing results | An identical request within expiry returns the cached result and increments hits. |
| [ENG-015](items/ENG-015.md) | MUST | Bound requests and degrade predictably under pressure | An oversized JSON body returns 413 without full buffering. |
| [ENG-016](items/ENG-016.md) | MUST | Authenticate and harden the serving edge | A default local start binds 127.0.0.1 and does not expose unauthenticated mutation routes remotely. |
| [ENG-017](items/ENG-017.md) | MUST | Map failures to one stable error contract | Invalid input returns 400 with a stable code naming the parameter. |
| [ENG-018](items/ENG-018.md) | MUST | Expose health, readiness, liveness, and bounded metrics | Liveness returns 200 for a running process even when no model is loaded. |
| [ENG-019](items/ENG-019.md) | SHOULD | Make runtime, hardware, and performance inspectable | System information matches observed OS, CPU, memory, and runtime version. |
| [ENG-020](items/ENG-020.md) | MUST | Correlate requests through structured, redacted logs | A request without a correlation header receives a generated ID visible in the response and logs. |
| [ENG-021](items/ENG-021.md) | MUST | Publish and evolve a validated HTTP contract | The OpenAPI document validates and covers every public route. |
| [ENG-022](items/ENG-022.md) | MUST | Keep concurrency, streaming, and shutdown responsive | Health responds while a long CPU-bound inference is running. |
| [ENG-023](items/ENG-023.md) | MUST | Sanitize inputs and postprocess outputs deterministically | Oversized text is rejected with input.text_too_long and no model execution. |
| [ENG-024](items/ENG-024.md) | MUST | Preserve local offline operation and optional service boundaries | With assets present and egress blocked, local inference endpoints serve successfully. |
| [ENG-025](items/ENG-025.md) | SHOULD | Administer the registry with authorization and audit | An authorized registration returns the model ID and metadata. |
| [ENG-026](items/ENG-026.md) | MUST | Declare and enforce supported build and platform profiles | The minimal artifact contains no accelerator or optional service dependencies. |

## Cross-cutting notes

- Every requirement applies to the shipping engine and to any executable profile that claims the affected capability.
- Limit, timeout, authentication, and error requirements apply equally to unversioned and versioned routes and to WebSocket transports.
- Local mode remains the reference deployment: no account, control plane, or outbound network is required once prepared assets exist.
- Performance and footprint claims are governed by [RP-016](items/RP-016.md), [RP-017](items/RP-017.md), and `PERF-06`; these requirements provide the functional behavior that benchmarks measure.
- Unresolved decisions in [`open-decisions.md`](open-decisions.md) block public claims or specific implementation choices, not the existence of the requirement.

## Traceability

| Layer | Location |
|---|---|
| Product and platform requirements | [`product-and-architecture.md`](product-and-architecture.md), [`runtime-and-platform.md`](runtime-and-platform.md), [`security-and-operations.md`](security-and-operations.md) |
| Engine domain model | [`../torviello-engine/domain/`](../torviello-engine/domain/README.md) |
| Engine specifications | [`../torviello-engine/specifications/`](../torviello-engine/specifications/README.md) |
| Engine API contract | [`../torviello-engine/contracts/openapi.yaml`](../torviello-engine/contracts/openapi.yaml) |
| Normative controls | [`../torviello-enforcer/`](../torviello-enforcer/README.md) |
