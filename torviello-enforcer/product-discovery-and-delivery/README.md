# product-discovery-and-delivery domain

**Development stage:** SDD

This directory contains 5 normative control document(s) and the generated enforcement tests for the **product-discovery-and-delivery** domain (Product discovery and delivery lifecycle). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| PDL-01 | [01-problem-discovery-and-evidence.md](rules/01-problem-discovery-and-evidence.md) | PDL-001–PDL-005, PDL-016 | [tests/test_01_problem_discovery_and_evidence.py](tests/test_01_problem_discovery_and_evidence.py) | Problem discovery and evidence |
| PDL-02 | [02-requirements-engineering-and-quality.md](rules/02-requirements-engineering-and-quality.md) | PDL-004–PDL-007, PDL-013–PDL-014, ED-011, ED-042 | [tests/test_02_requirements_engineering_and_quality.py](tests/test_02_requirements_engineering_and_quality.py) | Requirements engineering and quality |
| PDL-03 | [03-solution-alternatives-and-experimentation.md](rules/03-solution-alternatives-and-experimentation.md) | PDL-005, PDL-008–PDL-009, PDL-016 | [tests/test_03_solution_alternatives_and_experimentation.py](tests/test_03_solution_alternatives_and_experimentation.py) | Solution alternatives and experimentation |
| PDL-04 | [04-prioritization-and-delivery-planning.md](rules/04-prioritization-and-delivery-planning.md) | PDL-005, PDL-010–PDL-012, PDL-017, ED-042 | [tests/test_04_prioritization_and_delivery_planning.py](tests/test_04_prioritization_and_delivery_planning.py) | Prioritization and delivery planning |
| PDL-05 | [05-acceptance-release-learning-and-retirement.md](rules/05-acceptance-release-learning-and-retirement.md) | PDL-013–PDL-017, ED-011, ED-042 | [tests/test_05_acceptance_release_learning_and_retirement.py](tests/test_05_acceptance_release_learning_and_retirement.py) | Acceptance, release, learning, and retirement |

## Detailed controls

### PDL-01 — Problem discovery and evidence

**Objective.** Ensure that work begins with a sufficiently supported account of the problem, affected people and systems, desired outcome, uncertainty, and decision authority. Prevent a proposed implementation from being mistaken for validated need.

**Requirements traced:** PDL-001–PDL-005, PDL-016

**Normative requirements:**

- **PDL-01.01 — Preserve provenance and distinguish evidence types.** The work owner MUST record where a need came from, when and under what conditions it was observed, who is affected, and who is authorized to decide. Records MUST distinguish direct observation or measured evidence from reported experience, interpretation, and assumption. Preserve links, versions, samples, reproduction steps, and limitations needed to revisit a material finding.
- **PDL-01.02 — Describe current state and desired outcome.** Before selecting a solution, the owner MUST state the current workflow or system behavior, the user or operational problem, affected actors and contexts, consequence and frequency where known, desired outcome, measurable signal, scope, and explicit non-goals. State how the problem framing could be disproved or materially changed.
- **PDL-01.03 — Select a proportionate discovery method.** Choose methods based on the uncertainty and impact being resolved. Options include code/configuration inspection, production telemetry, support and incident records, interviews, contextual observation, usability/accessibility review, stakeholder workshops, market or platform research, prototypes, and controlled experiments. Record why the evidence is relevant, sampling limits, selection bias, recency, and confidence. Do not treat popularity, one anecdote, or a model-generated claim as proof without corroboration proportionate to risk.
- **PDL-01.04 — Protect research participants and sensitive evidence.** Before collecting personal or confidential information, determine purpose, lawful/approved basis where applicable, consent or notice needs, minimization, access, retention, redaction, and deletion. Do not place secrets, credentials, personal data, vulnerability details, or commercially sensitive material in public specifications or broad-access planning records. Escalate jurisdiction-dependent obligations to the authorized owner before collection or publication.
- **PDL-01.05 — Map impact and constraints across affected groups.** Identify direct and indirect users, operators, maintainers, administrators, contributors, support staff, and external parties whose workflows or risks change. Consider accessibility, language, skills, network/offline conditions, supported hardware/OS, failure consequences, misuse, and groups excluded by the proposed direction. Record material benefits, burdens, and mitigations; do not assume a single “typical user.”
- **PDL-01.06 — Keep uncertainty and unresolved decisions actionable.** Maintain assumptions, unknowns, constraints, dependencies, risks, and open decisions with owner, evidence or approval needed, impact if unresolved, target/review trigger, and status. A release-critical unknown MUST block commitment or receive an explicit, authorized risk decision with scope, mitigations, and expiry. Do not silently turn uncertainty into a default product promise.
- **PDL-01.07 — Close discovery with a decision.** Conclude each material discovery effort with a recorded decision to proceed, investigate further, change framing, defer, or stop. Cite the evidence and confidence, affected requirement IDs, unresolved matters, and next owner. Preserve negative results and rejected hypotheses so later teams do not repeat work or present disproven assumptions as facts.

