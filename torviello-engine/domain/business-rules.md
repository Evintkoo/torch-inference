# Engine business rules and invariants

Each rule has a stable identifier. A rule is satisfied only when a specification, test, and evaluation reference resolve to it. Rules MAY be refined, but their identifiers MUST remain stable.

| Rule ID | Invariant | Trace |
|---|---|---|
| ENG-RULE-001 | A model is addressed by a stable model ID, and two models MUST NOT share an ID within a profile. | PA-010, RP-014 |
| ENG-RULE-002 | A model asset MUST be verified against its recorded digest before it is loaded. | RP-014, SEC-05.02 |
| ENG-RULE-003 | Configuration MUST be TOML, validated before startup, and MUST reject unknown keys for the active schema version. | RP-001, RP-002, RP-003 |
| ENG-RULE-004 | Backend selection MUST be explicit and observable; silent fallback is prohibited unless configuration explicitly allows it. | RP-012 |
| ENG-RULE-005 | Reported capabilities MUST reflect what the running engine can execute, never what is merely installed or configured. | RP-010–RP-012 |
| ENG-RULE-006 | An inference request for an unknown model, unavailable backend, or exceeded input limit MUST be rejected before execution with a stable error code. | RP-014 |
| ENG-RULE-007 | Local mode MUST NOT require an account, control plane, or outbound network access after required assets are present. | PA-002 |
| ENG-RULE-008 | Inference results MUST carry the model ID, selected backend, timing, and status used to produce them. | RP-012, RP-013 |
| ENG-RULE-009 | Domain and application code MUST NOT depend on transport-specific or provider-specific types. | PA-010, PA-014 |
| ENG-RULE-010 | Secrets and raw prompt or tensor payloads MUST NOT appear in logs or error envelopes. | CSC-008, SEC-05 |
| ENG-RULE-011 | Every successful inference response MUST carry a result envelope with model ID, backend, latency, version, postprocessing state, and request ID. | ENG-007 |
| ENG-RULE-012 | Speech synthesis MUST declare its sample rate, channel count, encoding, and framing; streaming output MUST be ordered and temporally bounded. | ENG-008 |
| ENG-RULE-013 | Speech transcription MUST reject unsupported, oversized, or malformed audio before decoding and MUST report the effective language and duration. | ENG-009 |
| ENG-RULE-014 | Image classification MUST preserve input order, enforce per-request item and dimension bounds, and validate `top_k` before inference. | ENG-010 |
| ENG-RULE-015 | Object detection MUST validate model family and size, apply declared confidence thresholds, and return stable class and box fields. | ENG-011 |
| ENG-RULE-016 | The assistant proxy MUST be optional, isolate upstream credentials, enforce deadlines, and never gate local engine readiness. | ENG-024 |
| ENG-RULE-017 | Realtime transports MUST negotiate capability and framing, bound buffers, preserve frame order, and release resources on disconnect. | ENG-013 |
| ENG-RULE-018 | A cache key MUST include every input and parameter that can change the result; expired, partial, and failed entries are never served. | ENG-014 |
| ENG-RULE-019 | Batching and request coalescing MUST preserve per-caller isolation and original item order. | ENG-014 |
| ENG-RULE-020 | Size, duration, count, and concurrency limits MUST be enforced before allocation or dispatch. | ENG-015 |
| ENG-RULE-021 | Queues and streaming channels MUST be bounded; saturation MUST produce an explicit retryable outcome, not unbounded growth. | ENG-015 |
| ENG-RULE-022 | Every deadline and cancellation path MUST release its model reference, worker, permit, and connection exactly once. | ENG-022 |
| ENG-RULE-023 | The default edge policy MUST bind loopback, disable unauthenticated mutation, and reject unsafe configuration at startup. | ENG-016 |
| ENG-RULE-024 | Authentication MUST precede handler logic, and administrative mutation MUST require administrative authority. | ENG-016 |
| ENG-RULE-025 | Administrative model registration, update, and deletion MUST be authorized, audited, and atomic. | ENG-025 |
| ENG-RULE-026 | Liveness, readiness, and health probes MUST answer distinct questions and remain available during inference saturation. | ENG-018 |
| ENG-RULE-027 | Metrics MUST use bounded label sets and MUST NOT include request content, identifiers, paths, or user-controlled values. | ENG-018 |
| ENG-RULE-028 | Introspection MUST report the effective configuration and runtime state, state its sampling window, and redact secrets. | ENG-019 |
| ENG-RULE-029 | Logs MUST carry correlation and attribution, use stable levels and fields, and exclude secrets and payload content. | ENG-020 |
| ENG-RULE-030 | The published API contract MUST match the router, and versioned aliases MUST preserve status and body shape. | ENG-021 |
| ENG-RULE-031 | Blocking model, codec, and filesystem work MUST run off the transport reactor and MUST observe cancellation. | ENG-022 |
| ENG-RULE-032 | Inputs MUST be validated and sanitized before inference, and outputs MUST apply declared postprocessing steps in order. | ENG-023 |
| ENG-RULE-033 | After required assets are prepared, local inference MUST operate without account, control plane, or outbound network access. | ENG-024 |
| ENG-RULE-034 | Registry administration MUST expose discoverable, authorized, audited mutation with stable conflict semantics. | ENG-025 |
| ENG-RULE-035 | Each build profile MUST declare its supported capabilities and optional dependencies, and a build MUST NOT report undeclared providers. | ENG-026 |
| ENG-RULE-036 | Model state MUST follow the declared lifecycle; slots MUST be unique per model ID and capacity limits MUST be enforced or explicitly disabled. | ENG-006 |
| ENG-RULE-037 | Downloads MUST validate names and destinations, verify integrity before activation, and never expose partial assets. | ENG-005 |
| ENG-RULE-038 | Startup MUST validate the complete configuration and required assets before reporting readiness. | ENG-002 |
| ENG-RULE-039 | Backend capabilities MUST reflect host execution ability, and fallback MUST follow the declared policy and be observable. | ENG-003 |
| ENG-RULE-040 | Catalog presence, local availability, download state, and load state MUST be independent and independently reported. | ENG-004 |
| ENG-RULE-041 | A failed request MUST NOT return a partial result presented as complete, and every failure MUST use the stable error model. | ENG-017 |
| ENG-RULE-042 | Shutdown MUST stop admission, drain or cancel work, and exit within the configured grace window. | ENG-002 |
| ENG-RULE-043 | Every requirement MUST satisfy the ISO/IEC/IEEE 29148 quality gates for necessity, correctness, unambiguity, completeness, singularity, feasibility, verifiability, implementation freedom, and traceability. | HPA-4, ENG-001–ENG-026 |
| ENG-RULE-044 | Traceability MUST be bidirectional and complete across requirement, control, feature, acceptance check, test, and evaluation, with no orphans. | HPA-4, ENG-001–ENG-026 |
| ENG-RULE-045 | Lifecycle and concurrency invariants MUST be specified in a checkable formal model, and implementation tests MUST be derived from that model. | HPA-4, ENG-002, ENG-006, ENG-013, ENG-014, ENG-022 |
| ENG-RULE-046 | Untrusted parsers MUST be property-tested and fuzzed for at least 24 CPU-hours, and critical modules MUST meet the recorded mutation-score floor. | HPA-4, ENG-001, ENG-005, ENG-008–ENG-011, ENG-013, ENG-023 |
| ENG-RULE-047 | Production surfaces MUST be assessed against OWASP ASVS 5.0.0 Level 3 and OWASP API Security Top 10 2023, with model-supply surfaces assessed against AISVS 1.01 Level 3. | HPA-4, ENG-005, ENG-012, ENG-016, ENG-020, ENG-025 |
| ENG-RULE-048 | Every failure MUST use RFC 9457 `application/problem+json` with a stable engine code and an exhaustive status mapping. | HPA-4, ENG-017 |
| ENG-RULE-049 | Remote listeners MUST use TLS 1.3 and RFC 8725 asymmetric JWT validation; shared secrets are permitted only for loopback-only profiles. | HPA-4, ENG-016 |
| ENG-RULE-050 | Telemetry MUST follow OpenTelemetry 1.44.0 semantic conventions and Prometheus/OpenMetrics exposition with bounded label sets. | HPA-4, ENG-018–ENG-020 |
| ENG-RULE-051 | Release artifacts MUST meet SLSA v1.2 Build Level 3 with verified provenance, a signed SBOM, and a reproducible rebuild. | HPA-4, ENG-026 |
| ENG-RULE-052 | Evidence MUST identify revision, inputs, environment, procedure, threshold, observed result, and limitations, and no conformance claim may exceed that evidence. | HPA-4, ENG-001–ENG-026 |

## Assurance

Governed by [HPA-4](../../torviello-enforcer/requirements/assurance-standard.md) and the [engine acceptance criteria](../specifications/acceptance-criteria.md).
- **Subject:** Business rules.
- **Required evidence:** Every rule MUST have a stable ID, normative statement, trace, and executable evidence; rules MUST NOT contradict requirements or invariants.
- **Failure:** A rule without a trace or check, or a contradiction with a requirement or invariant, fails acceptance. No waiver is permitted.
