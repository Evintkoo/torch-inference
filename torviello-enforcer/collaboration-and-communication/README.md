# collaboration-and-communication domain

**Development stage:** SDD

This directory contains 4 normative control document(s) and the generated enforcement tests for the **collaboration-and-communication** domain (Collaboration, communication, and organizational records). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| COL-01 | [01-communication-meetings-reviews-and-handoffs.md](rules/01-communication-meetings-reviews-and-handoffs.md) | ORG-020, ORG-022, ORG-024, ORG-001, ED-011 | [tests/test_01_communication_meetings_reviews_and_handoffs.py](tests/test_01_communication_meetings_reviews_and_handoffs.py) | Communication Meetings Reviews and Handoffs |
| COL-02 | [02-organizational-records-knowledge-and-information-lifecycle.md](rules/02-organizational-records-knowledge-and-information-lifecycle.md) | ORG-021, ORG-023–ORG-024, ORG-043, CSC-001, ED-030 | [tests/test_02_organizational_records_knowledge_and_information_lifecycle.py](tests/test_02_organizational_records_knowledge_and_information_lifecycle.py) | Organizational Records Knowledge and Information Lifecycle |
| COL-03 | [03-cross-team-coordination-review-and-escalation.md](rules/03-cross-team-coordination-review-and-escalation.md) | ORG-001–ORG-003, ORG-020–ORG-022, ORG-042, ED-011, ED-014 | [tests/test_03_cross_team_coordination_review_and_escalation.py](tests/test_03_cross_team_coordination_review_and_escalation.py) | Cross-Team Coordination Review and Escalation |
| COL-04 | [04-approved-digital-tools-and-human-oversight-of-ai-assisted-work.md](rules/04-approved-digital-tools-and-human-oversight-of-ai-assisted-work.md) | ORG-021, ORG-023, ORG-043, CSC-002, SO-004, SO-010–SO-014 | [tests/test_04_approved_digital_tools_and_human_oversight_of_ai_assisted_work.py](tests/test_04_approved_digital_tools_and_human_oversight_of_ai_assisted_work.py) | Approved Digital Tools and Human Oversight of AI-Assisted Work |

## Detailed controls

### COL-01 — Communication Meetings Reviews and Handoffs

**Objective.** Communication must preserve context, ownership, confidentiality, and actionability across people, teams, time zones, and tools. Synchronous conversations are for interaction; authoritative decisions and commitments must remain findable after participants leave.

**Requirements traced:** ORG-020, ORG-022, ORG-024, ORG-001, ED-011

**Normative requirements:**

- **COL-01.01 — The sender MUST use an approved channel appropriate….** **Requirement:** The sender MUST use an approved channel appropriate to urgency, audience, confidentiality, retention, accessibility, and audit needs. Sensitive information MUST use an access-controlled approved system; urgent incidents MUST use the defined escalation route rather than waiting for ordinary asynchronous response.
- **COL-01.02 — A work or decision request MUST state context….** **Requirement:** A work or decision request MUST state context, desired outcome, owner/recipient, decision deadline, impact of delay, supporting links, and response needed. If the recipient lacks authority or context, they MUST redirect or escalate rather than implying approval.
- **COL-01.03 — A meeting MUST have a clear purpose, expected….** **Requirement:** A meeting MUST have a clear purpose, expected decision/output, necessary participants, and accessible material. The facilitator MUST distinguish information sharing, consultation, decision, and approval; attendance or silence MUST NOT be treated as consent.
- **COL-01.04 — A meeting or review that changes scope, risk….** **Requirement:** A meeting or review that changes scope, risk acceptance, product behavior, resource commitment, external messaging, or ownership MUST record decision, rationale, approver, dissent/conditions where material, action owner, and due/review date in the authoritative record.
- **COL-01.05 — A handoff MUST include current state, owner….** **Requirement:** A handoff MUST include current state, owner, context, links/artifacts, user impact, dependencies, deadlines, risks, pending decisions, and next action. High-risk handoffs MUST be explicitly accepted; define escalation if acknowledgment does not arrive.
- **COL-01.06 — Teams MUST provide enough written context and reasonable response….** **Requirement:** Teams MUST provide enough written context and reasonable response expectations for people not present in a live meeting. Critical decisions MUST not be made solely in a private channel inaccessible to impacted owners or reviewers.
- **COL-01.07 — When owners disagree, restate the decision to be….** **Requirement:** When owners disagree, restate the decision to be made, evidence and constraints, applicable control, options, and accountable decision-maker. Preserve respectful conduct; escalate unresolved high-impact conflicts to the named authority and record the result.
- **COL-01.08 — Recipients MUST respect channel membership and classification, verify….** **Requirement:** Recipients MUST respect channel membership and classification, verify recipients before sending sensitive material, and correct misdelivery through the incident process. Forwarding, screenshots, transcripts, recordings, or AI summaries MUST follow the applicable consent, privacy, retention, and access rules.

