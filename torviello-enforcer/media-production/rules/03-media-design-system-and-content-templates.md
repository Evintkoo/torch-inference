# Media design system and content templates

**Control family:** media-production  
**Control document:** MEDIA-03  
**Requirement trace:** PA-030, PA-032, PA-035–PA-036, PDL-001–PDL-009, PDL-016  
**Status:** Normative project control

## Control objective

Provide a coherent, accessible, reusable creative system for videos and related web content, while requiring each production to choose components that fit its audience, evidence, platform, and purpose.

## Applicability

Applies to visual and audio identity, video narratives, motion/graphic components, reusable project templates, thumbnails, captions, and video embeds for product demos, tutorials, marketing, and training. This control defines the system and selection process; actual logo, palette, typefaces, voice, and brand personality require an approved brand decision and are not invented here.

## Normative requirements

### MEDIA-03.01 — Maintain an approved media style guide

The product/design owner MUST maintain a versioned media style guide with approved logo usage, color tokens, typography and fallback fonts, grid/margins, title-safe areas, contrast rules, icon/illustration treatment, motion principles, transition rules, audio identity, caption conventions, thumbnail layout, and examples of correct/incorrect usage. Record the style-guide owner, version, supported languages, and review trigger. Where brand decisions are unresolved, use neutral accessible defaults and label them provisional; do not fabricate official branding.

### MEDIA-03.02 — Define reusable production components and their contracts

The media system MUST define reusable components or templates with purpose, inputs, variants, duration/placement expectations, typography/color tokens, animation behavior, sound behavior, accessibility alternatives, editable source, and allowed customization. The inventory MUST consider, as applicable: opening/title card; logo bug; lower third/name and role; section/chapter marker; product UI frame/device mockup; cursor/interaction highlight; callout/annotation; comparison/before-after panel; diagram/architecture frame; metric/benchmark card; quote/testimonial card with permission; code/terminal panel; warning/limitation card; end card/call-to-action; thumbnail; captions; and audio bed/stinger. Components MUST be omitted when they add no informational value.

### MEDIA-03.03 — Choose narrative structure by viewer task

Select and document a structure appropriate to the content: problem → outcome → evidence for a short product overview; prerequisites → steps → verification → troubleshooting for a tutorial; context → architecture → flow → failure/recovery for a technical walkthrough; claim → method → result → limitations for a benchmark; or an explicitly reasoned alternative. Define the opening promise, information sequence, proof, transitions, ending, and call to action before production. Do not force every video into one marketing format.

### MEDIA-03.04 — Specify shot and screen-capture grammar

The script/storyboard MUST identify the capture type per scene (screen capture, presenter, narration over graphics, animation, live action, or mixed), composition/framing, cursor/focus behavior, text legibility, product state, scene duration target, and transition intent. For screen recordings, set a stable viewport/scale, remove distracting UI and notifications, use predictable cursor movement, zoom only to support comprehension, and use prepared synthetic data. Preserve sufficient context so viewers can understand where an action occurs. Avoid rapid cuts or motion that prevents reading or causes discomfort.

### MEDIA-03.05 — Use visual hierarchy and motion to clarify information

Each scene MUST have a primary message and hierarchy among headline, visual evidence, annotation, and supporting detail. Keep text within the chosen destination’s safe area and readable at expected mobile display size. Motion MUST explain sequence, focus, state, or relationship; use restrained duration/easing and provide a reduced-motion or static equivalent for essential web experiences. Do not use flashing content, color alone, tiny captions, or animation as the only carrier of meaning. Validate overlays against the actual footage and final encoded output.

### MEDIA-03.06 — Define audio and voice treatment

Specify narration language, pronunciation of product terms, recording environment, microphone distance, noise treatment, music/sound-effect role, voice/music priority, channel layout, loudness target, peak ceiling, and export profile. Dialogue MUST remain intelligible on common speakers/headphones and in mono fold-down where applicable. Music and effects MUST not mask speech or captions. Measure the final render against the selected delivery target; do not adopt broadcast loudness targets blindly for every online platform. Retain clean dialogue/music stems when rights and storage policy allow future remixes.

### MEDIA-03.07 — Provide content-type templates, not one universal video

Maintain distinct reusable briefs/storyboard templates for product overview, feature demo, step-by-step tutorial, architecture/engineering explainer, benchmark/performance report, launch announcement, and short-form cutdown when those formats are in scope. Each template MUST ask for the claims/evidence, user prerequisite, version/profile, story sequence, visual components, accessibility deliverables, length/platform constraints, and approval roles relevant to that format. A template MAY be omitted by an owner decision when that format is not in scope.

### MEDIA-03.08 — Design for destination and aspect-ratio adaptation

