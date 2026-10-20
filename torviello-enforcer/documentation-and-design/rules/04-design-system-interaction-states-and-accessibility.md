# Design system, interaction states, and accessibility

**Control family:** documentation-and-design  
**Control document:** DOC-04  
**Requirement trace:** PA-030, ED-033  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **design system, interaction states, and accessibility** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed documentation-and-design behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### DOC-04.01 — Every user-facing interface MUST use shared design tokens…

**Requirement:** Every user-facing interface MUST use shared design tokens for color, typography, spacing, focus, motion, and responsive breakpoints. Token changes MUST be reviewed for contrast, theme, and high-contrast effects across all supported surfaces.

### DOC-04.02 — Reusable components MUST expose semantic properties and predictable keyboard…

**Requirement:** Reusable components MUST expose semantic properties and predictable keyboard behavior. A component MUST NOT hide validation, authorization, loading, or failure behavior behind visual-only styling.

### DOC-04.03 — Every interactive flow MUST define initial, loading…

**Requirement:** Every interactive flow MUST define initial, loading, empty, success, validation-error, permission-denied, unavailable, timeout, cancellation, and retry states where those states can occur.

### DOC-04.04 — Web content MUST target WCAG 2. 2 Level…

**Requirement:** Web content MUST target WCAG 2.2 Level AA. Acceptance MUST be evaluated against applicable success criteria, not inferred from an automated score; manual keyboard and assistive-technology checks are required for critical workflows.

### DOC-04.05 — Keyboard focus MUST remain visible, logical…

**Requirement:** Keyboard focus MUST remain visible, logical, and unobscured through dialogs, menus, streaming updates, and route changes. Drag-only or pointer-only interaction MUST have an equivalent single-pointer or keyboard path.

### DOC-04.06 — Forms MUST expose programmatic labels, instructions, required…

**Requirement:** Forms MUST expose programmatic labels, instructions, required state, error association, correction guidance, and preserved user input after recoverable failures. Authentication flows MUST support accessible authentication criteria applicable to the chosen mechanism.

### DOC-04.07 — Non-text content MUST have meaningful alternatives; audio/video demonstrations…

**Requirement:** Non-text content MUST have meaningful alternatives; audio/video demonstrations MUST provide captions or transcripts appropriate to the content and intended audience.

### DOC-04.08 — Localization-ready interfaces MUST avoid concatenated sentence fragments, assume…

**Requirement:** Localization-ready interfaces MUST avoid concatenated sentence fragments, assume variable text expansion, preserve locale-sensitive formats, and define fallback behavior for missing translations.

## Prohibited conditions

- Do not rely on color, animation, icon shape, hover, or sound alone to communicate state.
- Do not claim WCAG conformance from automated checks alone.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to design system, interaction states, and accessibility. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Run automated accessibility rules and manually test keyboard-only completion, focus order, zoom/reflow, screen-reader names/errors, motion settings, and representative failure states.
- Exercise negative, boundary, and failure cases identified by the control; record actual versus expected behavior. A skipped required check is not passing evidence.

## Assessment determination

Assess each control ID as **pass**, **fail**, or **not applicable**. Pass requires every applicable MUST to be implemented and supported by current evidence. Fail applies when behavior contradicts a requirement, enforcement is bypassable, evidence is missing/stale, or a required scenario cannot be reproduced. Not applicable requires a condition stated by the requirement and reviewer rationale.

## Required evidence

- Change/design record with applicable control IDs, requirement IDs, and accountable owner.
- Automated or documented manual evidence covering the domain-specific verification above on a stated revision and environment.
- Exception record where an approved deviation exists, including scope, risk, compensating controls, owner, approval, and expiry.

## Exceptions and nonconformance

A deviation from a MUST requirement requires accountable owner approval before release. Record affected control IDs and profiles, risk, compensating measures, remediation owner, and expiry/review date. A SHOULD deviation requires rationale and impact in the change record. An expired or unapproved exception is a nonconformance and MUST block a release when the affected control is release-critical.

## Reference trail

Source IDs R3 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
