# Reference Trails: Rule governance and agent standards

**Development stage:** EDD

This domain governs the rule system itself, including the instructions followed by human contributors and coding agents. Project controls state required behavior; external sources inform control design and review practice. Citing a source does not claim compliance or certification.

## Control authoring and assessment basis

The control structure uses outcome-focused requirements and assessment methods informed by [NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) and [NIST SP 800-53A Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final). Normative terms follow [IETF BCP 14 (RFC 2119 and RFC 8174)](https://www.rfc-editor.org/info/bcp14/). The software-development and evidence lifecycle also draws on [NIST SP 800-218 SSDF](https://csrc.nist.gov/pubs/sp/800/218/final).

## Sources

### R1 — NIST SP 800-53 Rev. 5, Release 5.2.0

[NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)

### R2 — NIST SP 800-218 Secure Software Development Framework

[NIST SP 800-218 SSDF](https://csrc.nist.gov/pubs/sp/800/218/final)

### R3 — Google Engineering Practices: Code Review

[The Standard of Code Review](https://google.github.io/eng-practices/review/reviewer/standard.html)

### R4 — Martin Fowler: Domain-Driven Design and Bounded Context

[Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html), [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html)

### R5 — Pact: Contract Testing

[Contract Testing](https://docs.pact.io/)

### R6 — Martin Fowler: Test-Driven Development

[Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## Rule mapping

| Rule document | Requirement IDs | Source trail |
|---|---|---|
| [01-rule-hierarchy-and-authority.md](../rules/01-rule-hierarchy-and-authority.md) | CSC-002, CSC-010, ED-042, PA-010–PA-014 | R1,R2 |
| [02-normative-rule-writing-and-control-quality.md](../rules/02-normative-rule-writing-and-control-quality.md) | CSC-002, CSC-005, CSC-010, ED-042 | R1,R2 |
| [03-coverage-risk-analysis-and-rule-evolution.md](../rules/03-coverage-risk-analysis-and-rule-evolution.md) | CSC-001, CSC-002, CSC-004, CSC-010, ED-014, ED-042 | R1,R2 |
| [04-agent-operating-and-change-evidence-standard.md](../rules/04-agent-operating-and-change-evidence-standard.md) | CSC-002, CSC-005, CSC-006, CSC-010, ED-011, ED-042 | R2,R3 |
| [05-exceptions-conformance-and-control-assurance.md](../rules/05-exceptions-conformance-and-control-assurance.md) | CSC-002, CSC-005, CSC-006, CSC-010, ED-014, ED-042 | R1,R2 |
| [06-domain-driven-design.md](../rules/06-domain-driven-design.md) | CSC-005, ED-050, ED-055 | R2,R4 |
| [07-specification-driven-development.md](../rules/07-specification-driven-development.md) | CSC-005, ED-011, ED-042, ED-051, ED-055 | R2,R4 |
| [08-contract-driven-development.md](../rules/08-contract-driven-development.md) | CSC-005, ED-052, ED-055 | R5 |
| [09-test-driven-development.md](../rules/09-test-driven-development.md) | CSC-009, ED-010, ED-011, ED-053, ED-055 | R2,R6 |
| [10-evaluation-driven-development.md](../rules/10-evaluation-driven-development.md) | ED-014, ED-042, ED-054, ED-055 | R1,R2 |
| [11-work-item-tracking-and-role-memory.md](../rules/11-work-item-tracking-and-role-memory.md) | CSC-005, ED-011, ED-042, ORG-001, ORG-002, PDL-010, PDL-011, PDL-013, PDL-014 | R2,R3 |
| [12-independent-unit-packaging.md](../rules/12-independent-unit-packaging.md) | CSC-005, ED-011, ED-042, ENG-026, PDL-013 | R1,R2 |

## Coverage review

| Lifecycle area | Primary controls | Review outcome |
|---|---|---|
| Organizational and instruction authority | GOV-01, GOV-03 | Applicable; resolve precedence and ownership before acting |
| Requirements, architecture, and design decisions | GOV-01–GOV-03 | Applicable; preserve approved product decisions and record tradeoffs |
| Rule authoring and maintenance | GOV-02, GOV-03 | Applicable; test clarity, traceability, scope, and evidence |
| Agent-assisted implementation and verification | GOV-04 | Applicable; inspect scope, untrusted input handling, actual checks, and report accuracy |
| Release, assessment, exceptions, and corrective action | GOV-03, GOV-05 | Applicable; require scoped evidence, accountable approval, expiry, and retest |
| Incident feedback and retirement | GOV-03, GOV-05 | Applicable; update controls from evidence and preserve replacement history |
| Domain-Driven Design | GOV-06 | Applicable; require domain model, invariants, ownership, and forward trace |
| Specification-Driven Development | GOV-07 | Applicable; require testable requirements, acceptance criteria, and resolvable IDs |
| Contract-Driven Development | GOV-08 | Applicable; require machine-readable contracts and contract tests |
| Test-Driven Development | GOV-09 | Applicable; require failing-first tests, categorized suites, and no weakening |
| Evaluation-Driven Development | GOV-10 | Applicable; require pre-established thresholds, dated report, and release decision |
| Work item tracking and role memory | GOV-11 | Applicable; require a ticket before committed work, append-only evidence, role ownership, and validated state |


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
| Development workflow (DDD → SDD → CDD → TDD → EDD) | unresolved | No dated coverage review or dry-run is recorded; risk is running stages in isolation or skipping traceability | ED-050–ED-055; scenario: a change ships without stage artifacts, traceability, or evaluation evidence | Apply GOV-06–GOV-10; do not pass a release gate while stage evidence is missing | Domain owner | Before the next material change and each major release |
| Work item tracking and session memory | unresolved | No dated coverage review or dry-run is recorded; risk is untracked work, stale status, or lost handoff context | CSC-005, ED-011, ED-042, ORG-001, ORG-002, PDL-010–PDL-014; scenario: a session reports progress that the store and committed evidence do not support | Apply GOV-11 and validate the ticket store before relying on a status | Domain owner | Before the next material change and each major release |
| Retirement | unresolved | No dated coverage review or dry-run is recorded; risk is omitting a control at this lifecycle stage | All requirement IDs mapped above; scenario: work crosses this stage without a named owner, control, or evidence | Apply clearly relevant controls; do not pass release-critical gates while applicability is unresolved | Domain owner | Before the next material change and each major release |

## Maintenance

Review the hierarchy when repository instructions or platform constraints change; review agent controls after material agent incidents or tool/workflow changes; review all controls after requirement changes and major releases. Update source links, rule mappings, and coverage outcomes in the same change as the affected controls.

Applicability and assessment entries, exception status, and procedure dry-run evidence are indexed in the [governance assurance register](../assurance-register.md). A domain coverage row is a navigation aid, not evidence by itself; use a dated review linked from the register for completed dispositions.
