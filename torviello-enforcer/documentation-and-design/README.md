# documentation-and-design domain

**Development stage:** SDD

This directory contains 7 normative control document(s) and the generated enforcement tests for the **documentation-and-design** domain (Documentation and product design). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| DOC-01 | [01-documentation-source-and-publishing.md](rules/01-documentation-source-and-publishing.md) | PA-013, PA-030–PA-032, ED-030–ED-033 | [tests/test_01_documentation_source_and_publishing.py](tests/test_01_documentation_source_and_publishing.py) | Documentation source and publishing |
| DOC-02 | [02-design-system-and-accessibility.md](rules/02-design-system-and-accessibility.md) | PA-013, PA-030–PA-032, ED-030–ED-033 | [tests/test_02_design_system_and_accessibility.py](tests/test_02_design_system_and_accessibility.py) | Design system and accessibility |
| DOC-03 | [03-documentation-architecture-and-content-types.md](rules/03-documentation-architecture-and-content-types.md) | ED-030–ED-032, PA-031 | [tests/test_03_documentation_architecture_and_content_types.py](tests/test_03_documentation_architecture_and_content_types.py) | Documentation architecture and content types |
| DOC-04 | [04-design-system-interaction-states-and-accessibility.md](rules/04-design-system-interaction-states-and-accessibility.md) | PA-030, ED-033 | [tests/test_04_design_system_interaction_states_and_accessibility.py](tests/test_04_design_system_interaction_states_and_accessibility.py) | Design system, interaction states, and accessibility |
| DOC-05 | [05-user-research-content-and-design-review.md](rules/05-user-research-content-and-design-review.md) | PA-001, PA-030–PA-032, ED-030–ED-033 | [tests/test_05_user_research_content_and_design_review.py](tests/test_05_user_research_content_and_design_review.py) | User research, content, and design review |
| DOC-06 | [06-website-design-and-delivery-lifecycle.md](rules/06-website-design-and-delivery-lifecycle.md) | PA-001, PA-004, PA-024, PA-030–PA-033, ED-030–ED-033, PDL-001–PDL-015 | [tests/test_06_website_design_and_delivery_lifecycle.py](tests/test_06_website_design_and_delivery_lifecycle.py) | Website design and delivery lifecycle |
| DOC-07 | [07-atomic-component-conventions.md](rules/07-atomic-component-conventions.md) | PA-001, PA-030, PA-034, ED-005, ED-033, PDL-006–PDL-008 | [tests/test_07_atomic_component_conventions.py](tests/test_07_atomic_component_conventions.py) | Atomic component conventions |

## Detailed controls

### DOC-01 — Documentation source and publishing

**Objective.** These controls govern **documentation source and publishing**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** PA-013, PA-030–PA-032, ED-030–ED-033

**Normative requirements:**

- **DOC-01.01 — Keep maintained product documentation in one authoritative source tree.** The project MUST keep maintained product documentation in one authoritative source tree and render it with a maintained documentation engine. Contributors can build the same site locally from a clean checkout.
- **DOC-01.02 — Publish accurate installation, configuration, API, architecture, security, deployment, upgrade.** The project MUST publish accurate installation, configuration, API, architecture, security, deployment, upgrade, troubleshooting, and support guidance for each supported product profile.
- **DOC-01.03 — Treat executable examples as tested interfaces.** The project MUST treat executable examples as tested interfaces. The project MUST also validate TOML snippets, API requests, commands, and config examples automatically where possible; otherwise include them in release qualification.
- **DOC-01.04 — Explain prerequisites, hardware/runtime requirements, network access, persistent storage, failure.** The project MUST explain prerequisites, hardware/runtime requirements, network access, persistent storage, failure states, recovery, and data handling for each operation.
- **DOC-01.05 — Distinguish implemented behavior from planned behavior.** The project MUST distinguish implemented behavior from planned behavior. Mark preview or experimental features and state support limits.
- **DOC-01.06 — Keep diagrams in source control and update them when.** The project MUST keep diagrams in source control and update them when module boundaries, data flows, trust zones, or deployment topology changes.

**Rule document:** [rules/01-documentation-source-and-publishing.md](rules/01-documentation-source-and-publishing.md)

**Enforcement:** [tests/test_01_documentation_source_and_publishing.py](tests/test_01_documentation_source_and_publishing.py)

**Prohibited conditions:**

- The project MUST NOT maintain conflicting copies of setup instructions as independent sources of truth
- The project MUST NOT document an endpoint or build option that does not exist in the supported release
- The project MUST NOT expose secrets in examples or leave unverified command blocks
### DOC-02 — Design system and accessibility

