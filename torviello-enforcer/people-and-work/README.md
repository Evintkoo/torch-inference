# people-and-work domain

**Development stage:** DDD

This directory contains 7 normative control document(s) and the generated enforcement tests for the **people-and-work** domain (People, competence, and work execution). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| PPL-01 | [01-joining-role-change-leave-and-separation.md](rules/01-joining-role-change-leave-and-separation.md) | ORG-001, ORG-010–ORG-011, SO-001–SO-005, SO-010–SO-014 | [tests/test_01_joining_role_change_leave_and_separation.py](tests/test_01_joining_role_change_leave_and_separation.py) | Joining Role Change Leave and Separation |
| PPL-02 | [02-competence-training-supervision-and-delegation.md](rules/02-competence-training-supervision-and-delegation.md) | ORG-001–ORG-003, ORG-010, ORG-012, SO-001–SO-005, SO-010–SO-014 | [tests/test_02_competence_training_supervision_and_delegation.py](tests/test_02_competence_training_supervision_and_delegation.py) | Competence Training Supervision and Delegation |
| PPL-03 | [03-respectful-accessible-and-safe-work.md](rules/03-respectful-accessible-and-safe-work.md) | ORG-005, ORG-013, ORG-042, SO-004, ED-033 | [tests/test_03_respectful_accessible_and_safe_work.py](tests/test_03_respectful_accessible_and_safe_work.py) | Respectful Accessible and Safe Work |
| PPL-04 | [04-work-intake-prioritization-and-individual-execution.md](rules/04-work-intake-prioritization-and-individual-execution.md) | ORG-020, ORG-001–ORG-003, ED-005, ED-011 | [tests/test_04_work_intake_prioritization_and_individual_execution.py](tests/test_04_work_intake_prioritization_and_individual_execution.py) | Work Intake Prioritization and Individual Execution |
| PPL-05 | [05-work-time-availability-leave-and-expense-integrity.md](rules/05-work-time-availability-leave-and-expense-integrity.md) | ORG-011, ORG-044, ORG-010, ORG-013 | [tests/test_05_work_time_availability_leave_and_expense_integrity.py](tests/test_05_work_time_availability_leave_and_expense_integrity.py) | Work Time Availability Leave and Expense Integrity |
| PPL-06 | [06-recruitment-selection-and-hiring-decisions.md](rules/06-recruitment-selection-and-hiring-decisions.md) | ORG-010, ORG-045, ORG-001–ORG-003, ORG-013 | [tests/test_06_recruitment_selection_and_hiring_decisions.py](tests/test_06_recruitment_selection_and_hiring_decisions.py) | Recruitment Selection and Hiring Decisions |
| PPL-07 | [07-performance-development-recognition-and-corrective-action.md](rules/07-performance-development-recognition-and-corrective-action.md) | ORG-010, ORG-013, ORG-042, ORG-046, ED-014 | [tests/test_07_performance_development_recognition_and_corrective_action.py](tests/test_07_performance_development_recognition_and_corrective_action.py) | Performance Development Recognition and Corrective Action |

## Detailed controls

### PPL-01 — Joining Role Change Leave and Separation

**Objective.** Every person’s organizational relationship and duties must move through controlled entry, change, absence, return, and exit processes. Workforce workflows coordinate identity, authority, access, equipment, knowledge, privacy, and continuity without assuming one employment model or jurisdiction.

**Requirements traced:** ORG-001, ORG-010–ORG-011, SO-001–SO-005, SO-010–SO-014

**Normative requirements:**

