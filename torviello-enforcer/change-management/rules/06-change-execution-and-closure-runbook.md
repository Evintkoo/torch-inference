# Change execution and closure runbook

**Control family:** change-management  
**Control document:** CHG-06  
**Requirement trace:** ED-011, ED-014, ED-042, CSC-005, PDL-001–PDL-017  
**Status:** Normative project control

## Control objective

Give a contributor or agent an end-to-end, repeatable procedure to accept, investigate, design, implement, verify, review, hand off, and close work without losing scope, evidence, user changes, operational readiness, or accountability.

## Applicability

Applies to every feature, bug fix, security remediation, refactor, dependency/toolchain update, documentation/design change, build/release change, data migration, operational change, and rule/requirement change. Use a lightweight path for low-impact, reversible changes, while retaining applicable phases and evidence.

## Work states and transitions

A work item has one explicit state: **proposed**, **discovering**, **specified**, **planned**, **in progress**, **in review**, **accepted**, **released/operational**, **blocked**, **deferred**, **rejected**, or **closed/retired**. The owner MUST record state changes and the evidence/authority that permits transition. Blocked/deferred work is not complete. A state name alone does not establish that its exit gate passed.

## Normative requirements

### CHG-06.01 — Accept and classify work before acting

At intake, record the request/source, affected users/system, desired outcome, urgency, requester, accountable owner, and initial impact. Classify the work by change type, affected release/profile, data/security/privacy/safety/compatibility/reliability impact, reversibility, and urgency. Check for conflicts, duplicate work, authority, access, and dependencies. If scope or owner is unclear, record the ambiguity and perform only safe, reversible discovery until the owner resolves it. Emergency work follows the emergency-change control.

### CHG-06.02 — Establish a clean and safe working context

Before editing, inspect repository status, current branch/revision, applicable instructions, requirements, rules, related code/tests, and existing local changes. Preserve user and collaborator changes; do not reset, overwrite, clean, or rebase them without explicit authorization. Confirm the target branch/worktree and intended files. Record the base revision and environment when they affect reproducibility. If repository state conflicts with the task, stop the conflicting operation and report the specific blocker while continuing independent read-only analysis.

### CHG-06.03 — Discover and specify proportionately

For material work, follow the discovery and requirements rules: reproduce defects, establish evidence, affected profiles, scope/non-goals, requirement IDs, acceptance, risks, unresolved decisions, alternatives, and relevant quality constraints before implementation. For low-risk maintenance, document expected behavior, affected boundary, and checks in the change record. Do not treat an implementation request as approval for unrelated scope or as proof of the proposed solution.

### CHG-06.04 — Plan work with owners, dependencies, and gates

Create a plan appropriate to the work size. Decompose into reviewable outcomes; identify owner roles, dependencies, sequence, uncertainty, risk, milestones, validation, documentation, migration, rollout, and rollback/forward recovery where applicable. For parallel work, name file/module ownership and integration points. Define what would block, descope, or stop the work. The plan MUST preserve durable decisions and requirements outside transient private planning notes.

### CHG-06.05 — Implement in bounded increments

Before each increment, state its intended output and acceptance check. Follow local conventions and domain rules; keep changes within approved scope, update tests alongside behavior, and separate unrelated cleanup. Inspect the diff after each meaningful increment. If implementation reveals changed assumptions, unexpected risk, incompatible behavior, or scope growth, pause affected work, update evidence/spec/plan, and obtain the appropriate decision before proceeding.

### CHG-06.06 — Verify the change at the affected boundaries

Select checks from the requirement acceptance criteria and technical domain controls. Run the narrowest fast checks first, then relevant integration, security, compatibility, performance, migration, accessibility, build, and release checks. Include failure/negative cases for affected trust, data, resource, reliability, and compatibility boundaries. Record exact commands/procedures, revision/profile/environment, result, skipped/unavailable checks, and limitations. Do not infer success from code inspection when behavior can be tested.

### CHG-06.07 — Prepare an independently reviewable change

Before review, inspect the complete diff for unintended files, secrets, generated artifacts, unrelated changes, missing tests, stale comments, API/documentation mismatch, and overlooked requirement/control updates. Provide a concise description of problem, behavior, scope, design choices, alternatives where material, tests/evidence, risks, migration/release notes, and remaining questions. Ensure reviewers have access to cited artifacts and avoid requiring private plan content when policy prohibits publishing it.

