# Reference Trails: API contracts and request handling

**Development stage:** CDD

This document records the authoritative sources used to develop this domain. The numbered rule documents state the project obligations directly; source documents inform their scope and verification. A reference is not a claim of certification or compliance.

## Control authoring and assessment basis

The project control format uses outcome-focused, independently assessable requirements informed by [NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final). Assessment procedures use the examine, interview, and test method model from [NIST SP 800-53A Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final), tailored to repository evidence and software behavior. Normative terms follow [IETF BCP 14 (RFC 2119 and RFC 8174)](https://www.rfc-editor.org/info/bcp14/). These sources define how project rules are written and assessed; their inclusion does not claim adoption of a NIST baseline or certification.

## Sources

### R1 — OpenAPI Specification 3.2.1

[OpenAPI Specification 3.2.1](https://spec.openapis.org/oas/v3.2.1.html)

### R2 — OWASP ASVS 5.0.0

[OWASP ASVS 5.0.0](https://owasp.org/projects/asvs)

### R3 — RFC 9110: HTTP Semantics

[RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)

### R4 — RFC 9457: Problem Details for HTTP APIs

[RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)

### R5 — OWASP API Security Top 10 (2023)

[OWASP API Security Top 10 (2023)](https://api-security.owasp.org/editions/2023/en/0x10-api-security-risks/)

## Rule mapping

| Rule document | Requirement IDs | Source trail |
|---|---|---|
| [01-api-contracts-and-schemas.md](../rules/01-api-contracts-and-schemas.md) | ED-004, SO-002–SO-005, SO-011, PA-010 | R1,R2 |
| [02-api-input-and-stream-safety.md](../rules/02-api-input-and-stream-safety.md) | ED-004, SO-002–SO-005, SO-011, PA-010 | R1,R2 |
| [03-http-semantics-and-client-behavior.md](../rules/03-http-semantics-and-client-behavior.md) | ED-004, SO-002–SO-005, SO-011 | R3,R4,R5 |
| [04-api-inventory-evolution-and-deprecation.md](../rules/04-api-inventory-evolution-and-deprecation.md) | ED-004, ED-030, SO-010–SO-011, RP-023 | R1,R3,R5 |
| [05-api-abuse-and-integrated-service-boundaries.md](../rules/05-api-abuse-and-integrated-service-boundaries.md) | SO-003, SO-010–SO-012, SO-032 | R2,R5 |


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
