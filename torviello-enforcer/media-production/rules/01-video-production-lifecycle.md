# Video production lifecycle

**Control family:** media-production  
**Control document:** MEDIA-01  
**Requirement trace:** PA-024, PA-032, PA-035, PDL-001–PDL-012, PDL-016  
**Status:** Normative project control

## Control objective

Produce product demos, tutorials, and marketing videos as evidence-backed, rights-cleared, accessible, secure, and reviewable work products with clear production gates and ownership.

## Applicability

Applies to original or substantially edited recordings, screen captures, voiceovers, animation, generated media, product demonstrations, tutorials, launch announcements, customer/user stories, and video used in documentation, the landing page, or external channels. Applies to employees, contractors, agents, and vendors. A quick internal diagnostic recording may use a shortened path if it is not published, contains no sensitive content, and has an expiry/deletion owner.

## Normative requirements

### MEDIA-01.01 — Approve a production brief before production

The producer MUST record the video’s purpose, intended audience, user need, distribution context, desired action/outcome, owner, approver, length/format constraints, deadline, budget/resources, success measure, and planned review/expiry. Identify whether the material is a product demo, tutorial, training, launch, or promotional claim because these types require different evidence and review. Do not begin costly or externally visible production from an unapproved idea alone.

### MEDIA-01.02 — Establish truth and scope for every product claim

For each factual claim about features, performance, security, compatibility, availability, pricing, licensing, or roadmap, record an authoritative source, tested version/profile, measurement conditions where applicable, and approval owner. Demonstrations MUST show the real product state for the stated version or be clearly labeled as mockup, prototype, edited composite, or planned capability. Do not fabricate user outcomes, benchmark results, testimonials, endorsements, or availability. Remove or qualify claims that cannot be substantiated at publication time.

### MEDIA-01.03 — Plan narrative and capture before recording

Prepare a script, outline, or storyboard proportionate to complexity. Specify scenes, narration/on-screen text, required product state and test data, transitions, call to action, accessibility needs, expected duration, and owner for each factual segment. Rehearse demonstrations on a controlled profile using non-sensitive data. Capture a clean take and note deviations or edits that alter meaning. For tutorials, include prerequisites and recovery steps, not just the success path.

### MEDIA-01.04 — Clear rights and permissions before using material

Before recording or editing, inventory music, fonts, images, footage, logos, product/customer names, voices, likenesses, testimonials, code, model output, and third-party interfaces. Record creator/source, license/permission, attribution, permitted channels/territories/term, restrictions, and evidence. Obtain required releases and approvals for identifiable people, customer content, or confidential environments. Do not assume publicly viewable content is reusable. Escalate unclear ownership, commercial usage, privacy, or jurisdiction issues to authorized review before publication.

### MEDIA-01.05 — Protect secrets, personal data, and production systems during capture

Use a dedicated demo account/environment with least privilege, synthetic data, test credentials, and representative but non-sensitive content. Before and after capture inspect the full screen, notifications, browser history, terminal output, logs, environment variables, file paths, access tokens, customer data, and background audio for accidental disclosure. Revoke any credential exposed in raw footage, even if later cropped or blurred. Do not connect recording workflows to production systems unless explicitly approved and risk-controlled.

### MEDIA-01.06 — Edit for accuracy, comprehension, and reproducibility

Edits MUST preserve factual context and MUST NOT imply behavior, causality, speed, quality, or availability that the source did not demonstrate. Keep the project file and source provenance sufficient for another authorized editor to reproduce the final render. Record significant edits, compositing, speed changes, AI-generated or synthetic media, and removed limitations where those could affect viewer interpretation. Maintain a versioned review copy and a separate approved release render.

### MEDIA-01.07 — Make published speech and meaningful sound accessible

Provide synchronized captions for speech and meaningful audio, including speaker identification and relevant sound cues. Review captions for accuracy, timing, names, technical terms, and punctuation; automatic captions alone are not accepted without human review. Provide a transcript for long or instructional media where useful, and audio description or equivalent narration when essential visual information is not conveyed in audio. Ensure text overlays remain readable, high contrast, sufficiently long, and do not communicate meaning only through color or motion. Apply WCAG 2.2 media criteria and the target publishing surface’s accessible player requirements.

### MEDIA-01.08 — Review the complete video as a release artifact

Before publication, an independent reviewer MUST check the full beginning-to-end rendered video, not only the script or a partial preview. Review claim accuracy, product/version fidelity, rights and releases, captions/transcript, audio clarity, text legibility, pacing, spelling, accessible playback, privacy/security leakage, visual defects, links/call-to-action, and consistency with the approved brief. For performance or security claims, require evidence from the relevant domain owner. Record findings and resolved/dispositioned exceptions.

### MEDIA-01.09 — Maintain reproducible technical outputs

The production owner MUST define source project format, render settings, aspect ratio, frame rate, resolution, audio level/format, caption format, naming/version scheme, and destination-specific deliverables before final render. Preserve a high-quality archival master where retention is approved, then produce platform-specific encodes from that master. Validate the rendered file’s duration, audio/video synchronization, captions, resolution, playback, and file integrity. Platform-specific settings are confirmed against current official destination guidance at each release.