- **PPL-01.01 — Before an employee, contractor, intern, advisor….** **Requirement:** Before an employee, contractor, intern, advisor, agent operator, or other person begins work, an accountable sponsor MUST define relationship, scope, duration, supervisor, permitted systems/data, confidentiality/IP terms, required screening lawful for the jurisdiction, and end/renewal trigger.
- **PPL-01.02 — Before production, source, model, customer-data….** **Requirement:** Before production, source, model, customer-data, administrative, finance, or public-communication access, verify identity through approved means, accept applicable policy/agreements, complete required role training, assign a sponsor, and grant only the approved role set. Exceptions require an owner and expiration.
- **PPL-01.03 — A role, team, contract, or project….** **Requirement:** A role, team, contract, or project change MUST trigger review of current entitlements, data access, approvals, delegated authority, equipment, training, and outstanding work. Remove access and authority no longer needed; do not wait for the next periodic review when the change is material.
- **PPL-01.04 — For planned or unexpected absence, the manager….** **Requirement:** For planned or unexpected absence, the manager or delegate MUST identify critical duties, authority suspension or delegation, work queues, customer/incident coverage, and return/reassignment steps. Do not share credentials to provide coverage.
- **PPL-01.05 — At separation or contract end, a responsible owner….** **Requirement:** At separation or contract end, a responsible owner MUST promptly disable identities, sessions, tokens, keys, devices, recovery methods, admin roles, and external accounts; recover assets; transfer owned work and records; and remove public/financial authority. Timing MUST reflect risk and legal constraints.
- **PPL-01.06 — Personnel records, screening results, performance, health….** **Requirement:** Personnel records, screening results, performance, health, and investigation information MUST be limited to an authorized purpose, least-privilege access, approved retention, and applicable law. Security controls MUST NOT become a pretext for collecting unrelated personal information.
- **PPL-01.07 — The sponsor or delegate MUST confirm access closure….** **Requirement:** The sponsor or delegate MUST confirm access closure, asset return, knowledge handoff, outstanding commitments, legal holds, and record ownership. Any delayed removal MUST name a risk owner, compensating control, and deadline; overdue items escalate.

**Rule document:** [rules/01-joining-role-change-leave-and-separation.md](rules/01-joining-role-change-leave-and-separation.md)

**Enforcement:** [tests/test_01_joining_role_change_leave_and_separation.py](tests/test_01_joining_role_change_leave_and_separation.py)
### PPL-02 — Competence Training Supervision and Delegation

**Objective.** People may perform work only within their competence, authorization, and supervision. Training and qualification must be specific to the decisions and risks a person is expected to handle, and must be refreshed when systems or duties change.

**Requirements traced:** ORG-001–ORG-003, ORG-010, ORG-012, SO-001–SO-005, SO-010–SO-014

**Normative requirements:**

- **PPL-02.01 — For work that can affect security, privacy….** **Requirement:** For work that can affect security, privacy, safety, finances, customer commitments, production availability, model quality, or legal rights, define the knowledge and demonstrated capability required. A credential alone MUST NOT substitute for role-specific competence evidence.
- **PPL-02.02 — Before independent performance of a high-risk task….** **Requirement:** Before independent performance of a high-risk task, the person MUST complete relevant instruction and demonstrate the necessary procedure or judgment. Training MUST cover escalation, failure handling, data protection, tool access, and prohibited actions as applicable.
- **PPL-02.03 — When a person is learning, working outside routine….** **Requirement:** When a person is learning, working outside routine competence, or handling an unusual high-risk task, assign a qualified reviewer/supervisor, define the allowed scope, and require checkpoints before irreversible or externally visible action.
- **PPL-02.04 — Material policy, threat, system, legal….** **Requirement:** Material policy, threat, system, legal, incident, or role changes MUST trigger an assessment of training impact. Retrain or requalify affected roles before they perform newly risky actions independently.
- **PPL-02.05 — A person delegating work MUST confirm the recipient’s authority….** **Requirement:** A person delegating work MUST confirm the recipient’s authority, competence, context, access, expected result, deadline, escalation, and review point. Delegation MUST not transfer an obligation the delegator lacks authority to transfer.
- **PPL-02.06 — Performance feedback MUST use role-relevant expectations and evidence….** **Requirement:** Performance feedback MUST use role-relevant expectations and evidence, provide a path to improve, and distinguish system/process failures from individual actions. Consequential employment decisions MUST follow the approved, jurisdiction-reviewed people policy.
- **PPL-02.07 — Training and qualification evidence MUST record role, subject/version….** **Requirement:** Training and qualification evidence MUST record role, subject/version, completion or assessment result, owner, and refresh trigger. Keep records proportionate and protect them as personnel data.

