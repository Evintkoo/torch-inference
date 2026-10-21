# change-management domain

**Development stage:** SDD

This directory contains 6 normative control document(s) and the generated enforcement tests for the **change-management** domain (Change management and planning). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| CHG-01 | [01-feature-specification-and-requirements.md](rules/01-feature-specification-and-requirements.md) | ED-011, ED-042, CSC-005, PDL-001–PDL-008, PDL-013–PDL-014 | [tests/test_01_feature_specification_and_requirements.py](tests/test_01_feature_specification_and_requirements.py) | Feature specification and requirements |
| CHG-02 | [02-plan-implementation-and-review.md](rules/02-plan-implementation-and-review.md) | ED-011, ED-042, CSC-005, PDL-010–PDL-012, PDL-017 | [tests/test_02_plan_implementation_and_review.py](tests/test_02_plan_implementation_and_review.py) | Plan, implementation, and review |
| CHG-03 | [03-review-evidence-and-change-control.md](rules/03-review-evidence-and-change-control.md) | ED-011, ED-014, ED-042, CSC-005 | [tests/test_03_review_evidence_and_change_control.py](tests/test_03_review_evidence_and_change_control.py) | Review evidence and change control |
| CHG-04 | [04-emergency-changes-and-risk-acceptance.md](rules/04-emergency-changes-and-risk-acceptance.md) | ED-014, ED-042, SO-013, SO-031 | [tests/test_04_emergency_changes_and_risk_acceptance.py](tests/test_04_emergency_changes_and_risk_acceptance.py) | Emergency changes and risk acceptance |
| CHG-05 | [05-repository-history-and-plan-retention.md](rules/05-repository-history-and-plan-retention.md) | ED-042, PA-024 | [tests/test_05_repository_history_and_plan_retention.py](tests/test_05_repository_history_and_plan_retention.py) | Repository history and plan retention |
| CHG-06 | [06-change-execution-and-closure-runbook.md](rules/06-change-execution-and-closure-runbook.md) | ED-011, ED-014, ED-042, CSC-005, PDL-001–PDL-017 | [tests/test_06_change_execution_and_closure_runbook.py](tests/test_06_change_execution_and_closure_runbook.py) | Change execution and closure runbook |

## Detailed controls

### CHG-01 — Feature specification and requirements

**Objective.** These controls govern **feature specification and requirements**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

For full discovery, requirement-quality, alternatives, experiment, acceptance, and traceability procedures, apply the cross-cutting [product discovery and delivery lifecycle](../product-discovery-and-delivery/trails/00-references-trails.md). This document retains change-specific controls; it does not replace those lifecycle controls.

**Requirements traced:** ED-011, ED-042, CSC-005, PDL-001–PDL-008, PDL-013–PDL-014

**Normative requirements:**

- **CHG-01.01 — Start feature work with a specification that states.** The project MUST start feature work with a specification that states the user or operational problem, intended outcomes, scope, exclusions, constraints, affected product profiles, and measurable acceptance criteria.
- **CHG-01.02 — Trace each requirement to a stable ID in requirements/.** The project MUST trace each requirement to a stable ID in requirements/. Identify which IDs are addressed, deferred, or out of scope. The project MUST also record unresolved product, legal, security, and architecture decisions rather than guessing them in code.
- **CHG-01.03 — Describe public interface changes, data flows, trust boundaries, compatibility.** The project MUST describe public interface changes, data flows, trust boundaries, compatibility, migration, and rollback needs before implementation.
- **CHG-01.04 — Keep plans in the repository's agreed private planning location.** The project MUST keep plans in the repository's agreed private planning location and do not publish them when repository policy says plans remain local. The specification and requirement IDs MAY still be referenced in review metadata without exposing private plan content.

**Rule document:** [rules/01-feature-specification-and-requirements.md](rules/01-feature-specification-and-requirements.md)

**Enforcement:** [tests/test_01_feature_specification_and_requirements.py](tests/test_01_feature_specification_and_requirements.py)

