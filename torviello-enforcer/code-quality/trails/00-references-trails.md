# Reference Trails: Code quality and maintainability

**Development stage:** TDD

This document records the authoritative sources used to develop this domain. The numbered rule documents state the project obligations directly; source documents inform their scope and verification. A reference is not a claim of certification or compliance.

## Control authoring and assessment basis

The project control format uses outcome-focused, independently assessable requirements informed by [NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final). Assessment procedures use the examine, interview, and test method model from [NIST SP 800-53A Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final), tailored to repository evidence and software behavior. Normative terms follow [IETF BCP 14 (RFC 2119 and RFC 8174)](https://www.rfc-editor.org/info/bcp14/). These sources define how project rules are written and assessed; their inclusion does not claim adoption of a NIST baseline or certification.

## Sources

### R1 — Clippy usage

[Clippy usage](https://doc.rust-lang.org/clippy/usage.html)

### R2 — Cargo features

[Cargo features](https://doc.rust-lang.org/cargo/reference/features.html)

### R3 — OWASP Logging Cheat Sheet

[OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

### R4 — Rust API Guidelines

[Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)

### R5 — Google Engineering Practices: Code Review

[The Standard of Code Review](https://google.github.io/eng-practices/review/reviewer/standard.html)

### R6 — Carnegie Mellon SEI: Managing Technical Debt

[Managing Technical Debt in Software-Intensive Systems](https://www.sei.cmu.edu/documents/2474/2016_015_001_450809.pdf)

## Rule mapping

| Rule document | Requirement IDs | Source trail |
|---|---|---|
| [01-format-lint-and-warning-policy.md](../rules/01-format-lint-and-warning-policy.md) | ED-001–ED-005, CSC-006–CSC-008 | R1,R2 |
| [02-dead-code-file-size-and-logging.md](../rules/02-dead-code-file-size-and-logging.md) | ED-001–ED-005, CSC-006–CSC-008 | R1,R2 |
| [03-rust-api-safety-errors-and-unsafe-code.md](../rules/03-rust-api-safety-errors-and-unsafe-code.md) | ED-001–ED-005 | R1,R4 |
| [04-static-analysis-and-supply-chain-quality.md](../rules/04-static-analysis-and-supply-chain-quality.md) | ED-001–ED-002, ED-014, ED-020 | R1,R2 |
| [05-maintainability-and-technical-debt.md](../rules/05-maintainability-and-technical-debt.md) | ED-002–ED-005, CSC-006–CSC-010 | R1,R4 |
| [06-system-level-maintainability-and-quality-attributes.md](../rules/06-system-level-maintainability-and-quality-attributes.md) | ED-001–ED-005, ED-014, ED-042, PA-010–PA-014, CSC-006–CSC-010 | R2,R5,R6 |
| [07-module-boundaries-cohesion-and-dependency-direction.md](../rules/07-module-boundaries-cohesion-and-dependency-direction.md) | ED-001–ED-005, ED-014, PA-010–PA-014, CSC-004, CSC-007 | R1,R4,R5 |
| [08-local-code-readability-types-and-control-flow.md](../rules/08-local-code-readability-types-and-control-flow.md) | ED-001–ED-003, ED-014, CSC-006–CSC-009 | R1,R4,R5 |
| [09-change-safe-refactoring-and-compatibility.md](../rules/09-change-safe-refactoring-and-compatibility.md) | ED-002–ED-005, ED-011, ED-013–ED-014, ED-023, CSC-005–CSC-010 | R2,R3,R5 |
| [10-technical-debt-and-maintainability-operations.md](../rules/10-technical-debt-and-maintainability-operations.md) | ED-002–ED-005, ED-014, CSC-006–CSC-010 | R2,R5,R6 |
| [11-function-design-and-implementation.md](../rules/11-function-design-and-implementation.md) | ED-001–ED-005, ED-010–ED-014, CSC-005–CSC-009, PDL-006–PDL-007, PDL-013–PDL-014 | R1,R4,R5 |

## Coverage review

| Level | Primary controls | Assessment focus |
|---|---|---|
| System/product | CQ-06 | Quality attributes, architecture, change amplification, operation, retirement |
| Module and interface | CQ-07 | Ownership, cohesion, dependencies, invariants, error contracts |
| Local implementation | CQ-03, CQ-08, CQ-11 | Function contract, type safety, control flow, effects, names, errors, resources, tests |
| Change and evolution | CQ-05, CQ-09 | Behavior preservation, compatibility, incremental migration, rollback |
| Portfolio and feedback | CQ-05, CQ-10 | Debt ownership, risk, operational signals, closure evidence |
| Automated quality and dependencies | CQ-01, CQ-04 | Formatter/linter, analysis, dependency and toolchain trust |

Reassess the relevant levels for every material change; this map is an index, not a claim that every product behavior has already passed assessment.


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
