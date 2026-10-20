# Engine acceptance criteria

**Assurance level:** HPA-4 (Highest Practical Assurance), defined in [`requirements/assurance-standard.md`](../../requirements/assurance-standard.md).
**Scope:** configuration, lifecycle, backends, catalog, acquisition, model loading, inference capabilities, realtime transports, batching, resilience, security, errors, observability, contracts, registry administration, and platform profiles.
**Decision rule:** acceptance is binary. A check passes only when every applicable MUST, every threshold below, every negative case, and every evidence requirement pass on the recorded revision. Partial credit, best-run reporting, and conditional acceptance are prohibited.

## 1. Acceptance principles

1. **Zero-tolerance means zero.** One occurrence of a fatal condition is a failure, regardless of the number of passing cases, the size of the test suite, or the severity of the surrounding work.
2. **Evidence beats assertion.** A passing build, a code review, a design document, a screenshot, or this table is not evidence. Evidence is a reproducible measurement tied to a revision, configuration, input digest, environment, and command.
3. **The shipping path is the only path.** A debug feature, test double, mock, special build, or manually configured exception cannot establish acceptance.
4. **Every claim has a falsifier.** Each check states the observation that would fail it. A check whose failure cannot be observed is not acceptable.
5. **Adversarial by default.** Every capability is tested with malformed, boundary, oversized, concurrent, cancelled, disconnected, unauthorized, and dependency-failure inputs, not only the documented success path.
6. **No silent degradation.** A fallback, skip, partial result, disabled limit, or unsupported platform is acceptable only when declared, observable, and covered by its own passing check.
7. **No stale evidence.** Evidence predating the revision, configuration, model, toolchain, or dependency change under test is invalid.
8. **No unbounded resource.** Every queue, buffer, cache, retry, stream, session, profile, and parser allocation is bounded or explicitly documented as unbounded with an approved capacity analysis. The default is bounded.

### 1.1 SMART specification contract

Every acceptance check, feature scenario, and check document is written as a SMART specification. A row that cannot answer all five components is not a valid check.

| Component | Normative requirement | Rejection condition |
|---|---|---|
| Specific | Names the requirement, actor, action, object, observable outcome, and the condition that fails it. | Vague verbs such as "improve", "support well", or "handle correctly" without an observable outcome. |
| Measurable | States a numeric threshold, percentage, count, zero-tolerance condition, or exact observable state. | A threshold that is subjective, unquantified, or satisfied by a documentation statement. |
| Achievable | Names the evidence method, required environment, and whether the check is automated or reviewed; the threshold must be reachable with the declared toolchain and resources. | A target with no feasible evidence path, undeclared environment, or resource assumption. |
| Relevant | Links to the requirement ID, affected controls, and the acceptance decision or failure criterion it protects. | A check with no requirement link, no affected control, or no release consequence. |
| Time-bound | States the measurement window, revision, freshness rule, and the event that invalidates the evidence. | A check with no measurement window, no re-acceptance trigger, or stale evidence. |

The five components are mandatory for all 32 checks in section 3 and for every `checks/AC-ENG-*.md` document. Feature scenarios are governed through their `@AC-ENG-*` tag and the linked SMART check; every scenario must trace to at least one acceptance check. `docs` or prose alone never satisfies a SMART component; the evidence must be produced by the shipping artifact and retained with the revision and command.

The current SMART review window is **2026-10-20 through 2027-01-31**. Evidence presented after 2027-01-31, or evidence from an earlier revision, is stale and cannot satisfy a check.

## 2. Universal acceptance gates

Every check must satisfy all of these in addition to its row in section 3.