**Rule document:** [rules/02-competence-training-supervision-and-delegation.md](rules/02-competence-training-supervision-and-delegation.md)

**Enforcement:** [tests/test_02_competence_training_supervision_and_delegation.py](tests/test_02_competence_training_supervision_and_delegation.py)
### PPL-03 — Respectful Accessible and Safe Work

**Objective.** Work practices must protect people’s safety, dignity, accessibility, and ability to raise concerns. The organization must maintain qualified, jurisdiction-aware policies and fair response processes instead of relying on informal norms or individual goodwill.

**Requirements traced:** ORG-005, ORG-013, ORG-042, SO-004, ED-033

**Normative requirements:**

- **PPL-03.01 — A designated owner MUST maintain current, accessible policies….** **Requirement:** A designated owner MUST maintain current, accessible policies for respectful conduct, discrimination/harassment prevention, accessibility accommodations, workplace health/safety relevant to the work, acceptable technology use, and non-retaliation. Policy scope, reporting routes, responsible handlers, and applicable jurisdictions MUST be stated.
- **PPL-03.02 — People MUST have an accessible reporting route for unsafe….** **Requirement:** People MUST have an accessible reporting route for unsafe, discriminatory, harassing, retaliatory, or coercive behavior and an alternative when the normal manager or handler is implicated. Emergency or immediate physical danger MUST have a direct urgent response route.
- **PPL-03.03 — Reports MUST be acknowledged, risk-triaged, assigned….** **Requirement:** Reports MUST be acknowledged, risk-triaged, assigned to a trained impartial handler, and handled with access limited to need-to-know. The process MUST state confidentiality limits, evidence preservation, protective measures, fair response, escalation, and closure.
- **PPL-03.04 — The organization MUST prohibit retaliation for good-faith reporting….** **Requirement:** The organization MUST prohibit retaliation for good-faith reporting, requesting accommodation, participating in an investigation, or raising a safety/quality concern. Monitor for adverse treatment after reports and provide a separate escalation path.
- **PPL-03.05 — Work tools, documentation, meetings, training….** **Requirement:** Work tools, documentation, meetings, training, and reporting channels SHOULD be usable by people with differing access needs. When an accommodation or accessibility barrier is raised, assign an owner, assess confidentiality and safety, and provide an effective alternative while resolving the barrier.
- **PPL-03.06 — Investigations and performance decisions MUST distinguish observed facts….** **Requirement:** Investigations and performance decisions MUST distinguish observed facts, inferences, and unverified claims; provide affected people a fair opportunity to respond when appropriate; and follow qualified HR/legal advice for regulated or sensitive cases.
- **PPL-03.07 — Aggregate trends in reports, safety issues, accommodations….** **Requirement:** Aggregate trends in reports, safety issues, accommodations, and recurring barriers to improve systems. Share only the minimum personal detail needed for action; protect source identity and records under approved retention and legal-hold rules.

**Rule document:** [rules/03-respectful-accessible-and-safe-work.md](rules/03-respectful-accessible-and-safe-work.md)

**Enforcement:** [tests/test_03_respectful_accessible_and_safe_work.py](tests/test_03_respectful_accessible_and_safe_work.py)
### PPL-04 — Work Intake Prioritization and Individual Execution

**Objective.** Every work action must have a clear purpose, owner, authorized scope, completion condition, and escalation path. Teams must balance planned work, incidents, maintenance, learning, and stakeholder commitments without relying on hidden queues or personal memory.

**Requirements traced:** ORG-020, ORG-001–ORG-003, ED-005, ED-011

**Normative requirements:**

