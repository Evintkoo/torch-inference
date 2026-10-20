# Torviello Enforcer

This directory holds the normative engineering rules and the conformance tests that enforce them, derived from the manual review, project requirements, and applicable industry standards. Rules and their enforcement tests are merged: each subdirectory is a rule domain that contains both the rule documents and the generated tests that check them against the product source. Each domain directory separates its `trails/`, `rules/`, and `tests/`. The governance domain defines instruction authority, rule-writing quality, coverage, conformance, and the operating standard for coding agents. The development workflow is defined one stage per control: [GOV-06 Domain-Driven Design](governance/rules/06-domain-driven-design.md) establishes meaning, [GOV-07 Specification-Driven Development](governance/rules/07-specification-driven-development.md) defines expected behavior, [GOV-08 Contract-Driven Development](governance/rules/08-contract-driven-development.md) fixes integration boundaries, [GOV-09 Test-Driven Development](governance/rules/09-test-driven-development.md) guides implementation, and [GOV-10 Evaluation-Driven Development](governance/rules/10-evaluation-driven-development.md) determines whether the whole result is acceptable. These stages operate as one connected, iterative flow and are additive to every domain control. Domain trails map each control to requirement IDs and authoritative sources; numbered files state what to do, what to consider when choosing a design, what to avoid, and how to verify the result.

## Layout

- `<domain>/` — one rule domain with `trails/` (sources and requirement map), `rules/` (numbered normative documents), and `tests/` (generated conformance tests). Each domain also has a detailed `README.md` and `AGENTS.md`.
- `tools/generate_rule_tests.py` — generates the enforcement tests from the rule documents.
- `test_rules_*.py` — corpus-level checks for document format, the domain index, and instruction files.

## Running and regenerating enforcement