**Objective.** These controls govern **design system and accessibility**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** PA-013, PA-030–PA-032, ED-030–ED-033

**Normative requirements:**

- **DOC-02.01 — Maintain design tokens, reusable components, interaction patterns, and accessibility.** The project MUST maintain design tokens, reusable components, interaction patterns, and accessibility guidance in a dedicated design directory/module.
- **DOC-02.02 — Build screens from reusable components with one responsibility, explicit.** The project MUST build screens from reusable components with one responsibility, explicit states, and consistent visual and interaction behavior.
- **DOC-02.03 — Target WCAG 2.** The project MUST target WCAG 2.2 Level AA for web interfaces. The project MUST also ensure keyboard operation, visible focus, accessible names and descriptions, sufficient contrast, zoom/reflow, error identification, and reduced-motion support.
- **DOC-02.04 — Provide loading, empty, success, validation-error, permission-denied, and service-failure states.** The project MUST provide loading, empty, success, validation-error, permission-denied, and service-failure states for interactive workflows.
- **DOC-02.05 — Keep the landing page, documentation UI, application UI.** The project MUST keep the landing page, documentation UI, application UI, and media workflows under clear monorepo ownership boundaries; they MUST NOT become engine runtime dependencies.

**Rule document:** [rules/02-design-system-and-accessibility.md](rules/02-design-system-and-accessibility.md)

**Enforcement:** [tests/test_02_design_system_and_accessibility.py](tests/test_02_design_system_and_accessibility.py)

**Prohibited conditions:**

- The project MUST NOT use color or animation as the only way to communicate state
- The project MUST NOT create one-off controls when a shared component is appropriate
- The project MUST NOT claim WCAG conformance based only on automated tooling
### DOC-03 — Documentation architecture and content types

**Objective.** This control defines the intended outcome for **documentation architecture and content types** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** ED-030–ED-032, PA-031

**Normative requirements:**

- **DOC-03.01 — Documentation MUST be organized by reader task: learning….** **Requirement:** Documentation MUST be organized by reader task: learning a first workflow, completing a task, consulting authoritative reference, or understanding design rationale. Each page MUST have one primary purpose and link to adjacent page types instead of combining them indiscriminately.
- **DOC-03.02 — Product documentation MUST identify supported package/profile, prerequisites….** **Requirement:** Product documentation MUST identify supported package/profile, prerequisites, exact commands, expected output, failure recovery, and version scope. Commands MUST be tested in a clean checkout or explicitly marked as illustrative.
- **DOC-03.03 — API, configuration, CLI, model descriptor….** **Requirement:** API, configuration, CLI, model descriptor, and deployment reference pages MUST derive from or be checked against the authoritative contract/schema. Every example MUST specify whether it is complete, partial, illustrative, or unsafe for production.
- **DOC-03.04 — Architecture diagrams MUST identify scope, legend, trust….** **Requirement:** Architecture diagrams MUST identify scope, legend, trust boundaries, runtime and build-time dependencies, data flow, deployment profile, and version reviewed. Diagrams MUST be updated when the represented behavior changes.
- **DOC-03.05 — Documentation navigation MUST reveal supported paths, lifecycle state….** **Requirement:** Documentation navigation MUST reveal supported paths, lifecycle state, audience, and deprecated guidance. Archived or unsupported instructions MUST be clearly marked and excluded from default search or onboarding routes.
- **DOC-03.06 — Published documentation MUST be built from versioned repository source….** **Requirement:** Published documentation MUST be built from versioned repository source with reproducible dependencies. Local preview and link/example validation MUST be available to contributors; publication failure MUST be visible.
- **DOC-03.07 — User-facing documentation MUST explain destructive actions, network access….** **Requirement:** User-facing documentation MUST explain destructive actions, network access, data retention, model downloads, resource needs, and required privileges before the user commits to them.

**Rule document:** [rules/03-documentation-architecture-and-content-types.md](rules/03-documentation-architecture-and-content-types.md)

**Enforcement:** [tests/test_03_documentation_architecture_and_content_types.py](tests/test_03_documentation_architecture_and_content_types.py)

**Prohibited conditions:**

- Do not keep conflicting quick-start copies with different commands or configuration schemas.
- Do not describe planned capabilities as available or use screenshots that conceal required warnings and choices.
### DOC-04 — Design system, interaction states, and accessibility

**Objective.** This control defines the intended outcome for **design system, interaction states, and accessibility** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** PA-030, ED-033

**Normative requirements:**

