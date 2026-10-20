# Engine capability evaluation plan

Status: planned. No measurement in this document is evidence; it defines the measurements that must be recorded before a capability is claimed. The evaluation is governed by [HPA-4](../../requirements/assurance-standard.md).

## Purpose

Evaluate the engine against the requirements in `requirements/engine-runtime.md` using repeatable workloads, explicit thresholds, and retained artifacts. Acceptance checks prove specific behaviors. Evaluations measure whether those behaviors remain acceptable under realistic load, failure, and platform conditions.

## Gate model

| Gate | Question | Required before |
|---|---|---|
| E1 Correctness | Do capability outputs and error mappings match the contract? | Any capability is called usable. |
| E2 Isolation | Do cache, batch, coalescing, auth, and limits preserve caller boundaries? | Any shared execution path is enabled. |
| E3 Saturation | Does the engine degrade predictably under load and overload? | Any throughput claim or capacity recommendation. |
| E4 Resilience | Do deadlines, cancellation, disconnect, and dependency failure release resources? | Any long-running or streaming capability is enabled. |
| E5 Observability | Are health, metrics, logs, and introspection truthful, bounded, and redacted? | Any production or managed deployment. |
| E6 Platform | Does each declared build profile behave as declared on each supported target? | A platform is listed as supported. |
| E7 Local-first | Does local inference work with required assets present and egress blocked? | Local mode is claimed. |
| E8 Operations | Does startup, drain, and shutdown meet the stated bounds? | A release candidate is promoted. |

A gate passes only when every threshold in it passes or an approved exception names compensating measures, an owner, and an expiry.

## Workloads

| Workload | Description | Used by |
|---|---|---|
| W1 Config matrix | Default, file, environment, and command-line combinations, including invalid candidates. | E1, E8 |
| W2 Catalog states | Registry-only, downloaded-unloaded, loaded, failed, and removed models. | E1, E5 |
| W3 Speech short | Single short TTS and STT request at the documented default format. | E1, E4 |
| W4 Speech stream | Long synthesis stream with slow consumer and mid-stream disconnect. | E3, E4 |
| W5 Vision batch | 1, 16, 64, and 128 images at boundary dimensions. | E1, E2, E3 |
| W6 Detection | Single image at minimum, nominal, and maximum dimension; threshold boundaries. | E1, E3 |
| W7 Mixed traffic | Concurrent TTS, STT, classification, detection, catalog reads, and probes. | E2, E3, E5 |
| W8 Failure injection | Missing model, corrupt digest, unavailable backend, upstream timeout, worker panic. | E4 |
| W9 Shutdown | Drain with in-flight streams, downloads, and inference at the grace boundary. | E4, E8 |
| W10 Platform matrix | Each declared build profile on each declared target. | E6 |

## Thresholds

Thresholds are provisional until the first baseline run; lowering one requires a recorded decision. They are stated so a run can pass or fail rather than produce an unactionable number.

| Measure | Threshold | Gate |
|---|---|---|
| Contract conformance for exercised routes | 100% of documented success and error cases match status, headers, and schema. | E1 |
| Cross-caller leakage in cache and batch | 0 observable leaks. | E2 |
| Item order preservation | 100% of labeled batches and streams. | E1, E2 |
| Oversized input handling | 100% rejected before execution with the documented status and code. | E1, E3 |
| Deadline release | 100% of expired, cancelled, and disconnected work releases model references and permits within 1 s of the event. | E4 |
| Probe availability under saturation | Liveness and readiness respond within 1 s in 100% of samples while execution queues are full. | E3, E5 |
| Error-envelope conformance | 100% of injected failures use the documented envelope and no partial success. | E1, E4 |
| Secret and payload redaction | 0 occurrences across responses, logs, metrics, events, and diagnostic exports for the seeded corpus. | E5 |
| Metric label cardinality | No unbounded label; series count stays within the declared budget under W7. | E5 |
| Startup to readiness | Within the published bound for each profile and model set; no listener before validation. | E8 |
| Shutdown within grace | 100% of runs exit within the configured grace window; forced exits are counted and explained. | E8 |
| Local offline execution | 100% of W1–W6 local cases pass with egress blocked and no account configured. | E7 |
| Build-profile honesty | 0 undeclared providers or optional dependencies in the minimal artifact; every declared provider passes on its target or is marked unsupported. | E6 |
| Latency and throughput | Record p50, p95, p99, and throughput for each workload and profile. A release claim must name the profile, workload, and measured values. | E3 |

Latency and throughput have no universal threshold because they depend on hardware and model. A claim is invalid unless it names the hardware, model, precision, batch size, concurrency, and measurement window.

## Procedure

1. Freeze the build, model set, configuration, hardware, and dataset versions; record their digests.
2. Run the correctness and contract checks before load tests. A correctness failure stops the evaluation.
3. Warm up each workload for a stated duration; exclude warm-up from reported statistics.
4. Run each workload for at least the stated window and at least three repetitions. Report median and spread, not a best run.
5. Inject each failure in isolation and then in combination with W7.
6. Capture responses, logs, metrics, events, and resource samples with synchronized timestamps and the request ID.
7. Inspect redaction against a seeded corpus containing tokens, paths, prompts, transcripts, and image metadata.
8. Record skipped workloads, environment differences, and any threshold exception.
9. Route failures to the owning stage with the requirement ID, check ID, evidence path, and reproduction command.

