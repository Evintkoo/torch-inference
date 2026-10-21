# Governance assurance register

This file is the discoverable index required by [GOV-05](rules/05-exceptions-conformance-and-control-assurance.md). Detailed evidence belongs in its authoritative work record; every entry here must link to that record. Do not enter a pass, approval, applicability disposition, or completed dry-run without evidence. An empty register means the relevant assessment has not been recorded.

## Applicability and conformance assessments

| Record ID | Date | Control/clause IDs | Component and profile | Revision/environment | Disposition | Rationale and decision owner | Evidence/work record | Reviewer | Next review trigger |
|---|---|---|---|---|---|---|---|---|---|
| RULES-STATIC-2026-10-16 | 2026-10-16 | GOV-02.08–.10, GOV-05.01, .03, .08–.09 | Rules documentation only; all 26 domains | Working tree based on HEAD 6e88465; macOS Python 3.9.21; static Markdown/ID/link/mapping scan | pass (limited to structural consistency) | Structural checks passed; no semantic control effectiveness or product implementation claim | This register’s “Static audit evidence” section | Codex, tool-assisted document reviewer | Before rules publication, after rule edits, and at the next major release |
| RULES-MANUAL-2026-10-16 | 2026-10-16 | GOV-02.03, .08–.10, .14; GOV-03.06, .11; GOV-05.01; SEC-01.04, SEC-05.02, .05 | Rule text, mappings, validator, and GitHub merge gate | Uncommitted working tree on `manual-review`; macOS; uv 0.13.1; CPython 3.15.0; pytest 9.1.1 | fail (limited review; blocking decisions remain) | Duplicate source identifiers, undefined requirement references, lowercase normative modals, and under-specified security controls were corrected. Named accountable owners, lifecycle dry-runs, security release-severity criteria, and independent review remain unrecorded; no product implementation is present. | This register’s “Manual rules review evidence” section and `uv run --locked pytest` | Codex; not an independent reviewer | Before relying on the rules for a release decision; after owner assignment and each linked decision/dry-run |
| RULES-FLOW-2026-10-19 | 2026-10-19 | GOV-06–GOV-10; ED-050–ED-055 | Rules documentation and repository-wide workflow evidence | Working tree; all 26 domains; static Markdown/ID/link scan | pass (structural addition only) | Added GOV-06–GOV-10 as one control per development stage (DDD, SDD, CDD, TDD, EDD) and ED-050–ED-055 as their requirement trace; no product implementation or evaluation effectiveness is claimed | This register’s “Development workflow addition evidence” section | Tool-assisted document reviewer | Before rules publication, after workflow edits, and at the next major release |
| RULES-SCAFFOLD-2026-10-20 | 2026-10-20 | GOV-06–GOV-10; HPA-4 acceptance criteria | Rust scaffold, React shell, Python harness; baseline 8bac4b1 plus uncommitted first-slice changes; macOS; Rust stable; Node 22; CPython 3.15; pytest 9.1.1 | fail (scaffold readiness; blocking gaps remain) | Build, format, clippy, 220 enforcer/harness tests, web build/lint/test, and cargo tests pass. The HTTP shell implements 6 routes from a 24-route target contract through `openapi.first-slice.yaml`; model loading, inference, persistence, OpenTelemetry, WebSocket transport, evaluation evidence, SBOM, and provenance are absent. Passing tests are not product conformance. | This register’s “Scaffold readiness evidence” section | Tool-assisted review; not independent acceptance | Before any release decision, and after route/model/evaluation work |