**Rule document:** [rules/01-problem-discovery-and-evidence.md](rules/01-problem-discovery-and-evidence.md)

**Enforcement:** [tests/test_01_problem_discovery_and_evidence.py](tests/test_01_problem_discovery_and_evidence.py)
### PDL-02 — Requirements engineering and quality

**Objective.** Convert approved needs and constraints into a coherent, testable, traceable specification that covers ordinary operation, boundaries, failures, quality attributes, and acceptance without prematurely prescribing implementation.

**Requirements traced:** PDL-004–PDL-007, PDL-013–PDL-014, ED-011, ED-042

**Normative requirements:**

- **PDL-02.01 — Give each requirement identity, source, rationale, and ownership.** Each committed requirement MUST have a stable unique ID, priority, accountable owner, source need or approved constraint, rationale, affected profiles, and verification method. IDs MUST remain stable when wording changes; retired or split requirements MUST retain a disposition and successor links. Priority labels MUST have a defined project meaning and MUST NOT substitute for risk assessment.
- **PDL-02.02 — Write requirements as observable outcomes.** A requirement MUST state one necessary outcome, the actor/system and trigger where relevant, externally observable behavior, applicable conditions, and measurable limits or failure behavior. It MUST be clear, consistent, feasible, bounded, and verifiable. Separate implementation rationale and examples from normative behavior. Avoid unbounded terms such as “fast,” “secure,” “easy,” “all,” or “best” unless defined by measurable criteria and scope.
- **PDL-02.03 — Define system context, boundary, and interfaces.** The specification MUST identify affected components, users, external systems, data flows, trust boundaries, dependencies, and ownership. For interfaces, define inputs, outputs, semantics, errors, limits, authentication/authorization, compatibility, versioning, and operational expectations as applicable. Record assumptions about external services and behavior on loss, delay, duplication, or malformed responses.
- **PDL-02.04 — Derive quality scenarios and failure behavior.** For each affected profile, evaluate security, privacy, safety where applicable, reliability, performance, resource use, accessibility, portability, compatibility, operability, maintainability, and recoverability. Applicable concerns MUST have a scenario with stimulus/context, expected response, and threshold or evidence; non-applicability MUST have rationale. Include normal, boundary, degraded, abuse, and recovery conditions proportionate to the risk.
- **PDL-02.05 — Include data lifecycle and migration requirements.** Where data changes, specify classification, source, ownership, validation, integrity, consistency, retention, backup/restore, export, deletion, migration, downgrade/rollback, and compatibility behavior. Identify which requirements are local/offline versus hosted and what happens when storage or dependencies are unavailable. Link the relevant persistence and privacy controls.
- **PDL-02.06 — Separate requirement, design decision, and implementation detail.** State what outcome MUST hold in requirements; place selected patterns, component placement, protocol, schema, vendor, and algorithm in an approved design/decision artifact unless already fixed by a constraint. Link the decision to the requirement and record alternatives, rationale, risks, and change triggers. A constraint that fixes a design MUST cite its authority.
- **PDL-02.07 — Define acceptance and verification before implementation.** Every committed requirement MUST identify objective acceptance evidence, responsible verifier/authority, applicable test level or inspection method, and conditions for pass, fail, or not applicable. Cover negative and failure paths where security, compatibility, data integrity, resource limits, or reliability are involved. Manual checks MUST state steps and expected results; unavailable checks are recorded as limitations, not passes.
- **PDL-02.08 — Maintain bidirectional traceability and configuration baseline.** Maintain links from source need to requirement, decision/design, implementation change, verification evidence, release/profile, and operational signal where applicable. Identify uncovered requirements, orphan changes/tests, deferred items, and out-of-scope items. Baseline the approved specification revision for planning; material changes trigger impact analysis and owner review before the baseline changes.
- **PDL-02.09 — Review specification quality across roles.** Before commitment, obtain review from the relevant product/user, engineering, security/privacy, operations, accessibility/design, support, and legal/compliance roles when the change affects their concerns. The author MUST resolve or record objections, assumptions, and accepted risk; review participation does not transfer accountability from the decision owner.

