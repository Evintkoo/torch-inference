# Production code, assets, and website integration

**Control family:** media-production  
**Control document:** MEDIA-04  
**Requirement trace:** PA-024, PA-031–PA-036, ED-001, ED-010, ED-020–ED-024, ED-030–ED-033, PDL-006–PDL-017  
**Status:** Normative project control

## Control objective

Treat video creation automation, large assets, and website playback as maintained product work with clear boundaries, reproducible outputs, quality gates, accessibility, privacy, and operational ownership.

## Applicability

Applies when video production uses scripts, source code, render frameworks, command-line tools, plugins, templates, CI, asset storage, a website player/embed, or automated publication. Also applies to manual workflows where asset and export consistency require controlled configuration.

## Normative requirements

### MEDIA-04.01 — Select tools by production needs and lifecycle cost

Before choosing an editor/render framework or automation, compare the actual work: manual editing versus data-driven/programmatic scenes; number of repeated variants/locales; timeline/audio requirements; collaboration/review; preview speed; deterministic rendering; format/codec support; accessibility sidecars; platform availability; licenses; security/update posture; hardware/GPU needs; offline use; CI duration/cost; and skill/maintenance burden. Keep creative editing tools where they provide needed timing and judgment; use code-driven rendering when reusable data/templates and reproducible variants justify it. Do not adopt a framework or AI media tool solely because it is available or popular. Record decision owner, tested prototype, alternatives, limitations, and reconsideration triggers.

### MEDIA-04.02 — Give media production a separate monorepo boundary

When production workflows are maintained in this repository, use a dedicated `media/` product area with its own `README.md` and `AGENTS.md`, toolchain/lockfiles, scripts, tests, asset policy, build instructions, and ownership. It MUST NOT be a dependency of the inference engine’s build, runtime, install, or release profiles. Define explicit interfaces to shared brand assets or website packages; avoid cross-area private imports and toolchain coupling. The `media/` owner MUST maintain a supported build/render entry point and document required licenses, hardware, and external inputs.

### MEDIA-04.03 — Organize work products for discoverability and safe revision

Use a documented layout equivalent to: `brand/` for approved style guide/tokens; `templates/` for content-type templates and reusable scene components; `projects/<video-id>/` for brief, script, storyboard, claims, rights manifest, and edit/render config; `assets/` for approved shared source media; `automation/` for render, QC, and packaging code; and `releases/<video-id>/<version>/` or an approved artifact store for release manifests and outputs. Large binaries MUST use an approved large-file or artifact store with stable IDs/checksums and access controls rather than silently bloating ordinary source history. Keep project-specific raw footage segregated and access-limited.

### MEDIA-04.04 — Represent automated scenes as typed, validated inputs

For programmatic video, model scenes, durations, assets, narration, captions, transitions, and output profiles in a validated schema. Give each scene a stable identifier and explicit required/optional assets, timing, locale, and accessibility text. Fail early with actionable diagnostics for missing media, unsupported dimensions, unresolved fonts, invalid time ranges, unlicensed inputs, missing captions, or contradictory project settings. Avoid arbitrary code evaluation or unchecked paths in user-editable project manifests; treat asset paths and project input as untrusted data. Keep rendering deterministic where the toolchain permits and disclose nondeterministic codecs/metadata.

### MEDIA-04.05 — Pin and inventory production dependencies

Record editor/render-tool versions, plugins, fonts, codecs, templates, scripts, model/AI services if used, and licenses. Pin automated build dependencies and verify downloaded tools/assets; store required binaries in the approved cache/mirror for offline production when offline repeatability is a project requirement. Identify end-of-life/deprecated formats and test migration. Do not promise bit-identical output when codecs, hardware encoders, timestamps, or external services prevent it; define the reproducibility level and verify content/metadata checksums appropriately.

### MEDIA-04.06 — Build a layered validation pipeline

