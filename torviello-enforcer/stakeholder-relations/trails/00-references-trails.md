# Reference Trails: Customer, community, and public commitments

**Development stage:** SDD

This domain assigns controls to the people and teams who perform the work. Functional ownership is required even when the organization has no dedicated job title or department. Sources inform the project rules; they do not establish certification or override jurisdiction-specific obligations.

## Control authoring and assessment basis

Controls use outcome-based requirements and evidence assessment methods informed by [NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) and [NIST SP 800-53A Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final). Normative terms follow [IETF BCP 14](https://www.rfc-editor.org/info/bcp14/).

## Sources

### R1 — ISO 37000:2021 Governance of organizations — Guidance

[ISO 37000:2021 Governance of organizations — Guidance](https://www.iso.org/standard/65036.html)

### R2 — NIST Cybersecurity Framework 2.0

[NIST Cybersecurity Framework 2.0](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf)

### R3 — ISO 10002:2018 Quality management — Customer satisfaction — Guidelines for complaints handling in organizations

[ISO 10002:2018 Quality management — Customer satisfaction — Guidelines for complaints handling in organizations](https://www.iso.org/standard/71580.html)

### R4 — ISO 10001:2018 Quality management — Customer satisfaction — Guidelines for codes of conduct for organizations

[ISO 10001:2018 Quality management — Customer satisfaction — Guidelines for codes of conduct for organizations](https://www.iso.org/standard/71579.html)

### R5 — NIST SP 800-61 Rev. 3 Incident Response Recommendations

[NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)

## Rule mapping

| Rule document | Requirement IDs | Source trail |
|---|---|---|
| [01-customer-user-and-community-support-operations.md](../rules/01-customer-user-and-community-support-operations.md) | ORG-030–ORG-032, PA-001–PA-004, SO-002–SO-005, SO-030–SO-033 | R1,R2,R3 |
| [02-feedback-complaints-accessibility-and-dispute-handling.md](../rules/02-feedback-complaints-accessibility-and-dispute-handling.md) | ORG-005, ORG-031–ORG-032, ORG-042, ED-033 | R1,R3 |
| [03-public-statements-product-claims-and-marketing-content.md](../rules/03-public-statements-product-claims-and-marketing-content.md) | ORG-030, ORG-002, ORG-021, ORG-040, ED-012, ED-030–ED-033, ED-040–ED-041 | R1,R2,R4 |
| [04-external-incident-and-stakeholder-communications.md](../rules/04-external-incident-and-stakeholder-communications.md) | ORG-030–ORG-032, ORG-040–ORG-042, SO-004, SO-012–SO-014, SO-030–SO-033 | R1,R2,R5 |


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
