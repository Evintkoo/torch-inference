# organization domain

**Development stage:** DDD

This directory contains 4 normative control document(s) and the generated enforcement tests for the **organization** domain (Organization governance and decision authority). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| ORG-01 | [01-functional-roles-accountability-and-decision-rights.md](rules/01-functional-roles-accountability-and-decision-rights.md) | ORG-001–ORG-003, PA-010–PA-014, SO-001–SO-005, SO-010–SO-014 | [tests/test_01_functional_roles_accountability_and_decision_rights.py](tests/test_01_functional_roles_accountability_and_decision_rights.py) | Functional Roles Accountability and Decision Rights |
| ORG-02 | [02-ethical-conduct-conflicts-of-interest-and-protected-reporting.md](rules/02-ethical-conduct-conflicts-of-interest-and-protected-reporting.md) | ORG-004–ORG-005, SO-001–SO-005, SO-010–SO-014, ED-014 | [tests/test_02_ethical_conduct_conflicts_of_interest_and_protected_reporting.py](tests/test_02_ethical_conduct_conflicts_of_interest_and_protected_reporting.py) | Ethical Conduct Conflicts of Interest and Protected Reporting |
| ORG-03 | [03-compliance-risk-and-obligation-management.md](rules/03-compliance-risk-and-obligation-management.md) | ORG-040–ORG-042, SO-014, ED-014 | [tests/test_03_compliance_risk_and_obligation_management.py](tests/test_03_compliance_risk_and_obligation_management.py) | Compliance Risk and Obligation Management |
| ORG-04 | [04-spending-procurement-and-organizational-commitments.md](rules/04-spending-procurement-and-organizational-commitments.md) | ORG-044, ORG-002–ORG-003, ORG-033, PA-001–PA-004 | [tests/test_04_spending_procurement_and_organizational_commitments.py](tests/test_04_spending_procurement_and_organizational_commitments.py) | Spending Procurement and Organizational Commitments |

## Detailed controls

### ORG-01 — Functional Roles Accountability and Decision Rights

**Objective.** People must know which outcomes they own, what authority they can exercise, who must review a decision, and who accepts residual risk. Clear authority is required for routine work, exceptions, emergencies, external commitments, and succession.

**Requirements traced:** ORG-001–ORG-003, PA-010–PA-014, SO-001–SO-005, SO-010–SO-014

**Normative requirements:**

- **ORG-01.01 — The organization MUST maintain a current map of functions….** **Requirement:** The organization MUST maintain a current map of functions that perform product, engineering, security, privacy, legal/compliance coordination, finance/procurement, people operations, release, operations, support, and external communications as applicable. For each material workflow, identify one accountable owner, responsible performer(s), required consulted roles, informed parties, and delegate/escalation path; do not require a dedicated job title for every function.
- **ORG-01.02 — For architecture, security/privacy risk, release, data….** **Requirement:** For architecture, security/privacy risk, release, data use, spending, contracts, customer promises, public claims, policy exceptions, and incident disclosure, define who proposes, reviews, approves, executes, and verifies the decision. Set thresholds using impact, irreversibility, exposure, cost, and affected parties; high-impact decisions MUST receive independent review where practical.
- **ORG-01.03 — A delegation MUST state scope, limits, start/end….** **Requirement:** A delegation MUST state scope, limits, start/end, records required, subdelegation rules, and conditions for escalation. The delegator remains accountable unless the governing policy explicitly transfers accountability; informal availability or seniority MUST NOT be treated as unlimited authority.
- **ORG-01.04 — Where one person can initiate, approve, execute….** **Requirement:** Where one person can initiate, approve, execute, and attest to the same high-impact transaction, the workflow MUST use independent approval, automated safeguards, retrospective review, or another documented compensating control. Apply separation proportionate to actual fraud, error, privacy, security, and release risk.
- **ORG-01.05 — When schedule, cost, quality, security….** **Requirement:** When schedule, cost, quality, security, privacy, accessibility, and customer impact conflict, the decision record MUST state the tradeoff, evidence, affected stakeholders, residual risk, accountable approver, and rejected alternatives. The most senior person’s preference alone is not a substitute for the required decision evidence.
- **ORG-01.06 — Every material responsibility MUST have an escalation route….** **Requirement:** Every material responsibility MUST have an escalation route for blocked decisions, unavailable owners, suspected wrongdoing, unsafe instructions, or urgent user impact. The route MUST include a delegate or coverage procedure; an unresolved escalation MUST not be silently treated as approval.
- **ORG-01.07 — Role changes, departures, new products, new….** **Requirement:** Role changes, departures, new products, new jurisdictions, material incidents, and changed risk MUST trigger review of affected authority, access, approval thresholds, and succession. Remove stale owner names and privileges promptly.