| RULES-ENGINE-SLICE2-2026-10-21 | 2026-10-21 | GOV-06–GOV-10; HPA-4 acceptance criteria; ENG-004, ENG-005, ENG-006 | Rust engine scaffold; working tree on `manual-review`; baseline 8bac4b1 plus uncommitted first-slice and acquisition/load changes; macOS; Rust stable; Node 22; CPython 3.15; pytest 9.1.1 | fail (scaffold readiness; HPA-4 gates unmet) | Format, clippy with `-D warnings`, 34 cargo tests, 220 enforcer/harness tests, web lint/build/test, and `ruff check` pass. The router now implements 11 routes recorded in `openapi.first-slice.yaml`: health, catalog, local acquisition with digest verification, acquisition status/SSE progress, load/unload, and metrics. Remote Hugging Face acquisition, managed-asset deletion, inference routes, a TorchScript runtime, persistence, OpenTelemetry export, WebSocket transport, fuzzing, TLA+/Loom models, SBOM, provenance, and evaluation evidence remain absent. Passing scaffold tests are not product conformance. | This register’s “Engine acquisition and load slice evidence” section | Tool-assisted review; not independent acceptance | Before any release decision, and after inference/runtime/evaluation work |

| RULES-ORDER-2026-10-21 | 2026-10-21 | GOV-08.07, GOV-09.07; ED-052, ED-053 | Governance rule text, rule index, and embedded requirement trace | Working tree on `manual-review`; uncommitted acquisition/load slice; macOS; CPython 3.15; pytest 9.1.1 | pass (structural addition only) | Added explicit ordering: contract approval precedes contract tests, which precede implementation, and failing tests precede interface implementation. Clause IDs are unique (1,053 total); the rule index and ED-052/ED-053/ED-055 traces mirror the new clauses; targeted structural tests pass. No product behavior or control effectiveness is claimed. | This register’s “Contract-first ordering evidence” section | Tool-assisted document reviewer | Before rules publication, after ordering edits, and at the next major release |

| RULES-ENDPOINT-USAGE-2026-10-21 | 2026-10-21 | GOV-08.08; ED-052, ED-055 | Rule text, HTTP response standard, contract tooling, and router integration suite | Working tree on `manual-review`; uncommitted engine changes; macOS; CPython 3.15; pytest 9.1.1; Rust stable | pass (targeted contract and runtime evidence) | Added GOV-08.08 requiring every HTTP operation to be exercised against the running provider. `status_tester.py` enforces OpenAPI status usage and reports 32 operations: 13 implemented, 19 reserved. `endpoint_usage` calls all 32 and checks fallback rejection, declared status and media type, catalog headers/cache/body fields/error codes, and the reserved `501` contract. The check caught and drove fixes for undeclared `409` responses and the operation-specific `503` representations. This is targeted evidence, not independent acceptance. | This register’s “Endpoint usage evidence” section | Tool-assisted review; not independent acceptance | Before contract release and after any operation, status, or router change |
| RULES-COMMIT-2026-10-21 | 2026-10-21 | CHG-05.07; ED-042, PA-024 | Rule text, rule index, requirement traces, and agent instructions | Working tree on `manual-review`; macOS; CPython 3.15; pytest 9.1.1 | pass (structural addition only) | Added CHG-05.07 requiring completed, verified work to be committed before handoff so every coherent change has a revertible revision. Updated the rule, change-management index, ED-042 and PA-024 traces, root and enforcer AGENTS.md, and the change-control record. Clause IDs are unique (1,055 total). This is a structural rule change, not evidence that future work will follow it. | This register’s “Commit rollback evidence” section | Tool-assisted document reviewer | Before rules publication, after version-control policy changes, and at the next major release |
| ENG-CLASSIFY-2026-10-22 | 2026-10-22 | GOV-08.08; GOV-09; ADR 0002; ENG-007, ENG-010 | Rust engine, TorchScript CPU runtime, `/classify` contract, and bundled fixture | Working tree on `manual-review` after 12d7373; macOS arm64; Rust stable; tch/torch-sys 0.22.0; Homebrew libtorch 2.9.1 with version-check bypass (expected 2.9.0); CPython 3.15; pytest 9.1.1 | fail (first vertical slice only; HPA-4 gates unmet) | Recorded ADR 0002 selecting TorchScript on CPU behind `Runtime`, added registry input geometry and labels, a 3.3 KB traced fixture, multipart `/classify`, image decode/resize/normalize, ordered top-k results, and declared 404/409 responses. `classify` tests pass 3/3, `endpoint_usage` passes with 32 operations (15 implemented, 17 reserved), contract generation reports 322 current artifacts, and the status tester reports 73 checks/0 failures. AC-ENG-13 correlation/log consistency and AC-ENG-16 SSE streaming, decoder fuzzing, and exact `classify.*` error codes remain unmet; no independent acceptance and no full CI-matrix run. | This register’s “TorchScript classification slice evidence” section | Tool-assisted review; not independent acceptance | Before claiming inference conformance, after runtime/contract changes, and after the next CI matrix run |
| ENG-CONTRACTS-2026-10-21 | 2026-10-21 | GOV-08; ED-052; HPA-4 | `torviello-engine/contracts`; working tree on `manual-review`; uncommitted engine changes; macOS; CPython 3.15; pytest 9.1.1 | fail (contract surface complete; producer/consumer agreement unverified) | Generated 320 contract artifacts including JSON Schema 2020-12 schemas and an HTTP status policy from `openapi.yaml` and the event catalog, added AsyncAPI streams and a 27-feature traceability map, and added a deterministic check. OpenAPI validates, all schemas validate against the 2020-12 metaschema, all file and `$id` references resolve, and generated files are current. Event payload fields were derived from prose and have no producer/consumer approval; no runtime payload validation or AsyncAPI linting exists, and the router routes all 30 contract paths: 13 operations are implemented and 19 return RFC 9457 `501 not_implemented`. | This register’s “Contract schema set evidence” section | Tool-assisted review; not independent acceptance | Before any contract is treated as agreed, and after producer/consumer review |