| Gate | Threshold |
|---|---|
| SMART specification | 100% of checks state Specific, Measurable, Achievable, Relevant, and Time-bound components; zero unmeasurable, unlinked, or undated checks. |
| Applicable MUST clauses | 100% pass; a single unmet MUST fails the check. |
| Traceability | 100% bidirectional: requirement ↔ feature ↔ check ↔ test ↔ evidence; zero orphans. |
| Negative, boundary, and failure cases | 100% of the cases named by the requirement and check executed; zero skips without an approved blocked status. |
| Reproducibility | Same revision, inputs, and environment produce the same verdict on 3 independent runs. |
| Determinism | Identical requests produce byte-identical output except for documented, bounded non-determinism. |
| Security findings | Zero critical or high; zero known exploited vulnerabilities in shipped dependencies. |
| Redaction | Zero secrets, credentials, tokens, prompts, transcripts, audio, images, paths, or raw payloads in any response, log, trace, metric, event, or export. |
| Contract conformance | 100% of exercised routes match OpenAPI 3.2.1 status, headers, content type, and schema. |
| Error conformance | 100% of failures use RFC 9457 `application/problem+json` with a stable engine code. |
| Formal, fuzz, mutation, coverage | Met for the risk class in the assurance standard; missing or below-threshold evidence fails the check. |
| Flakiness | Zero unexplained failures or retries in the acceptance window. |
| Evidence integrity | Revision, inputs, toolchain, hardware, configuration, model digest, command, threshold, observed result, and limitations are recorded. |

## 3. Acceptance checks

The threshold column is normative. The adversarial column names the minimum evidence that must exist in addition to the happy path.