A production pipeline MUST support separate fast checks and full render/QC. At minimum, validate: project manifest/schema; required sources and rights metadata; broken/missing media and font dependencies; safe paths and secrets; script/claims references; caption and transcript existence and timing; render dimensions/duration/frame rate/codec/color/audio profile; audio/video synchronization; loudness/peak limits for chosen target; black/silent/frozen frames where relevant; output integrity; and playback. Add visual snapshot or representative frame review only as supporting evidence; it cannot replace watching the complete final video. Store machine-readable QC report linked to source revision and render artifact.

### MEDIA-04.07 — Make builds and renders resource-bounded and resumable

Specify expected render time/storage/GPU/CPU and maximum source dimensions/duration per profile. Provide progress, cancellation, safe temporary-file cleanup, disk-space checks, retry behavior, and recovery from interrupted render without corrupting approved outputs. Bound parallel encodes to available resources. A release render MUST be distinguishable from a preview and MUST NOT overwrite an approved artifact without a new version and review.

### MEDIA-04.08 — Define explicit delivery profiles and manifests

Maintain versioned profiles for intended destinations rather than one universal export. Each profile defines container, video/audio codecs, dimensions/aspect ratio, frame rate, color space/HDR policy, bitrate or quality mode, audio layout/loudness target, captions, thumbnail, metadata, and validation commands. Record profile version, source revision, toolchain versions, output checksum, and destination requirements in a release manifest. Recheck external destination specifications at release time; keep archived master settings separate from delivery transcodes.

### MEDIA-04.09 — Integrate video into websites as an accessible, privacy-aware component

A website video component MUST include a poster/thumbnail, descriptive title, playback controls, caption tracks, transcript or equivalent text path, accessible keyboard/focus behavior, responsive sizing, fallback/error behavior, and no autoplay with sound. Provide a local/first-party player or click-to-load consent pattern when third-party embeds would set cookies, load trackers, or contact external domains before user interaction. Lazy-load noncritical media, reserve layout space to prevent layout shift, and do not make video the sole means to understand the page or complete a task. Record supported formats, caption languages, privacy behavior, and fallback.

### MEDIA-04.10 — Release and operate the production system safely

Deploy production tooling and website changes through their owning release controls. Restrict credentials, signing keys, publication tokens, and private raw media to least privilege; use secret stores rather than project config. Publish only approved release manifests. Monitor render failures, storage saturation, artifact integrity, player failures, accessibility reports, and broken links at a level proportionate to use. Define rollback for website/player releases, disable/revoke publication credentials on compromise, and provide a manual fallback procedure if the render or hosting pipeline is unavailable.

### MEDIA-04.11 — Test behavior at unit, integration, and release seams

Test scene/schema parsing and timeline calculations as unit tests; test asset resolution, caption association, and render invocation as integration tests; and test representative full renders and playback as release checks. Include malformed manifests, missing assets/fonts, unsupported profile, cancellation, disk exhaustion, encoder/tool failure, caption mismatch, and privacy/embed behavior as applicable. Use tiny synthetic fixtures in CI; reserve full-quality renders for scheduled or release workflows. Document hardware and resource prerequisites; report skipped GPU or platform checks honestly.

## Implementation guidance

Use the production-code path only when the expected repeatability, volume, localization, validation, or maintenance benefit exceeds toolchain and CI cost. Keep the human-editable source, content/claims, reusable visual components, and output settings independently reviewable. The approved rendered video remains the deliverable; code and successful rendering alone do not prove that the content is accurate, accessible, or fit to publish.

## Production-system procedure

