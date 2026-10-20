# Website design and delivery lifecycle

**Control family:** documentation-and-design  
**Control document:** DOC-06  
**Requirement trace:** PA-001, PA-004, PA-024, PA-030–PA-033, ED-030–ED-033, PDL-001–PDL-015  
**Status:** Normative project control

## Control objective

Guide a website from audience and content discovery to information architecture, interaction design, implementation, publication, operation, and retirement, with quality measured at user journeys and page boundaries.

## Applicability

Applies to the landing page, product/application UI, administration console, documentation site, demo or marketing site, and any web-delivered workflow. Each surface has its own audience, owner, release and support lifecycle, even when sharing a design system or monorepo.

## Normative requirements

### DOC-06.01 — Establish audience, purpose, and success before choosing layout

For each site/surface, identify primary and secondary audiences, user goals, tasks, context, language, device/network assumptions, content owner, business or service outcome, and measurable success/failure signals. Validate consequential assumptions using user/operator evidence. Do not begin with a framework, visual style, or reference website as the problem statement.

### DOC-06.02 — Define information architecture and route contracts

Create a page/route inventory and navigation model before implementation. For each route specify purpose, intended audience, content source and owner, access level, canonical URL/redirect behavior, metadata needs, and links to adjacent journeys. Group content by user mental model and task rather than internal org chart. Define search and findability needs for substantial content sets.

### DOC-06.03 — Design complete user journeys and state transitions

For each critical journey, document entry points, prerequisites, user actions, decisions, success, validation, loading, empty, permission-denied, partial, offline/timeout, service-error, retry, and recovery states. Define confirmation for destructive or irreversible actions, preservation of user input after correctable errors, and navigation/back behavior. Every state MUST have an accessible message and a clear next action where one exists.

### DOC-06.04 — Specify content and interaction before visual polish

Write or structure representative content and labels before final layout. Use semantic headings, links, buttons, forms, tables, and landmarks according to purpose. Make labels describe outcomes, validation errors identify how to recover, and help text available at the decision point. Separate content from presentation where localization, reuse, or editorial ownership requires it. Public claims MUST map to approved evidence and licensing.

### DOC-06.05 — Design responsive, resilient behavior from content constraints

Define layout behavior across viewport sizes, zoom/reflow, pointer and keyboard input, orientation, reduced motion, and constrained network/device capability. Content MUST remain readable and task-completable without relying on a specific screen size or hover. Prefer progressive enhancement and platform semantics where they reduce failure modes. Specify supported browser/device profiles and fallbacks for unavailable scripts, APIs, fonts, or media according to the product support matrix.

### DOC-06.06 — Apply accessibility and privacy requirements in design

Design to the project's WCAG 2.2 AA target and relevant legal/product requirements. Include keyboard path and visible focus, semantic structure, accessible names/descriptions, contrast, text resizing/reflow, error identification, non-color cues, captions/transcripts for meaningful media, and reduced-motion behavior. Define whether analytics, cookies, or telemetry are necessary; minimize collection, document consent/notice and retention where applicable, and do not collect sensitive fields through analytics or URL parameters.

### DOC-06.07 — Define user-centered performance and reliability budgets

Specify measurable budgets for critical routes and tasks, including transfer and resource size, loading, interaction responsiveness, layout stability, API latency, failure states, and supported network/device conditions. Choose current field or lab measures suited to the surface and explain sampling limits. Optimize the journey bottleneck using measurements; do not trade away accessibility, security, or correctness for a synthetic score. Define behavior when the server or essential API is unavailable.

### DOC-06.08 — Design routes and content for security and search/publication needs

For public content define indexability, canonicalization, metadata, robots/sitemap policy, redirects, and link lifecycle as appropriate; never expose private routes or secrets through indexing configuration. For authenticated surfaces, specify session/authentication transitions, authorization-denied behavior, CSRF/XSS/input risks, content security policy, safe external links, and cache behavior in coordination with security rules. Treat all user and CMS content as untrusted input and encode it for its output context.

