# Reference Trails: Organization governance and decision authority

**Development stage:** DDD

This domain assigns controls to the people and teams who perform the work. Functional ownership is required even when the organization has no dedicated job title or department. Sources inform the project rules; they do not establish certification or override jurisdiction-specific obligations.

## Control authoring and assessment basis

Controls use outcome-based requirements and evidence assessment methods informed by [NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) and [NIST SP 800-53A Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final). Normative terms follow [IETF BCP 14](https://www.rfc-editor.org/info/bcp14/).

## Sources

### R1 — ISO 37000:2021 Governance of organizations — Guidance

[ISO 37000:2021 Governance of organizations — Guidance](https://www.iso.org/standard/65036.html)

### R2 — NIST Cybersecurity Framework 2.0

[NIST Cybersecurity Framework 2.0](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf)

### R3 — ISO 37301:2021 Compliance management systems — Requirements with guidance for use

[ISO 37301:2021 Compliance management systems — Requirements with guidance for use](https://committee.iso.org/sites/tc309/home/projects/published/iso-37301-compliance-management.html)

### R4 — ISO 37002:2021 Whistleblowing management systems — Guidelines

[ISO 37002:2021 Whistleblowing management systems — Guidelines](https://committee.iso.org/sites/tc309/home/projects/published/iso-37002-whistleblowing-managem.html)

### R5 — ISO 37009:2025 Conflict of interest in organizations — Guidance

[ISO 37009:2025](https://www.iso.org/standard/74095.html)

### R6 — ISO 37003:2025 Fraud control management systems — Guidance

[ISO 37003:2025](https://www.iso.org/standard/37003?browse=tc)

## Rule mapping

| Rule document | Requirement IDs | Source trail |
|---|---|---|
| [01-functional-roles-accountability-and-decision-rights.md](../rules/01-functional-roles-accountability-and-decision-rights.md) | ORG-001–ORG-003, PA-010–PA-014, SO-001–SO-005, SO-010–SO-014 | R1,R2 |
| [02-ethical-conduct-conflicts-of-interest-and-protected-reporting.md](../rules/02-ethical-conduct-conflicts-of-interest-and-protected-reporting.md) | ORG-004–ORG-005, SO-001–SO-005, SO-010–SO-014, ED-014 | R1,R3–R6 |
| [03-compliance-risk-and-obligation-management.md](../rules/03-compliance-risk-and-obligation-management.md) | ORG-040–ORG-042, SO-014, ED-014 | R1,R2,R3 |
| [04-spending-procurement-and-organizational-commitments.md](../rules/04-spending-procurement-and-organizational-commitments.md) | ORG-044, ORG-002–ORG-003, ORG-033, PA-001–PA-004 | R1,R2 |

## Person-action coverage map

Use this map to locate the rules for a person’s action, decision, or transition. The accountable functional owner must be assigned in the approved role map; control IDs define minimum evidence and escalation.

| Person action | Primary controls | Owner and required evidence |
|---|---|---|
| Set organization purpose, policy, authority, and risk acceptance | ORG-01, ORG-03; GOV-01, GOV-03 | Authorized decision owner; approved scope, rationale, stakeholder impact, risk record |
| Recruit, select, authorize, train, or supervise a person | PPL-01, PPL-02, PPL-06; SEC-12 | People sponsor, hiring/role owner, access owner; job criteria, offer approval, training and access evidence |
| Accept, prioritize, perform, review, or close work | PPL-04; COL-01, COL-03; CHG-01–CHG-05; applicable technical domain | Work owner/reviewer; scope, acceptance criteria, dependencies, checks, handoff/closure |
| Change duties, take leave, hand over, or separate | PPL-01, PPL-05; SEC-12; COL-02; OPS-06 | People sponsor and resource owners; access revocation, coverage, records and knowledge transfer |
| Access, use, or administer systems, data, devices, or workspaces | SEC-02–SEC-13; PPL-01; COL-04 | Resource/security owner; authorization, training, tool/data classification, review/expiry |
| Meet, communicate, approve, delegate, or record decisions | ORG-01; COL-01–COL-03; GOV-01, GOV-04 | Decision owner/facilitator; authority, consulted parties, durable record, action owner |
| Buy, spend, contract, renew, or create a commitment | ORG-04; VEND-01–VEND-05; EXT-03 | Sponsor and finance/legal/security/privacy reviewers as applicable; authority, due diligence, cost and exit evidence |
| Support users, receive feedback, handle complaints, or resolve disputes | EXT-01–EXT-02 | Support/case owner; acknowledgment, classification, privacy, investigation, remedy, closure |
| Publish claims, marketing, release or incident statements | EXT-03–EXT-04; LIC-01–LIC-05; applicable release/security controls | Authorized publisher plus subject-matter reviewers; evidence, scope, approval, correction path |
| Report misconduct, risk, safety issue, security/privacy concern, or incident | ORG-02–ORG-03; SEC-07, SEC-11; OPS-04; EXT-04 | Protected/independent intake and incident lead; triage, evidence, escalation, status and closure |
| Work on duty, respond, recover service, or transfer operational coverage | OPS-01–OPS-06; OBS-01–OBS-05; SEC-12 | Service/incident owner and delegate; supported promise, named access, handover, recovery proof |
| Create, retain, correct, archive, disclose, or dispose of a record | COL-02; PERS-03–PERS-05; SEC-09 | Record/data owner; purpose, access, retention/hold, integrity, deletion evidence |
| Submit or approve time, leave, expenses, or resource use | PPL-05; ORG-04 | Person submitting and authorized approver; accurate evidence, budget, privacy, reconciliation |
| Set expectations, provide feedback, recognize performance, or take corrective action | PPL-02, PPL-07; ORG-046 | Manager/reviewer and authorized people owner; expectations, evidence, fair review, protected record |
| Learn from findings, complaints, near misses, or incidents | ORG-03; GOV-03, GOV-05; OPS-04; CHG-03 | Corrective-action owner; cause, action, deadline, control update, effectiveness retest |
| Protect physical assets, remote work, travel, and visitor access | SEC-13; PPL-03 | Workplace/asset owner; fit-for-risk safeguards, custody, reporting and disposal evidence |


## Lifecycle coverage map (assessed status)

This map is a rules-text coverage inventory only; it does not establish that product implementation conforms. Each unresolved row is an explicit gap under GOV-03.06. Before claiming coverage, the domain owner records the scenario/risk and relevant requirement IDs from the rule mapping above, performs a documented review and representative ordinary plus adverse-case dry-run, and links evidence in the [governance assurance register](../../governance/assurance-register.md). Interim safeguard: apply all clearly applicable controls and do not pass a release-critical gate while applicability remains unresolved.

| Lifecycle area | Disposition | Coverage rationale/status | Affected requirements/scenarios | Interim safeguard | Owner | Review trigger |
|---|---|---|---|---|---|---|
| Organizational governance | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Product intent | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| System architecture | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Component/module design | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Interfaces | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Implementation | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Verification | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Release | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Operation | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Incident response | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |
| Retirement | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |

## Maintenance

Review after organization, product, jurisdiction, staffing, support promise, or workflow changes; after incidents and complaints; and at least once per major release. Assign gaps and exclusions to an owner with rationale and review trigger. Keep role titles and named owners in the approved organization map, not hard-coded into generic controls.
