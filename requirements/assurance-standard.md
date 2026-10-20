# Engine requirement assurance standard

**Status:** Normative for the engine requirement set (`ENG-001`…`ENG-026`).
**Level:** Highest Practical Assurance (HPA-4).
**Scope:** Requirement quality, verification, security, supply chain, observability, and evidence for `torviello-engine`.

This standard raises the engine requirements above "reference implementation parity". It adopts the strongest applicable published practices and states where a stronger regime does not apply. It does not claim certification, accreditation, or full conformance to any external standard. Conformance is established only by current, reproducible evidence.

## 1. Why HPA-4

Safety-certification regimes such as DO-178C Level A, ISO 26262 ASIL D, and IEC 62304 Class C impose process, tool-qualification, and assurance obligations that depend on a safety classification this engine does not have. Applying their vocabulary without their classification, independence, and tool-qualification controls would overstate assurance.

HPA-4 therefore selects the strongest applicable practices for a local inference server:

- **Requirements engineering:** ISO/IEC/IEEE 29148:2018 quality characteristics and bidirectional traceability.
- **System quality:** ISO/IEC 25010:2023 product quality characteristics with measurable outcomes.
- **Trustworthy engineering:** NIST SP 800-160 Vol. 1 Rev. 1 lifecycle and assurance thinking.
- **Secure development:** NIST SSDF SP 800-218 v1.1 (latest final; the v1.2 initial public draft is tracked but not normative).
- **Web/API verification:** OWASP ASVS 5.0.0 Level 3 and OWASP API Security Top 10 (2023).
- **AI/model lifecycle:** OWASP AISVS 1.01 Level 3 where the requirement concerns model provenance, model supply, or model behavior.
- **Normative language:** IETF BCP 14 (RFC 2119 and RFC 8174).
- **HTTP errors:** RFC 9457 problem details with stable engine extensions.
- **Tokens:** RFC 8725 JWT best current practice; TLS 1.3 for every non-loopback listener.
- **Contract:** OpenAPI 3.2.1, validated and diffed on every change.
- **Observability:** OpenTelemetry Semantic Conventions 1.44.0, W3C Trace Context, and Prometheus/OpenMetrics exposition.
- **Supply chain:** SLSA v1.2 Build Level 3, signed CycloneDX 1.7 SBOM, signed provenance, and reproducible builds.
- **Verification techniques:** formal specification (TLA+), bounded model checking (Kani), concurrency exploration (Loom), undefined-behavior detection (Miri), property-based testing (proptest), coverage-guided fuzzing (cargo-fuzz), and mutation testing (cargo-mutants).

If an engine deployment is later assigned a safety integrity level, the applicable safety standard takes precedence and this standard is re-baselined. Until then, claiming ASIL, SIL, Class C, or equivalent assurance is prohibited.

## 2. Requirement quality gates

Every requirement document MUST satisfy all of the following before its check can pass.

| Attribute | Gate |
|---|---|
| Necessary | The requirement traces to a stakeholder need, control, risk, or invariant. |
| Correct | The stated behavior matches the authoritative control and the published contract. |
| Unambiguous | Every normative term has one meaning; quantities have units, ranges, and boundaries. |
| Complete | Inputs, outputs, limits, failure behavior, lifecycle, and ownership are stated. |
| Singular | One requirement states one independently verifiable outcome. Compound outcomes are split or enumerated. |
| Feasible | The obligation is implementable within the declared platform and resource envelope. |
| Verifiable | Each MUST has an objective procedure and pass/fail criterion. "Works correctly" is not a criterion. |
| Implementation-free | The requirement states what, not an unnecessary how, unless the how is a security or compatibility constraint. |
| Traceable | It links upstream controls and downstream feature, check, test, and evaluation. |
| Conforming | It uses BCP 14 terms, stable IDs, and the repository document structure. |

A requirement with an unresolved open decision MAY remain normative, but its check is recorded as blocked, not passed. `TBD`, `etc.`, `and so on`, and unquantified comparatives are prohibited in normative text.