Disposition is `pass`, `fail`, `not applicable`, or `unresolved`. `Not applicable` requires the condition and rationale; `unresolved` requires an owner and resolution trigger. Keep clause-level results where a control is only partly applicable.

## Exceptions

| Exception ID | Status | Control/clause IDs and profiles | Reason and risk/impacted parties | Compensating controls | Authorized approver and approval date | Remediation owner | Expiry/review date | Verification plan/evidence | Work record |
|---|---|---|---|---|---|---|---|---|---|
| — | — | — | No exceptions recorded | — | — | — | — | — | — |

Status is `pending`, `approved`, `rejected`, `expired`, `closed`, or `revoked`. Only `approved` exceptions authorize the recorded deviation; pending, expired, or unregistered deviations are nonconformances.

## Coverage procedure dry-runs

| Review ID | Domain/control and revision | Case/profile and starting inputs | Participant, reviewer, and independence basis | Expected artifacts/decision | Actual result and evidence | Gaps, owner, retest trigger |
|---|---|---|---|---|---|---|
| — | — | No dry-runs recorded | — | — | — | — |

Do not change a placeholder into a completed status without linking dated evidence. Update the domain reference trail and this register together when a coverage review is completed; retain prior records through the repository’s records-retention controls.

## Historical static audit evidence: RULES-STATIC-2026-10-16

This initial scan is superseded by the manual review below. It did not validate mapped requirement IDs against the canonical requirement set or check uniqueness of source identifiers; the later review found defects in both areas.

**Rule change record:** Requested work was to audit and close the identified rule loopholes. Scope includes GOV-02, GOV-03, GOV-05, rule/requirement indexes, all domain coverage trails, root/notes directory guidance, clause headings, and one corrected source mapping. No external source policy or product behavior was changed; no migration is needed. The requesting user authorized the documentation edits. The named accountable rules owner remains an organizational assignment to resolve under the open-decisions record.

Scope was limited to the rules text and its local links/mappings; it did not assess implementation behavior, legal applicability, or operational effectiveness. The reviewer enumerated all 148 numbered control documents and 1,014 clause IDs; checked required metadata and assessment sections; checked duplicate clause IDs; verified that each numbered control has one domain mapping row and that its requirement/source IDs are represented in that row and source catalog; and resolved every relative Markdown link. Results: zero duplicate clause IDs, zero missing required sections, zero unmapped controls/requirement/source IDs, and zero broken local links. One stale source mapping in CHG-06 was found and corrected before the final scan. These results support only the stated structural disposition. The checks were performed with a local Python 3 script over the working tree; no product tests or runtime checks were run.

