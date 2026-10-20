# stakeholder-relations domain

**Development stage:** SDD

This directory contains 4 normative control document(s) and the generated enforcement tests for the **stakeholder-relations** domain (Customer, community, and public commitments). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| EXT-01 | [01-customer-user-and-community-support-operations.md](rules/01-customer-user-and-community-support-operations.md) | ORG-030–ORG-032, PA-001–PA-004, SO-002–SO-005, SO-030–SO-033 | [tests/test_01_customer_user_and_community_support_operations.py](tests/test_01_customer_user_and_community_support_operations.py) | Customer User and Community Support Operations |
| EXT-02 | [02-feedback-complaints-accessibility-and-dispute-handling.md](rules/02-feedback-complaints-accessibility-and-dispute-handling.md) | ORG-005, ORG-031–ORG-032, ORG-042, ED-033 | [tests/test_02_feedback_complaints_accessibility_and_dispute_handling.py](tests/test_02_feedback_complaints_accessibility_and_dispute_handling.py) | Feedback Complaints Accessibility and Dispute Handling |
| EXT-03 | [03-public-statements-product-claims-and-marketing-content.md](rules/03-public-statements-product-claims-and-marketing-content.md) | ORG-030, ORG-002, ORG-021, ORG-040, ED-012, ED-030–ED-033, ED-040–ED-041 | [tests/test_03_public_statements_product_claims_and_marketing_content.py](tests/test_03_public_statements_product_claims_and_marketing_content.py) | Public Statements Product Claims and Marketing Content |
| EXT-04 | [04-external-incident-and-stakeholder-communications.md](rules/04-external-incident-and-stakeholder-communications.md) | ORG-030–ORG-032, ORG-040–ORG-042, SO-004, SO-012–SO-014, SO-030–SO-033 | [tests/test_04_external_incident_and_stakeholder_communications.py](tests/test_04_external_incident_and_stakeholder_communications.py) | External Incident and Stakeholder Communications |

## Detailed controls

### EXT-01 — Customer User and Community Support Operations

**Objective.** Every user-facing request must reach an authorized and competent responder, receive an accurate acknowledgment, and be resolved, escalated, or explicitly bounded. Support must protect user privacy and feed product, security, accessibility, and reliability learning back to owners.

**Requirements traced:** ORG-030–ORG-032, PA-001–PA-004, SO-002–SO-005, SO-030–SO-033

**Normative requirements:**

- **EXT-01.01 — For each supported product profile, state supported audiences….** **Requirement:** For each supported product profile, state supported audiences, support channel, hours/response expectations, languages/accessibility options as applicable, supported versions, escalation boundaries, and what the channel cannot provide. Do not imply 24/7 or guaranteed response absent an approved staffed commitment.
- **EXT-01.02 — A support owner MUST capture a case identifier….** **Requirement:** A support owner MUST capture a case identifier, minimal contact/context, product/version/profile, impact, urgency, category, consent/data handling where relevant, owner, status, and next update. Classify security, privacy, safety, accessibility, billing, data-loss, outage, and ordinary usage cases distinctly.
- **EXT-01.03 — The responder MUST confirm receipt, explain next steps….** **Requirement:** The responder MUST confirm receipt, explain next steps and realistic response timing, and avoid promises beyond authority. If the issue is urgent or outside support competence, route it to the designated incident, privacy, security, legal, or product owner.
- **EXT-01.04 — Request only the diagnostic information needed; prefer synthetic….** **Requirement:** Request only the diagnostic information needed; prefer synthetic or redacted data. Provide a secure transfer path for necessary sensitive files, restrict case access, set retention, and never ask users to send passwords, private keys, or unnecessary inference content.
- **EXT-01.05 — Support responses MUST distinguish verified facts, hypotheses….** **Requirement:** Support responses MUST distinguish verified facts, hypotheses, workarounds, and commitments; explain limitations plainly; preserve user dignity; and provide accessible alternatives where a product barrier blocks use.
- **EXT-01.06 — The case owner MUST record diagnosis, workaround/fix….** **Requirement:** The case owner MUST record diagnosis, workaround/fix, affected versions, user communication, residual risk, escalation, and closure. For unresolved issues, state owner, next update, and safe workaround; closure MUST NOT mean merely that a ticket was transferred.
- **EXT-01.07 — Repeated complaints, confusing behavior, support workarounds….** **Requirement:** Repeated complaints, confusing behavior, support workarounds, accessibility barriers, unsafe use, and common failures MUST be summarized for accountable product and engineering owners. Convert recurring risks into requirements, defects, documentation, controls, or product decisions with traceable follow-up.
- **EXT-01.08 — Support measures MAY include response and resolution times….** **Requirement:** Support measures MAY include response and resolution times, backlog age, reopen rate, user impact, and satisfaction, but MUST be interpreted with case complexity, safety, fairness, and quality. Do not reward fast closure at the expense of accurate diagnosis or user outcome.