| Check ID | Requirement | Acceptance threshold | Required adversarial evidence | Type |
|---|---|---|---|---|
| [AC-ENG-01](checks/AC-ENG-01.md) | RP-001 | 100% of accepted configurations are TOML; 100% of non-TOML inputs are rejected with a stable code; the active format is reported; zero files are written on validation failure. | Non-TOML, empty, truncated, duplicate-key, unknown-key, and unreadable-file cases. | Automated |
| [AC-ENG-02](checks/AC-ENG-02.md) | RP-002 | A precedence truth table covers 100% of setting classes; randomized property testing matches the reference order in 100% of cases; 100 runs and 3 platforms produce an identical effective snapshot; 100% of values report a winning source; zero secret disclosure. | Conflicting sources, empty values, malformed environment values, duplicate flags, and secret-bearing settings. | Automated |
| [AC-ENG-03](checks/AC-ENG-03.md) | RP-014 | 100% of descriptors expose a unique, non-empty, stable model ID and declared backend; duplicate, empty, path-derived, and traversal-derived IDs are rejected; identity is unchanged across restart, download, load, and unload in 100% of cases. | Duplicate IDs, path-shaped IDs, restart reconstruction, and descriptor mutation attempts. | Automated |
| [AC-ENG-04](checks/AC-ENG-04.md) | PA-002 | 100% of local capabilities pass with egress blocked; zero external connections, DNS lookups, account checks, or control-plane calls; startup and health succeed in 100% of offline runs. | Blocked egress, absent DNS, absent credentials, and upstream-unavailable cases. | Automated |
| [AC-ENG-05](checks/AC-ENG-05.md) | PA-010 | Static and runtime boundary review finds zero transport or provider types in domain/application signatures; 100% of boundary crossings use domain values; two independent reviewers sign off; zero unresolved exceptions. | Attempted transport-type injection, provider-handle leakage, and boundary bypass. | Review |
| [AC-ENG-06](checks/AC-ENG-06.md) | ED-011 | 100% of feature scenarios map to an automated test or an approved manual procedure; zero orphan requirements or checks; 100% of checks resolve to current evidence; zero stale evidence. | Missing, duplicate, stale, and unreachable trace links. | Review |
| [AC-ENG-07](checks/AC-ENG-07.md) | ENG-001 | 100% of precedence truth-table cases pass; property testing over randomized source combinations is 100%; 24 CPU-hours of parser fuzzing produce zero crash, hang, or unbounded allocation; mutation score ≥90% for precedence/validation/redaction; zero secret findings. | Malformed TOML, duplicate keys, hostile environment values, secret-bearing values, and source conflicts. | Automated |
| [AC-ENG-08](checks/AC-ENG-08.md) | ENG-002 | TLA+ model checking finds zero invariant violations across every lifecycle state; 100% of guarded transitions match the model; readiness is false in 100% of pending/failed states; shutdown completes within the configured grace window in 100% of runs or records a forced exit. | Signal storms, repeated termination, kill during initialization, drain with active work, and grace-window expiry. | Automated |
| [AC-ENG-09](checks/AC-ENG-09.md) | ENG-003 | 100% of declared providers are probed on every claimed target; zero false "available" results; selection is deterministic in 100% of randomized capability sets; 100% of fallbacks emit a reason and remain attributable. | Missing device, denied permission, exhausted memory, failed initialization, and unavailable provider. | Automated |
| [AC-ENG-10](checks/AC-ENG-10.md) | ENG-004 | 100% of catalog state combinations are independently reported; zero duplicate IDs or slots; 100% schema validation; zero host paths, credentials, or signed URLs; removal is atomic in 100% of crash-injection runs. | Conflicting dimensions, duplicate identity, restart, partial removal, and hostile IDs. | Automated |
| [AC-ENG-11](checks/AC-ENG-11.md) | ENG-005 | 100% of traversal, absolute-path, symlink, hardlink, special-file, and archive-bomb cases are rejected; zero writes outside the root; 100% integrity verification before activation; zero partial assets visible; 24 CPU-hours of archive fuzzing. | Zip bomb, tar bomb, malformed headers, encoding tricks, TOCTOU, and interrupted activation. | Automated |
| [AC-ENG-12](checks/AC-ENG-12.md) | ENG-006 | TLA+ and Loom find zero lifecycle, single-flight, capacity, or reference-ownership violations; zero double initialization; zero reference leaks across cancellation, error, unload, and eviction; 100% capacity enforcement; zero Ready slots after OOM. | Concurrent load/infer/unload/evict, OOM, cancel-during-load, and provider failure. | Automated |
| [AC-ENG-13](checks/AC-ENG-13.md) | ENG-007 | 100% of success responses validate against the envelope schema; 100% contain model, backend, latency, version, postprocessing state, warnings, and request ID; zero attribution mismatches; zero partial success bodies. | Every capability, binary/stream metadata, backend failure, and alias comparison. | Automated |
| [AC-ENG-14](checks/AC-ENG-14.md) | ENG-008 | 100% of audio declares and matches sample rate, channels, encoding, and framing; zero reordered or unmarked-gap frames; 100% disconnect/deadline cancellation; 24 CPU-hours of text/parameter/audio fuzzing. | Slow consumer, mid-stream disconnect, deadline expiry, invalid format, and boundary parameters. | Automated |
| [AC-ENG-15](checks/AC-ENG-15.md) | ENG-009 | 100% of oversized, malformed, polyglot, and decompression-bomb inputs are rejected before decode and dispatch; zero invalid inputs reach a model; 100% of responses contain text, language, duration, and timing; zero temporary-file, buffer, or reference leaks. | Bomb corpus, truncated containers, unsupported codecs, and cancellation during decode. | Automated |
| [AC-ENG-16](checks/AC-ENG-16.md) | ENG-010 | 100% input-order preservation; zero bound bypasses for count, bytes, dimensions, or `top_k`; 100% deterministic tie-breaking; 24 CPU-hours of image-decoder fuzzing; zero cross-item contamination. | Malformed, truncated, oversized, polyglot images, and boundary `top_k`. | Automated |
| [AC-ENG-17](checks/AC-ENG-17.md) | ENG-011 | 100% of unsupported model families/sizes rejected without substitution; 100% threshold validation and monotonicity; 100% finite in-range boxes/scores; differential agreement with the reference model within the recorded tolerance; 24 CPU-hours of image/parameter fuzzing. | Wrong family, wrong size, NaN/Inf thresholds, threshold boundaries, and malformed images. | Automated |
| [AC-ENG-18](checks/AC-ENG-18.md) | ENG-012 | 100% of SSRF, redirect, DNS-rebinding, userinfo, encoded-host, private-address, and unsupported-scheme cases blocked; zero credential disclosure; 100% deadline and bounded-retry enforcement; local readiness unchanged in 100% of upstream failures. | Upstream delay, reset, malformed response, partial stream, 4xx/5xx, and credential rejection. | Automated |
| [AC-ENG-19](checks/AC-ENG-19.md) | ENG-013 | 100% RFC 6455 conformance for handshake, framing, fragmentation, control frames, close codes, and UTF-8; zero malformed frames accepted; zero unbounded buffers; 100% resource release on disconnect; 24 CPU-hours of frame fuzzing. | Oversized, fragmented, interleaved, malformed frames, slow consumer, and abrupt disconnect. | Automated |
| [AC-ENG-20](checks/AC-ENG-20.md) | ENG-014 | 100% cache-key completeness for every result-changing input, parameter, model, backend option, and version; zero cross-caller leakage; zero stale, partial, or poisoned hits; 100% order preservation; 100% reconciliation of hits, misses, joins, and executions. | Semantically identical requests, collision attempts, TTL boundaries, leader cancellation, and per-caller batch isolation. | Automated |
| [AC-ENG-21](checks/AC-ENG-21.md) | ENG-015 | 100% of limits enforced before buffering, decode, queue insertion, or dispatch; zero unbounded queues or retry budgets; 100% deadline resource release; probes remain available in 100% of saturation samples; overload never returns 500. | Burst, soak, worker exhaustion, circuit opening/closing, deadline expiry, and probe-under-saturation. | Automated |
| [AC-ENG-22](checks/AC-ENG-22.md) | ENG-016 | 100% of applicable ASVS 5.0.0 Level 3 controls pass or hold an approved exception; zero authentication or authorization bypass; 100% TLS 1.3 on non-loopback listeners; zero shared-secret remote profiles; 100% token-attack corpus rejection; 100% security headers. | `none`, algorithm confusion, kid injection, expired, wrong issuer/audience, replay, retired keys, untrusted proxy headers, and admin-scope denial. | Automated |
| [AC-ENG-23](checks/AC-ENG-23.md) | ENG-017 | 100% of error responses are RFC 9457 `application/problem+json`; 100% status/code mapping coverage; zero success-shaped failures; zero internal-detail leaks; zero alias drift; 100% request-ID consistency across body, headers, and logs. | Every code, status, alias, WebSocket error frame, forced internal failure, and redaction corpus. | Automated |
| [AC-ENG-24](checks/AC-ENG-24.md) | ENG-018 | Liveness, readiness, and health are distinct in 100% of states; zero blocked probes under saturation; 100% Prometheus/OpenMetrics validation; zero unbounded labels; 100% OpenTelemetry 1.44.0 field conformance; zero user-controlled label values. | Full queues, open circuits, long inference, scrape under load, and cardinality stress. | Automated |
| [AC-ENG-25](checks/AC-ENG-25.md) | ENG-019 | 100% of reported configuration matches the active snapshot; 100% of values report source and precedence; 100% sampling windows and sample counts stated; zero redaction findings; profiling cost stays within the declared bound. | Secret corpus, partial initialization, degraded components, concurrent sampling, and profiling. | Automated |
| [AC-ENG-26](checks/AC-ENG-26.md) | ENG-020 | 100% request correlation across HTTP, WebSocket, upstream, and response; zero log-forging via CRLF, ANSI, Unicode control, or oversized fields; zero secret or payload findings; 100% W3C trace-context propagation; 100% audited diagnostic access. | Injection corpus, accepted and rejected traffic, trace propagation, export, and retention boundaries. | Automated |
| [AC-ENG-27](checks/AC-ENG-27.md) | ENG-021 | OpenAPI 3.2.1 validates and resolves with zero errors; zero lint findings; 100% bidirectional router parity; 100% alias equivalence; zero unintended breaking changes; 100% RFC 9457 error schema coverage. | Missing/extra routes, schema omissions, alias differences, and breaking diffs. | Automated |
| [AC-ENG-28](checks/AC-ENG-28.md) | ENG-022 | TLA+/Loom find zero concurrency or ownership violations; blocking detector finds zero reactor blocking; zero unbounded queues/channels; 100% cancellation and deadline release; 100% shutdown within deadline; ASan/UBSan/TSan/Miri clean. | Cancellation at every await, disconnect, worker panic, saturated queues, and shutdown with active streams. | Automated |
| [AC-ENG-29](checks/AC-ENG-29.md) | ENG-023 | 100% validate-before-infer; 100% deterministic output for identical inputs and parameters; 100% declared postprocessing order; zero validation bypasses or execution after rejection; mutation score ≥90% for validation/postprocessing. | Oversized text, control characters, polyglot payloads, NaN/Inf parameters, repeated runs, and encoding tricks. | Automated |
| [AC-ENG-30](checks/AC-ENG-30.md) | ENG-024 | 100% of local capability matrix passes with egress blocked; zero external connections, DNS lookups, telemetry, account checks, or hidden downloads; 100% endpoint inventory mapped to configuration gates; local readiness unchanged during upstream failure. | Blocked egress, absent DNS, upstream failure, and dependency inspection. | Automated |
| [AC-ENG-31](checks/AC-ENG-31.md) | ENG-025 | 100% of administrative authorization matrix cases pass; zero unaudited mutations; zero audit-chain tampering undetected; 100% atomic and idempotent registration/removal; zero path or scan escape; 100% redacted export. | Unauthorized roles, concurrent mutation, crash at every boundary, audit tampering, and hostile names. | Automated |
| [AC-ENG-32](checks/AC-ENG-32.md) | ENG-026 | 100% of declared target/profile combinations build, start, and pass a probe; zero undeclared optional dependencies in the minimal profile; 100% SLSA v1.2 Build Level 3 and signed SBOM verification; 100% bit-for-bit reproducible rebuild. | Unsupported target, missing provider, feature leakage, tampered provenance, and rebuild comparison. | Automated |