- **PPL-04.01 — A request for product, engineering, operations….** **Requirement:** A request for product, engineering, operations, support, research, compliance, or administrative work MUST be captured in an approved system with requester, purpose, affected users, urgency, expected outcome, owner, and relevant evidence. Emergency actions MAY start immediately but MUST be recorded promptly afterward.
- **PPL-04.02 — A responsible owner MUST compare user harm/value, security/legal….** **Requirement:** A responsible owner MUST compare user harm/value, security/legal obligations, service impact, dependencies, urgency, effort, opportunity cost, and reversibility. Record deferral rationale for material risks or commitments; do not let loudness, status, or recency alone determine priority.
- **PPL-04.03 — Accepted work MUST state outcomes, boundaries, dependencies….** **Requirement:** Accepted work MUST state outcomes, boundaries, dependencies, decision owner, review needs, validation, and closure evidence proportionate to risk. For software feature work, follow the specification → technical requirements → plan → implementation sequence required by project rules; use a proportionate documented path for routine maintenance.
- **PPL-04.04 — Team leads SHOULD make active work and blocked work….** **Requirement:** Team leads SHOULD make active work and blocked work visible, limit avoidable concurrent commitments, and identify the decision needed to unblock progress. Do not claim capacity for work without accounting for on-call, review, support, security, and maintenance duties.
- **PPL-04.05 — The owner MUST update status when scope, estimate….** **Requirement:** The owner MUST update status when scope, estimate, dependency, risk, or expected delivery changes. A blocked or unsafe task MUST be escalated with the reason, impact, next action, and decision needed; silence MUST NOT be interpreted as acceptance.
- **PPL-04.06 — Completion MUST be checked against acceptance evidence by….** **Requirement:** Completion MUST be checked against acceptance evidence by the owner or an appropriate reviewer. Work that affects production, user data, public commitments, money, security, or irreversible state MUST receive independent review/approval where practical.
- **PPL-04.07 — When work is complete, cancelled, superseded….** **Requirement:** When work is complete, cancelled, superseded, or transferred, update status, artifacts, owners, follow-up tasks, stakeholders, and any residual risk. Unfinished work MUST not remain hidden in personal notes, private messages, or unowned branches.

**Rule document:** [rules/04-work-intake-prioritization-and-individual-execution.md](rules/04-work-intake-prioritization-and-individual-execution.md)

**Enforcement:** [tests/test_04_work_intake_prioritization_and_individual_execution.py](tests/test_04_work_intake_prioritization_and_individual_execution.py)
### PPL-05 — Work Time Availability Leave and Expense Integrity

**Objective.** People must follow approved work-time, availability, leave, expense, and resource-use policies with accurate records and safe escalation. These controls require a policy owner and lawful, transparent procedures; they do not define a universal schedule, compensation model, or employment arrangement.

**Requirements traced:** ORG-011, ORG-044, ORG-010, ORG-013

**Normative requirements:**