**Rule document:** [rules/01-customer-user-and-community-support-operations.md](rules/01-customer-user-and-community-support-operations.md)

**Enforcement:** [tests/test_01_customer_user_and_community_support_operations.py](tests/test_01_customer_user_and_community_support_operations.py)
### EXT-02 — Feedback Complaints Accessibility and Dispute Handling

**Objective.** Complaints and feedback are controlled signals about unmet expectations, harm, defects, accessibility barriers, and trust. The process must be easy to find, impartial, timely, reviewable, and linked to improvement while respecting customer rights and privacy.

**Requirements traced:** ORG-005, ORG-031–ORG-032, ORG-042, ED-033

**Normative requirements:**

- **EXT-02.01 — Publish how users, customers, and partners can….** **Requirement:** Publish how users, customers, and partners can provide feedback or complain, what information is useful, expected acknowledgment/update, available accessibility alternatives, escalation, and any external dispute or regulator route required by applicable terms/law.
- **EXT-02.02 — On receipt, assign an owner, case ID….** **Requirement:** On receipt, assign an owner, case ID, acknowledgment, category, severity, affected people, urgency, and next update. Assess actual or potential harm, privacy/security, accessibility, financial impact, repeated pattern, and whether the complainant needs an immediate protective action.
- **EXT-02.03 — The investigator MUST be independent of the disputed decision….** **Requirement:** The investigator MUST be independent of the disputed decision where practical, preserve relevant records, hear the complainant and affected parties fairly, distinguish facts from assumptions, and identify applicable product, policy, contract, and legal requirements.
- **EXT-02.04 — The decision-maker MUST state findings, rationale, corrective….** **Requirement:** The decision-maker MUST state findings, rationale, corrective action or remedy, owner, timeline, and review/appeal route. A responder MUST not promise refund, service credit, admission, legal position, or roadmap change outside delegated authority.
- **EXT-02.05 — Provide status and outcome within the stated timeframe….** **Requirement:** Provide status and outcome within the stated timeframe and confidentiality limits. If delayed, explain the reason, owner, next update date, and escalation route; do not leave the complainant to repeatedly chase an unowned case.
- **EXT-02.06 — When a complaint concerns legal rights, safety….** **Requirement:** When a complaint concerns legal rights, safety, discrimination, security, privacy, or a high-impact product decision, route it to the appropriate specialist process. Internal complaint handling MUST not block a user from applicable external rights or remedy.
- **EXT-02.07 — Review recurring themes by product, version, user….** **Requirement:** Review recurring themes by product, version, user group, workflow, and impact. Assign corrective action to root causes; verify later whether complaint recurrence, defect, or barrier decreased, and communicate material product changes.

**Rule document:** [rules/02-feedback-complaints-accessibility-and-dispute-handling.md](rules/02-feedback-complaints-accessibility-and-dispute-handling.md)

**Enforcement:** [tests/test_02_feedback_complaints_accessibility_and_dispute_handling.py](tests/test_02_feedback_complaints_accessibility_and_dispute_handling.py)
### EXT-03 — Public Statements Product Claims and Marketing Content

**Objective.** External-facing claims shape user decisions and organizational obligations. Product, security, privacy, licensing, performance, accessibility, model, and commercial statements must be accurate, scoped, evidenced, approved, and corrected when they become stale.

**Requirements traced:** ORG-030, ORG-002, ORG-021, ORG-040, ED-012, ED-030–ED-033, ED-040–ED-041

**Normative requirements:**