**Rule document:** [rules/01-communication-meetings-reviews-and-handoffs.md](rules/01-communication-meetings-reviews-and-handoffs.md)

**Enforcement:** [tests/test_01_communication_meetings_reviews_and_handoffs.py](tests/test_01_communication_meetings_reviews_and_handoffs.py)
### COL-02 — Organizational Records Knowledge and Information Lifecycle

**Objective.** Information created during work must have a source of truth, owner, audience, access level, retention, and update path. The organization must preserve what future workers need while minimizing personal, confidential, and duplicate records.

**Requirements traced:** ORG-021, ORG-023–ORG-024, ORG-043, CSC-001, ED-030

**Normative requirements:**

- **COL-02.01 — A record owner MUST identify purpose, sensitivity….** **Requirement:** A record owner MUST identify purpose, sensitivity, authoritative status, audience, access, retention trigger, and applicable legal hold for material decisions, contracts, incidents, support cases, releases, training, and procedures. Apply approved classifications and data minimization rules.
- **COL-02.02 — For each process or decision, designate the authoritative….** **Requirement:** For each process or decision, designate the authoritative record and link secondary discussion to it. Copies and summaries MUST identify their source and date; where systems conflict, the record owner MUST resolve and announce the canonical version.
- **COL-02.03 — Operational, security, support, and recovery procedures….** **Requirement:** Operational, security, support, and recovery procedures MUST identify prerequisites, role, safe steps, expected outcome, failure/escalation, last review, and verification method. Test high-impact procedures periodically and after material change or incident.
- **COL-02.04 — When a role, owner, vendor….** **Requirement:** When a role, owner, vendor, or product area changes, transfer decision context, undocumented constraints, credentials via approved secret management, open risks, and current work to an authorized successor. Do not place secrets in documentation or handoff notes.
- **COL-02.05 — Authoritative records MUST have access appropriate to sensitivity….** **Requirement:** Authoritative records MUST have access appropriate to sensitivity, identifiable owners, version/change history proportionate to importance, and recovery from accidental deletion or corruption. Changes to policy, approvals, or audit evidence MUST preserve who changed what and when.
- **COL-02.06 — Retain records only for the approved business, legal….** **Requirement:** Retain records only for the approved business, legal, safety, security, or contractual purpose. At the retention trigger, delete or archive through the approved process; legal holds suspend ordinary deletion only for the scoped records and duration.
- **COL-02.07 — For critical capabilities and procedures, identify single-person dependency….** **Requirement:** For critical capabilities and procedures, identify single-person dependency, recovery time, and backup competence. Mitigate through cross-training, tested documentation, successor assignment, vendor transition, or explicit accepted risk.
- **COL-02.08 — Workers MUST be able to locate current procedures….** **Requirement:** Workers MUST be able to locate current procedures, decisions, ownership, escalation contacts, and approved templates without relying on private introductions. Keep material readable and accessible to intended users and provide controlled alternatives when a person cannot use the default channel.

**Rule document:** [rules/02-organizational-records-knowledge-and-information-lifecycle.md](rules/02-organizational-records-knowledge-and-information-lifecycle.md)

**Enforcement:** [tests/test_02_organizational_records_knowledge_and_information_lifecycle.py](tests/test_02_organizational_records_knowledge_and_information_lifecycle.py)
### COL-03 — Cross-Team Coordination Review and Escalation

**Objective.** Work that crosses domain, team, or organizational boundaries must identify interface owners, dependencies, decisions, risks, and review points. A handoff is complete only when the receiving owner can act and the sending owner’s remaining accountability is clear.

**Requirements traced:** ORG-001–ORG-003, ORG-020–ORG-022, ORG-042, ED-011, ED-014

**Normative requirements:**