**Rule document:** [rules/02-requirements-engineering-and-quality.md](rules/02-requirements-engineering-and-quality.md)

**Enforcement:** [tests/test_02_requirements_engineering_and_quality.py](tests/test_02_requirements_engineering_and_quality.py)
### PDL-03 — Solution alternatives and experimentation

**Objective.** Select solutions through explicit, evidence-based decisions and use bounded investigations to reduce uncertainty without confusing experimental artifacts with supported product behavior.

**Requirements traced:** PDL-005, PDL-008–PDL-009, PDL-016

**Normative requirements:**

- **PDL-03.02 — Record decision authority and reconsideration triggers.** A decision record MUST identify the accountable authority, consulted roles, affected requirements, scope, date/revision, assumptions, constraints, consequences, and conditions that require review or reversal. Agents and implementers MUST NOT treat a proposal, brainstorm, or unapproved decision as authorization to commit to an irreversible or externally visible choice.
- **PDL-03.03 — Define experiments before running them.** A prototype, proof of concept, benchmark, pilot, user study, or other experiment MUST state the question or hypothesis, method, target context, sample/workload, success and stop criteria, data/safety constraints, owner, time/cost bound, and intended decision. Do not expand an experiment into production use without the applicable engineering, security, support, release, and operations gates.
- **PDL-03.04 — Ensure experiments produce interpretable evidence.** Record the environment, revision, configuration, inputs, controls/baseline, repetitions or sample limitations, observed results, uncertainty, anomalies, and deviations from protocol. Protect participants and production systems; use synthetic or minimized data when it can answer the question. A benchmark MUST follow the performance rules and MUST NOT generalize beyond its hardware, model, workload, and measurement limits.
- **PDL-03.05 — Close experiments with an explicit outcome.** Conclude with adopt, reject, iterate, or inconclusive; map evidence to the predefined criteria and document limitations, follow-up questions, owner, and resulting requirement/decision changes. Negative results MUST be retained. Do not cherry-pick successful runs or redefine success after observing results without disclosing the change and rerunning or qualifying conclusions.
- **PDL-03.06 — Bound prototype exposure and remove or promote artifacts deliberately.** Label prototypes and temporary tools with purpose, owner, data classification, intended audience, expiry, known gaps, and whether they MAY be deployed. Before promotion, review architecture, code quality, tests, accessibility, security, privacy, compatibility, licensing, documentation, support, monitoring, and recovery. Otherwise remove or archive safely, including associated data and credentials.

**Rule document:** [rules/03-solution-alternatives-and-experimentation.md](rules/03-solution-alternatives-and-experimentation.md)

**Enforcement:** [tests/test_03_solution_alternatives_and_experimentation.py](tests/test_03_solution_alternatives_and_experimentation.py)
### PDL-04 — Prioritization and delivery planning

**Objective.** Commit only to understood and authorized outcomes, sequence delivery around dependencies and risk, and keep plans honest as uncertainty and conditions change.

**Requirements traced:** PDL-005, PDL-010–PDL-012, PDL-017, ED-042

**Normative requirements:**

- **PDL-04.02 — Establish a bounded and traceable plan.** Before implementation, establish approved scope and exclusions, requirement IDs, deliverables, sequence, accountable roles, dependencies, estimate or uncertainty range, milestones or decision points, verification, documentation, migration, release, rollback, and operational readiness activities as applicable. Identify work that can proceed independently and work blocked on unresolved decisions.
- **PDL-04.03 — Decompose around reviewable outcomes and safe integration.** Break work into changes that can be independently reviewed and verified while preserving coherent behavior. Sequence foundational interfaces, data migrations, security controls, and compatibility work before dependent consumers where required. Name integration points, parallel-work assumptions, ownership, and coordination checkpoints; avoid task lists that only describe activity without a verifiable result.
- **PDL-04.04 — Make estimates and commitments uncertainty-aware.** Record estimate basis, assumptions, confidence/range, excluded work, and external dependencies. For novel or high-uncertainty work, plan discovery/spikes and decision gates before making date or scope commitments. Do not present an estimate as a guarantee; revise forecasts when evidence changes and communicate material impact to affected stakeholders.
- **PDL-04.05 — Plan for risk, contingency, and capacity.** For material risks, specify likelihood/impact, owner, prevention or mitigation, trigger, contingency, and residual risk authority. Include review capacity, test environments, hardware/model availability, vendor/service limits, support and on-call needs, build/CI time, and recovery tasks when relevant. Avoid plans that depend on unowned work or unverified availability.
- **PDL-04.06 — Control scope and replan on material change.** When requirements, evidence, dependencies, estimates, constraints, or risk change, assess impact on outcomes, schedule, cost, staffing, architecture, acceptance, release, and stakeholders. Obtain the relevant owner decision and update the baseline and affected artifacts before continuing work outside approved tolerance. Preserve a record of why and when the plan changed.
- **PDL-04.07 — Keep plans proportionate and usable.** Use the smallest plan that supports shared understanding, sequencing, accountability, risk control, and verification. Keep transient implementation plans in the repository-approved private planning location when required by project policy; do not expose private plans in public artifacts. Specifications, requirement IDs, decisions, release evidence, and durable operational knowledge remain in their approved locations and MUST NOT be hidden in a discarded plan.
- **PDL-04.08 — Review completion against outcomes, not activity.** A task or milestone is complete only when its stated output is reviewed, required checks have evidence, linked scope is updated, and dependencies or residual risks are dispositioned. Report blocked, skipped, failed, and unavailable checks accurately. Update remaining estimates and plan status from actual results.