**Rule document:** [rules/01-functional-roles-accountability-and-decision-rights.md](rules/01-functional-roles-accountability-and-decision-rights.md)

**Enforcement:** [tests/test_01_functional_roles_accountability_and_decision_rights.py](tests/test_01_functional_roles_accountability_and_decision_rights.py)
### ORG-02 — Ethical Conduct Conflicts of Interest and Protected Reporting

**Objective.** People must be able to act honestly, identify conflicts, raise concerns, and receive impartial handling without retaliation. The process must protect reporters and subjects while preserving fair review and applicable legal obligations.

**Requirements traced:** ORG-004–ORG-005, SO-001–SO-005, SO-010–SO-014, ED-014

**Normative requirements:**

- **ORG-02.01 — The organization MUST maintain an accessible conduct policy covering….** **Requirement:** The organization MUST maintain an accessible conduct policy covering honesty in records and claims, respectful behavior, confidentiality, responsible system/data use, gifts and inducements, conflicts, misuse of authority, and how to raise concerns. The policy MUST identify accountable owners, applicable scope, training, review date, and consequences under approved procedures.
- **ORG-02.02 — A person MUST disclose an actual, potential….** **Requirement:** A person MUST disclose an actual, potential, or reasonably perceived conflict before participating in the affected hiring, procurement, model/vendor selection, security review, incident investigation, compensation, or commercial decision. The authorized reviewer MUST decide recusal, independent review, disclosure, or other mitigation and retain a proportionate record.
- **ORG-02.03 — Rules for gifts, hospitality, referral payments….** **Requirement:** Rules for gifts, hospitality, referral payments, personal investments, outside work, and use of organizational information MUST be set by the accountable owner and reviewed against applicable law and contract. A person MUST seek review before accepting an item or commitment that could influence a decision, create a conflict, or imply organizational endorsement.
- **ORG-02.04 — People MUST be able to report suspected wrongdoing….** **Requirement:** People MUST be able to report suspected wrongdoing, unsafe practice, policy breach, retaliation, privacy/security incident, or serious product harm through at least one route independent of the person implicated. The route MUST explain confidentiality limits, urgent escalation, evidence preservation, and available external/legal avenues where applicable.
- **ORG-02.05 — A designated handler MUST acknowledge, classify urgency….** **Requirement:** A designated handler MUST acknowledge, classify urgency and risk, preserve relevant evidence, check conflicts, assign an impartial investigator or reviewer, and communicate expected next steps. Reports involving leadership, the normal handler, or a conflict MUST be routed to an independent alternative.
- **ORG-02.06 — Access to reports and investigation records MUST be limited….** **Requirement:** Access to reports and investigation records MUST be limited to need-to-know roles. The process MUST prohibit retaliation, protect against unnecessary disclosure, allow a fair opportunity to respond where appropriate, and distinguish allegation, evidence, finding, and action.
- **ORG-02.07 — The handler MUST record disposition, actions, rationale….** **Requirement:** The handler MUST record disposition, actions, rationale, and any required escalation or legal hold. The reporter SHOULD receive a status or closure update within confidentiality limits; trends and control failures MUST inform corrective action without identifying people unnecessarily.

**Rule document:** [rules/02-ethical-conduct-conflicts-of-interest-and-protected-reporting.md](rules/02-ethical-conduct-conflicts-of-interest-and-protected-reporting.md)

**Enforcement:** [tests/test_02_ethical_conduct_conflicts_of_interest_and_protected_reporting.py](tests/test_02_ethical_conduct_conflicts_of_interest_and_protected_reporting.py)
### ORG-03 — Compliance Risk and Obligation Management

**Objective.** Organizational decisions must account for applicable law, contract, policy, security, safety, privacy, and product risk. Owners must identify obligations and uncertainty early, seek qualified advice where needed, and turn findings into controlled, verifiable actions.

**Requirements traced:** ORG-040–ORG-042, SO-014, ED-014

**Normative requirements:**

