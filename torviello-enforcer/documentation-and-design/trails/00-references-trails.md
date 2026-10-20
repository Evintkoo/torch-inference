# Reference Trails: Documentation and product design

**Development stage:** SDD

This document records the authoritative sources used to develop this domain. The numbered rule documents state the project obligations directly; source documents inform their scope and verification. A reference is not a claim of certification or compliance.

## Control authoring and assessment basis

The project control format uses outcome-focused, independently assessable requirements informed by [NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final). Assessment procedures use the examine, interview, and test method model from [NIST SP 800-53A Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final), tailored to repository evidence and software behavior. Normative terms follow [IETF BCP 14 (RFC 2119 and RFC 8174)](https://www.rfc-editor.org/info/bcp14/). These sources define how project rules are written and assessed; their inclusion does not claim adoption of a NIST baseline or certification.

## Sources

### R1 — W3C WCAG 2.2

[W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### R2 — OpenAPI Specification 3.2.1

[OpenAPI Specification 3.2.1](https://spec.openapis.org/oas/v3.2.1.html)

### R3 — Diátaxis documentation framework

[Diátaxis documentation framework](https://diataxis.fr/)

### R4 — WHATWG HTML Living Standard

[WHATWG HTML Living Standard](https://html.spec.whatwg.org/multipage/semantics.html). Used for semantic HTML elements and document structure. It is a living standard, so behavior and support MUST be assessed against the project’s declared browser matrix.

### R5 — web.dev Core Web Vitals

[web.dev: Web Vitals](https://web.dev/articles/vitals). Used to define measurable user-centered loading, responsiveness, and visual stability evaluation; thresholds and methodology must be rechecked against current guidance.

### R6 — Atomic Design

[Brad Frost, Atomic Design](https://atomicdesign.bradfrost.com/chapter-2/). Used as a composition vocabulary (atoms, molecules, organisms, templates, pages), not as a mandated component taxonomy or substitute for software design principles.

## Rule mapping

| Rule document | Requirement IDs | Source trail |
|---|---|---|
| [01-documentation-source-and-publishing.md](../rules/01-documentation-source-and-publishing.md) | PA-013, PA-030–PA-032, ED-030–ED-033 | R1,R2 |
| [02-design-system-and-accessibility.md](../rules/02-design-system-and-accessibility.md) | PA-013, PA-030–PA-032, ED-030–ED-033 | R1 |
| [03-documentation-architecture-and-content-types.md](../rules/03-documentation-architecture-and-content-types.md) | ED-030–ED-032, PA-031 | R1,R2 |
| [04-design-system-interaction-states-and-accessibility.md](../rules/04-design-system-interaction-states-and-accessibility.md) | PA-030, ED-033 | R3 |
| [05-user-research-content-and-design-review.md](../rules/05-user-research-content-and-design-review.md) | PA-001, PA-030–PA-032, ED-030–ED-033 | R1,R2,R3 |
| [06-website-design-and-delivery-lifecycle.md](../rules/06-website-design-and-delivery-lifecycle.md) | PA-001, PA-004, PA-024, PA-030–PA-036, ED-030–ED-033, PDL-001–PDL-015 | R1,R4–R6; media-specific embedding in `../media-production/` |
| [07-atomic-component-conventions.md](../rules/07-atomic-component-conventions.md) | PA-001, PA-030, PA-034, ED-005, ED-033, PDL-006–PDL-008 | R1,R6 |


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

