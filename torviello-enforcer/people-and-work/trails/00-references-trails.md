# Reference Trails: People, competence, and work execution

**Development stage:** DDD

This domain assigns controls to the people and teams who perform the work. Functional ownership is required even when the organization has no dedicated job title or department. Sources inform the project rules; they do not establish certification or override jurisdiction-specific obligations.

## Control authoring and assessment basis

Controls use outcome-based requirements and evidence assessment methods informed by [NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) and [NIST SP 800-53A Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final). Normative terms follow [IETF BCP 14](https://www.rfc-editor.org/info/bcp14/).

## Sources

### R1 — NIST SP 800-53 Rev. 5, Release 5.2.0

[NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)

### R2 — ISO 30201:2026 Human resources management systems — Requirements

[ISO 30201:2026 Human resources management systems — Requirements](https://www.iso.org/standard/90923.html)

### R3 — ISO 37303:2025 Compliance management systems — Guidelines for competence management

[ISO 37303:2025 Compliance management systems — Guidelines for competence management](https://www.iso.org/standard/37303?browse=tc)

### R4 — ISO 37002:2021 Whistleblowing management systems — Guidelines

[ISO 37002:2021 Whistleblowing management systems — Guidelines](https://committee.iso.org/sites/tc309/home/projects/published/iso-37002-whistleblowing-managem.html)

### R5 — ISO 30405:2023 Human resource management — Guidelines on recruitment

[ISO 30405:2023](https://www.iso.org/standard/79488.html)

## Rule mapping

| [07-performance-development-recognition-and-corrective-action.md](../rules/07-performance-development-recognition-and-corrective-action.md) | ORG-010, ORG-013, ORG-042, ORG-046, ED-014 | R1,R2,R3 |
| [05-work-time-availability-leave-and-expense-integrity.md](../rules/05-work-time-availability-leave-and-expense-integrity.md) | ORG-011, ORG-044, ORG-010, ORG-013 | R1,R2 |
| [06-recruitment-selection-and-hiring-decisions.md](../rules/06-recruitment-selection-and-hiring-decisions.md) | ORG-010, ORG-045, ORG-001–ORG-003, ORG-013 | R1,R2,R5 |
| Rule document | Requirement IDs | Source trail |
|---|---|---|
| [01-joining-role-change-leave-and-separation.md](../rules/01-joining-role-change-leave-and-separation.md) | ORG-001, ORG-010–ORG-011, SO-001–SO-005, SO-010–SO-014 | R1,R2 |
| [02-competence-training-supervision-and-delegation.md](../rules/02-competence-training-supervision-and-delegation.md) | ORG-001–ORG-003, ORG-010, ORG-012, SO-001–SO-005, SO-010–SO-014 | R1,R2,R3 |
| [03-respectful-accessible-and-safe-work.md](../rules/03-respectful-accessible-and-safe-work.md) | ORG-005, ORG-013, ORG-042, SO-004, ED-033 | R1,R2,R4 |
| [04-work-intake-prioritization-and-individual-execution.md](../rules/04-work-intake-prioritization-and-individual-execution.md) | ORG-020, ORG-001–ORG-003, ED-005, ED-011 | R1,R2 |


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