**Prohibited conditions:**

- The project MUST NOT start broad features from a prompt alone when they change user behavior, architecture, security, data, or release packaging
- The project MUST NOT convert an open question into a requirement without an owner decision
- The project MUST NOT make an implementation plan substitute for product acceptance criteria
### CHG-02 — Plan, implementation, and review

**Objective.** These controls govern **plan, implementation, and review**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

For prioritization, uncertainty-aware estimates, dependency and risk planning, replanning, and outcome-based completion, apply the [product discovery and delivery lifecycle](../product-discovery-and-delivery/trails/00-references-trails.md) alongside this change-specific implementation and review control.

**Requirements traced:** ED-011, ED-042, CSC-005, PDL-010–PDL-012, PDL-017

**Normative requirements:**

- **CHG-02.01 — Break approved scope into small, reviewable steps with dependencies.** The project MUST break approved scope into small, reviewable steps with dependencies and verification for each. The project MUST also order work so foundational interfaces and migrations precede consumers.
- **CHG-02.02 — Keep each change focused on its approved requirement set.** The project MUST keep each change focused on its approved requirement set. The project MUST also update tests, API contracts, documentation, system diagrams, release notes, and migration artifacts affected by the change.
- **CHG-02.03 — Record deviations from the specification in the change description.** The project MUST record deviations from the specification in the change description with the reason, impact, and requirement owner. The project MUST also update the spec when the intended behavior changes.
- **CHG-02.04 — Review changes for correctness, security, resource behavior, observability, accessibility.** The project MUST review changes for correctness, security, resource behavior, observability, accessibility when applicable, compatibility, and operational recovery.
- **CHG-02.05 — Use a proportionate flow for small maintenance: identify.** The project MUST use a proportionate flow for small maintenance: identify the requirement or defect, define the expected behavior, plan the minimal change, and record relevant checks.

**Rule document:** [rules/02-plan-implementation-and-review.md](rules/02-plan-implementation-and-review.md)

**Enforcement:** [tests/test_02_plan_implementation_and_review.py](tests/test_02_plan_implementation_and_review.py)

**Prohibited conditions:**

- The project MUST NOT combine unrelated cleanup with a feature in a way that obscures review or rollback
- The project MUST NOT mark a requirement complete because code exists; require acceptance evidence
- The project MUST NOT claim checks passed when they were skipped or unavailable
### CHG-03 — Review evidence and change control

**Objective.** This control defines the intended outcome for **review evidence and change control** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-011, ED-014, ED-042, CSC-005

**Normative requirements:**

- **CHG-03.01 — Every change MUST identify its intent, affected requirement….** **Requirement:** Every change MUST identify its intent, affected requirement and control IDs, scope, compatibility impact, verification plan, and operational or user-visible consequences. Changes without a requirement ID MUST identify the defect or maintenance objective they satisfy.
- **CHG-03.02 — Changes affecting authentication, authorization, parsing, model….** **Requirement:** Changes affecting authentication, authorization, parsing, model loading, data persistence, release automation, cryptographic material, or public contracts MUST receive review by a person with relevant domain responsibility before merge.
- **CHG-03.03 — Reviewers MUST assess behavior and evidence, not only….** **Requirement:** Reviewers MUST assess behavior and evidence, not only code style: success and failure paths, trust boundaries, resource bounds, concurrency, diagnostics, migration, backward compatibility, and recovery MUST be checked when applicable.
- **CHG-03.04 — Each review MUST be attributable to an authenticated identity….** **Requirement:** Each review MUST be attributable to an authenticated identity and attached to the exact revision being merged. Material revisions after approval MUST invalidate or renew approval for affected areas.
- **CHG-03.05 — Generated files, lockfiles, API schemas, database….** **Requirement:** Generated files, lockfiles, API schemas, database migrations, and release metadata MUST be reviewed for semantic impact and provenance. Automated generation MUST NOT be used to bypass review.
- **CHG-03.06 — Changes that cannot be independently understood or rolled back….** **Requirement:** Changes that cannot be independently understood or rolled back SHOULD be split along functional boundaries unless splitting would make the intermediate state unsafe or non-buildable.
- **CHG-03.07 — The final change record MUST accurately distinguish checks passed….** **Requirement:** The final change record MUST accurately distinguish checks passed, failed, skipped, and not run; include exact commands or CI job links and explain environment-dependent exclusions.