## 4. Failure criteria

**One occurrence of any criterion below fails the entire acceptance decision.** Failures are not averaged, weighted, downgraded, or offset by passing cases. A failure may not be closed by documenting it, adding a warning, or lowering a threshold.

### 4.1 Correctness and identity

- A model ID resolves to more than one descriptor or slot, or identity changes across restart, download, load, unload, or relocation.
- A capability reports success for a result that is partial, truncated, empty when non-empty is required, misordered, attributed to another model, or attributed to another caller.
- A success response omits model ID, backend, latency, engine version, postprocessing state, warnings, or request ID.
- An unsupported model, backend, format, precision, or platform is substituted without an explicit, observable, configured fallback.
- A limit, threshold, or parameter outside its declared range is accepted.
- Identical inputs and parameters produce different results without documented bounded non-determinism.

### 4.2 Security and trust boundaries

- Any path derived from a request resolves outside the configured model root, follows a link outside it, or writes before validation.
- A model asset is activated before digest or signature verification succeeds.
- A non-loopback listener serves plaintext, lacks TLS 1.3, or exposes unauthenticated mutation.
- A remote profile accepts a shared-secret JWT algorithm, an unapproved algorithm, a missing issuer/audience, an expired token, a replayed token, or a retired key.
- A protected route executes handler logic before authentication, or a valid non-admin token reaches an administrative mutation.
- Rate-limit identity trusts a client-controlled forwarding header without an explicit trusted-proxy policy.
- An SSRF, redirect, DNS-rebinding, private-address, or unsupported-scheme destination is reachable through the assistant proxy.
- A secret, credential, token, prompt, transcript, audio, image, path, or raw payload appears in any response, log, trace, metric, event, export, or error.
- An audit record is missing for an administrative mutation, or audit deletion/reordering/modification is undetectable.