## Manual rules review evidence: RULES-MANUAL-2026-10-16

The review examined governance authoring and assurance controls, the security rule text and source mappings, cross-domain requirement references, lifecycle disposition records, and the proposed GitHub Actions workflow. It was performed by the same agent that made these changes, so it is not an independent procedure dry-run or approval. No product source or runtime behavior exists in this repository to assess.

Findings corrected in the working tree:

- The security source catalog assigned `R5` to both OWASP API Security Top 10 and NIST SP 800-53; the latter is now `R6`. The operations trail assigned `R3` to both Google SRE and ISO 37000; ISO 37000 is now `R4`, and the incident-response mapping cites NIST SP 800-61 as `R5`.
- Rule traces and maps referred to undefined requirement IDs (`SO-006`–`SO-009`, `SO-015`–`SO-019`, and `PA-015`). These references were removed or replaced with the actual defined requirement ranges.
- Sixteen normative documents used lowercase BCP 14 modal words. These were normalized, and the rules validator now rejects lowercase modal terms in normative sections.
- SEC-01.04 did not identify which SSDF version or how to assess use; it now requires a versioned implementation map to SSDF 1.1. SEC-05.02 now requires a named store and bounded file fallback. SEC-05.05 now states the exact comparison and failure conditions.
- The validator now checks requirement IDs against the requirements set, rejects duplicate source IDs and mapping rows, checks lifecycle owner/review-trigger fields, enforces globally unique control IDs, and has negative tests for unmapped files, duplicate sources, undefined requirements, lowercase modal terms, and broken links.

The local CI workflow is syntax-checked with `actionlint`; the GitHub `main` branch now requires the `rules-check` status and applies that requirement to administrators. The workflow is still only in the local worktree, so GitHub has not run that check yet; it will run when a pull request includes the workflow.

This review does not support a “ready to ship” or product-conformance claim. All 26 domain lifecycle maps still contain unresolved coverage and lack linked dry-run evidence. The repository has no named rule/security owners, no resolved security severity/release gate (tracked in `requirements/open-decisions.md`), and no product implementation. Those choices require accountable human decisions and, for coverage procedures, an independent dry-run.

## Development workflow addition evidence: RULES-FLOW-2026-10-19

The repository now has 154 numbered control documents and 1,050 clause IDs. PERF-06 adds the competitive performance and footprint claim control, and RP-016–RP-017 add its requirement basis. GOV-06–GOV-10 add one control per stage of the DDD → SDD → CDD → TDD → EDD flow, and ED-050–ED-055 add the corresponding engineering requirements. The change is additive: no existing control, requirement, or domain mapping was removed or renumbered. Structural checks confirm the new control has all required sections, unique clause IDs, a reference-trail mapping row, resolvable requirement IDs, and a lifecycle coverage row. Product implementation and evaluation effectiveness remain unassessed because no product source or evaluation report exists in this repository.


## Scaffold readiness evidence: RULES-SCAFFOLD-2026-10-20

This review covers the non-production scaffold under `services/engine`, `web`, and `services/engine-py`; it is not an HPA-4 product acceptance. The review started from commit `8bac4b1` with uncommitted first-slice changes, so the exact reviewed revision is not reproducible and this record cannot support a release decision.

Commands run on macOS with the locked toolchains:

- `cargo fmt --all --check` — pass.
- `cargo clippy --workspace --all-targets -- -D warnings` — pass.
- `cargo test --workspace --locked` — pass.
- `npm run lint`, `npm run build`, `npm test` — pass.
- `uv run ruff check .` — pass; `E501` is ignored only for `torviello-enforcer/**` tests, while unused imports and other rules are enforced there.
- `uv run pytest -q` — 220 passed.

Blocking gaps:

- The Axum router implements 6 routes from the 24-route target contract, recorded in `torviello-engine/contracts/openapi.first-slice.yaml`. Model load/download, speech, vision, assistant, and WebSocket routes remain unimplemented; the synthetic `/classify` route was removed rather than presented as inference.
- Authentication is HS256-only; the target contract permits HS256/384/512, and remote asymmetric verification is not implemented.
- The default config enables authentication while ENG-016 says loopback local mode disables it by default; an accountable owner must resolve the profile default.
- Model loading, inference, registry, persistence, OpenTelemetry export, fuzzing, formal models, SBOM generation, provenance, and evaluation evidence are absent.
- All 38 governance records are `active`/`structural_only` because their metrics are `not_yet_measured`; none is operational approval.
- The first-slice changes are uncommitted, so no revision-pinned evidence can be retained yet.

## Engine acquisition and load slice evidence: RULES-ENGINE-SLICE2-2026-10-21

This review covers the non-production scaffold under `services/engine`, `web`, and `services/engine-py`; it is not an HPA-4 product acceptance. The review started from commit `8bac4b1` with uncommitted first-slice, acquisition, and load changes, so the exact reviewed revision is not reproducible and this record cannot support a release decision.

Commands run on macOS with the locked toolchains:

- `cargo fmt --all --check` — pass.
- `cargo clippy --workspace --all-targets --locked -- -D warnings` — pass.
- `cargo test --workspace --locked` — 34 passed (11 unit, 3 contract, 5 first-slice, 4 integration, 8 model-lifecycle, 3 security).
- `npm run lint`, `npm run build`, `npm test` — pass.
- `uv run ruff check .` — pass.
- `uv run pytest -q` — 220 passed.

Implemented in this slice:

- A confined `AssetStore` joins validated single-segment model IDs to the configured root, rejects traversal, absolute paths, and symlinked path components, stages under the root, hashes with SHA-256, and activates by atomic rename.
- A bounded `Acquisition` service validates https/local sources, enforces the host allowlist, size limit, timeout, job count, and download concurrency, persists monotonic job states, and exposes status plus SSE progress that closes after a terminal state.
- A `ModelManager` implements queued/loading/ready/failed/draining/unloaded states, per-ID single-flight initialization, digest re-verification on load, reference-aware unload with a bounded drain, and a capacity policy where `max_loaded_models = 0` explicitly disables the limit.
- A reference CPU adapter (`torviello-tensor-v1`) executes a validated linear classifier over the activated bytes. The bundled `engine-demo-tensor` asset and manifest provide an offline/preloaded path. It is not a PyTorch or TorchScript runtime.

Blocking gaps:

- The router implements 11 of the 24 target routes; inference, registry administration, deletion, system, logs, assistant, and WebSocket routes remain unimplemented.
- Remote acquisition implements the bounded https path but rejects the declared Hugging Face scheme; no live remote source was exercised.
- Managed-asset deletion and registry mutation are not implemented, so the AC-ENG-11 deletion scenario is not satisfied.
- The load success path proves lifecycle behavior on the reference adapter, not on a TorchScript model; `engine-demo-classifier` and `engine-demo-embedder` fail load with `model.backend_unavailable` when no asset is present or the format is unsupported.
- AC-ENG-11 and AC-ENG-12 require archive-fuzz budgets, property tests over all path encodings, TLA+/Loom models, and memory-failure injection; none is present.
- Authentication is HS256-only and the loopback auth default remains unresolved; SBOM, provenance, and evaluation evidence remain absent.
- All changes are uncommitted, so no revision-pinned evidence can be retained yet.

## Contract-first ordering evidence: RULES-ORDER-2026-10-21

The governance flow now states the mandatory order explicitly: contract → failing test → implementation.

- GOV-08.07 requires the machine-readable contract to be authored, reviewed, and approved before contract tests, and contract tests to be observed failing before provider implementation.
- GOV-09.07 requires failing-first tests to be written against the approved contract; tests MUST NOT retroactively define an interface.
- GOV-08 and GOV-09 control objectives, prohibited conditions, assessment procedures, determinations, and required evidence were updated to match.
- The clause index in `torviello-enforcer/governance/README.md` and the embedded rule traces in `requirements/items/ED-052.md`, `ED-053.md`, and `ED-055.md` mirror both clauses.