**Rule document:** [rules/03-review-evidence-and-change-control.md](rules/03-review-evidence-and-change-control.md)

**Enforcement:** [tests/test_03_review_evidence_and_change_control.py](tests/test_03_review_evidence_and_change_control.py)

**Prohibited conditions:**

- Do not approve a change based only on a green status badge when required jobs were skipped or did not cover changed paths.
- Do not merge self-reviewed high-impact changes when independent review is available and required by repository policy.
### CHG-04 — Emergency changes and risk acceptance

**Objective.** This control defines the intended outcome for **emergency changes and risk acceptance** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-014, ED-042, SO-013, SO-031

**Normative requirements:**

- **CHG-04.01 — Emergency changes MUST be limited to restoring service….** **Requirement:** Emergency changes MUST be limited to restoring service, containing an active security risk, or preventing imminent data loss. The incident or risk identifier, affected scope, owner, and reason MUST be recorded before or during the change.
- **CHG-04.02 — An emergency change MUST use the smallest viable patch….** **Requirement:** An emergency change MUST use the smallest viable patch, retain required independent review where practicable, run focused regression and security checks, and record any check that could not run before deployment.
- **CHG-04.03 — Every emergency change MUST receive a retrospective review within….** **Requirement:** Every emergency change MUST receive a retrospective review within the project-defined response window. The review MUST assess why normal planning was bypassed, validate the deployed diff, add missing tests/documentation, and close or assign follow-up risks.
- **CHG-04.04 — Risk acceptance MUST name an accountable owner with authority….** **Requirement:** Risk acceptance MUST name an accountable owner with authority over the affected product or system, describe threat/scenario and impact, define compensating controls, name a remediation owner, set an expiry, and specify what event triggers earlier re-review.
- **CHG-04.05 — Exceptions MUST be scoped to exact controls, services….** **Requirement:** Exceptions MUST be scoped to exact controls, services, packages, versions, and environments. A general waiver MUST NOT silently cover future changes or newly discovered risks.
- **CHG-04.06 — Expired or materially invalidated exceptions MUST be treated as….** **Requirement:** Expired or materially invalidated exceptions MUST be treated as nonconformances. CI or release review MUST surface them before the affected artifact is promoted.
- **CHG-04.07 — High-severity security defects MUST follow the private reporting….** **Requirement:** High-severity security defects MUST follow the private reporting, triage, patch, coordinated disclosure, and supported-version processes defined by the security policy.

**Rule document:** [rules/04-emergency-changes-and-risk-acceptance.md](rules/04-emergency-changes-and-risk-acceptance.md)

**Enforcement:** [tests/test_04_emergency_changes_and_risk_acceptance.py](tests/test_04_emergency_changes_and_risk_acceptance.py)

**Prohibited conditions:**

- Do not use emergency status to bypass planning for schedule convenience.
- Do not close an exception by deleting its record; record remediation evidence and the date it ceased to apply.
### CHG-05 — Repository history and plan retention

**Objective.** This control defines the intended outcome for **repository history and plan retention** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-042, PA-024

**Normative requirements:**

