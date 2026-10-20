# Reference Trails: Media and video production

**Development stage:** SDD

This domain governs recorded demos, tutorials, launch videos, marketing content, and other audiovisual material produced or maintained in this repository. It applies the discovery, change, monorepo, licensing, privacy/security, accessibility, and stakeholder controls as well as the production-specific controls below.

## Sources

### R1 — W3C Web Content Accessibility Guidelines (WCAG) 2.2

[W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/). Used for captioning, text alternatives, contrast, and accessible media presentation requirements for web-published content.

### R2 — Project licensing and rights controls

Apply [licensing controls](../../licensing/trails/00-references-trails.md) for provenance, permission, attribution, license scope, and release packaging. Applicable legal and platform obligations must be reviewed by the authorized owner; this trail does not replace legal review.

### R3 — Product discovery and delivery lifecycle

[Product discovery and delivery controls](../../product-discovery-and-delivery/trails/00-references-trails.md). Used for evidence-backed briefs, requirements, approval, acceptance, feedback, and retirement.

### R4 — W3C WAI: Making Audio and Video Media Accessible

[W3C WAI audio and video media guidance](https://www.w3.org/WAI/media/av/). Used for planning and producing captions, transcripts, descriptions, and accessible media experiences.

### R5 — EBU R 128, Version 5.0 (November 2023)

[EBU R 128](https://tech.ebu.ch/publications/r128). Used as a broadcast loudness reference and measurement vocabulary. Its target is not imposed on every web destination; select a target for the intended distribution and validate it.

### R6 — YouTube recommended upload encoding settings

[YouTube upload encoding settings](https://support.google.com/youtube/answer/1722171). Used only for YouTube delivery profiles. Recheck destination requirements at publication time; do not treat them as universal archive/master settings.

## Rule mapping

| Rule document | Requirement IDs | Source trail |
|---|---|---|
| [01-video-production-lifecycle.md](../rules/01-video-production-lifecycle.md) | PA-024, PA-032, PA-035, PDL-001–PDL-017 | R1–R3 |
| [02-video-publication-and-asset-lifecycle.md](../rules/02-video-publication-and-asset-lifecycle.md) | PA-024, PA-032, PA-035, PDL-013–PDL-017 | R1–R3 |
| [03-media-design-system-and-content-templates.md](../rules/03-media-design-system-and-content-templates.md) | PA-030, PA-032, PA-035–PA-036, PDL-001–PDL-009, PDL-016 | R1,R4–R6 |
| [04-production-code-and-web-integration.md](../rules/04-production-code-and-web-integration.md) | PA-024, PA-031–PA-036, ED-001, ED-010, ED-020–ED-024, ED-030–ED-033, PDL-006–PDL-017 | R1–R6 |

## Lifecycle coverage

| Stage | Control | Exit evidence |
|---|---|---|
| Idea, audience, purpose, brief | MEDIA-01 | Owner-approved brief and success/use measure |
| Script, storyboard, claims, rights planning | MEDIA-01 | Reviewed script/shot plan, claims sources, permissions plan |
| Capture, production, and secure handling | MEDIA-01 | Approved recording session, safe raw assets and production notes |
| Edit, accessibility, technical review | MEDIA-01 | Versioned edit, captions/transcript, quality and claims checks |
| Publication and distribution | MEDIA-02 | Approved render, metadata, destination, owner, release record |
| Source files, maintenance, response, retirement | MEDIA-02 | Retention/access decision, update/withdrawal and takedown evidence |
| Visual/audio system, script structure, capture and templates | MEDIA-03 | Approved style-guide, template, component, storyboard and output review |
| Automation, code, asset layout, website playback and CI | MEDIA-04 | Tool decision, project manifest, tests, render/QC manifest and web integration evidence |


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

Reassess platform-specific format, upload, monetization, and distribution requirements at publication time because platform specifications change. Do not hard-code transient platform limits as project-wide standards without an owner and review trigger.