- **PPL-05.01 — Each role MUST have documented expectations for availability….** **Requirement:** Each role MUST have documented expectations for availability, on-call duty, response windows, work location, time recording if required, and escalation. Expectations MUST be consistent with the applicable agreement, service promise, and jurisdiction-specific policy; informal messages MUST NOT create hidden permanent obligations.
- **PPL-05.02 — Where time or activity records are required….** **Requirement:** Where time or activity records are required, the person MUST report actual work, leave, on-call, or expense information accurately and promptly. Managers MUST correct process or workload issues rather than pressure people to falsify records or work off the record.
- **PPL-05.03 — Leave and absence MUST use the approved confidential process….** **Requirement:** Leave and absence MUST use the approved confidential process, identify only information required by policy, and trigger appropriate duty coverage and access/delegation review. Managers MUST not disclose sensitive leave information to coworkers beyond operational need.
- **PPL-05.04 — A person requesting reimbursement or using organizational funds MUST….** **Requirement:** A person requesting reimbursement or using organizational funds MUST state business purpose, amount, date, recipient, and evidence required by policy, disclose conflicts, and use approved categories. Approvers MUST verify legitimacy, policy, budget, and separation-of-duties controls.
- **PPL-05.05 — Cards, accounts, credits, cloud budgets….** **Requirement:** Cards, accounts, credits, cloud budgets, travel booking, and subscriptions MUST be assigned to an authorized person, purpose, limit, and reconciliation owner. Lost instruments, suspicious charges, duplicate claims, and out-of-policy purchases MUST be reported promptly.
- **PPL-05.06 — People MUST be able to report fatigue, excessive….** **Requirement:** People MUST be able to report fatigue, excessive workload, unsafe work hours, conflicting on-call assignments, or inability to meet response commitments without retaliation. The owner MUST rebalance work, change coverage, or reduce the service commitment rather than conceal the risk.
- **PPL-05.07 — Time, leave, payroll, reimbursement….** **Requirement:** Time, leave, payroll, reimbursement, and expense evidence MUST be access-controlled and retained only according to approved legal, financial, employment, and audit requirements. Product or engineering repositories MUST NOT become shadow HR or finance databases.

**Rule document:** [rules/05-work-time-availability-leave-and-expense-integrity.md](rules/05-work-time-availability-leave-and-expense-integrity.md)

**Enforcement:** [tests/test_05_work_time_availability_leave_and_expense_integrity.py](tests/test_05_work_time_availability_leave_and_expense_integrity.py)
### PPL-06 — Recruitment Selection and Hiring Decisions

**Objective.** Recruitment and selection decisions must be job-related, fair, authorized, privacy-preserving, and supported by consistent evidence. The hiring process must identify the capability needed and select for that capability without promising terms or collecting information beyond lawful business need.

**Requirements traced:** ORG-010, ORG-045, ORG-001–ORG-003, ORG-013

**Normative requirements:**

- **PPL-06.01 — Before recruitment begins, an accountable owner MUST approve….** **Requirement:** Before recruitment begins, an accountable owner MUST approve the role purpose, outcomes, essential competencies, reporting/delegation boundary, budget, employment or contractor form, and decision authority. Do not recruit for an undefined title or imply a role grants unapproved product, spending, or access authority.
- **PPL-06.02 — Selection criteria and interview/assessment methods MUST relate to actual….** **Requirement:** Selection criteria and interview/assessment methods MUST relate to actual role outcomes and be consistently applied to candidates. Define essential versus trainable capabilities, accessible participation, scoring or evidence method, and decision threshold before evaluating applicants.
- **PPL-06.03 — Interviewers MUST disclose personal, financial, or other….** **Requirement:** Interviewers MUST disclose personal, financial, or other conflicts and recuse or use independent review where appropriate. Hiring decisions MUST be based on documented job-related evidence, not protected characteristics, affinity, prestige, personal similarity, or undisclosed criteria, subject to applicable law.
- **PPL-06.04 — Collect only candidate information needed for the approved process….** **Requirement:** Collect only candidate information needed for the approved process; provide required notices and consent where applicable; restrict access; secure interview notes and assessments; set retention/deletion triggers; and use approved systems. Sensitive screening MUST be lawful, proportionate, and performed by authorized roles.
- **PPL-06.05 — Reference checks, background checks, work samples….** **Requirement:** Reference checks, background checks, work samples, psychometric tests, and automated ranking MUST have an authorized purpose, valid criteria, proportionality, transparency where required, appropriate human review, and a challenge/correction path. An automated score MUST NOT be the sole basis for a consequential decision without an approved lawful process.
- **PPL-06.06 — Only an authorized role MAY make or change….** **Requirement:** Only an authorized role MAY make or change an offer, compensation term, work location, start date, confidentiality/IP term, or contractual commitment. Candidate communications MUST be timely, accurate, respectful, accessible, and consistent with approved terms.
- **PPL-06.07 — The owner MUST record the selection rationale and approvals….** **Requirement:** The owner MUST record the selection rationale and approvals in protected records, notify candidates appropriately, dispose of data under retention rules, and hand the approved role, duties, conditions, training, and access requirements to the onboarding owner.

