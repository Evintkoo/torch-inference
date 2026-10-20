# Requirements engineering and quality

**Control family:** product-discovery-and-delivery  
**Control document:** PDL-02  
**Requirement trace:** PDL-004–PDL-007, PDL-013–PDL-014, ED-011, ED-042  
**Status:** Normative project control

## Control objective

Convert approved needs and constraints into a coherent, testable, traceable specification that covers ordinary operation, boundaries, failures, quality attributes, and acceptance without prematurely prescribing implementation.

## Applicability

Applies to product, system, service, API, data, security, operational, packaging, documentation, design, and organizational workflow requirements that materially constrain delivery. Scale the artifact depth to risk, but preserve stable identity and verification for every committed outcome.

## Normative requirements

All-capital normative terms have BCP 14 meaning.

### PDL-02.01 — Give each requirement identity, source, rationale, and ownership

Each committed requirement MUST have a stable unique ID, priority, accountable owner, source need or approved constraint, rationale, affected profiles, and verification method. IDs MUST remain stable when wording changes; retired or split requirements MUST retain a disposition and successor links. Priority labels MUST have a defined project meaning and MUST NOT substitute for risk assessment.

### PDL-02.02 — Write requirements as observable outcomes

A requirement MUST state one necessary outcome, the actor/system and trigger where relevant, externally observable behavior, applicable conditions, and measurable limits or failure behavior. It MUST be clear, consistent, feasible, bounded, and verifiable. Separate implementation rationale and examples from normative behavior. Avoid unbounded terms such as “fast,” “secure,” “easy,” “all,” or “best” unless defined by measurable criteria and scope.

### PDL-02.03 — Define system context, boundary, and interfaces

The specification MUST identify affected components, users, external systems, data flows, trust boundaries, dependencies, and ownership. For interfaces, define inputs, outputs, semantics, errors, limits, authentication/authorization, compatibility, versioning, and operational expectations as applicable. Record assumptions about external services and behavior on loss, delay, duplication, or malformed responses.

### PDL-02.04 — Derive quality scenarios and failure behavior

For each affected profile, evaluate security, privacy, safety where applicable, reliability, performance, resource use, accessibility, portability, compatibility, operability, maintainability, and recoverability. Applicable concerns MUST have a scenario with stimulus/context, expected response, and threshold or evidence; non-applicability MUST have rationale. Include normal, boundary, degraded, abuse, and recovery conditions proportionate to the risk.

### PDL-02.05 — Include data lifecycle and migration requirements

Where data changes, specify classification, source, ownership, validation, integrity, consistency, retention, backup/restore, export, deletion, migration, downgrade/rollback, and compatibility behavior. Identify which requirements are local/offline versus hosted and what happens when storage or dependencies are unavailable. Link the relevant persistence and privacy controls.

### PDL-02.06 — Separate requirement, design decision, and implementation detail

State what outcome MUST hold in requirements; place selected patterns, component placement, protocol, schema, vendor, and algorithm in an approved design/decision artifact unless already fixed by a constraint. Link the decision to the requirement and record alternatives, rationale, risks, and change triggers. A constraint that fixes a design MUST cite its authority.

### PDL-02.07 — Define acceptance and verification before implementation

Every committed requirement MUST identify objective acceptance evidence, responsible verifier/authority, applicable test level or inspection method, and conditions for pass, fail, or not applicable. Cover negative and failure paths where security, compatibility, data integrity, resource limits, or reliability are involved. Manual checks MUST state steps and expected results; unavailable checks are recorded as limitations, not passes.

### PDL-02.08 — Maintain bidirectional traceability and configuration baseline

Maintain links from source need to requirement, decision/design, implementation change, verification evidence, release/profile, and operational signal where applicable. Identify uncovered requirements, orphan changes/tests, deferred items, and out-of-scope items. Baseline the approved specification revision for planning; material changes trigger impact analysis and owner review before the baseline changes.

### PDL-02.09 — Review specification quality across roles

Before commitment, obtain review from the relevant product/user, engineering, security/privacy, operations, accessibility/design, support, and legal/compliance roles when the change affects their concerns. The author MUST resolve or record objections, assumptions, and accepted risk; review participation does not transfer accountability from the decision owner.

## Prohibited conditions

- Requirements that only prescribe code structure without a justified system constraint.
- Acceptance criteria that depend on subjective approval without observable evidence.
- Conflicting duplicates or silently overwritten IDs.
- Requirements that omit relevant degradation, compatibility, or data behavior.

## Decision procedure

First confirm the need and scope, then establish context and constraints, derive functional and quality requirements, compare them for consistency and feasibility, assign IDs and verification, review with affected roles, and baseline only after owner disposition. Where a quality attribute is not yet quantifiable, define a bounded investigation and decision date rather than inventing a threshold.

## Assessment procedure

**Examine:** trace a sample from need through IDs, design, implementation, checks, and release. Inspect quality scenarios, data/interface behavior, and disposition of unresolved comments.

**Interview:** ask implementers and reviewers to explain intended behavior and failure outcomes from the spec alone.

**Test:** independently derive test cases from selected requirements and compare to specified acceptance. Check trace queries for missing implementation, missing verification, and changed requirements without impact review.

## Assessment determination

Pass requires every in-scope committed requirement to be unambiguous, owned, traceable, and verifiable, with quality concerns assessed. Fail if materially different interpretations are reasonable, a requirement lacks evidence criteria, or baseline changes bypass impact review. Not applicable requires rationale.

## Required evidence

Approved specification with revision, source/requirement trace, context and quality scenarios, decision links, review dispositions, acceptance matrix, and change history.

## Exceptions and nonconformance

A MUST exception requires product/system owner approval and relevant domain authority. Identify affected requirement IDs, profiles, residual risk, compensating measures, downstream release impact, owner, and expiry/review date. Exceptions do not convert unmet requirements into accepted results.

## Reference trail

Source IDs R1–R4 are in [00-references-trails.md](../trails/00-references-trails.md).