### 2.1 SMART specification quality

Every acceptance check and verification procedure MUST satisfy the five SMART components. A check that omits any component is invalid, and an invalid check cannot pass.

| Component | Required content | Failure example |
|---|---|---|
| Specific | Requirement ID, actor, action, object, observable outcome, and the falsifying condition. | "The engine handles configuration correctly." |
| Measurable | Numeric threshold, percentage, count, zero-tolerance condition, or exact observable state, with units. | "Fast enough" or "most requests succeed". |
| Achievable | Evidence method, environment, toolchain, and resource budget; the target is reachable under the declared envelope. | A 100% target with no executable procedure or available environment. |
| Relevant | Linked requirement, affected controls, acceptance decision, and failure consequence. | A check that protects no requirement or release gate. |
| Time-bound | Measurement window, revision or snapshot, freshness rule, and the trigger that invalidates the evidence. | An untimestamped screenshot or a result from an unspecified revision. |

SMART applies to requirement acceptance criteria, feature scenarios, check documents, evaluation reports, and governance control records. Assertions or documents do not substitute for measurement.

## 3. Verification obligations by risk

| Risk | Minimum verification |
|---|---|
| Untrusted parser (config, JSON, multipart, audio, image, archive, WebSocket frame) | Property tests, 24 CPU-hours of coverage-guided fuzzing with no crash, OOM, or hang, plus regression corpus for every finding. |
| Lifecycle or state machine (engine, model, download, session, shutdown) | TLA+ model with bounded model checking of every invariant, plus implementation tests derived from the model. |
| Concurrency or reference ownership | Loom exploration of the primitive plus stress tests under sanitizers and cancellation injection. |
| Memory safety or unsafe code | Miri for safe-code paths and Kani for every `unsafe` block or security-critical pure function. |
| Security boundary (auth, authorization, path confinement, SSRF, redaction, limits) | OWASP ASVS 5.0.0 Level 3 checklist with evidence, attack corpus, negative tests, and zero critical/high findings. |
| API contract | OpenAPI validation, linting, router parity, alias equivalence, and breaking-change diff. |
| Arithmetic, ordering, cache key, envelope | Property-based tests with generators that cross boundaries and compare against a simple reference model. |
| Performance or capacity claim | Reproducible load/soak test on named hardware with p50/p95/p99, throughput, error rate, and saturation point. |
| Build or release claim | SLSA Build Level 3 provenance, signed SBOM, reproducible bit-for-bit rebuild, and signature verification. |

## 4. Evidence thresholds

These thresholds apply to the engine unit. A lower threshold requires an approved exception with a compensating measure, owner, and expiry. A higher threshold is always permitted.

| Evidence | Threshold |
|---|---|
| MUST clauses with a reproducible check (automated where observable, otherwise an approved manual procedure with retained evidence) | 100% |
| Bidirectional traceability (requirement ↔ feature ↔ check ↔ test ↔ evaluation) | 100%, no orphans |
| Branch coverage, security-critical modules | 100% branch coverage |
| Line coverage, engine unit | ≥ 95% |
| Branch coverage, engine unit | ≥ 90% |
| Mutation score, security-critical and domain/error modules | ≥ 90% |
| Mutation score, engine unit | ≥ 80% |
| Fuzzing per untrusted parser | ≥ 24 CPU-hours, zero crashes, OOMs, or hangs; corpus retained |
| Formal lifecycle invariants | All checked invariants hold in the bounded model; no unreviewed constraint |
| Concurrency primitives | Loom exploration clean; no race or lost-release finding |
| Sanitizers | ASan, UBSan, TSan, and Miri clean for exercised paths |
| Security findings | Zero critical or high; no known exploited vulnerability in shipped dependencies |
| ASVS 5.0.0 Level 3 applicable controls | 100% pass, or an approved exception with compensating control |
| Contract coverage | 100% of router routes documented; 100% of documented routes resolvable; zero unintended breaking diffs |
| Redaction findings | Zero across responses, logs, metrics, traces, events, and diagnostic exports |
| Provenance | SLSA Build Level 3 attestation verified; SBOM signed; rebuild bit-for-bit identical |
| Flakiness | Zero unexplained failures in the release evidence window; every retry is recorded |