1. **Classify production:** decide hand-edited timeline, code-generated video, or hybrid based on repeated variants, timing complexity, audio needs, reproducibility, and editor skill; record decision and owner.
2. **Create project structure:** initialize approved template and project ID, owners, brief, rights/claim manifests, style-guide version, asset references, locale, and delivery profile.
3. **Validate inputs:** run manifest/schema, rights, path, font, caption, asset existence, and secret checks before expensive rendering.
4. **Develop preview:** use low-cost preview settings; test scene order, narration, visual components, line wraps, captions, and crop safety in target aspect ratios.
5. **Run checks:** format/lint/type-check production code; unit-test scene logic; integration-test resolution and captions; generate QC report. Fix blockers before full render.
6. **Render release candidate:** pin profile/toolchain, use bounded resources, write to a versioned staging path, and record source revision and environment.
7. **Review output:** watch the full candidate, review captions and all variants, run technical QC, check rights/claims/security, and record reviewer decision.
8. **Publish package:** create checksummed release manifest with final render, caption/transcript, thumbnail, metadata, provenance, and target-specific transcodes. Upload through MEDIA-02 procedure.
9. **Integrate website:** use shared accessible video component, test playback/privacy/performance/fallback on supported devices, and link to the content inventory.
10. **Maintain:** monitor failures and feedback, update profiles/toolchains, rotate credentials, revalidate claims, and retire outputs and source assets under MEDIA-02.

## Decision procedure

Choose **manual editing** when storytelling, performance, frame-level timing, or sound design require human editorial control and variants are limited. Choose **programmatic rendering** when the output is assembled from repeated structured scenes, localized values, or many consistent variants and when determinism/QC automation saves effort. Choose **hybrid** when code should enforce scene layout and metadata while humans direct timing and polish. Prototype a representative scene and full delivery path before committing; compare quality, editability, render time, reproducibility, accessibility, rights, cost, and contributor skill. For website delivery, choose a first-party player when control/privacy/offline behavior dominates; use third-party embed only after privacy, availability, accessibility, analytics, and vendor exit are accepted.

## Prohibited conditions

- Coupling video rendering or marketing site dependencies into the inference engine’s build/runtime by convenience.
- Publishing artifacts with no source revision, delivery profile, checksum, rights record, or QC outcome.
- Passing an automated QC report as a substitute for human review of narrative, accuracy, accessibility, and complete playback.
- Loading third-party players or trackers before required consent/privacy behavior is implemented.
- Embedding secrets or publication credentials in source, project files, URLs, or logs.

## Assessment procedure

**Examine:** inspect tool decision, product-area structure, manifests, pinned inputs, automated checks, render/QC records, release manifest, website player implementation, privacy behavior, and operational fallback.

**Interview:** ask a new maintainer to set up a project, render a preview, diagnose a deliberately missing asset, and explain how to make an accessible website embed.

**Test:** run fast CI validation and a representative release render; inject missing asset/font, invalid caption timing, cancellation, and embed-consent cases. Measure resource use and verify output manifest/checksum and playback.

## Assessment determination

Pass when production tools and assets are isolated, understandable, validated, reproducible to the stated level, resource-bounded, and integrated accessibly and privately. Fail when source/tool provenance is missing, release output cannot be traced, engine builds depend on media tooling, critical failures go undetected, or website playback excludes users or violates privacy expectations. Not applicable requires that no code/tool/site integration is used and an owner documents the manual control path.

## Required evidence

Tool decision record; product-area README/AGENTS and layout; pinned toolchain/license inventory; schema/project fixtures; QC and test results; render manifest/checksum; website component tests and privacy review; resource/fallback and incident procedures.

## Exceptions and nonconformance

A MUST exception requires the media engineering owner plus affected website, security/privacy, release, accessibility, or licensing authority. Record scope, tool/profile, residual risk, mitigation, owner, and expiry. An exception cannot permit publication of unlicensed content or undisclosed sensitive data.

## Reference trail

Sources R1–R6 are listed in [00-references-trails.md](../trails/00-references-trails.md). Website page lifecycle is also governed by [DOC-06](../../documentation-and-design/rules/06-website-design-and-delivery-lifecycle.md); component contracts by [DOC-07](../../documentation-and-design/rules/07-atomic-component-conventions.md).