### 4.3 Limits, resources, and concurrency

- A size, duration, count, concurrency, queue, cache, retry, stream, or session limit is silently ignored or enforced after allocation.
- A queue, channel, retry budget, buffer, or parser allocation grows without a declared bound.
- A deadline, cancellation, disconnect, panic, or shutdown leaves a model reference, worker, permit, connection, temporary file, or session unreleased.
- Blocking model, codec, filesystem, or lock-holding work runs on the transport reactor.
- Overload returns 500 instead of an explicit 429 or 503 with retry guidance where retry can succeed.
- A probe is blocked by inference saturation, rate limiting, or an open circuit.
- Shutdown exceeds the configured grace window without recording a forced exit and the cancelled work.

### 4.4 Contract and observability

- A route exists in the router but not the contract, or in the contract but not the router.
- An alias differs from its canonical route in status, headers, content type, or body shape.
- An unchanged contract change removes a field, changes a type, changes a status, or renames a code without a version and deprecation plan.
- Any failure body is not RFC 9457 `application/problem+json`, lacks a stable engine code, or uses a code/status pair outside the exhaustive mapping.
- Liveness, readiness, and health are substituted for one another, or readiness is true while a required component is pending or failed.
- A metric label is unbounded or contains a request ID, path, prompt, or user-controlled value.
- A request cannot be correlated across response, log, and trace, or a log record can be forged through injected fields.
- Reported configuration, hardware, version, or performance differs from the active snapshot or measurement basis.