Choose a primary master aspect ratio, resolution, frame rate, color space, and audio layout from intended use and capture source. If multiple destinations/aspect ratios are needed, compose for safe reframing at storyboard time; do not rely on blind center crop for text, faces, UI, or critical information. Maintain a delivery matrix for widescreen, vertical, square, embedded/site, or archival outputs as applicable. Confirm current platform specifications at export time and keep the high-quality master separate from compressed delivery encodes.

### MEDIA-03.09 — Keep visual/audio components accessible and localized

Define caption font, size, placement, line length, speaker labels, timing, sound cues, and contrast so captions do not cover essential UI or graphics. Supply human-reviewed caption files and transcript; record translation ownership and terminology glossary for localized versions. Avoid embedding essential text only in the image; localize graphics or supply equivalent transcript/description. Validate each language’s fonts, line breaks, reading speed, names, and timing after export.

### MEDIA-03.10 — Version and evolve the design system safely

Give tokens, templates, project files, fonts, plugins, and component packages version/owner/license metadata. A change to identity, template, font, animation, or caption convention MUST assess impact on in-progress and published media, compatibility of source project files, and update cost. Keep deprecated templates readable for active projects or define a migration path. Do not silently overwrite reusable assets used by released work.

## Implementation guidance

Use the design system to make decisions consistent and outputs easier to produce, not to force identical storytelling. Select only components that help the intended viewer understand, trust, navigate, or act on the content. Brand tokens remain pending until an authorized product/brand owner approves them; provisional defaults MUST be clearly labeled and replaceable without rebuilding the content structure.

## Design procedure

1. Identify video type, audience, outcome, distribution, duration constraints, language, and evidence requirements in the approved brief.
2. Select the matching narrative template and required scenes/components; record why any template or component is omitted.
3. Apply the approved style-guide version and delivery matrix; mark unresolved brand choices as provisional.
4. Draft storyboard with scene purpose, shot/capture type, copy, visual hierarchy, motion, narration, sound, captions, and safe-area notes.
5. Review storyboard for truth, comprehension, accessibility, rights, privacy/security, mobile legibility, and adaptation to required aspect ratios.
6. Build and record the edit using owned components; review a rough cut before fine polish to catch story and evidence problems early.
7. Check the final encoded render—not only the editor timeline—for text/caption legibility, audio intelligibility/loudness, sync, cropping, color, playback, and component consistency.
8. Archive style/template versions and source dependencies with the approved render and production record.

## Decision procedure

Choose components only when they improve recognition, comprehension, evidence, or navigation. A product tutorial may need section markers, cursor focus, captions, and a verification end card, but not a logo animation or music bed. A benchmark report needs workload/environment/method/result/limitations, not an unsupported claim card. A landing-page hero video should have a silent/autoplay-safe version or poster and must not be the only way to understand the product. The design owner decides token/brand changes; the content/product owner approves narrative and claims; accessibility and rights reviewers assess their respective risks.

## Prohibited conditions

- Treating decorative motion, music, stock footage, or a long branded intro as mandatory components.
- Creating per-video typography, colors, transitions, lower thirds, or audio conventions that conflict with the approved system without an approved exception.
- Reusing components that obscure product evidence, cover captions, misrepresent UI, or introduce unreadable text on small screens.
- Building templates around inaccessible baked-in text or unlicensed fonts/plugins/assets.

## Assessment procedure

**Examine:** compare brief/storyboard/render against the style guide, component contracts, narrative template, delivery matrix, rights, and accessibility package.

**Interview:** ask a new producer to select a template, find components, create a storyboard, and explain how to adapt it to vertical and widescreen delivery without oral coaching.

**Test:** review rendered outputs at expected mobile/desktop sizes, with captions and sound on/off; check selected components, language variants, audio measurement, safe areas, and accessibility alternatives.

## Assessment determination

Pass when design choices are purpose-driven, consistent with an approved or clearly provisional system, accessible in final outputs, adaptable to required destinations, and reproducible from versioned assets. Fail when style or component choices cannot be found/reused, make content inaccessible, misstate evidence, or lack rights/provenance. Not applicable requires the production scope and rationale.

## Required evidence

Approved style-guide revision; component/template inventory; selected narrative template; storyboard; delivery matrix; localization/accessibility/audio specifications; final-render review and asset/version provenance.

## Exceptions and nonconformance

A MUST exception requires the media/design owner and the relevant product, accessibility, rights, or communications authority. Record affected outputs, reason, impact, alternate access/protection, owner, and expiry/review trigger.

## Reference trail

Sources R1, R4, and R5 are listed in [00-references-trails.md](../trails/00-references-trails.md). Video accessibility follows [W3C media guidance](https://www.w3.org/WAI/media/av/) and the project’s WCAG target.