- **DOC-04.01 — Every user-facing interface MUST use shared design tokens….** **Requirement:** Every user-facing interface MUST use shared design tokens for color, typography, spacing, focus, motion, and responsive breakpoints. Token changes MUST be reviewed for contrast, theme, and high-contrast effects across all supported surfaces.
- **DOC-04.02 — Reusable components MUST expose semantic properties and predictable keyboard….** **Requirement:** Reusable components MUST expose semantic properties and predictable keyboard behavior. A component MUST NOT hide validation, authorization, loading, or failure behavior behind visual-only styling.
- **DOC-04.03 — Every interactive flow MUST define initial, loading….** **Requirement:** Every interactive flow MUST define initial, loading, empty, success, validation-error, permission-denied, unavailable, timeout, cancellation, and retry states where those states can occur.
- **DOC-04.04 — Web content MUST target WCAG 2. 2 Level….** **Requirement:** Web content MUST target WCAG 2.2 Level AA. Acceptance MUST be evaluated against applicable success criteria, not inferred from an automated score; manual keyboard and assistive-technology checks are required for critical workflows.
- **DOC-04.05 — Keyboard focus MUST remain visible, logical….** **Requirement:** Keyboard focus MUST remain visible, logical, and unobscured through dialogs, menus, streaming updates, and route changes. Drag-only or pointer-only interaction MUST have an equivalent single-pointer or keyboard path.
- **DOC-04.06 — Forms MUST expose programmatic labels, instructions, required….** **Requirement:** Forms MUST expose programmatic labels, instructions, required state, error association, correction guidance, and preserved user input after recoverable failures. Authentication flows MUST support accessible authentication criteria applicable to the chosen mechanism.
- **DOC-04.07 — Non-text content MUST have meaningful alternatives; audio/video demonstrations….** **Requirement:** Non-text content MUST have meaningful alternatives; audio/video demonstrations MUST provide captions or transcripts appropriate to the content and intended audience.
- **DOC-04.08 — Localization-ready interfaces MUST avoid concatenated sentence fragments, assume….** **Requirement:** Localization-ready interfaces MUST avoid concatenated sentence fragments, assume variable text expansion, preserve locale-sensitive formats, and define fallback behavior for missing translations.

**Rule document:** [rules/04-design-system-interaction-states-and-accessibility.md](rules/04-design-system-interaction-states-and-accessibility.md)

**Enforcement:** [tests/test_04_design_system_interaction_states_and_accessibility.py](tests/test_04_design_system_interaction_states_and_accessibility.py)

**Prohibited conditions:**

- Do not rely on color, animation, icon shape, hover, or sound alone to communicate state.
- Do not claim WCAG conformance from automated checks alone.
### DOC-05 — User research, content, and design review

**Objective.** This control defines the intended outcome for **user research, content, and design review** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** PA-001, PA-030–PA-032, ED-030–ED-033

**Normative requirements:**

- **DOC-05.01 — Design work MUST identify target user, task….** **Requirement:** Design work MUST identify target user, task, context of use, non-developer skill assumptions, accessibility needs, and failure cost before selecting a component or interaction pattern.
- **DOC-05.02 — High-impact workflows MUST be validated with representative users….** **Requirement:** High-impact workflows MUST be validated with representative users or documented usability review before broad release. Evidence MUST identify the scenario, observed friction, and resulting design decision without exposing participant personal data.
- **DOC-05.03 — User-facing error content MUST state what happened, what….** **Requirement:** User-facing error content MUST state what happened, what the user can safely do next, whether work was saved, and how to obtain support when recovery is not self-service.
- **DOC-05.04 — Product copy MUST distinguish local from hosted behavior….** **Requirement:** Product copy MUST distinguish local from hosted behavior, required from optional network access, and free/personal from licensed/commercial use according to approved legal terms.
- **DOC-05.05 — Demo and marketing media MUST identify the product version/profile….** **Requirement:** Demo and marketing media MUST identify the product version/profile shown, avoid implying unsupported performance or capabilities, include required third-party/model notices, and be reproducible from approved source assets where feasible.
- **DOC-05.06 — Design reviews MUST include privacy, data disclosure….** **Requirement:** Design reviews MUST include privacy, data disclosure, permission boundaries, accessibility, narrow/large viewport behavior, empty and failure states, and supportability in addition to visual consistency.
- **DOC-05.07 — When user research is not possible, the change….** **Requirement:** When user research is not possible, the change MUST record assumptions, risks, and a follow-up signal or feedback path rather than presenting assumptions as validated facts.

