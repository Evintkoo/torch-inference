+++
id = "0048"
title = "Remediate the full rules-corpus conformance debt (29 failing domain tests)"
status = "in_progress"
priority = "P2"
owner = "engineer"
created = "2026-11-10"
updated = "2026-11-10"
requirements = ["ED-014", "SO-012"]
controls = ["GOV-02", "GOV-03", "GOV-05"]
depends_on = []
labels = ["governance", "tech-debt", "ci"]
+++
## Outcome

every failing domain conformance test in the full rules-corpus suite is remediated or explicitly dispositioned with owner authority, and the CI rules-check gate is widened from the rules-system subset (contracts, ticket store, governance, document format - the only passing scope) back to the full corpus without failing, in tracked increments

## Acceptance

- [ ] the twelve-section defect record below captures every failing test class with evidence; increments land in tracked commits with per-class pass evidence; no conformance test is weakened
- [ ] skipped
- [ ] or deleted - remediation or owner-dispositioned rule/requirement changes only (GOV-05 assurance process for any relaxation)
- [ ] OpenAPI route coverage: every engine route appears in the published OpenAPI contract (API-01)
- [ ] HPA-4 structure: engine requirement and check documents meet the assurance standard (10 failing test_engine_* tests)
- [ ] and the document-count assertions are re-baselined to the real corpus size
- [ ] code quality: no source file exceeds the 500-line bound (CQ-02/05: engine acquisition.rs 940
- [ ] auth.rs 793
- [ ] config.rs 717 + landing deploy files if still over) and licensing headers exist on every source file (LIC-03)
- [ ] observability scope: OBS-01 gains a rule-level definition of deploy/ops tooling scope so the generated test matches the rule text instead of failing on legitimate CLI output
- [ ] configuration
- [ ] portability
- [ ] security
- [ ] releases
- [ ] architecture
- [ ] and collaboration domain failures are remediated or owner-dispositioned with assurance-register entries
- [ ] the full uv run --locked pytest passes green and the CI rules-check job scope is widened to the full corpus in the same increment

## Log

- 2026-11-10 — created
- 2026-11-10 — 1. Issue Metadata: filed 2026-11-10 by engineer; severity MEDIUM (no user-facing impact; blocks repo main-line CI integrity and hides real conformance state); priority P2. 2. Summary: the full rules-corpus pytest suite fails 29 tests across 13 domains; the branch-protection required check rules-check pointed at a context no workflow produced, and restoring it surfaced this debt - the corpus grew while the gate never ran. 3. Preconditions: clean checkout of main/manual-review; uv sync --locked. 4. Steps to Reproduce: uv run --locked pytest -q (full suite). 5. Expected: 0 failures. 6. Actual: 29 failures - API-01 OpenAPI route coverage (10 routes missing); CQ-02/05 500-line bound (engine acquisition.rs 940, auth.rs 793, config.rs 717; landing deploy.ts 512 + deploy-script.test.ts 572 - the two landing files were split in commit 60d0c69+headers); COL-04 human-oversight record; DOC-02/07 feature-module layer; MEDIA-04 feature-module layer; LIC-03 missing copyright headers on 6 files (4 fixed in 60d0c69+); OBS-01 stdout-logging 33 hits (rule scope vs CLI output mismatch - test stricter than rule text); configuration/portability/security/releases/architecture domain assertions; document-count 138 vs 140; 12 HPA-4 structure tests in test_engine_*. 7. Reproducibility: 100 percent deterministic. 8. Environment: macOS arm64 local + ubuntu-latest runners, uv locked. 9. Evidence: CI run 42668170962 (rules-check job), local /tmp/allfail.txt capture. 10. Impact: main is unpushable for any actor including the owner; real conformance state is invisible; risk of normalizing a red gate. 11. Investigation: failures pre-date tonight's work (old main CI red since 2026-09-19); the landing deploy files were remediated immediately (split + headers) rather than exempted. 12. Verification Criteria: full suite green; then the CI rules-check job scope widened to the full corpus in the same increment. Ownership: engineer; severity/priority owner-confirmable. Not closed without the verification criteria
- 2026-11-10 — 2026-11-10 measurement in a clean worktree of HEAD (ba390ed): 23 failed / 218 passed (2m45s), identical to CI rules-check job 129337310904 on 8bdc719. The previously recorded 29 came from the main checkout, where untracked root legacy files add six false classes (CFG-01/02/05, SEC-05, ARC-01/CQ-07/09, CQ-03, GOV-13 .sh, PORT-04/REL-01) that CI never sees. OBS-01 is now 34 (the 0049 LP-12 visual-qa probe added one console.log). Remediation plan drafted per PLAN-FORMAT with classes C1-C8; awaiting owner decisions D1 (OBS-01 CLI scope), D2 (COL-04 record location), D3 (adopt or discard the uncommitted WIP: deploy split, headers, status-tester; discard the ci.yml narrowing)
- 2026-11-10 — started
- 2026-11-10 — owner direction 2026-11-10: 'do everything until the standard and test are achieved' - authority for the plan defaults: D1 landing tooling adopts the repo's CLI stream-write convention (no rule change; OBS-01 rule text prohibits print calls for runtime service diagnostics), D2 COL-04 record lives in the unit (policy + record, test path repointed from the pre-migration root locations), D3 adopt the deploy split/headers/status-tester WIP and discard the ci.yml narrowing (saved as a patch outside the repo), D4 push main after the gate is green. Task 1: the WIP deploy split was half-done (deploy.ts redeclared the imported remote scripts, 4 deploy tests failing); finished it (duplicates removed, renderCaddyConfig called with explicit args, contract test reads both tool sources) - bun test ../tests 40 pass / 0 fail
- 2026-11-10 — Task 3 (C4+C5): repointed REQUIREMENTS in test_engine_documentation_assurance/test_engine_requirement_quality/test_requirement_documents and the HPA-4 check-link form to torviello-enforcer/requirements (stale since migration 76b21e8; assertions unchanged); the now-working link test caught real stale links, fixed in the docs: engine README ../services/engine and ../web (the console moved to torviello-landing/web/src/console - resolved locally only via the untracked legacy web/), packaging README ADR link, engine-runtime.md ../ depth; containers + packaging READMEs (moved in by 76b21e8) gained HPA-4 Validation and honest Status sections, then the engine-doc count rebaselined 138->140 and the rule count 156->157 (GOV-13, dd8ec7e) - each delta file verified governed; 26 enforcer tests pass
- 2026-11-10 — Task 4 (C6): landing feature layer - RED first (src/features tests: 2 failing, modules missing), then lib/reveal.ts moved to features/reveal/ (first tests for it: reduced motion, intersect reveal + cleanup, fallback timer) and the clipboard logic extracted from TerminalCard into features/copy-command/; the extraction fixed a real defect: navigator.clipboard?.writeText(...) resolved undefined when the API was absent and the chip showed a fake Copied, now false with a regression test. bun test src 99/0, test:interaction 7/0, typecheck clean, build green; DOC-02, DOC-07, MEDIA-04 pass
