# Engine glossary

Ubiquitous language for the engine bounded context. Terms are normative for specifications and contracts in this unit.

| Term | Definition |
|---|---|
| Acceptance check | An executable or reviewable verification mapped one-to-one to a requirement. |
| Adapter | A component that translates a domain port to a provider, transport, or storage implementation. |
| Admission | The decision to accept a request under authentication, validation, rate, and concurrency limits. |
| Engine | The local process or library that loads a model and executes inference. |
| Entity | A domain object with identity and lifecycle; the engine's primary entities are Model, Backend, and InferenceRequest. |
| Envelope | The stable success wrapper containing `data` and `meta` attribution fields. |
| Error code | A stable machine-readable identifier in the error model, independent of human prose. |
| Model | A versioned, validated set of weights plus the metadata needed to execute it. |
| Model ID | A stable, human-meaningful identifier unique within an engine profile. |
| Model descriptor | Metadata that names a model, its format, its backend requirements, and its asset digest. |
| Model asset | A file or directory containing weights, configuration, or tokenizer data. |
| Model slot | The runtime instance of a descriptor, with its own load state and reference count. |
| Catalog state | The independent facts of presence, local availability, download state, and load state. |
| Backend | An execution provider such as CPU, CUDA, Metal, Vulkan, or AMD. |
| Backend capability | What the running build can actually execute on this host, including device and precision. |
| Capability | A feature the running engine can actually serve, as opposed to one merely listed. |
| Profile | A named configuration that selects capabilities, limits, and defaults. |
| Build profile | The optional features and providers compiled into a build. |
| Inference request | A model ID plus validated capability inputs, parameters, and limits. |
| Inference result | Capability output plus model ID, backend, timing, postprocessing state, and status. |
| Envelope attribution | Model ID, backend, latency, version, postprocessing steps, warnings, and request ID returned with every success. |
| Postprocessing | Declared, ordered transformations applied to raw capability output before the envelope is built. |
| Error envelope | The stable error shape returned when a request cannot be executed. |
| Request ID | Correlation identifier assigned at ingress or generated at the edge and echoed in the response. |
| Correlation | The ability to follow one request across logs, events, metrics, and results using a request ID. |
| Deadline | A bound on elapsed time that must release every resource it holds when it expires. |
| Bounded channel | A channel with a fixed capacity that applies backpressure instead of growing without limit. |
| Backpressure | A signal that slows or rejects producers when a downstream queue is full. |
| Coalescing | Joining identical in-flight requests so they share one execution while preserving caller isolation. |
| Batch | A group of items or requests executed together under a declared order and limit. |
| Cache key | The exact set of inputs, parameters, model identity, and backend-visible options that determine a result. |
| Circuit breaker | A policy that stops dispatching to a failing dependency and probes for recovery. |
| Bulkhead | A policy that isolates concurrency or resources so one caller or component cannot exhaust the engine. |
| Drain | To stop admitting new work and allow or cancel existing work within a grace window. |
| Readiness | A statement that required components can serve requests now. |
| Liveness | A statement that the process can make progress and should not be restarted. |
| Health | A statement about individual subsystems, including optional ones. |
| Degraded | A state in which the process is alive but one or more components are unavailable. |
| Local mode | Standalone operation with no account, control plane, or outbound network dependency. |
| Hosted mode | Optional managed operation that may add accounts, administration, and remote configuration. |
| Realtime session | A negotiated WebSocket interaction with bounded buffers and ordered frames. |
| Framing | The declared encoding and boundaries of streamed data, such as length-prefixed PCM frames. |
| Registry | The administrative surface that admits, updates, lists, and removes model descriptors with audit. |
| Audit record | An append-only record of an administrative attempt, its actor, target, outcome, and request ID. |
| Sanitization | Rejection or safe normalization of untrusted input before it reaches model execution or output. |
| Redaction | Removal of secrets and payload content at emission so no sink can retain them. |
| Evaluation | A measured check with a stated threshold, dataset or workload, and evidence artifact. |

## Assurance

Governed by [HPA-4](../../torviello-enforcer/requirements/assurance-standard.md) and the [engine acceptance criteria](../specifications/acceptance-criteria.md).
- **Subject:** Ubiquitous language.
- **Required evidence:** Each term MUST have one normative meaning, an owner, and explicit non-examples; conflicting or overloaded terms MUST be resolved before use.
- **Failure:** An ambiguous term used in a normative clause, or two meanings for one term, fails acceptance. No waiver is permitted.