Commands and results:

- `uv run --locked pytest torviello-enforcer/test_rules_format.py torviello-enforcer/test_rules_readme.py torviello-enforcer/test_requirement_documents.py torviello-enforcer/test_engine_requirement_quality.py -q` — 19 passed.
- Clause-ID scan — 1,055 IDs, 1,055 unique.

Limitation: this is a structural rule change. It does not prove that past or future changes followed the order; revision-order evidence remains required per change under GOV-08.07 and GOV-09.07.

## Commit rollback evidence: RULES-COMMIT-2026-10-21

CHG-05.07 makes rollback traceability a completion condition.

- Completed, verified work must be committed before handoff, release, or a completion report.
- The commit history must provide a revertible revision for each coherent change.
- The completion report must identify the commit and confirm that task-owned changes are clean.
- Work-in-progress may stay uncommitted only while explicitly owned and marked incomplete.
- Credentials, personal data, build outputs, and generated caches must not be committed.
- Pushing or publishing remains subject to explicit authorization.

The root `AGENTS.md`, `torviello-enforcer/AGENTS.md`, `governance/change-control.md`, and the ED-042/PA-024 traces carry the same requirement.

Commands and results:

- `uv run pytest -q torviello-enforcer/test_rules_format.py torviello-enforcer/test_rules_readme.py torviello-enforcer/test_rules_agents.py torviello-enforcer/test_requirement_documents.py torviello-enforcer/test_engine_requirement_quality.py torviello-enforcer/change-management/tests/test_05_repository_history_and_plan_retention.py torviello-enforcer/test_contract_artifacts.py torviello-enforcer/test_status_tester.py` — 43 passed.
- Clause-ID scan — 1,055 IDs, 1,055 unique.

Limitation: this is a structural rule change. It does not prove that every future change will be committed or that existing history is complete.

## Endpoint usage evidence: RULES-ENDPOINT-USAGE-2026-10-21

GOV-08.08 makes operation usage a normative contract obligation, not a documentation observation.

- `status_tester.py` parses `openapi.yaml`, rejects undeclared or prohibited statuses, requires `500` on every operation, requires every `used` status to appear in at least one operation, and reports the implemented/reserved split.
- `endpoint_usage` exercises every declared operation against the real router. It fails on fallback routing, undeclared status or media type, missing required headers, wrong cache policy, missing or forbidden body fields, and disallowed problem codes.
- `501` is the reserved marker: operations declaring it must return `not_implemented`; operations not declaring it must not return `501`.
- `503` is `per-operation` because readiness returns `Readiness` JSON, metrics may return text, and problem-details operations return `ErrorEnvelope`. Every `503` carries `Retry-After`.
- The HTTP response standard and contract README state the same rule, and CI plus `just verify` run the tester and integration suite.

Commands and results:

- `uv run python torviello-engine/contracts/tools/status_tester.py` — 73 checks, 64 statuses, 51 examples, 0 failures; 32 operations, 13 implemented, 19 reserved.
- Superseded 2026-10-22 by `ENG-CLASSIFY-2026-10-22`: 15 implemented, 17 reserved.
- `cargo test --locked --test endpoint_usage` — 1 passed; 32 operations exercised.
- `cargo test --workspace --locked` — 49 passed.
- `uv run pytest -q torviello-enforcer/test_status_tester.py` — 4 passed.
- `uv run pytest -q` — 240 passed.
- `uv run ruff check .` — pass.
- `cargo clippy --workspace --all-targets --all-features -- -D warnings` — pass.

Limitations: the integration request matrix uses fixture IDs and default request bodies; it does not exercise every error branch, and it is not independent acceptance. The `503` metrics path is declared but not forced in the test.

## Contract schema set evidence: ENG-CONTRACTS-2026-10-21

The target contract was converted into a generated machine-readable schema set. `openapi.yaml` and `events/catalog.yaml` are the sources; `schemas/`, `events/schemas/`, and `events/asyncapi.yaml` are generated and must not be edited by hand. Components and operation schemas are grouped by domain (`common`, `health`, `catalog`, `models`, `speech`, `vision`, `assistant`, `system`, `operations`); event schemas use the matching event domains.