**Rule document:** [rules/04-prioritization-and-delivery-planning.md](rules/04-prioritization-and-delivery-planning.md)

**Enforcement:** [tests/test_04_prioritization_and_delivery_planning.py](tests/test_04_prioritization_and_delivery_planning.py)
### PDL-05 — Acceptance, release, learning, and retirement

**Objective.** Demonstrate that the delivered change meets approved outcomes, make a controlled release decision, observe actual results, and safely change or retire capabilities when evidence warrants it.

**Requirements traced:** PDL-013–PDL-017, ED-011, ED-042

**Normative requirements:**

- **PDL-05.02 — Make acceptance authority and residual limitations explicit.** The designated owner MUST decide accept, reject, conditionally accept, or defer against predeclared criteria. Record tested revision/profile, evidence, failed or unavailable checks, known limitations, residual risks, approved exceptions, migration and rollback readiness. Conditional acceptance MUST identify scope, conditions, owner, expiry, and prohibited use. Agents MAY report evidence but MUST NOT invent delegated approval.
- **PDL-05.03 — Apply domain release gates before exposure.** A release or staged exposure MUST satisfy applicable release, security, license, verification, portability, operations, documentation, support, and stakeholder-communication controls. Define rollout cohort/criteria, monitoring, stop/rollback trigger, responsible operator, and user impact. For public launch or irreversible data change, obtain the explicitly authorized decision before exposure.
- **PDL-05.04 — Observe outcomes and act on feedback.** For a material change, define post-release signals tied to intended outcomes, safety/security/reliability constraints, and user/operator experience. Set an owner and review point proportionate to risk. Review telemetry, support requests, complaints, incidents, accessibility feedback, regressions, and cost within their privacy and retention limits. Decide to continue, improve, constrain, roll back, or retire; record reasons and resulting work.
- **PDL-05.05 — Maintain traceability and communicate material changes.** Update the requirement disposition and links to design, code/change, verification, release, and operational evidence. Communicate behavior, compatibility, migration, support, and known limitations to affected audiences through approved channels. Keep public claims consistent with tested profiles and evidence; coordinate incident or safety communications under applicable controls.
- **PDL-05.06 — Manage changes after acceptance.** A change to an accepted requirement, interface, supported profile, data behavior, risk treatment, or acceptance threshold MUST receive impact analysis, owner approval, updated baseline, and re-verification of affected claims. Preserve history so reviewers can determine which revision was approved and why.
- **PDL-05.07 — Retire capabilities and work products safely.** Before retirement, identify affected users, clients, operators, integrations, data, models, credentials, dependencies, published artifacts, and contractual commitments. Define notice and transition period, replacement or export path, migration, backup/deletion schedule, access revocation, support end date, rollback limits, and evidence retention. Verify that shutdown removes exposed services and secrets and that retained records meet policy. For an immediate security or safety shutdown, document the emergency rationale and follow incident controls.
- **PDL-05.08 — Feed incidents and failures back into the lifecycle.** Material failure, near miss, support pattern, or unmet requirement MUST produce a blameless evidence-based review proportionate to impact. Identify contributing system/process conditions, affected requirements and controls, containment, corrective action owner, due/review trigger, and how effectiveness will be verified. Update rules, specifications, tests, plans, or training when findings show a systemic gap; do not close corrective action solely because a ticket was filed.

**Rule document:** [rules/05-acceptance-release-learning-and-retirement.md](rules/05-acceptance-release-learning-and-retirement.md)

**Enforcement:** [tests/test_05_acceptance_release_learning_and_retirement.py](tests/test_05_acceptance_release_learning_and_retirement.py)

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/product-discovery-and-delivery
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
