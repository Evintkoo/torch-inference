# Reference Trails: Deployment and operations

**Development stage:** EDD

This document records the authoritative sources used to develop this domain. The numbered rule documents state the project obligations directly; source documents inform their scope and verification. A reference is not a claim of certification or compliance.

## Control authoring and assessment basis

The project control format uses outcome-focused, independently assessable requirements informed by [NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final). Assessment procedures use the examine, interview, and test method model from [NIST SP 800-53A Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final), tailored to repository evidence and software behavior. Normative terms follow [IETF BCP 14 (RFC 2119 and RFC 8174)](https://www.rfc-editor.org/info/bcp14/). These sources define how project rules are written and assessed; their inclusion does not claim adoption of a NIST baseline or certification.

## Sources

### R1 — NIST SSDF SP 800-218

[NIST SSDF SP 800-218](https://csrc.nist.gov/pubs/sp/800/218/final)

### R2 — Docker build best practices

[Docker build best practices](https://docs.docker.com/build/building/best-practices/)

### R3 — Google SRE: Monitoring Distributed Systems

[Google SRE: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)

### R4 — ISO 37000:2021 Governance of organizations — Guidance

[ISO 37000:2021](https://www.iso.org/standard/65036.html)

### R5 — NIST SP 800-61 Rev. 3 Incident Response Recommendations

[NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)

## Rule mapping

| Rule document | Requirement IDs | Source trail |
|---|---|---|
| [01-service-lifecycle-and-readiness.md](../rules/01-service-lifecycle-and-readiness.md) | RP-030–RP-031, RP-034, SO-022–SO-024, SO-030–SO-033 | R1,R2 |
| [02-reliability-slos-and-recovery.md](../rules/02-reliability-slos-and-recovery.md) | RP-030–RP-031, RP-034, SO-022–SO-024, SO-030–SO-033 | R1,R2 |
| [03-installation-service-managers-and-deployment-profiles.md](../rules/03-installation-service-managers-and-deployment-profiles.md) | RP-020–RP-024, RP-030 | R1,R2 |
| [04-incident-response-and-operational-recovery.md](../rules/04-incident-response-and-operational-recovery.md) | SO-013, SO-030–SO-033, RP-030–RP-034 | R1,R3,R5 |
| [05-capacity-readiness-and-operator-change-management.md](../rules/05-capacity-readiness-and-operator-change-management.md) | RP-030–RP-034, SO-022, SO-030–SO-032 | R1,R2 |
| [06-operational-roles-coverage-handover-and-human-continuity.md](../rules/06-operational-roles-coverage-handover-and-human-continuity.md) | ORG-001, ORG-011, ORG-022–ORG-023, ORG-042, RP-030–RP-034, SO-030–SO-033 | R3,R4 |

## Coverage review

| Operational human activity | Controls | Evidence |
|---|---|---|
| Assign owner/delegate and incident authority | OPS-01, OPS-04, OPS-06 | Current service role map and escalation exercise |
| Perform routine operation and duty handover | OPS-01–OPS-03, OPS-06 | Runbook, named access, acknowledged handoff |
| Recover service and communicate status | OPS-02, OPS-04, OPS-06 | Recovery test, incident log, customer update |
| Review capacity, fatigue, and continuity | OPS-05–OPS-06 | Capacity review, key-person/supplier exercise |


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

Use stable versioned identifiers when a source changes its numbering. Review these references at least once per major release and whenever a referenced standard publishes a new stable version. Update the numbered rule text and this trail together; do not copy large portions of external standards.