Artifacts:

- 25 component schemas, including `Envelope`, `ErrorEnvelope`, catalog, acquisition, inference, speech, vision, assistant, health, system, and registration shapes.
- 64 status response schemas under `contracts/schemas/common/status/`, exactly one per assigned HTTP status code, generated by `contracts/tools/status.py`. Each file holds one schema and carries `x-status`, `x-engine-use`, `x-response-body`, and required headers. The check now enforces that every `used` code is declared in `openapi.yaml` and that every operation declares `500`.
- 162 structured operation request/response schemas for 32 OpenAPI operations, including the seven versioned aliases and the internal-error response on every operation.
- 47 event schemas, one per event in `domain/events.md`, plus AsyncAPI SSE and WebSocket channels.
- `contracts/traceability.md` maps all 27 feature specifications to operations, events, and schemas.
- The project owner approved `contracts/schemas/common/http-response-standards.md` for contract use on 2026-10-21.
- Cargo now gates SQLite persistence and telemetry behind `persistence` and `telemetry` features, removes unused runtime dependencies, and validates configured accelerators against the compiled build. CI builds minimal and `full` profiles.
- `contracts/schemas/common/http-status.yaml` and `contracts/schemas/common/http-response-standards.md` cover every code from `100` through `599`, including unassigned ranges, with RFC citations, engine use (`used`, `conditional`, `not-used`), body shape, and required headers. The check rejects an OpenAPI response status that is undeclared or prohibited.

Commands and results:

- `uv run python torviello-engine/contracts/tools/contracts.py check` — current.
- `uv run python torviello-engine/contracts/tools/status_tester.py` — 73 checks, 64 statuses, 51 examples, 0 failures; supports human-readable and `--json` reports.
- `uv run pytest -q torviello-enforcer/test_contract_artifacts.py` — 16 passed.
- `uv run pytest -q torviello-enforcer/test_status_tester.py` — 4 passed.
- `cargo test --locked --test endpoint_usage` — 1 passed; exercises all 32 OpenAPI operations and checks routing, declared status, operation-declared media type, catalog headers/body fields, and the implemented/reserved split.
- `uv run pytest -q torviello-enforcer/test_contract_artifacts.py torviello-enforcer/test_rules_format.py torviello-enforcer/test_rules_readme.py torviello-enforcer/test_requirement_documents.py torviello-enforcer/test_engine_requirement_quality.py` — 27 passed.
- `uv run pytest -q` — 240 passed.
- `cargo test --workspace --locked` — 49 passed.
- `cargo build --locked --no-default-features` and `cargo build --locked --features full` — pass.
- Router parity: all 30 OpenAPI paths are routed; 19 unimplemented operations return problem+json `501`.
- `http-status.yaml` v2.0.0 records trigger, content type, schema, required headers, cache/retry semantics, body fields, and error codes for all 64 assigned statuses; the catalog validates against `http-status.catalog.schema.json` and the standards document carries a detailed 64-row contract.
- `status_tester.py` checks catalog/schema structure, complete `100`–`599` coverage, OpenAPI status usage, per-status contract drift, header-rule coverage, and validates all embedded examples against their own schemas. It reported 32 operations: 13 implemented and 19 reserved at this revision. Superseded 2026-10-22 by `ENG-CLASSIFY-2026-10-22`: 15 implemented, 17 reserved. CI and `just verify` run it.
- `endpoint_usage.rs` is the runtime integration check behind that count: every OpenAPI operation is called, must not fall through to the router fallback, must return a status declared for that operation, must use the operation-declared media type, and must satisfy the catalog's required headers, cache policy, body fields, and allowed error codes. It caught and drove fixes for undeclared `409` responses on download status/progress and the operation-specific `503` representations (readiness JSON, metrics text, and problem details).
- Config file is validated against `services/engine/api/contracts/schema.json` before use; auth cannot be disabled.
- `413` oversized bodies, `415` missing JSON content type, configured `429` rate limits, and configured CORS origins are covered by contract tests.
- `cargo clippy --workspace --all-targets --all-features -- -D warnings` — pass.
- The engine documentation inventory check was updated from 78 to 138 Markdown files because the contract tree added traceability, status standards, and per-directory `AGENTS.md`/`README.md` files; the assertion was not relaxed.
- OpenAPI validation with `openapi-spec-validator` — valid.
- `uv run ruff check .` — pass.

