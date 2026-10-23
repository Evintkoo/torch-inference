# Torviello

The execution layer for AI. Torviello is an AI-native engineering infrastructure brand; its initial product is a PyTorch-based inference engine designed for AI workloads.

This repository contains product requirements, the repository shape for the product units, normative engineering rules, and a non-production scaffold under `services/` and `web/`. The presence of a directory, requirement, rule, or buildable scaffold does not establish product implementation or conformance.

## Competitive target

Torviello aims to be the fastest and lightest inference engine in a declared, reproducible benchmark envelope. That claim is earned, not asserted: [RP-016–RP-017](requirements/runtime-and-platform.md) require a pinned competitor set, identical hardware and workloads, one harness, published latency/throughput/memory/startup/artifact evidence, and enforced footprint budgets. [PERF-06](torviello-enforcer/performance/rules/06-competitive-performance-and-footprint.md) governs the claim, and [OD-005–OD-006](requirements/open-decisions.md) must be resolved before any public "fastest" or "lightest" statement.

## Product architecture

- `torviello-engine/` — core PyTorch inference runtime. Brand message: *Inference built for AI-native systems.*
- `torviello-serve/` — model serving layer.
- `torviello-bench/` — performance benchmarking.
- `torviello-cloud/` — reserved shape for the proposed managed inference offering; not implemented.
- `torviello-design/` — brand identity, design tokens, UI components, and visual assets.
- `torviello-landing/` — public landing page and marketing site.
- `torviello-docs/` — documentation site.
- `torviello-media/` — product demo and marketing video production.
- `torviello-roles/` — hands-on role execution contracts and the agentic ticket store; tracked work starts here.

Each unit carries the same lifecycle shape: `domain/`, `specifications/`, `contracts/`, `src/`, `tests/`, and `evaluations/`, with `README.md` and `AGENTS.md` in every directory.

### Root hygiene

The repository root stays clean. Its committed file set is fixed: license and
legal files, `AGENTS.md`, `README.md`, `CODEOWNERS`, `CONTRIBUTING.md`,
`SECURITY.md`, `NOTICE`, `justfile`, build manifests and lockfiles, tool
configs, and dotfiles. Nothing else is created at the root.

Every artifact lives inside its owning unit:

| Artifact | Home |
|---|---|
| Product demo, marketing video, brand media | `torviello-media/` |
| Brand identity, design tokens, UI components, visual assets | `torviello-design/` |
| Documentation site content | `torviello-docs/` |
| Landing page and marketing site content | `torviello-landing/` |
| Benchmark harnesses and performance evidence | `torviello-bench/` |
| Inference runtime and serving work | `torviello-engine/`, `torviello-serve/` |
| Role contracts and tickets | `torviello-roles/` |

If no unit owns an artifact, record an owner decision on a ticket before
creating a home for it — the root is never the default. Pre-existing loose
root directories (for example `assets/`, `media/`, `canvas/`, `notes/`) are
legacy: they receive no new content, and their consolidation into a unit is an
owner decision.

## Start here

The first vertical slice is specified in [load-config-and-list-models.feature](torviello-engine/specifications/features/load-config-and-list-models.feature): load TOML configuration, validate it, and expose health and the configured model catalog. Its domain model and rules live in [torviello-engine/domain](torviello-engine/domain/README.md). Resolve OD-001–OD-004 in [open decisions](requirements/open-decisions.md) before implementation proceeds beyond the current scaffold.

## Project guidance

- Read [requirements](requirements/README.md) for product and engineering outcomes, acceptance criteria, and unresolved decisions.
- Read [enforcer](torviello-enforcer/README.md) for enforceable contributor and agent controls, their enforcement tests, domain indexes, and lifecycle coverage.

## Development workflow

Behavior-changing work follows the five development-workflow controls ([GOV-06](torviello-enforcer/governance/rules/06-domain-driven-design.md), [GOV-07](torviello-enforcer/governance/rules/07-specification-driven-development.md), [GOV-08](torviello-enforcer/governance/rules/08-contract-driven-development.md), [GOV-09](torviello-enforcer/governance/rules/09-test-driven-development.md), [GOV-10](torviello-enforcer/governance/rules/10-evaluation-driven-development.md)) as one connected, iterative flow: DDD establishes the domain model and invariants, SDD defines testable requirements and acceptance criteria, CDD fixes machine-readable contracts, TDD drives implementation from failing tests, and EDD evaluates the result against pre-established release thresholds. Implementation and tests must trace to a contract, specification, or business rule, and tests, specifications, contracts, and thresholds must not be weakened to make a change pass.

## Work tracking

Tracked work lives in [torviello-roles](torviello-roles/README.md). Start a
session with `uv run --directory torviello-roles python -m torviello_roles brief`,
then create or select a ticket before committed work and record dated evidence in
its log, per [GOV-11](torviello-enforcer/governance/rules/11-work-item-tracking-and-role-memory.md).
A ticket is durable memory for status, owners, blockers, and evidence; it does
not replace requirements, specifications, contracts, decision records, or release
approval. Run `uv run --directory torviello-roles python -m torviello_roles check`
to validate the store.

## Documentation assurance

Every engine requirement, feature, check, contract, domain document, evaluation, README, and `AGENTS.md` is governed by the [HPA-4 assurance standard](requirements/assurance-standard.md). Acceptance is binary: a single fatal criterion in the [engine acceptance criteria](torviello-engine/specifications/acceptance-criteria.md) fails the artifact, with no waiver or conditional pass. Document presence is not evidence; evidence is revision-pinned, reproducible, and retained.

## Checks

Use [`uv`](https://docs.astral.sh/uv/) 0.13.1 or newer to manage the configured Python version and locked test tools. From the repository root, run:

```sh
uv sync --locked
uv run --locked pytest
```

## Readiness status

The rule corpus has a recorded structural consistency audit in [the governance assurance register](torviello-enforcer/governance/assurance-register.md). That audit covers document structure, stable IDs, requirement/source mappings, and local links. It does not claim product implementation, legal, operational, or human procedure-dry-run conformance. Unresolved lifecycle coverage and open product decisions remain explicitly recorded; resolve applicable items before relying on the affected controls for a release decision.

A buildable scaffold exists, but no model backend, evaluation result, SBOM, provenance attestation, or release decision is recorded. `220` structural/enforcer tests and the scaffold tests passing is not product conformance.