- **ORG-03.01 — For each product/service activity and operating jurisdiction….** **Requirement:** For each product/service activity and operating jurisdiction, an assigned owner MUST identify relevant legal, regulatory, contractual, license, privacy, accessibility, security, safety, and customer obligations. Record source, scope, applicability rationale, control owner, evidence, review trigger, and qualified adviser where interpretation is uncertain.
- **ORG-03.02 — Employees and agents MUST NOT make authoritative legal conclusions….** **Requirement:** Employees and agents MUST NOT make authoritative legal conclusions from a general rule, internet summary, or model output. When a decision affects employment, privacy, data residency, export controls, consumer rights, intellectual property, licensing, breach notification, or regulated use, route it to qualified counsel or an authorized specialist before commitment.
- **ORG-03.03 — A risk review MUST identify asset/person/stakeholder, threat….** **Requirement:** A risk review MUST identify asset/person/stakeholder, threat or failure scenario, likelihood and impact, exposure, existing safeguards, residual risk, treatment owner, approval authority, and review trigger. The depth of review MUST reflect harm, irreversibility, scale, and uncertainty.
- **ORG-03.04 — For each material risk, the owner MUST choose….** **Requirement:** For each material risk, the owner MUST choose avoid, reduce, transfer, or accept; state why, due date, interim safeguards, monitoring, and evidence. Risk acceptance MUST be explicit, time-bounded or trigger-bounded, and authorized by the owner accountable for the affected impact.
- **ORG-03.05 — A material change in jurisdiction, data use….** **Requirement:** A material change in jurisdiction, data use, product purpose, supplier, public claim, contract, deployment model, or user population MUST trigger an obligation and risk impact review before the change is made effective.
- **ORG-03.06 — A material incident, complaint, audit finding….** **Requirement:** A material incident, complaint, audit finding, near miss, or repeated exception MUST be analyzed for process, authority, competence, incentive, tooling, and control causes. Corrective actions MUST identify owners, dates, control updates, effectiveness checks, and residual risks.
- **ORG-03.07 — Compliance, risk, investigation, and corrective-action records….** **Requirement:** Compliance, risk, investigation, and corrective-action records MUST have restricted access, retention and deletion rules, integrity protection proportionate to their importance, and a legal-hold process. Personal data in those records MUST be minimized and handled under the approved privacy policy.

**Rule document:** [rules/03-compliance-risk-and-obligation-management.md](rules/03-compliance-risk-and-obligation-management.md)

**Enforcement:** [tests/test_03_compliance_risk_and_obligation_management.py](tests/test_03_compliance_risk_and_obligation_management.py)
### ORG-04 — Spending Procurement and Organizational Commitments

**Objective.** People must not create financial, contractual, data, service, or operational commitments without an authorized sponsor and a review proportionate to lifecycle cost and risk. Procurement and commitments include subscriptions, infrastructure, software, datasets, models, contractors, marketing, public promises, and renewals.

**Requirements traced:** ORG-044, ORG-002–ORG-003, ORG-033, PA-001–PA-004

**Normative requirements:**

- **ORG-04.01 — The accountable business owner MUST define spending and commitment….** **Requirement:** The accountable business owner MUST define spending and commitment classes, approval limits, budget authority, required finance/legal/security/privacy/procurement review, evidence, and renewal authority. Thresholds MUST consider total lifecycle cost, data access, lock-in, user impact, and exit cost rather than initial price alone.
- **ORG-04.02 — Before a material purchase or external commitment….** **Requirement:** Before a material purchase or external commitment, the sponsor MUST state the business/user need, expected outcome, constraints, alternatives including no purchase, evaluation criteria, full cost, risks, and measurable acceptance conditions. Selection rationale MUST be retained.
- **ORG-04.03 — Before granting a supplier or contractor sensitive information….** **Requirement:** Before granting a supplier or contractor sensitive information, production access, code contribution, model/data access, or operational responsibility, review capability, security/privacy controls, licensing, subcontractors, continuity, incident duties, data return/deletion, and termination rights as applicable.
- **ORG-04.04 — Only designated roles MAY sign agreements, accept terms….** **Requirement:** Only designated roles MAY sign agreements, accept terms, quote prices, promise features or service levels, or represent a roadmap as committed. Review obligations, implied warranties, data rights, support burden, accessibility, export/retention, indemnity, renewal, and termination before acceptance.
- **ORG-04.05 — A service or commitment owner MUST track usage….** **Requirement:** A service or commitment owner MUST track usage, total spend, renewals, budget thresholds, owner, business value, and cost anomalies. Unused or over-provisioned resources MUST be removed or justified; cost-saving actions MUST be checked for security, reliability, and user impact.
- **ORG-04.06 — Material scope, price, data, access….** **Requirement:** Material scope, price, data, access, subprocessor, support, jurisdiction, or contract changes MUST trigger reassessment and approval before taking effect. Renewal decisions MUST compare current value and alternatives and include a tested exit or export path when lock-in risk is material.
- **ORG-04.07 — At contract or project end, revoke access….** **Requirement:** At contract or project end, revoke access, return or delete information, recover assets, stop recurring charges, retain required records, transfer ownership, and verify closure. Record any retained data or continuing duty and its owner.

**Rule document:** [rules/04-spending-procurement-and-organizational-commitments.md](rules/04-spending-procurement-and-organizational-commitments.md)

**Enforcement:** [tests/test_04_spending_procurement_and_organizational_commitments.py](tests/test_04_spending_procurement_and_organizational_commitments.py)

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/organization
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