Limitations:

- Event payload fields were reconstructed from the prose in `domain/events.md`. No producer, consumer, or owner has approved them, so they are not an agreed contract.
- No AsyncAPI linter is installed; AsyncAPI is checked only for YAML syntax and resolvable payload references.
- No live payload is validated against any event or operation schema.
- Fallbacks return RFC 9457 problem details for unknown routes and wrong methods, and `500` is declared on every operation. Tests cover 404, 405 with `Allow`, 413, 415, 429 with `Retry-After`, configured CORS, and 500 serialization. The router routes every contract path; 13 operations are implemented and 19 return `501`.
- The OpenAPI document covers 32 operations across 30 paths. Every path is routed; 13 operations are implemented and the other 19 return `501 not_implemented`. Contract/router path parity is tested; capability parity remains unmet.
- Operation schemas duplicate shared error shapes per status; deduplication is not performed.
- `api-contract-versioning.feature` mentions `/classify/batch` and `/v1/classify/batch`, which are absent from the inventory and contract. The discrepancy remains unresolved.


## TorchScript classification slice evidence: ENG-CLASSIFY-2026-10-22

ADR 0002 selects TorchScript on CPU behind the existing `Runtime` port. The default profile still builds without libtorch; `torchscript` is included in `full`.

Commands and results:

- `cargo check -p torviello-engine` — pass (default profile).
- `SDKROOT=$(xcrun --show-sdk-path) LIBTORCH=/opt/homebrew LIBTORCH_BYPASS_VERSION_CHECK=1 cargo test -p torviello-engine --features torchscript --test classify` — 3 passed.
- `SDKROOT=$(xcrun --show-sdk-path) LIBTORCH=/opt/homebrew LIBTORCH_BYPASS_VERSION_CHECK=1 cargo test -p torviello-engine --features torchscript --test endpoint_usage` — 1 passed; 32 operations exercised.
- `cargo test --workspace --locked` — pass (`classify` compiles with 0 tests in the default profile).
- `SDKROOT=$(xcrun --show-sdk-path) LIBTORCH=/opt/homebrew LIBTORCH_BYPASS_VERSION_CHECK=1 cargo test --workspace --locked --features torchscript` — pass.
- `SDKROOT=$(xcrun --show-sdk-path) LIBTORCH=/opt/homebrew LIBTORCH_BYPASS_VERSION_CHECK=1 cargo clippy --workspace --all-targets --all-features -- -D warnings` — pass.
- `cargo build --locked --no-default-features` and `cargo build --locked --features full` — pass.
- `uv run pytest -q` — 240 passed.
- `uv run ruff check .` — pass.
- `uv run python torviello-engine/contracts/tools/contracts.py generate` — 322 artifacts.
- `uv run python torviello-engine/contracts/tools/contracts.py check` — current.
- `uv run python torviello-engine/contracts/tools/status_tester.py` — 73 checks, 64 statuses, 51 examples, 0 failures; 32 operations, 15 implemented, 17 reserved.

Observed behavior: two PNG inputs submitted red then green returned indices 0 and 1 with leading labels `red` and `green`; `top_k=3` returned three predictions in descending score order. Unknown models return 404 `model.not_found`; empty batches, `top_k=0`, and malformed images return 400; non-multipart requests return 415.

Limitations: the local libtorch version is 2.9.1 while tch 0.22 expects 2.9.0, so the probe bypasses the version check. The clean-download path, Ubuntu build, full workspace tests, request correlation/log consistency, streaming, fuzzing, and exact AC-ENG-16 error codes are not recorded here.
