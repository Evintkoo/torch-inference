# Open Decisions and Discovery

These questions affect architecture or product promises. Resolve them in a specification or decision record before committing to an implementation. Each decision should cite the requirement IDs it unblocks.

| Topic | Questions to resolve | Related requirements |
|---|---|---|
| Product boundary | Is the primary product a local inference engine, a hosted platform, or both? Which functions require an account? What exactly belongs in the full package? | PA-001–PA-004, PA-024 |
| Supported hardware | Which OS versions, CPU architectures, GPU generations, drivers, and runtime providers are release commitments? Is Vulkan required for the first release? Which AMD runtime is intended on each OS? | RP-010–RP-015, RP-020 |
| Authentication | Who are the actors? Are accounts local, hosted, or both? How do engine devices enroll, authenticate, rotate credentials, and work offline? Which routes are public? | SO-001–SO-005 |
| Persistence | Which records must persist locally or centrally? What are expected scale, availability, backup, encryption, and offline needs? Should local mode use an embedded database, files, or no database? | RP-032–RP-034, SO-033 |
| Registry service | Is the registry a local file-backed catalog, hosted API, or both? Who can edit it, how are changes approved, and how do clients receive updates safely? | RP-031, PA-012, SO-031 |
| Licensing | What license permits personal use and requires a commercial license? Which code and model assets can use that policy? What entity owns and grants those rights? | ED-040–ED-041 |
| Packaging workflow | Which candidate automation frameworks can build Windows, macOS, and Linux artifacts offline, including signing/notarization where required? Does Ansible meet the cross-platform build needs or should it only handle deployment? | RP-021–RP-023, ED-020–ED-023 |
| Deployment targets | Which service managers and orchestration systems are supported at launch? Is Kubernetes a product commitment or only an example? | RP-024, RP-030, SO-030–SO-033 |
| Observability profile | Which metrics, alerts, retention periods, and dashboard integrations are required for a single node and for enterprise installations? What telemetry is opt-in? | SO-022–SO-024 |
| Documentation and media | What site generator and publishing host are acceptable? Are demo and marketing media workflows part of this repository's maintained scope? | PA-024, PA-031–PA-032, ED-030–ED-033 |
| Compatibility and migration | Which existing configuration files, endpoints, packages, and deployments must remain compatible? How long are deprecated formats supported? | RP-001–RP-003, ED-023, ED-030 |
| Security finding severity and release gate | Which severity/exploitability criteria block a release, what risk authority can approve a time-bounded exception, and what remediation deadlines apply to supported profiles? | SO-012–SO-013 |
| Competitive claim envelope | Which competitors, pinned versions, hardware, models, workloads, precision, batch, concurrency, and statistical margin define "fastest and lightest"? Which artifact, startup, idle, memory, and latency budgets gate a release? | RP-016–RP-017, ED-012, PA-021 |
| Organizational role ownership | Which named people initially own governance, security, privacy, legal/compliance coordination, release, operations, customer support, and people workflows? What independent review is available for high-impact decisions? | ORG-001–ORG-046 |

## First-release slice decisions (blocking)

These four decisions block the first vertical slice: load TOML configuration, validate it, and expose the configured engine capabilities through `/health` and `/v1/models`. They must be resolved in a reviewed decision record before implementation; the recommendations below are proposals, not decisions.

### OD-001 — Model format

- **Question:** Which model format(s) must the first release load and execute?
- **Options:** ONNX Runtime; TorchScript/libtorch; safetensors weights with a Rust runtime; more than one via a format adapter.
- **Recommendation:** start with one format behind a `ModelLoader` port, selected by the model descriptor, so additional formats do not change the domain or HTTP contract.
- **Criteria:** PyTorch compatibility, CPU portability, offline installation, model-asset size, deterministic errors, available Rust bindings, and licensing.
- **Unblocks:** RP-010–RP-014, PA-010–PA-012.
- **Status:** decided for the first slice by ADR 0002 (TorchScript via the `Runtime` port). Owner: engine technical owner.

### OD-002 — First execution backend

- **Question:** Which backend is the release baseline, and what may fall back automatically?
- **Options:** CPU only; CPU plus optional CUDA/Metal/Vulkan/AMD; backend selected per model or per request.
- **Recommendation:** CPU is the mandatory baseline (RP-010). Select it explicitly, report it in capability output, and never fall back silently unless configuration allows it (RP-012).
- **Criteria:** supported OS/architecture matrix, dependency footprint, observable selection, and failure behavior.
- **Unblocks:** RP-010–RP-015, RP-020.
- **Status:** CPU-only baseline decided for the first slice by ADR 0002; accelerator scope remains open. Owner: runtime owner.