## Evidence

Store under `evaluations/<YYYY-MM-DD>-<gate>/`:

- `plan.md` — build, configuration, hardware, datasets, and thresholds used.
- `results.json` — per-run measurements and pass/fail per threshold.
- `summary.md` — findings, regressions, exceptions, and routing.
- `redaction-report.md` — corpus, method, and zero-finding statement.
- `artifacts/` — captured logs, metrics snapshots, and sanitized traces.

Evidence must be reproducible from the recorded commands and must not contain secrets or raw user payloads. A summary without retained measurements is not evidence.

## Requirement coverage

| Requirement | Primary gates | Required workloads |
|---|---|---|
| ENG-001 | E1, E8 | W1 |
| ENG-002 | E8 | W1, W9 |
| ENG-003 | E1, E6 | W10 |
| ENG-004 | E1, E5 | W2 |
| ENG-005 | E1, E4 | W2, W8 |
| ENG-006 | E1, E4 | W2, W9 |
| ENG-007 | E1 | W3, W5 |
| ENG-008 | E1, E3, E4 | W3, W4 |
| ENG-009 | E1, E3, E4 | W3, W7 |
| ENG-010 | E1, E2, E3 | W5 |
| ENG-011 | E1, E3 | W6 |
| ENG-012 | E1, E4 | W7, W8 |
| ENG-013 | E1, E4 | W4, W7 |
| ENG-014 | E1, E2 | W5, W7 |
| ENG-015 | E2, E3 | W7, W8 |
| ENG-016 | E2, E5 | W7, W8 |
| ENG-017 | E1, E4 | W8 |
| ENG-018 | E3, E5 | W7 |
| ENG-019 | E5 | W7 |
| ENG-020 | E5 | W7, W8 |
| ENG-021 | E1, E5 | W1–W7 |
| ENG-022 | E3, E4, E8 | W4, W7, W9 |
| ENG-023 | E1, E2 | W3, W5, W6 |
| ENG-024 | E7 | W1–W6 |
| ENG-025 | E1, E5 | W2 |
| ENG-026 | E6 | W10 |

## Assurance evidence gates

These gates are mandatory under HPA-4 and are additional to E1–E8. A missing or stale artifact blocks the release; a tool run without a retained report is not evidence.

| Gate | Required evidence | Threshold |
|---|---|---|
| A1 Requirements quality | Requirement review against ISO/IEC/IEEE 29148 quality gates and bidirectional traceability matrix. | 100% of `ENG-001`–`ENG-026`, no orphans. |
| A2 Coverage | Line and branch coverage for the engine unit and its security/safety-critical modules. | ≥95% line, ≥90% branch overall; 100% branch on critical modules. |
| A3 Mutation | Mutation report for domain, error, auth, limit, cache-key, and redaction modules. | ≥90% critical, ≥80% unit. |
| A4 Fuzzing | Coverage-guided fuzz runs for every untrusted parser with corpus and replay commands. | ≥24 CPU-hours per parser; zero crash, OOM, hang, or unbounded allocation. |
| A5 Formal and concurrency | TLA+ models for engine, model, download, session, and shutdown lifecycles; Loom for synchronization; Miri for safe-code paths; Kani for `unsafe` and security-critical functions. | All listed invariants checked; no unreviewed constraint; clean Loom, Miri, and Kani results. |
| A6 Sanitizers | ASan, UBSan, and TSan runs across integration, streaming, and concurrency suites. | Zero findings on exercised paths. |
| A7 Security | ASVS 5.0.0 Level 3 control record, API Security Top 10 2023 mapping, AISVS 1.01 Level 3 model-supply record, threat model, dependency and secret scans. | 100% applicable controls pass or approved exception; zero critical/high; no known exploited dependency. |
| A8 Contract | OpenAPI 3.2.1 validation, lint, router parity, alias equivalence, RFC 9457 schema validation, breaking-change diff. | 100% route coverage, zero lint findings, zero unintended breaking changes. |
| A9 Redaction | Seeded corpus across responses, logs, traces, metrics, events, and exports. | Zero findings. |
| A10 Supply chain | SLSA v1.2 Build Level 3 attestation, signed CycloneDX 1.7 SBOM, signature verification, bit-for-bit rebuild. | All verify; rebuild digest identical. |
| A11 Flakiness | Repeated runs of every gate in the release window with retries recorded. | Zero unexplained failures; every retry explained and bounded. |

An A-gate failure is not waived by a passing E-gate. Both sets are required for a release claim.

## Release decision

A release candidate is eligible only when E1–E8 and A1–A11 pass for every claimed capability and platform, all evidence is retained, and every exception has an owner and expiry. A green build, a passing unit test, or the existence of this plan is not a release decision.
