# Atomic component conventions

**Control family:** documentation-and-design  
**Control document:** DOC-07  
**Requirement trace:** PA-001, PA-030, PA-034, ED-005, ED-033, PDL-006–PDL-008  
**Status:** Normative project control

## Control objective

Give teams a shared, practical component vocabulary and extraction method that supports reuse, consistency, accessibility, and independent maintenance without turning the atomic metaphor into arbitrary foldering or over-fragmentation.

## Applicability

Applies to visual components in web/application UI and design-system packages. Domain modules and services follow architecture controls; the word “atomic” does not require every code concept to be a UI atom or a separate file/package.

## Normative requirements

### DOC-07.01 — Classify by responsibility and composition, not size alone

Use atomic-design terms as descriptive levels: **tokens/primitives** are design values and native/basic elements; **atoms** are small styled controls with one UI responsibility; **molecules** combine a few primitives into a coherent reusable interaction; **organisms** form a substantial region with a clear user purpose; **templates** arrange regions/content slots into a page structure; **pages** bind a template to real route data, permissions, and states. Teams MAY adapt names, but MUST document equivalent levels consistently. A small component is not automatically an atom, and a large component is not automatically an organism.

### DOC-07.02 — Extract a shared component only for a demonstrated boundary

Create a shared component when repeated use, a stable semantic interaction, a design-system invariant, or independent ownership makes reuse valuable. Before extraction, identify callers, common behavior, variation points, accessibility contract, and owner. Keep one-off domain logic local until a second real use or a stable cross-feature contract justifies sharing. Do not create “generic” components with many flags for unrelated use cases; split when callers require conflicting semantics or state models.

### DOC-07.03 — Give every reusable component a narrow contract

Document purpose, semantic element/role, public props/slots/events, controlled versus internal state, defaults, valid combinations, keyboard behavior, accessible name/value/state, loading/error/disabled behavior, styling/token extension points, and unsupported use. Props MUST express domain meaning rather than leak implementation details. Use composition and typed variants for intentional differences; avoid boolean-prop combinations that create invalid or unexplained states.

### DOC-07.04 — Keep state and business rules at the correct level

Place transient presentation state at the smallest owner that MUST coordinate it. Place workflow or domain state in the feature/page/controller layer with explicit transitions and data ownership. Reusable primitives MUST NOT secretly fetch feature-specific data, own global session state, or make authorization decisions. Do not duplicate authoritative validation in UI as a substitute for server/domain enforcement.

### DOC-07.05 — Preserve semantic/accessibility behavior through composition

Components MUST compose into valid document semantics and retain keyboard/focus order, labels, descriptions, error associations, announcements, contrast, and target behavior. Components that render interactive content MUST not nest interactive controls or hide focus. Provide slots/composition where callers need meaningful headings or actions rather than accepting opaque markup that defeats semantics. Accessibility is tested on the composed page, not only the isolated component.

### DOC-07.06 — Co-locate implementation evidence and examples

For each reusable component family, keep implementation, tests, usage examples/stories, and design documentation in the established owning location. Demonstrate default, variant, responsive, empty, loading, disabled, invalid, permission-limited, and failure states as applicable. Examples MUST be realistic and accessible, and MUST NOT rely on production secrets or private data.

### DOC-07.07 — Use explicit promotion, change, and deprecation rules

Promote a feature-local component into the shared system only after review of reuse, API stability, owner, accessibility, and migration cost. Changes to shared props, tokens, semantics, or visuals require impact analysis across consumers and version/release coordination. Deprecate with replacement guidance and removal timing; avoid silent breaking changes. Remove unused components after checking dynamic references and documented consumers.

### DOC-07.08 — Organize files around ownership and discoverability

Use the repository’s established naming and directory conventions. Group components by product/domain or stable design-system ownership, not by atomic level alone when that fragments feature context. A dedicated `atoms/`, `molecules/`, `organisms/` hierarchy MAY be used only when it improves discovery and ownership; it MUST NOT become a required taxonomy that forces awkward placement. Keep public exports intentional and prevent cross-feature imports of private implementation files.

## Decision procedure

For a proposed abstraction, ask: Is the behavior repeated or invariant? Do callers share semantics and state transitions? Is there a stable owner and API? Does composition preserve accessibility? Would a local component remain clearer? Compare extraction cost, duplication risk, coupling, and future change direction. Prefer the simplest cohesive boundary that answers those questions. Refactor only when evidence shows repeated change, inconsistency, or ownership confusion—not merely to match a diagram.

## Prohibited conditions

- One-file-per-element or one-package-per-control fragmentation without a real independent boundary.
- Shared components that conceal network calls, authorization, business workflows, or hidden global state.
- A component API whose combinations permit invalid states or whose generic styling bypasses design tokens.
- Atomic category labels used as a substitute for clear responsibility, ownership, tests, or accessibility.

## Assessment procedure

**Examine:** sample primitive, composite, and page components; inspect ownership, public exports, prop/state API, stories/tests, and consumer coupling.

**Interview:** ask a maintainer to explain why the abstraction is shared, how a new use case composes it, and how API changes reach consumers.

**Test:** render representative variants and composed flows; test semantic/accessibility tree, keyboard behavior, invalid combinations, state transitions, and change impact across consumers.

## Assessment determination

Pass when component boundaries are cohesive, contracts and states are explicit, reuse is justified, and composed usage remains accessible and maintainable. Fail when categories dictate placement regardless of responsibility, generic APIs hide incompatible use, or the component breaks page-level semantics. Not applicable requires scope and rationale.

## Required evidence

Component/design-system index; API and usage examples; design references/tokens; focused tests or stories; accessibility evidence at component and page levels; promotion/deprecation decision where applicable.

## Exceptions and nonconformance

A MUST exception requires the design-system owner and affected product-area owner. Record scope, reason, accessibility/maintenance impact, migration or revisit trigger, and expiry where temporary.

## Reference trail

Sources R1 and R6 are listed in [00-references-trails.md](../trails/00-references-trails.md). System module boundaries remain governed by [architecture controls](../../architecture/trails/00-references-trails.md).