The security-critical module set is fixed for this baseline: authentication and authorization, path confinement, egress and SSRF controls, redaction, request admission and limits, model integrity, error mapping, and lifecycle admission. A module added to or removed from this set requires an explicit standards-baseline revision.

Coverage and mutation thresholds are floors, not quality claims. A high score on trivial code does not offset an untested security boundary.

## 5. Evidence integrity

Every evidence bundle MUST identify:

1. Source revision and dirty-worktree status.
2. Build inputs, toolchain versions, feature flags, and lockfile digest.
3. Hardware, operating system, driver, and runtime versions.
4. Configuration, model digests, fixtures, and dataset versions.
5. Command or procedure, start and end time, and exit status.
6. Observed result, threshold, and pass/fail determination.
7. Known limitations, skipped cases, and exceptions.

Evidence MUST be reproducible from the recorded inputs. Screenshots alone are not evidence for a machine-checkable claim. A stale artifact, an unsigned provenance file, a green build without the named checks, or a summary without retained measurements is not evidence.

## 6. Exceptions

An exception MUST record the requirement ID, the unmet clause, the reason, the compensating control, the residual risk, the owner, the approval authority, and the expiry. An exception cannot:

- Waive a security boundary on a non-loopback listener.
- Waive the prohibition on secrets or payload content in logs.
- Waive integrity verification before model activation.
- Waive traceability or the existence of a check.
- Be renewed automatically.

Expired exceptions fail the requirement.

## 7. Overclaiming

The following statements are prohibited unless independently evidenced:

- "ASVS Level 3 compliant" without a complete control-by-control record.
- "SLSA Level 3" without a verified attestation for the shipped artifact.
- "Formally verified" when only a bounded model or a subset of functions was checked.
- "Zero vulnerabilities" based on a single scanner run.
- "Production ready" based on a passing build or the existence of this standard.

Documentation states the obligation. Evidence states the result. The two are never interchangeable.

## 8. Standards baseline

Baseline reviewed **2026-10-20**. Only stable, published editions are normative. A draft is tracked but cannot be cited as satisfied until it is final and adopted here. The baseline is re-reviewed within 30 days of a new stable release and at least every 90 days.

| Area | Pinned baseline | Edition/status |
|---|---|---|
| Requirements quality | ISO/IEC/IEEE 29148 | 2018, current |
| System/product quality | ISO/IEC 25010 | 2023, current |
| Trustworthy engineering | NIST SP 800-160 Vol. 1 Rev. 1 | 2022, final |
| Secure development | NIST SP 800-218 (SSDF) | v1.1, 2022, latest final; v1.2 draft not adopted |
| Web/API security | OWASP ASVS | 5.0.0, May 2025, latest stable |
| API security risks | OWASP API Security Top 10 | 2023, current |
| AI security | OWASP AISVS | 1.01, October 2026, latest stable |
| Normative language | IETF BCP 14 | RFC 2119 + RFC 8174, current |
| HTTP problem details | RFC 9457 | 2023, current |
| JWT profile | RFC 8725 | 2020, current |
| Transport security | TLS 1.3 (RFC 8446) | current |
| HTTP contract | OpenAPI Specification | 3.2.1, 10 September 2026, latest stable |
| Telemetry | OpenTelemetry Semantic Conventions | 1.44.0, August 2026, latest stable |
| Trace context | W3C Trace Context | current |
| Metrics exposition | Prometheus/OpenMetrics | current |
| Supply-chain levels | SLSA | v1.2, 24 November 2025, approved |
| SBOM | CycloneDX / ECMA-424 | 1.7 / 2nd edition, December 2025, current |
| Model-supply security | NIST SP 800-218A | 2024, final |