- **CHG-05.01 — Feature development MUST follow the sequence specification, technical….** **Requirement:** Feature development MUST follow the sequence specification, technical requirements, plan, implementation, and acceptance evidence. The required depth MAY scale with change risk, but the intent, acceptance criteria, and verification MUST remain explicit.
- **CHG-05.02 — Plans designated private by project policy MUST remain outside….** **Requirement:** Plans designated private by project policy MUST remain outside published Git history and release artifacts. The project MUST define where such plans live, how they are named, how long they are retained, and how reviewers can verify completion without publishing sensitive planning material.
- **CHG-05.03 — Commits and change descriptions MUST state what changed….** **Requirement:** Commits and change descriptions MUST state what changed and why, identify linked requirements or issues, and avoid credentials, personal data, customer payloads, and confidential operational details.
- **CHG-05.04 — History rewriting MUST be restricted to branches where it….** **Requirement:** History rewriting MUST be restricted to branches where it cannot invalidate reviewed or released source identities. Released tags and signed provenance MUST remain immutable; corrections MUST create a new version or attestation.
- **CHG-05.05 — When a plan changes materially, the change MUST….** **Requirement:** When a plan changes materially, the change MUST update the specification or decision record so the accepted implementation can be compared to the approved intent.
- **CHG-05.06 — Repository policy MUST distinguish review artifacts that are retained….** **Requirement:** Repository policy MUST distinguish review artifacts that are retained (specification, decision, test evidence, release notes) from local transient artifacts (private plans, scratch files, generated caches).
- **CHG-05.07 — Completed work MUST be committed before handoff….** **Requirement:** Completed, verified work MUST be committed to version control before it is handed off, released, or reported complete. The history MUST provide a revertible revision for each coherent change, and the reported evidence MUST identify the committed revision. A task MUST NOT leave its only copy of completed work as uncommitted changes. Work-in-progress MAY remain uncommitted only while it is explicitly owned and identified as incomplete. Credentials, personal data, build outputs, and generated caches MUST NOT be committed. Pushing or publishing the revision remains subject to explicit authorization.

**Rule document:** [rules/05-repository-history-and-plan-retention.md](rules/05-repository-history-and-plan-retention.md)

**Enforcement:** [tests/test_05_repository_history_and_plan_retention.py](tests/test_05_repository_history_and_plan_retention.py)

**Prohibited conditions:**

- Do not publish a private plan merely because a local planning file was accidentally included in a commit; remove it before release and assess exposure.
- Do not use mutable tags or rewritten release history as the mechanism for correcting a published artifact.
### CHG-06 — Change execution and closure runbook

**Objective.** Give a contributor or agent an end-to-end, repeatable procedure to accept, investigate, design, implement, verify, review, hand off, and close work without losing scope, evidence, user changes, operational readiness, or accountability.

**Requirements traced:** ED-011, ED-014, ED-042, CSC-005, PDL-001–PDL-017

**Normative requirements:**

