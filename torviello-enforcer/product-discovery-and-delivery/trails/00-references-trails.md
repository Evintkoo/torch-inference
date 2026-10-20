# Reference Trails: Product discovery and delivery lifecycle

**Development stage:** SDD

This domain governs the lifecycle from an observed need through discovery, requirements, solution decisions, planning, acceptance, and post-release learning. These rules apply to humans, agents, teams, and delegated work. They complement technical domain controls: security, architecture, performance, accessibility, verification, operations, release, data, licensing, and organizational authority remain applicable throughout the lifecycle.

## Sources

### R1 — ISO/IEC/IEEE 29148:2018, Requirements Engineering

[ISO standard catalogue](https://www.iso.org/standard/72089.html). Used as the requirements engineering lifecycle and quality basis. The project restates requirements rather than claiming conformance.

### R2 — NIST SP 800-160 Vol. 1 Rev. 1, Engineering Trustworthy Secure Systems

[NIST publication](https://csrc.nist.gov/pubs/sp/800/160/v1/r1/final). Used for integrating stakeholder needs, risk, security requirements, validation, verification, and lifecycle thinking into engineering decisions.

### R3 — NASA Systems Engineering Handbook, NASA/SP-2016-6105 Rev. 2

[NASA handbook](https://www.nasa.gov/reference/systems-engineering-handbook/). Used for needs analysis, requirements development, alternatives, technical planning, verification, validation, and configuration control concepts. The project adapts these practices to its scale.

### R4 — IETF BCP 14 (RFC 2119 and RFC 8174)

[IETF BCP 14](https://www.rfc-editor.org/info/bcp14/). Defines interpretation of all-capital normative terms.

## Rule mapping

| Rule | Requirement IDs | Sources |
|---|---|---|
| [01-problem-discovery-and-evidence.md](../rules/01-problem-discovery-and-evidence.md) | PDL-001–PDL-005, PDL-016 | R1, R2, R3 |
| [02-requirements-engineering-and-quality.md](../rules/02-requirements-engineering-and-quality.md) | PDL-004–PDL-007, PDL-013–PDL-014, ED-011, ED-042 | R1, R2, R3 |
| [03-solution-alternatives-and-experimentation.md](../rules/03-solution-alternatives-and-experimentation.md) | PDL-005, PDL-008–PDL-009, PDL-016 | R1, R2, R3 |
| [04-prioritization-and-delivery-planning.md](../rules/04-prioritization-and-delivery-planning.md) | PDL-005, PDL-010–PDL-012, PDL-017, ED-042 | R1, R2, R3 |
| [05-acceptance-release-learning-and-retirement.md](../rules/05-acceptance-release-learning-and-retirement.md) | PDL-013–PDL-017, ED-011, ED-042 | R1, R2, R3 |

## Lifecycle coverage map

| Lifecycle stage | Control | Required evidence / boundary |
|---|---|---|
| Intake and source capture | PDL-01 | Need record, provenance, actor, owner |
| Discovery and problem framing | PDL-01 | Evidence, assumptions, impacts, confidence, unresolved questions |
| Requirements and constraints | PDL-02 | Stable IDs, rationale, qualities, test method, trace links |
| Alternatives and uncertainty reduction | PDL-03 | Decision record, experiment protocol/results, stop criteria |
| Prioritization and commitment | PDL-04 | Ordering rationale, authority, estimates, dependencies, contingencies |
| Build and change control | PDL-02/04 | Baseline, plan, scope/change review, linked technical rules |
| Verification, validation, and acceptance | PDL-05 | Requirement-to-check evidence, decision authority, limitations |
| Release, operation, and feedback | PDL-05 | Release decision, signals, incidents/feedback, review record |
| Decommission/retirement | PDL-05 | Users/data/dependencies migration or deletion, support and rollback/exit |

A domain control passes only when every applicable MUST is supported by current, reviewable evidence. “Not applicable” requires the condition and rationale. The listed project requirement IDs are normative outcomes; external references inform their design but do not establish certification. Review sources for current editions during rule maintenance and revalidate rules after incidents, major product decisions, or material changes in the manual review scope.

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