### DOC-06.09 — Keep site ownership and runtime boundary explicit

Each site MUST have a product-area owner, build/test/deploy path, runtime dependencies, environment/configuration contract, content/design ownership, support route, and rollback/decommission procedure. Landing, docs, marketing/media, admin, and inference-engine UIs MUST NOT acquire hidden runtime/build dependencies on one another. Reuse MAY occur through versioned design packages with owners and compatibility policy.

### DOC-06.10 — Verify journeys on rendered pages and maintain after publication

Before release, test representative routes at supported viewports and input modes, keyboard-only and assistive technology paths, accessibility, browser console/network failures, links/forms, content correctness, performance budgets, security headers, and build/deployment rollback. Record route/profile coverage and known gaps. After publication monitor availability, errors, broken links, accessibility feedback, performance, search/indexing behavior where relevant, and content freshness; review ownership and retire stale routes safely.

### DOC-06.11 — Integrate video as accessible, privacy-aware page content

When a page uses video, the page MUST provide a descriptive title, poster, keyboard-accessible controls, captions in the supported language(s), transcript or equivalent content path, responsive dimensions, layout-space reservation, and a clear fallback. It MUST NOT rely on video alone to communicate essential product information or autoplay with sound. Before loading third-party player code, assess cookies, tracking, external requests, consent, availability, accessibility, and provider exit; use click-to-load or an approved first-party player when needed. Coordinate export profiles and source ownership with the [media production controls](../../media-production/trails/00-references-trails.md).

## Website design procedure

1. State audience, need, success measure, and evidence; resolve owners and sensitive-data constraints.
2. Inventory routes/content and draw the navigation and task flows.
3. Define page contracts and journey states before choosing page templates.
4. Create low-fidelity wireframes and content prototypes; review with representative users and accessibility/engineering/operations roles.
5. Define responsive behavior, design-system tokens/components, browser support, security/privacy and performance budgets.
6. Build semantic page structure and interactions; integrate approved reusable components and content source.
7. Validate rendered journeys against acceptance across viewports, assistive technology, failure cases and budgets.
8. Release with ownership, rollback, monitoring, content maintenance, and review/retirement triggers.

## Prohibited conditions

- Designing pages solely as visual mockups without content, routes, task flows, and non-happy states.
- Using inaccessible custom controls when semantic native controls meet the need.
- Relying on client-side rendering for critical content without an approved crawlability, resilience, and accessibility strategy.
- Treating automated audits or a single device screenshot as proof of usability or accessibility.

## Assessment procedure

**Examine:** site brief, route/page inventory, journey diagrams, content ownership, responsive/accessibility specs, threat/performance budgets, deployment and monitoring evidence.

**Interview:** ask a user/operator to complete representative tasks and explain where recovery, content, permissions, or navigation are unclear.

**Test:** exercise critical journeys at supported breakpoints with keyboard and representative screen reader; inject network/API failures; measure agreed field/lab performance and verify security headers and publication behavior.

## Assessment determination

Pass when critical journeys are specified, accessible, resilient, measurable, owned, and verified at the rendered route level. Fail when a key task or state has no design/acceptance, user data is exposed, or release/maintenance ownership is absent. Not applicable requires a bounded rationale.

## Required evidence

Audience/problem record; page and route inventory; journey/state designs; content and component references; accessibility, performance, security/privacy and browser-support criteria; rendered test results; deployment, monitoring, and owner records.

## Exceptions and nonconformance

A MUST exception requires the surface owner and relevant accessibility, security, privacy, product, or operations authority. Identify users and routes affected, equivalent access or mitigation, residual risk, owner, and expiry. Do not use exceptions to waive applicable law or contractual commitments.

## Reference trail

Sources R1 and R4–R6 are listed in [00-references-trails.md](../trails/00-references-trails.md). Product discovery and acceptance lifecycle controls are in [product-discovery-and-delivery](../../product-discovery-and-delivery/trails/00-references-trails.md).