### 4.5 Evidence, supply chain, and platform

- A MUST clause has no reproducible check, or any requirement, feature, check, test, or evaluation is an orphan.
- Required fuzzing, property, formal, Loom, Miri, Kani, sanitizer, coverage, or mutation evidence is absent, below threshold, or not reproducible.
- A critical or high security finding exists, or a shipped dependency has a known exploited vulnerability.
- An artifact lacks verified SLSA v1.2 Build Level 3 provenance, a signed SBOM, or a bit-for-bit reproducible rebuild.
- Evidence is stale, unsigned where required, lacks its revision/inputs/environment, or reports only a summary without measurements.
- A claimed platform, provider, or capability has no passing target-matrix evidence, or an undeclared optional dependency appears in the minimal profile.
- An unsupported target fails silently or degrades instead of failing clearly.
- An exception is unapproved, expired, lacks a compensating control, or attempts to waive a security boundary, redaction, traceability, or integrity verification.
- Any unexplained flaky result, skipped case, or retry appears in the acceptance window.

## 5. Evidence acceptance thresholds

| Evidence | Required threshold |
|---|---|
| MUST clauses with reproducible automated evidence | 100% |
| Bidirectional traceability | 100%, zero orphans |
| Branch coverage, security and safety-critical modules | 100% |
| Line coverage, engine unit | ≥95% |
| Branch coverage, engine unit | ≥90% |
| Mutation score, domain/error/auth/limit/cache-key/redaction modules | ≥90% |
| Mutation score, engine unit | ≥80% |
| Fuzzing per untrusted parser | ≥24 CPU-hours, zero crash/OOM/hang, corpus retained |
| Formal lifecycle and concurrency invariants | 100% checked, zero violation, scope recorded |
| Security findings | Zero critical/high; zero known exploited dependency |
| ASVS 5.0.0 Level 3 applicable controls | 100% pass or approved exception |
| Contract coverage | 100% routes, 100% schema, zero unintended breaking diff |
| Redaction findings | Zero |
| Provenance and SBOM | SLSA v1.2 Build Level 3 verified; SBOM signed; rebuild identical |
| Flakiness | Zero unexplained failures or retries |

## 6. Acceptance decision

A check is **accepted** only when all of the following are true:

1. Every applicable MUST and every row threshold in section 3 passes.
2. Every universal gate in section 2 passes.
3. No failure criterion in section 4 occurs.
4. The evidence in section 5 is current, complete, reproducible, and retained.
5. The result was produced by the shipping artifact on a named platform and configuration.

A check is **blocked** only for an unresolved open decision or an unavailable external dependency; blocked is not accepted. A check is **failed** for every other unmet condition, including missing evidence.

There is no conditional acceptance. There is no "pass with follow-up" for a fatal failure. There is no waiver of sections 4.2, 4.5, redaction, traceability, integrity verification, or transport security.

## 7. Re-acceptance triggers

Acceptance must be repeated in full when any of the following changes:

- A normative requirement, acceptance threshold, failure criterion, or mapped control.
- A route, schema, status code, error code, content type, or alias.
- Authentication, authorization, TLS, key handling, rate limiting, or trusted-proxy policy.
- Model identity, loader, acquisition, integrity, cache key, batching, or lifecycle.
- A dependency, toolchain, build profile, target, feature flag, or packaging step.
- A security, performance, capacity, or observability claim.

A change that touches several triggers requires the union of their checks, not a representative subset.