### OD-003 — Local and hosted authentication boundary

- **Question:** Does the first slice require accounts, and which routes are public?
- **Options:** no accounts in local mode; optional API token for non-loopback binding; hosted accounts for the managed offering only.
- **Recommendation:** local mode requires no account or control plane (PA-002); `/health` is public; `/v1/models` and inference are protected when bound beyond loopback or when hosted (PA-003, SO-001–SO-005).
- **Criteria:** offline operation, least privilege, credential rotation, and a clear hosted boundary.
- **Unblocks:** SO-001–SO-005, PA-002–PA-003.
- **Status:** open. Owner: security owner.

### OD-004 — External API style and error contract

- **Question:** Is the public surface REST/JSON with OpenAPI, gRPC, or both, and what is the stable error shape?
- **Options:** REST/JSON + OpenAPI 3.2.1; gRPC + protobuf; both with generated bindings.
- **Recommendation:** REST/JSON + OpenAPI 3.2.1 under `/v1` for the first slice, with a stable error envelope and versioned schemas; keep the internal engine API as Rust traits so the transport can change.
- **Criteria:** contract-testability, streaming needs, client tooling, versioning, and offline deployment.
- **Unblocks:** API controls, ED-052, RP-014.
- **Status:** open. Owner: API owner.

### OD-005 — Competitor set and claim scope

- **Question:** Which competitors and versions define "fastest and lightest", and over which hardware, models, precision, batch sizes, sequence lengths, and concurrency is the claim made?
- **Options:** inference servers (for example vLLM, TensorRT-LLM, Triton, llama.cpp, Ollama); runtimes (ONNX Runtime, PyTorch eager/compile); a CPU-only claim; a CPU-plus-one-GPU claim; separate claims per workload.
- **Recommendation:** define one pinned competitor set, one CPU reference environment, and at most one GPU reference environment for the first release. Claim only inside the measured envelope and label every claim with its workload and date (RP-016, PERF-06).
- **Criteria:** relevance to the target user, reproducibility, license and redistribution constraints, fair configuration, and the cost of maintaining the harness.
- **Unblocks:** RP-016, ED-012, PERF-06.
- **Status:** open. Owner: benchmark owner.

### OD-006 — Reference workloads and footprint budgets

- **Question:** Which reference models and input distributions are measured, and what numeric budgets gate latency, throughput, cold start, idle cost, peak memory, and artifact size?
- **Options:** small/medium transformer workloads; fixed prompt and generation lengths; CPU-only and optional accelerator profiles; budgets derived from the competitor set or from product targets.
- **Recommendation:** version the reference workload and hardware manifest, publish p50/p95/p99 plus footprint metrics, and set release-gating budgets only after the first honest baseline run (RP-017, PERF-06.04). Do not publish a "lightest" claim before the minimal-profile artifact and idle budgets are measured.
- **Criteria:** reproducibility, statistical stability, shipping-default representativeness, regression sensitivity, and cost of running the gate in CI.
- **Unblocks:** RP-017, ED-012, PA-021.
- **Progress (2026-10-22):** the CPU TorchScript demo workload and versioned budgets are recorded in `benchmarks/budgets/classify-cpu.json`, with three clean-revision runs in `torviello-bench/evaluations/reports/2026-10-22-classify-cpu/`. Other reference models, GPU profiles, competitor-derived budgets, and a same-hardware regression baseline remain open. No "fastest" or "lightest" claim is authorized.
- **Status:** open. Owner: benchmark owner with release owner.

## Suggested discovery order

0. Resolve OD-001–OD-004 for the first slice and OD-005–OD-006 before any public "fastest" or "lightest" claim: model format, baseline backend, local/hosted auth boundary, API style, competitor set, and footprint budgets.
1. Confirm product boundary and the two release definitions.
2. Set supported hardware and OS commitments, since they constrain build and backend choices.
3. Gather auth requirements and map persistent data before selecting a database or hosted architecture.
4. Decide licensing and artifact distribution before making commercial claims.
5. Compare packaging automation options against offline reproducibility and each supported OS.
6. Define service operations and monitoring targets for the first production profile.
7. Assign named owners for required organizational functions, identify supported jurisdictions, and obtain qualified review for employment, privacy, safety, and compliance policies before operating those workflows.

Discovery does not block independent foundation work such as making repository documentation consistent or removing accidental warning suppression, provided each change follows the normal spec and plan process.