- **CHG-06.02 — Establish a clean and safe working context.** Before editing, inspect repository status, current branch/revision, applicable instructions, requirements, rules, related code/tests, and existing local changes. Preserve user and collaborator changes; do not reset, overwrite, clean, or rebase them without explicit authorization. Confirm the target branch/worktree and intended files. Record the base revision and environment when they affect reproducibility. If repository state conflicts with the task, stop the conflicting operation and report the specific blocker while continuing independent read-only analysis.
- **CHG-06.03 — Discover and specify proportionately.** For material work, follow the discovery and requirements rules: reproduce defects, establish evidence, affected profiles, scope/non-goals, requirement IDs, acceptance, risks, unresolved decisions, alternatives, and relevant quality constraints before implementation. For low-risk maintenance, document expected behavior, affected boundary, and checks in the change record. Do not treat an implementation request as approval for unrelated scope or as proof of the proposed solution.
- **CHG-06.04 — Plan work with owners, dependencies, and gates.** Create a plan appropriate to the work size. Decompose into reviewable outcomes; identify owner roles, dependencies, sequence, uncertainty, risk, milestones, validation, documentation, migration, rollout, and rollback/forward recovery where applicable. For parallel work, name file/module ownership and integration points. Define what would block, descope, or stop the work. The plan MUST preserve durable decisions and requirements outside transient private planning notes.
- **CHG-06.05 — Implement in bounded increments.** Before each increment, state its intended output and acceptance check. Follow local conventions and domain rules; keep changes within approved scope, update tests alongside behavior, and separate unrelated cleanup. Inspect the diff after each meaningful increment. If implementation reveals changed assumptions, unexpected risk, incompatible behavior, or scope growth, pause affected work, update evidence/spec/plan, and obtain the appropriate decision before proceeding.
- **CHG-06.06 — Verify the change at the affected boundaries.** Select checks from the requirement acceptance criteria and technical domain controls. Run the narrowest fast checks first, then relevant integration, security, compatibility, performance, migration, accessibility, build, and release checks. Include failure/negative cases for affected trust, data, resource, reliability, and compatibility boundaries. Record exact commands/procedures, revision/profile/environment, result, skipped/unavailable checks, and limitations. Do not infer success from code inspection when behavior can be tested.
- **CHG-06.07 — Prepare an independently reviewable change.** Before review, inspect the complete diff for unintended files, secrets, generated artifacts, unrelated changes, missing tests, stale comments, API/documentation mismatch, and overlooked requirement/control updates. Provide a concise description of problem, behavior, scope, design choices, alternatives where material, tests/evidence, risks, migration/release notes, and remaining questions. Ensure reviewers have access to cited artifacts and avoid requiring private plan content when policy prohibits publishing it.
- **CHG-06.08 — Review with appropriate independence and resolve findings.** Assign reviewers based on touched boundaries and risk, including domain/security/operations/product/accessibility/data authorities where relevant. Authors MUST NOT self-approve a change requiring independent review. Reviewers assess correctness, simplicity, maintainability, failure behavior, access boundaries, test quality, compatibility, operations, and requirement acceptance—not style preference alone. Track each finding to resolution, documented disagreement, or authorized risk acceptance. Re-run checks after material revisions.
- **CHG-06.09 — Accept and hand off with evidence.** The authorized owner accepts only when specified outcomes have evidence, required reviews/checks pass, failed or skipped checks are dispositioned, release-critical risks have authority, and documentation/operations handoff is ready. Handoff includes changed behavior, deployment/configuration/migration steps, monitoring and alert implications, recovery/rollback limits, support owner, known limitations, and user communication where applicable. Mark partial or conditional acceptance explicitly with scope, owner, conditions, expiry, and prohibited use.
- **CHG-06.10 — Release or deploy through the owning gate.** Do not equate code merge with release. Follow release and operations controls for artifact integrity, approvals, staged exposure, health/readiness, stop conditions, rollback, and post-deploy checks. Capture release identity and environment. If a gate fails, stop or roll back according to the approved plan; record incident/change evidence and do not suppress a failure to report success.
- **CHG-06.11 — Close only after durable records and follow-up ownership exist.** At closure, update requirement dispositions, decision records, docs/design/API/canvas, tests, changelog/release artifacts, runbooks, monitoring, and deprecation records affected by the work. Record actual outcome, verification, release state, known limitations, unresolved risks, and links to evidence. Assign owner and due/review trigger to follow-ups; do not leave risk in an unowned comment. Retain only records permitted by policy and remove temporary credentials/data safely.
- **CHG-06.12 — Learn from defects, rework, and variance.**
- **CHG-06.13 — File, triage, and close bugs with the mandatory standard.** Every defect MUST use the 12-section bug standard, record severity and priority, keep automation from setting final severity or closing the issue, include AI-native diagnostics where applicable, and close only with reproduction, regression evidence, verification, and an accountable owner.
 When work misses acceptance, causes a regression/incident, materially exceeds estimates, or repeats review findings, identify the cause and whether a requirement, design, test, rule, tooling, or handoff failed. Create corrective action with owner and effectiveness check; update relevant torviello-enforcer/runbooks when the procedure itself was insufficient. Avoid blame-based conclusions that prevent accurate reporting.

**Rule document:** [rules/06-change-execution-and-closure-runbook.md](rules/06-change-execution-and-closure-runbook.md)

**Enforcement:** [tests/test_06_change_execution_and_closure_runbook.py](tests/test_06_change_execution_and_closure_runbook.py)

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/change-management
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
