# Reference Trails: Application and product security

**Development stage:** EDD

This document records the authoritative sources used to develop this domain. The numbered rule documents state the project obligations directly; source documents inform their scope and verification. A reference is not a claim of certification or compliance.

## Control authoring and assessment basis

The project control format uses outcome-focused, independently assessable requirements informed by [NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final). Assessment procedures use the examine, interview, and test method model from [NIST SP 800-53A Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final), tailored to repository evidence and software behavior. Normative terms follow [IETF BCP 14 (RFC 2119 and RFC 8174)](https://www.rfc-editor.org/info/bcp14/). These sources define how project rules are written and assessed; their inclusion does not claim adoption of a NIST baseline or certification.

## Sources

### R1 — OWASP ASVS 5.0.0

[OWASP ASVS 5.0.0](https://owasp.org/projects/asvs)

### R2 — OWASP AISVS 1.01

[OWASP AISVS 1.01](https://owasp.org/projects/artificial-intelligence-security-verification-standard-aisvs-docs)

### R3 — NIST SSDF Version 1.1 (SP 800-218)

[NIST SSDF Version 1.1 (SP 800-218)](https://csrc.nist.gov/pubs/sp/800/218/final)

### R4 — OWASP Cheat Sheet Series

[OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

### R5 — OWASP API Security Top 10 (2023)

[OWASP API Security Top 10 (2023)](https://api-security.owasp.org/editions/2023/en/0x10-api-security-risks/)

### R6 — NIST SP 800-53 Rev. 5, Release 5.2.0

[NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)

## Rule mapping

| [12-personnel-security-and-human-access-lifecycle.md](../rules/12-personnel-security-and-human-access-lifecycle.md) | ORG-001, ORG-010–ORG-012, SO-001–SO-005, SO-010–SO-014 | R1,R6 |
| [13-physical-workspace-remote-work-and-asset-protection.md](../rules/13-physical-workspace-remote-work-and-asset-protection.md) | ORG-010–ORG-013, ORG-023, SO-001–SO-005, SO-010–SO-014, RP-020–RP-024 | R6 |
| Rule document | Requirement IDs | Source trail |
|---|---|---|
| [01-threat-model-and-security-requirements.md](../rules/01-threat-model-and-security-requirements.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | R1,R2,R3,R4 |
| [02-identity-authentication-and-account-lifecycle.md](../rules/02-identity-authentication-and-account-lifecycle.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | R1,R2,R3,R4 |
| [03-authorization-and-administrative-access.md](../rules/03-authorization-and-administrative-access.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | R1,R2,R3,R4 |
| [04-input-file-and-resource-security.md](../rules/04-input-file-and-resource-security.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | R1,R2,R3,R4 |
| [05-secrets-cryptography-and-sensitive-data.md](../rules/05-secrets-cryptography-and-sensitive-data.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | R1,R2,R3,R4 |
| [06-software-and-model-supply-chain.md](../rules/06-software-and-model-supply-chain.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | R1,R2,R3,R4 |
| [07-vulnerability-response-and-assurance.md](../rules/07-vulnerability-response-and-assurance.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | R1,R2,R3,R4 |
| [08-network-boundaries-and-transport-security.md](../rules/08-network-boundaries-and-transport-security.md) | SO-002–SO-004, SO-010–SO-012 | R1,R2,R5 |
| [09-privacy-data-minimization-and-inference-boundaries.md](../rules/09-privacy-data-minimization-and-inference-boundaries.md) | SO-004, SO-010–SO-014, SO-020–SO-024, RP-032–RP-034 | R1,R2,R3 |
| [10-secure-defaults-and-abuse-resilience.md](../rules/10-secure-defaults-and-abuse-resilience.md) | SO-002–SO-005, SO-010–SO-014, SO-030–SO-032 | R1,R2,R5 |
| [11-application-security-testing-and-control-coverage.md](../rules/11-application-security-testing-and-control-coverage.md) | SO-010–SO-014, ED-011, ED-014 | R1,R2,R4,R5 |


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