**Rule document:** [rules/06-recruitment-selection-and-hiring-decisions.md](rules/06-recruitment-selection-and-hiring-decisions.md)

**Enforcement:** [tests/test_06_recruitment_selection_and_hiring_decisions.py](tests/test_06_recruitment_selection_and_hiring_decisions.py)
### PPL-07 — Performance Development Recognition and Corrective Action

**Objective.** People and teams need clear expectations, useful feedback, development support, and fair accountability. Performance processes must improve outcomes and capability without reducing complex work to a single metric or bypassing approved employment policies.

**Requirements traced:** ORG-010, ORG-013, ORG-042, ORG-046, ED-014

**Normative requirements:**

- **PPL-07.01 — Each role MUST have current expectations tied to responsibilities….** **Requirement:** Each role MUST have current expectations tied to responsibilities, authority, quality, collaboration, safety, and outcome measures relevant to the work. Expectations MUST be communicated before an evaluation period and revised when scope changes.
- **PPL-07.02 — Managers or designated reviewers MUST provide feedback based on….** **Requirement:** Managers or designated reviewers MUST provide feedback based on observed work and agreed expectations, explain evidence and impact, invite context, and identify actionable next steps. Material feedback MUST not be delivered for the first time as an undocumented consequential decision.
- **PPL-07.03 — Evaluation MUST consider outcome quality, user and team….** **Requirement:** Evaluation MUST consider outcome quality, user and team impact, role scope, constraints, collaboration, incident learning, and opportunities provided. Metrics MUST be contextual and MUST NOT be the sole basis for pay, promotion, discipline, or separation decisions.
- **PPL-07.04 — Before attributing failure to an individual, review workload….** **Requirement:** Before attributing failure to an individual, review workload, unclear authority, missing training, unsafe incentives, tools, dependencies, staffing, and process design. People remain accountable for intentional or negligent conduct under policy, but systemic contributors MUST be addressed as well.
- **PPL-07.05 — When capability gaps are remediable, define support….** **Requirement:** When capability gaps are remediable, define support, mentoring/training, time, expected improvement evidence, and review date. Promotion and recognition criteria MUST be role-related, consistently applied, conflict-reviewed, and accessible under applicable policy.
- **PPL-07.06 — Compensation, promotion, discipline, performance plans….** **Requirement:** Compensation, promotion, discipline, performance plans, termination, or other consequential employment decisions MUST be made by authorized roles using documented evidence, conflict checks, approved policy, and qualified HR/legal review when required by jurisdiction.
- **PPL-07.07 — A person MUST be able to correct factual errors….** **Requirement:** A person MUST be able to correct factual errors and request review of a consequential decision through a route not controlled solely by the original decision-maker where practical. Reviewers MUST consider evidence and policy consistently and protect against retaliation.
- **PPL-07.08 — Performance notes, compensation, health, accommodation….** **Requirement:** Performance notes, compensation, health, accommodation, and corrective-action records MUST have restricted access, retention and deletion rules, and data minimization. Use aggregate team-level learning without exposing individual details unnecessarily.
- **PPL-07.09 — The responsible owner MUST periodically review whether expectations….** **Requirement:** The responsible owner MUST periodically review whether expectations, metrics, workload, opportunity, feedback, and outcomes produce unexplained disparities or perverse incentives. Investigate concerns and update the process based on evidence without assuming a metric alone proves discrimination or fairness.

**Rule document:** [rules/07-performance-development-recognition-and-corrective-action.md](rules/07-performance-development-recognition-and-corrective-action.md)

**Enforcement:** [tests/test_07_performance_development_recognition_and_corrective_action.py](tests/test_07_performance_development_recognition_and_corrective_action.py)

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/people-and-work
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