### CHG-06.08 — Review with appropriate independence and resolve findings

Assign reviewers based on touched boundaries and risk, including domain/security/operations/product/accessibility/data authorities where relevant. Authors MUST NOT self-approve a change requiring independent review. Reviewers assess correctness, simplicity, maintainability, failure behavior, access boundaries, test quality, compatibility, operations, and requirement acceptance—not style preference alone. Track each finding to resolution, documented disagreement, or authorized risk acceptance. Re-run checks after material revisions.

### CHG-06.09 — Accept and hand off with evidence

The authorized owner accepts only when specified outcomes have evidence, required reviews/checks pass, failed or skipped checks are dispositioned, release-critical risks have authority, and documentation/operations handoff is ready. Handoff includes changed behavior, deployment/configuration/migration steps, monitoring and alert implications, recovery/rollback limits, support owner, known limitations, and user communication where applicable. Mark partial or conditional acceptance explicitly with scope, owner, conditions, expiry, and prohibited use.

### CHG-06.10 — Release or deploy through the owning gate

Do not equate code merge with release. Follow release and operations controls for artifact integrity, approvals, staged exposure, health/readiness, stop conditions, rollback, and post-deploy checks. Capture release identity and environment. If a gate fails, stop or roll back according to the approved plan; record incident/change evidence and do not suppress a failure to report success.

### CHG-06.11 — Close only after durable records and follow-up ownership exist

At closure, update requirement dispositions, decision records, docs/design/API/canvas, tests, changelog/release artifacts, runbooks, monitoring, and deprecation records affected by the work. Record actual outcome, verification, release state, known limitations, unresolved risks, and links to evidence. Assign owner and due/review trigger to follow-ups; do not leave risk in an unowned comment. Retain only records permitted by policy and remove temporary credentials/data safely.

### CHG-06.12 — Learn from defects, rework, and variance

When work misses acceptance, causes a regression/incident, materially exceeds estimates, or repeats review findings, identify the cause and whether a requirement, design, test, rule, tooling, or handoff failed. Create corrective action with owner and effectiveness check; update relevant torviello-enforcer/runbooks when the procedure itself was insufficient. Avoid blame-based conclusions that prevent accurate reporting.

### CHG-06.13 — File, triage, and close bugs with the mandatory standard

Every defect MUST be filed through the repository bug template and MUST contain the twelve mandatory sections: issue metadata; issue summary; preconditions; steps to reproduce; expected behavior; actual behavior; reproducibility; environment details; supporting evidence; impact assessment; technical investigation; and resolution and verification criteria. A report that omits reproduction, expected-versus-actual behavior, environment, redacted evidence, or impact MUST remain untriaged and MUST NOT be accepted as complete.

The issue metadata MUST record component, category, severity (S1 Critical through S4 Low), priority (P0 Immediate through P3 Low), environment, first-observed timestamp, reporter, assignee, and related issues. Severity MUST reflect user, data, security, and availability impact rather than reporter preference. Security-sensitive reports MUST use the private disclosure path and MUST NOT be filed publicly.

Triage MUST be performed by an accountable human owner within the response target for the assigned severity. The triage workflow MAY apply labels and route the report, but automation MUST NOT set final severity, accept risk, or close a defect. The owner MUST confirm reproducibility, affected versions, scope, workaround, and whether the report is a duplicate, invalid, deferred, or accepted defect, and MUST record the reason for that disposition.

AI-native reports MUST additionally record, where applicable, the exact prompt and conversation context, model and version, retrieval context, tool calls and arguments, source-data version, generated artifacts, ground-truth reference, and evaluation or validation result. These fields MUST distinguish confirmed observations from hypotheses.

The defect lifecycle MUST be `new -> triaged -> accepted -> in-progress -> verification -> closed`. A failed verification MUST reopen the defect to `in-progress` and retain the failed evidence. Duplicate, invalid, deferred, and risk-accepted reports MUST record a disposition and reason. Closure MUST NOT rely on the reporter's opinion alone when objective verification is available.

A defect MUST close only when the original reproduction no longer fails, the expected behavior is verified against an authoritative requirement or specification, regression tests exist and pass, related workflows are checked, verification occurred in the affected environment, and evidence is attached. The resolution record MUST identify the fix revision, fixed version, verifier, verification date, and final status. Deferred or risk-accepted defects MUST retain an owner, rationale, compensating control, and review or expiry date.