### MEDIA-01.10 — Keep work reviewable and separate from engine runtime

Store scripts, project files, source assets, licenses, renders, and production automation under the approved media ownership boundary. Media tooling and assets MUST NOT become build or runtime dependencies of the inference engine unless a separate requirement and architecture decision explicitly establish that dependency. Use version control for text/scripts/configuration; use approved object storage or asset management for large binaries, with stable references, access control, retention, backup, and checksums as appropriate. Do not commit secrets or restricted raw footage.

## Implementation guidance

Use the full production procedure for material intended for public release. Combine steps only for low-risk internal recordings, and record why the shortened path remains safe. The producer coordinates work but does not replace product, rights, security, accessibility, or legal authorities. Keep source assets in approved locations and link them from the work record; do not duplicate sensitive material into broad-access review threads.

## Production procedure

1. **Intake and brief:** create the media work record, assign producer and approver, identify audience, purpose, destination, success measure, budget, and expiry/update expectation. Exit when the brief is approved.
2. **Evidence and rights plan:** enumerate claims and source evidence; inventory all third-party and identifiable-person material; identify permissions/releases and privacy/security risks. Exit only when all required review owners and evidence sources are known.
3. **Script/storyboard:** outline the narrative and scene order, product state/version, demonstration data, on-screen text, captions/audio description needs, and call to action. Obtain content/product review before recording when claims are material.
4. **Prepare capture:** use a controlled account/environment and synthetic data; set up audio/video, accessibility, and recording settings; run a disclosure checklist; record test footage. Stop if a secret, customer data, or unapproved claim appears.
5. **Record and edit:** capture scenes, preserve source notes, edit for clarity without changing claim meaning, keep versioned project files, and record composites or synthetic content.
6. **Review and remediate:** export review render; independent reviewer checks the full artifact and evidence. Fix issues and repeat review for materially affected portions; escalate unresolved rights, privacy, or claims questions.
7. **Accessibility and technical QC:** human-review captions/transcript, assess visual/audio access, validate render settings and playback on intended destinations, and retain results.
8. **Approve publication:** designated owner confirms brief, evidence, rights, accessibility, quality, and release metadata. No producer self-approval where independent review is required.
9. **Handoff:** provide approved render, captions/transcript, source/project location, licenses/releases, claims evidence, metadata, destination instructions, owner, and update/withdrawal contact.

## Decision branches

- **Internal diagnostic only:** use a minimal brief; redact sensitive material; restrict access and set deletion date. Publication controls apply before any external sharing.
- **Product demo/tutorial:** use an identified product version/profile, controlled demo setup, reproducible steps, and tested prerequisites; label prototype or mock data clearly.
- **Marketing or performance claim:** require claim-by-claim evidence and authorized product/legal review; obtain benchmark source/environment and limitation approval for quantified claims.
- **Customer/person/third-party content:** stop before capture or publication until permission, release, license, and privacy scope are verified.
- **Synthetic/AI-generated material:** record tool/source and human review; disclose where required or where a reasonable viewer could mistake it for authentic evidence; never represent synthetic testimonials or product behavior as real.

## Prohibited conditions

- Publishing an unreviewed take with credentials, personal/customer data, confidential material, or unsupported claims.
- Relying only on auto-generated captions for release.
- Using music, images, fonts, logos, people, or customer material without verified rights/permission.
- Presenting a mockup, edited result, prototype, benchmark, or roadmap as generally available product behavior.
- Publishing a video whose source owner, update contact, or takedown path is unknown.

## Assessment procedure

**Examine:** compare brief, script/storyboard, claim ledger, rights inventory, raw/project/render versions, accessibility outputs, review record, and approved release artifact.

**Interview:** ask producer and reviewer to identify the evidence behind material claims, explain edits that affect interpretation, and show how sensitive content and rights were checked.

**Test:** play the full approved render with captions enabled and on the intended destination/device; spot-check screen disclosure at scene transitions; verify the media file and captions correspond to the approved revision.

## Assessment determination

Pass when the released artifact matches an approved brief, claims are supported, rights and privacy are cleared, accessibility and technical checks pass, and source/ownership handoff is complete. Fail when any of these cannot be evidenced or the artifact materially misleads. Not applicable requires the bounded internal-use case and deletion controls.

## Required evidence

Brief; script/storyboard; claim ledger and sources; rights/release inventory; recording environment checklist; source/project and render versions; caption/transcript; independent review and QC results; publication approval and handoff.

## Exceptions and nonconformance

A MUST exception requires the accountable product/marketing owner and relevant rights, privacy, security, accessibility, or legal authority. Record the artifact/scene, audience, residual risk, mitigation, owner, and expiry. Do not publish while mandatory rights, consent, or legal questions remain unresolved.

## Reference trail

Sources R1–R3 are listed in [00-references-trails.md](../trails/00-references-trails.md).