```sh
uv run --locked pytest
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

## Rule domains

- [Governance and agent standards](governance/trails/00-references-trails.md)
- [Organization and decision authority](organization/trails/00-references-trails.md)
- [People and work lifecycle](people-and-work/trails/00-references-trails.md)
- [Collaboration and communication](collaboration-and-communication/trails/00-references-trails.md)
- [Stakeholder relations](stakeholder-relations/trails/00-references-trails.md)
- [API](api/trails/00-references-trails.md)
- [Architecture](architecture/trails/00-references-trails.md)
- [Change management](change-management/trails/00-references-trails.md)
- [Product discovery and delivery lifecycle](product-discovery-and-delivery/trails/00-references-trails.md)
- [Code quality](code-quality/trails/00-references-trails.md)
- [Configuration](configuration/trails/00-references-trails.md)
- [Directory structure](directory/trails/00-references-trails.md)
- [Documentation and design](documentation-and-design/trails/00-references-trails.md)
- [Licensing](licensing/trails/00-references-trails.md)
- [Media and video production](media-production/trails/00-references-trails.md)
- [Model registry and artifacts](models/trails/00-references-trails.md)
- [Monorepo boundaries](monorepo/trails/00-references-trails.md)
- [Observability](observability/trails/00-references-trails.md)
- [Deployment and operations](operations/trails/00-references-trails.md)
- [Performance](performance/trails/00-references-trails.md)
- [Persistence](persistence/trails/00-references-trails.md)
- [Portability](portability/trails/00-references-trails.md)
- [Packaging and releases](releases/trails/00-references-trails.md)
- [Security](security/trails/00-references-trails.md)
- [Stack and cost](vendor-and-cost/trails/00-references-trails.md)
- [Verification](verification/trails/00-references-trails.md)

## How to navigate and expand coverage

Each domain trail is the domain index: it lists every rule document, project requirement IDs, and the source trail used to develop the controls. Read the rule documents for the enforceable procedures; read the source trail for provenance and review cadence. The numbered documents cover distinct control families and are not a closed checklist of all possible cases. Domain owners must review coverage across discovery, design, implementation, verification, release, operation, incident response, and retirement, record gaps or non-applicability with rationale, and expand the rules when new risks or product decisions appear.

## Apply standards from system to code and person to person

For engineering decisions, start with user and product outcomes and approved requirements; derive system quality attributes, trust boundaries, deployment and failure constraints; then define architecture and ownership boundaries, module contracts and dependency direction, public interfaces, local types and control flow, and finally concrete tests and evidence. A lower-level choice must preserve the invariants and decisions above it. When a change crosses levels, update the affected decision records, controls, interfaces, tests, and operator guidance together. The code-quality trail maps these levels to their control families.

For instruction authority, follow the precedence defined in [rule hierarchy](governance/rules/01-rule-hierarchy-and-authority.md) and the agent operating standard in [GOV-04](governance/rules/04-agent-operating-and-change-evidence-standard.md). For human and team work, use the [person-action coverage map](organization/trails/00-references-trails.md) to locate the responsible workflow controls. Roles are functional responsibilities; named staff assignments are a separate organization decision.


## Person-action coverage map

The organization trail indexes rules for recurring actions from role assignment and work acceptance through recruitment, onboarding, work assignment, access, spending, decisions, communications, customer support, publication, incident response, handover, and exit. Use it to locate controls; follow the linked domain documents for required actions, authority, evidence, and escalation.

## Manual-review lifecycle coverage

The originating manual review is local-only context, not a repository artifact. Apply the cross-cutting lifecycle in [product discovery and delivery](product-discovery-and-delivery/trails/00-references-trails.md) plus the technical domain rules listed here. The originating note is user-authored context, not a substitute for a scoped requirement, approved decision, or verification evidence.

| Manual-review concern | Rule domains to apply across discovery → operation/retirement |
|---|---|
| Packaging and offline, cross-platform builds | [releases](releases/trails/00-references-trails.md), [portability](portability/trails/00-references-trails.md), [vendor/cost](vendor-and-cost/trails/00-references-trails.md), [security](security/trails/00-references-trails.md), [verification](verification/trails/00-references-trails.md) |
| Canonical configuration | [configuration](configuration/trails/00-references-trails.md), [architecture](architecture/trails/00-references-trails.md), [documentation/design](documentation-and-design/trails/00-references-trails.md), [verification](verification/trails/00-references-trails.md) |
| System canvas, service deployment, monorepo, backend/full releases | [architecture](architecture/trails/00-references-trails.md), [monorepo](monorepo/trails/00-references-trails.md), [releases](releases/trails/00-references-trails.md), [operations](operations/trails/00-references-trails.md), [documentation/design](documentation-and-design/trails/00-references-trails.md) |
| Logging and monitoring | [observability](observability/trails/00-references-trails.md), [security](security/trails/00-references-trails.md), [operations](operations/trails/00-references-trails.md), [verification](verification/trails/00-references-trails.md) |
| Code structure, lint, dead code, file size, module boundaries, APIs, tests, benchmarks | [code quality](code-quality/trails/00-references-trails.md), [directory](directory/trails/00-references-trails.md), [API](api/trails/00-references-trails.md), [performance](performance/trails/00-references-trails.md), [verification](verification/trails/00-references-trails.md), [architecture](architecture/trails/00-references-trails.md) |
| Authentication, accounts, database, registry administration | [security](security/trails/00-references-trails.md), [persistence](persistence/trails/00-references-trails.md), [API](api/trails/00-references-trails.md), [models](models/trails/00-references-trails.md), [operations](operations/trails/00-references-trails.md) |
| GPU backends, modular capabilities, downloads, performance | [performance](performance/trails/00-references-trails.md), [portability](portability/trails/00-references-trails.md), [architecture](architecture/trails/00-references-trails.md), [models](models/trails/00-references-trails.md), [releases](releases/trails/00-references-trails.md) |
| Security, license, commercial use, dependencies, stacks and cost | [security](security/trails/00-references-trails.md), [licensing](licensing/trails/00-references-trails.md), [vendor/cost](vendor-and-cost/trails/00-references-trails.md), [organization](organization/trails/00-references-trails.md), [stakeholder relations](stakeholder-relations/trails/00-references-trails.md) |
| Design system, atomic UI, docs engine/site, marketing/demo media | [documentation/design](documentation-and-design/trails/00-references-trails.md), [media production](media-production/trails/00-references-trails.md), [monorepo](monorepo/trails/00-references-trails.md), [licensing](licensing/trails/00-references-trails.md), [stakeholder relations](stakeholder-relations/trails/00-references-trails.md) |
| Domain model, specifications, contracts, tests, evaluations, and traceability (DDD → SDD → CDD → TDD → EDD) | [governance](governance/trails/00-references-trails.md), [architecture](architecture/trails/00-references-trails.md), [API](api/trails/00-references-trails.md), [verification](verification/trails/00-references-trails.md), [releases](releases/trails/00-references-trails.md) |
| Work planning, agents, human/team actions, communications and handoffs | [product lifecycle](product-discovery-and-delivery/trails/00-references-trails.md), [change management](change-management/trails/00-references-trails.md), [governance](governance/trails/00-references-trails.md), [people and work](people-and-work/trails/00-references-trails.md), [collaboration](collaboration-and-communication/trails/00-references-trails.md), [organization](organization/trails/00-references-trails.md) |

Each linked domain trail supplies its own stage-by-stage coverage and source mapping. If an item has no named owner, evidence, or lifecycle control, treat it as a coverage gap and create or update the relevant requirement and domain rule before claiming it is planned or complete.

## Control language and evidence

Numbered documents are normative project controls, not summaries of external standards. Each document has a stable control-document ID, applicability, an intended outcome, individually numbered requirements, prohibited conditions, applicable assessment procedures, an explicit pass/fail determination, evidence requirements, and an exception process. Implementation guidance is included when it adds actionable detail beyond the requirements. A domain's `00-references-trails.md` maps its controls to project requirement IDs and authoritative technical sources. Applicability dispositions, conformance assessments, and exceptions are recorded in the [governance assurance register](governance/assurance-register.md); domain trails link to evidence and review records rather than asserting unsupported completion.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" have the meanings described by [IETF BCP 14](https://www.rfc-editor.org/info/bcp14/) only when they appear in all capitals. The control design is informed by outcome-focused controls in [NIST SP 800-53 Rev. 5, Release 5.2.0](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) and assessment methods in [NIST SP 800-53A Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final), tailored to this repository. This does not assert that Torviello has adopted a NIST baseline or achieved certification.

Update the affected control documents and this index when domains are added, renamed, or split.