## Implementation guidance

Use this runbook as the default operating procedure for a change record, issue, agent task, or equivalent work item. The owner MAY combine phases for a small, reversible task, but MUST retain their entry/exit evidence andMUST NOT skip a phase whose risk applies. Link domain-specific procedures rather than copying them; record the chosen profiles and any justified non-applicability. The work record is the navigation point for evidence, not a replacement for source artifacts such as tests, decision records, release records, and runbooks.

## Operational procedure

1. **Intake:** create/locate the work record; identify requester, owner, outcome, scope, urgency, profiles, and work class.
2. **Context check:** inspect branch/worktree and uncommitted state; read governing instructions and domain rules; reproduce or substantiate the need.
3. **Discovery/spec:** collect evidence; frame need; list requirements, acceptance, risks, alternatives, assumptions, dependencies, and open decisions. Obtain decisions needed to enter delivery.
4. **Plan:** break down outputs, owners, sequencing, estimate confidence, checks, migration/release/handoff, rollback, and stop criteria.
5. **Implement:** make the smallest coherent increment; keep changes scoped; test as behavior is added; replan after material evidence changes.
6. **Verify:** run required quality and domain checks; record exact outcomes and limitations; address failures or obtain authorized dispositions.
7. **Review:** prepare the evidence package; obtain independent domain review; resolve or disposition findings and rerun affected checks.
8. **Accept:** authorized owner confirms criteria and residual risk; prepare release/deploy and operator/user handoff.
9. **Release/operate:** use the release gate, monitor expected signals, execute rollback/stop criteria if triggered, and record the actual revision/environment.
10. **Close/learn:** update durable artifacts, assign follow-ups, review outcome, and close only when exit conditions are evidenced.

## Decision branches

- **Routine and reversible:** use a concise change record and focused checks; still inspect state, preserve unrelated work, review the diff, and record results.
- **User-visible, API, architecture, security, privacy, data, licensing, supported-platform, or release change:** require full specification/decision, multi-domain review, compatibility/failure analysis, and release/operator handoff.
- **Uncertain feasibility:** time-box a spike with a question, stop condition, and result; return to decision/specification before production implementation.
- **Emergency:** limit scope to containment/restoration, preserve evidence, use authorized emergency risk acceptance, and complete required retrospective review and record updates.
- **Blocked or authority missing:** do not silently choose a high-impact policy; record the blocker/owner/decision needed and continue independent safe work only.

## Prohibited conditions

- Editing before checking whether the target branch/worktree contains user changes.
- Treating a plan, code completion, merge, or passing unit tests as acceptance or production release by itself.
- Hiding failed, skipped, flaky, or unavailable checks; changing acceptance after the result without disclosure.
- Closing work with unowned risk, undocumented migration/release effects, or missing durable decisions.

## Assessment procedure

**Examine:** sample work records from intake through closure; check each transition’s entry/exit evidence, state accuracy, review authority, checks, release/handoff, and follow-up ownership.

**Interview:** ask the contributor and receiving operator to explain scope, unresolved decisions, failure behavior, and next actions using the records alone.

**Test:** dry-run this procedure on a representative routine change and a material/high-risk change; inject a failed check or changed assumption and confirm the flow stops, replans, and records disposition correctly.

## Assessment determination

Pass when work is traceable, appropriately planned, verified, independently reviewed where required, accepted by authority, handed off, and closed with evidence. Fail when a transition occurs without its exit evidence, status misrepresents reality, user work is lost, or risk/ownership disappears. Not applicable requires a bounded work class and rationale.

## Required evidence

Work intake and state history; applicable spec/requirements/decision/plan; diff and review; exact check results and limitations; acceptance authority; release/deployment identity and post-checks; handoff and closure/follow-up records.

## Exceptions and nonconformance

A MUST exception requires the accountable delivery/product/system owner and relevant risk authority. Emergency exceptions follow the emergency-change control. Record scope, omitted phase/gate, risk, compensating action, owner, and expiry/review; complete retrospective evidence. No exception may authorize loss or concealment of user changes or mandatory legal/contractual violations.

## Reference trail

Source IDs R1–R2 are listed in [00-references-trails.md](../trails/00-references-trails.md). Cross-cutting discovery and outcome controls are in [product discovery and delivery](../../product-discovery-and-delivery/trails/00-references-trails.md).