**Rule document:** [rules/05-user-research-content-and-design-review.md](rules/05-user-research-content-and-design-review.md)

**Enforcement:** [tests/test_05_user_research_content_and_design_review.py](tests/test_05_user_research_content_and_design_review.py)

**Prohibited conditions:**

- Do not publish marketing claims that exceed measured support or legal approval.
- Do not use real user data in design prototypes or media unless it is explicitly authorized and protected.
### DOC-06 — Website design and delivery lifecycle

**Objective.** Guide a website from audience and content discovery to information architecture, interaction design, implementation, publication, operation, and retirement, with quality measured at user journeys and page boundaries.

**Requirements traced:** PA-001, PA-004, PA-024, PA-030–PA-033, ED-030–ED-033, PDL-001–PDL-015

**Normative requirements:**

- **DOC-06.02 — Define information architecture and route contracts.** Create a page/route inventory and navigation model before implementation. For each route specify purpose, intended audience, content source and owner, access level, canonical URL/redirect behavior, metadata needs, and links to adjacent journeys. Group content by user mental model and task rather than internal org chart. Define search and findability needs for substantial content sets.
- **DOC-06.03 — Design complete user journeys and state transitions.** For each critical journey, document entry points, prerequisites, user actions, decisions, success, validation, loading, empty, permission-denied, partial, offline/timeout, service-error, retry, and recovery states. Define confirmation for destructive or irreversible actions, preservation of user input after correctable errors, and navigation/back behavior. Every state MUST have an accessible message and a clear next action where one exists.
- **DOC-06.04 — Specify content and interaction before visual polish.** Write or structure representative content and labels before final layout. Use semantic headings, links, buttons, forms, tables, and landmarks according to purpose. Make labels describe outcomes, validation errors identify how to recover, and help text available at the decision point. Separate content from presentation where localization, reuse, or editorial ownership requires it. Public claims MUST map to approved evidence and licensing.
- **DOC-06.05 — Design responsive, resilient behavior from content constraints.** Define layout behavior across viewport sizes, zoom/reflow, pointer and keyboard input, orientation, reduced motion, and constrained network/device capability. Content MUST remain readable and task-completable without relying on a specific screen size or hover. Prefer progressive enhancement and platform semantics where they reduce failure modes. Specify supported browser/device profiles and fallbacks for unavailable scripts, APIs, fonts, or media according to the product support matrix.
- **DOC-06.06 — Apply accessibility and privacy requirements in design.** Design to the project's WCAG 2.2 AA target and relevant legal/product requirements. Include keyboard path and visible focus, semantic structure, accessible names/descriptions, contrast, text resizing/reflow, error identification, non-color cues, captions/transcripts for meaningful media, and reduced-motion behavior. Define whether analytics, cookies, or telemetry are necessary; minimize collection, document consent/notice and retention where applicable, and do not collect sensitive fields through analytics or URL parameters.
- **DOC-06.07 — Define user-centered performance and reliability budgets.** Specify measurable budgets for critical routes and tasks, including transfer and resource size, loading, interaction responsiveness, layout stability, API latency, failure states, and supported network/device conditions. Choose current field or lab measures suited to the surface and explain sampling limits. Optimize the journey bottleneck using measurements; do not trade away accessibility, security, or correctness for a synthetic score. Define behavior when the server or essential API is unavailable.
- **DOC-06.08 — Design routes and content for security and search/publication needs.** For public content define indexability, canonicalization, metadata, robots/sitemap policy, redirects, and link lifecycle as appropriate; never expose private routes or secrets through indexing configuration. For authenticated surfaces, specify session/authentication transitions, authorization-denied behavior, CSRF/XSS/input risks, content security policy, safe external links, and cache behavior in coordination with security rules. Treat all user and CMS content as untrusted input and encode it for its output context.
- **DOC-06.09 — Keep site ownership and runtime boundary explicit.** Each site MUST have a product-area owner, build/test/deploy path, runtime dependencies, environment/configuration contract, content/design ownership, support route, and rollback/decommission procedure. Landing, docs, marketing/media, admin, and inference-engine UIs MUST NOT acquire hidden runtime/build dependencies on one another. Reuse MAY occur through versioned design packages with owners and compatibility policy.
- **DOC-06.10 — Verify journeys on rendered pages and maintain after publication.** Before release, test representative routes at supported viewports and input modes, keyboard-only and assistive technology paths, accessibility, browser console/network failures, links/forms, content correctness, performance budgets, security headers, and build/deployment rollback. Record route/profile coverage and known gaps. After publication monitor availability, errors, broken links, accessibility feedback, performance, search/indexing behavior where relevant, and content freshness; review ownership and retire stale routes safely.
- **DOC-06.11 — Integrate video as accessible, privacy-aware page content.** When a page uses video, the page MUST provide a descriptive title, poster, keyboard-accessible controls, captions in the supported language(s), transcript or equivalent content path, responsive dimensions, layout-space reservation, and a clear fallback. It MUST NOT rely on video alone to communicate essential product information or autoplay with sound. Before loading third-party player code, assess cookies, tracking, external requests, consent, availability, accessibility, and provider exit; use click-to-load or an approved first-party player when needed. Coordinate export profiles and source ownership with the [media production controls](../media-production/trails/00-references-trails.md).