- **EXT-03.01 — Each public channel and content type MUST have….** **Requirement:** Each public channel and content type MUST have an owner, authorized publisher, subject-matter reviewers, approval path, and correction process. Material claims involving security, privacy, legal rights, license, availability, support, or commercial terms MUST receive relevant specialist review.
- **EXT-03.02 — A claim MUST identify the product/profile/version, tested conditions….** **Requirement:** A claim MUST identify the product/profile/version, tested conditions, limitations, date/evidence, and source owner. Performance, accuracy, hardware support, model quality, security, accessibility, privacy, and reliability claims MUST match reproducible evidence and actual supported behavior.
- **EXT-03.03 — Reviewers MUST assess likely user interpretation, omitted conditions….** **Requirement:** Reviewers MUST assess likely user interpretation, omitted conditions, comparison baseline, target audience, and whether a prototype or aspiration could be mistaken for a shipped guarantee. Disclaimers MUST not contradict a headline or obscure a material limitation.
- **EXT-03.04 — Use of customer names, testimonials, partner marks….** **Requirement:** Use of customer names, testimonials, partner marks, certification symbols, standards references, model/provider names, or endorsements MUST have permission, accurate context, rights review, and current verification. Never imply certification or independent validation that has not occurred.
- **EXT-03.05 — Pricing, licensing, warranty, support level….** **Requirement:** Pricing, licensing, warranty, support level, privacy notice, data use, service level, roadmap, and legal terms MUST come from an approved source and authorized owner. Content editors MUST not improvise an enforceable commitment.
- **EXT-03.06 — Assign each material page, release note, demo….** **Requirement:** Assign each material page, release note, demo, social post, and sales artifact an owner and review trigger. Update or remove stale claims when the product, model, license, vulnerability status, supported profile, or commitment changes.
- **EXT-03.07 — When a published statement is materially false or misleading….** **Requirement:** When a published statement is materially false or misleading, notify the accountable owner, assess affected users and obligations, correct the source and downstream copies, and communicate the correction through a proportionate channel. Preserve evidence of what was changed and when.
- **EXT-03.08 — Before publishing, verify rights and approvals for code….** **Requirement:** Before publishing, verify rights and approvals for code, imagery, user stories, screenshots, telemetry, support cases, employee identities, and customer data. Redact secrets and identifying data; use explicit consent and approved retention for testimonials or case studies.

**Rule document:** [rules/03-public-statements-product-claims-and-marketing-content.md](rules/03-public-statements-product-claims-and-marketing-content.md)

**Enforcement:** [tests/test_03_public_statements_product_claims_and_marketing_content.py](tests/test_03_public_statements_product_claims_and_marketing_content.py)
### EXT-04 — External Incident and Stakeholder Communications

**Objective.** External incident communications must be coordinated, truthful, timely, privacy-preserving, and consistent with legal, contractual, and user-safety obligations. Technical investigation, customer service, legal review, and public communication must have distinct responsibilities that coordinate under one incident authority.

**Requirements traced:** ORG-030–ORG-032, ORG-040–ORG-042, SO-004, SO-012–SO-014, SO-030–SO-033

**Normative requirements:**

- **EXT-04.01 — Each supported service profile MUST identify who declares….** **Requirement:** Each supported service profile MUST identify who declares an incident, approves customer notices, handles media/regulator contact, prepares technical facts, and tracks affected users. Include deputies and a channel to reach them outside ordinary work hours where the service promise requires it.
- **EXT-04.02 — For suspected security, privacy, safety, data….** **Requirement:** For suspected security, privacy, safety, data loss, or widespread availability incidents, the incident lead MUST identify affected products, users, data, jurisdictions, contracts, evidence, and potential notification deadlines. Route to qualified counsel/privacy/security owners immediately; do not wait for full root-cause certainty to begin obligation assessment.
- **EXT-04.03 — Every update MUST distinguish confirmed facts, active investigation….** **Requirement:** Every update MUST distinguish confirmed facts, active investigation, unknowns, user actions, containment, support path, next update, and timestamp. Do not speculate about cause, scope, attribution, or resolution; correct earlier statements when evidence changes.
- **EXT-04.04 — Notices MUST avoid exposing credentials, exploit detail that….** **Requirement:** Notices MUST avoid exposing credentials, exploit detail that increases harm, personal data of other people, confidential customer information, or evidence that would compromise response. Provide specific mitigations users can safely follow and an accessible contact route.
- **EXT-04.05 — Use approved channels to reach directly affected customers….** **Requirement:** Use approved channels to reach directly affected customers, public users, partners, regulators, and internal responders as applicable. Maintain a canonical notice; ensure support, status page, account contacts, and public statements do not contradict it.
- **EXT-04.06 — The incident lead MUST set the next update time….** **Requirement:** The incident lead MUST set the next update time based on impact and obligations even if investigation is ongoing. Closure communication MUST state resolved status, remaining risk, user action, remediation/support path, and where a later post-incident report will appear.
- **EXT-04.07 — After incident closure, assess timeliness, accuracy….** **Requirement:** After incident closure, assess timeliness, accuracy, audience reach, accessibility, privacy, support readiness, and approval bottlenecks. Correct any affected claim and update contact lists, playbooks, training, controls, and contracts.

**Rule document:** [rules/04-external-incident-and-stakeholder-communications.md](rules/04-external-incident-and-stakeholder-communications.md)

**Enforcement:** [tests/test_04_external_incident_and_stakeholder_communications.py](tests/test_04_external_incident_and_stakeholder_communications.py)

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/stakeholder-relations
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