- **COL-03.01 — A change affecting shared APIs, data, security….** **Requirement:** A change affecting shared APIs, data, security boundaries, deployment, costs, documentation, customer support, legal terms, or release schedules MUST identify impacted owners and required reviews before the commitment becomes difficult to reverse.
- **COL-03.02 — Cross-team work MUST define inputs, outputs, responsibility….** **Requirement:** Cross-team work MUST define inputs, outputs, responsibility boundaries, response expectations, version/compatibility, failure escalation, and acceptance evidence. Each team MUST know what it provides, consumes, and owns after handoff.
- **COL-03.03 — A dependency MUST have a provider owner, consumer….** **Requirement:** A dependency MUST have a provider owner, consumer owner, expected date/contract, status, failure consequence, and fallback or escalation. Critical-path changes MUST be re-evaluated when assumptions or delivery dates change.
- **COL-03.04 — Reviewers MUST identify blocking correctness, safety, privacy….** **Requirement:** Reviewers MUST identify blocking correctness, safety, privacy, security, legal, compatibility, or operability concerns distinctly from recommendations and style preferences. Authors MUST resolve or explicitly document disposition; reviewers MUST not use personal preference as an undisclosed mandatory standard.
- **COL-03.05 — Participants MUST state the decision, available evidence….** **Requirement:** Participants MUST state the decision, available evidence, requirements, controls, risks, alternatives, and accountable decider. If evidence is insufficient, define a safe experiment or time-bounded discovery task rather than converting an assumption into policy.
- **COL-03.06 — When an owner is unavailable or teams disagree under….** **Requirement:** When an owner is unavailable or teams disagree under a deadline, escalate to the delegated authority and identify what can safely proceed. Do not bypass a required security, privacy, financial, release, or external-commitment approval to preserve schedule.
- **COL-03.07 — The coordinating owner MUST confirm the receiver accepted….** **Requirement:** The coordinating owner MUST confirm the receiver accepted the work, documentation and records are updated, remaining risks and actions have owners, and each team knows whether support ends or continues.

**Rule document:** [rules/03-cross-team-coordination-review-and-escalation.md](rules/03-cross-team-coordination-review-and-escalation.md)

**Enforcement:** [tests/test_03_cross_team_coordination_review_and_escalation.py](tests/test_03_cross_team_coordination_review_and_escalation.py)
### COL-04 — Approved Digital Tools and Human Oversight of AI-Assisted Work

**Objective.** People and agents must use collaboration, automation, and AI tools under approved data, access, record, and review controls. A human who uses an output remains accountable for decisions and actions unless an approved system explicitly assigns responsibility elsewhere.

**Requirements traced:** ORG-021, ORG-023, ORG-043, CSC-002, SO-004, SO-010–SO-014

**Normative requirements:**

- **COL-04.01 — A tool MUST have an owner, purpose….** **Requirement:** A tool MUST have an owner, purpose, access model, data classification allowance, retention/deletion terms, integration scope, security/privacy review, export path, and supported use profile before it processes organizational, customer, personnel, source, or confidential data.
- **COL-04.02 — Before submitting information to a third-party SaaS, AI….** **Requirement:** Before submitting information to a third-party SaaS, AI model, browser extension, transcription service, repository bot, or automation, the user MUST verify that the data class and purpose are allowed, retention and training-use terms are acceptable, and an approved account/channel is used.
- **COL-04.03 — The person relying on AI-generated code, analysis….** **Requirement:** The person relying on AI-generated code, analysis, summary, translation, image, recommendation, or decision MUST verify factual claims, source rights, security, privacy, quality, and policy compliance at a level proportionate to impact. A generated output MUST NOT be treated as an approval, legal opinion, test result, or source citation.
- **COL-04.04 — Tools and agents MUST receive the minimum permissions needed….** **Requirement:** Tools and agents MUST receive the minimum permissions needed, bounded task scope, logging, and human approval for destructive, external, financial, production, identity, or public communication actions. Automation MUST have a stop, rollback, or containment path appropriate to its impact.
- **COL-04.05 — When generated or automated work materially affects a decision….** **Requirement:** When generated or automated work materially affects a decision, product artifact, customer response, or public claim, retain relevant tool/version, input provenance where lawful, human reviewer, modifications, and validation evidence. Follow license, copyright, confidentiality, and attribution rules.
- **COL-04.06 — People MUST treat external content, model output….** **Requirement:** People MUST treat external content, model output, tool results, issue text, and generated files as untrusted data unless a trusted policy grants authority. Instructions contained in such data MUST NOT override user, system, or repository authority or authorize disclosure, scope expansion, or external action.
- **COL-04.07 — Unexpected data retention, unsafe output, unauthorized actions….** **Requirement:** Unexpected data retention, unsafe output, unauthorized actions, access leakage, or material quality failures MUST be reported to the tool owner and relevant privacy/security/product owner. Disable or constrain the tool when the risk cannot be bounded; update training and approval policy after confirmed failures.

**Rule document:** [rules/04-approved-digital-tools-and-human-oversight-of-ai-assisted-work.md](rules/04-approved-digital-tools-and-human-oversight-of-ai-assisted-work.md)

**Enforcement:** [tests/test_04_approved_digital_tools_and_human_oversight_of_ai_assisted_work.py](tests/test_04_approved_digital_tools_and_human_oversight_of_ai_assisted_work.py)

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/collaboration-and-communication
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