**Rule document:** [rules/06-website-design-and-delivery-lifecycle.md](rules/06-website-design-and-delivery-lifecycle.md)

**Enforcement:** [tests/test_06_website_design_and_delivery_lifecycle.py](tests/test_06_website_design_and_delivery_lifecycle.py)
### DOC-07 — Atomic component conventions

**Objective.** Give teams a shared, practical component vocabulary and extraction method that supports reuse, consistency, accessibility, and independent maintenance without turning the atomic metaphor into arbitrary foldering or over-fragmentation.

**Requirements traced:** PA-001, PA-030, PA-034, ED-005, ED-033, PDL-006–PDL-008

**Normative requirements:**

- **DOC-07.02 — Extract a shared component only for a demonstrated boundary.** Create a shared component when repeated use, a stable semantic interaction, a design-system invariant, or independent ownership makes reuse valuable. Before extraction, identify callers, common behavior, variation points, accessibility contract, and owner. Keep one-off domain logic local until a second real use or a stable cross-feature contract justifies sharing. Do not create “generic” components with many flags for unrelated use cases; split when callers require conflicting semantics or state models.
- **DOC-07.03 — Give every reusable component a narrow contract.** Document purpose, semantic element/role, public props/slots/events, controlled versus internal state, defaults, valid combinations, keyboard behavior, accessible name/value/state, loading/error/disabled behavior, styling/token extension points, and unsupported use. Props MUST express domain meaning rather than leak implementation details. Use composition and typed variants for intentional differences; avoid boolean-prop combinations that create invalid or unexplained states.
- **DOC-07.04 — Keep state and business rules at the correct level.** Place transient presentation state at the smallest owner that MUST coordinate it. Place workflow or domain state in the feature/page/controller layer with explicit transitions and data ownership. Reusable primitives MUST NOT secretly fetch feature-specific data, own global session state, or make authorization decisions. Do not duplicate authoritative validation in UI as a substitute for server/domain enforcement.
- **DOC-07.05 — Preserve semantic/accessibility behavior through composition.** Components MUST compose into valid document semantics and retain keyboard/focus order, labels, descriptions, error associations, announcements, contrast, and target behavior. Components that render interactive content MUST not nest interactive controls or hide focus. Provide slots/composition where callers need meaningful headings or actions rather than accepting opaque markup that defeats semantics. Accessibility is tested on the composed page, not only the isolated component.
- **DOC-07.06 — Co-locate implementation evidence and examples.** For each reusable component family, keep implementation, tests, usage examples/stories, and design documentation in the established owning location. Demonstrate default, variant, responsive, empty, loading, disabled, invalid, permission-limited, and failure states as applicable. Examples MUST be realistic and accessible, and MUST NOT rely on production secrets or private data.
- **DOC-07.07 — Use explicit promotion, change, and deprecation rules.** Promote a feature-local component into the shared system only after review of reuse, API stability, owner, accessibility, and migration cost. Changes to shared props, tokens, semantics, or visuals require impact analysis across consumers and version/release coordination. Deprecate with replacement guidance and removal timing; avoid silent breaking changes. Remove unused components after checking dynamic references and documented consumers.
- **DOC-07.08 — Organize files around ownership and discoverability.** Use the repository’s established naming and directory conventions. Group components by product/domain or stable design-system ownership, not by atomic level alone when that fragments feature context. A dedicated `atoms/`, `molecules/`, `organisms/` hierarchy MAY be used only when it improves discovery and ownership; it MUST NOT become a required taxonomy that forces awkward placement. Keep public exports intentional and prevent cross-feature imports of private implementation files.

**Rule document:** [rules/07-atomic-component-conventions.md](rules/07-atomic-component-conventions.md)

**Enforcement:** [tests/test_07_atomic_component_conventions.py](tests/test_07_atomic_component_conventions.py)

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/documentation-and-design
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
