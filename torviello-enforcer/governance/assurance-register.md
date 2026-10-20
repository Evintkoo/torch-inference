# Governance assurance register

This file is the discoverable index required by [GOV-05](rules/05-exceptions-conformance-and-control-assurance.md). Detailed evidence belongs in its authoritative work record; every entry here must link to that record. Do not enter a pass, approval, applicability disposition, or completed dry-run without evidence. An empty register means the relevant assessment has not been recorded.

## Applicability and conformance assessments

| Record ID | Date | Control/clause IDs | Component and profile | Revision/environment | Disposition | Rationale and decision owner | Evidence/work record | Reviewer | Next review trigger |
|---|---|---|---|---|---|---|---|---|---|
| RULES-STATIC-2026-10-16 | 2026-10-16 | GOV-02.08–.10, GOV-05.01, .03, .08–.09 | Rules documentation only; all 26 domains | Working tree based on HEAD 6e88465; macOS Python 3.9.21; static Markdown/ID/link/mapping scan | pass (limited to structural consistency) | Structural checks passed; no semantic control effectiveness or product implementation claim | This register’s “Static audit evidence” section | Codex, tool-assisted document reviewer | Before rules publication, after rule edits, and at the next major release |
| RULES-MANUAL-2026-10-16 | 2026-10-16 | GOV-02.03, .08–.10, .14; GOV-03.06, .11; GOV-05.01; SEC-01.04, SEC-05.02, .05 | Rule text, mappings, validator, and GitHub merge gate | Uncommitted working tree on `manual-review`; macOS; uv 0.13.1; CPython 3.15.0; pytest 9.1.1 | fail (limited review; blocking decisions remain) | Duplicate source identifiers, undefined requirement references, lowercase normative modals, and under-specified security controls were corrected. Named accountable owners, lifecycle dry-runs, security release-severity criteria, and independent review remain unrecorded; no product implementation is present. | This register’s “Manual rules review evidence” section and `uv run --locked pytest` | Codex; not an independent reviewer | Before relying on the rules for a release decision; after owner assignment and each linked decision/dry-run |
| RULES-FLOW-2026-10-19 | 2026-10-19 | GOV-06–GOV-10; ED-050–ED-055 | Rules documentation and repository-wide workflow evidence | Working tree; all 26 domains; static Markdown/ID/link scan | pass (structural addition only) | Added GOV-06–GOV-10 as one control per development stage (DDD, SDD, CDD, TDD, EDD) and ED-050–ED-055 as their requirement trace; no product implementation or evaluation effectiveness is claimed | This register’s “Development workflow addition evidence” section | Tool-assisted document reviewer | Before rules publication, after workflow edits, and at the next major release |
| RULES-SCAFFOLD-2026-10-20 | 2026-10-20 | GOV-06–GOV-10; HPA-4 acceptance criteria | Rust scaffold, React shell, Python harness; working tree; macOS; Rust stable; Node 22; CPython 3.15; pytest 9.1.1 | fail (scaffold readiness; blocking gaps remain) | Build, format, clippy, 220 enforcer/harness tests, web build/lint/test, and cargo tests pass. The HTTP shell still exposes 3 routes against a 24-route contract; model loading, inference, registry, persistence, OpenTelemetry, WebSocket transport, evaluation evidence, SBOM, and provenance are absent. Passing tests are not product conformance. | This register’s “Scaffold readiness evidence” section | Tool-assisted review; not independent acceptance | Before any release decision, and after route/model/evaluation work |

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

This review covers the non-production scaffold under `services/engine`, `web`, and `services/engine-py`; it is not an HPA-4 product acceptance. The worktree is uncommitted (`git ls-files` is empty), so the revision is not reproducible from a commit and this record cannot support a release decision.

Commands run on macOS with the locked toolchains:

- `cargo fmt --all --check` — pass.
- `cargo clippy --workspace --all-targets -- -D warnings` — pass.
- `cargo test --workspace --locked` — pass.
- `npm run lint`, `npm run build`, `npm test` — pass.
- `uv run ruff check .` — pass; `E501` is ignored only for `torviello-enforcer/**` tests, while unused imports and other rules are enforced there.
- `uv run pytest -q` — 220 passed.

Blocking gaps:

- The Axum router exposes 3 routes while `torviello-engine/contracts/openapi.yaml` declares 24; `/classify` uses JSON rather than the contracted multipart boundary, and WebSocket routes are not registered.
- Authentication is HS256-only; remote asymmetric verification is not implemented.
- Model loading, inference, registry, persistence, OpenTelemetry export, fuzzing, formal models, SBOM generation, provenance, and evaluation evidence are absent.
- All 38 governance records are `active`/`structural_only` because their metrics are `not_yet_measured`; none is operational approval.
- The worktree has no commit, so no revision-pinned evidence can be retained.
