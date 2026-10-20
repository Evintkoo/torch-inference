# Prioritization and delivery planning

**Control family:** product-discovery-and-delivery  
**Control document:** PDL-04  
**Requirement trace:** PDL-005, PDL-010–PDL-012, PDL-017, ED-042  
**Status:** Normative project control

## Control objective

Commit only to understood and authorized outcomes, sequence delivery around dependencies and risk, and keep plans honest as uncertainty and conditions change.

## Applicability

Applies to feature, remediation, platform, security, performance, design, documentation, packaging, release, infrastructure, organizational, and operational work. Plan depth scales with materiality. A low-risk, reversible maintenance change may use a concise change plan rather than a separate long-lived artifact.

## Normative requirements

### PDL-04.01 — Prioritize against explicit value, risk, and capacity

The accountable owner MUST consider user or operational value, severity and likelihood of harm, urgency, legal/security obligations, dependencies, uncertainty, cost, opportunity cost, and available capacity. Record why work is ordered, deferred, split, or stopped. Do not equate stakeholder seniority, estimated effort, or request volume alone with priority.

### PDL-04.02 — Establish a bounded and traceable plan

Before implementation, establish approved scope and exclusions, requirement IDs, deliverables, sequence, accountable roles, dependencies, estimate or uncertainty range, milestones or decision points, verification, documentation, migration, release, rollback, and operational readiness activities as applicable. Identify work that can proceed independently and work blocked on unresolved decisions.

### PDL-04.03 — Decompose around reviewable outcomes and safe integration

Break work into changes that can be independently reviewed and verified while preserving coherent behavior. Sequence foundational interfaces, data migrations, security controls, and compatibility work before dependent consumers where required. Name integration points, parallel-work assumptions, ownership, and coordination checkpoints; avoid task lists that only describe activity without a verifiable result.

### PDL-04.04 — Make estimates and commitments uncertainty-aware

Record estimate basis, assumptions, confidence/range, excluded work, and external dependencies. For novel or high-uncertainty work, plan discovery/spikes and decision gates before making date or scope commitments. Do not present an estimate as a guarantee; revise forecasts when evidence changes and communicate material impact to affected stakeholders.

### PDL-04.05 — Plan for risk, contingency, and capacity

For material risks, specify likelihood/impact, owner, prevention or mitigation, trigger, contingency, and residual risk authority. Include review capacity, test environments, hardware/model availability, vendor/service limits, support and on-call needs, build/CI time, and recovery tasks when relevant. Avoid plans that depend on unowned work or unverified availability.

### PDL-04.06 — Control scope and replan on material change

When requirements, evidence, dependencies, estimates, constraints, or risk change, assess impact on outcomes, schedule, cost, staffing, architecture, acceptance, release, and stakeholders. Obtain the relevant owner decision and update the baseline and affected artifacts before continuing work outside approved tolerance. Preserve a record of why and when the plan changed.

### PDL-04.07 — Keep plans proportionate and usable

Use the smallest plan that supports shared understanding, sequencing, accountability, risk control, and verification. Keep transient implementation plans in the repository-approved private planning location when required by project policy; do not expose private plans in public artifacts. Specifications, requirement IDs, decisions, release evidence, and durable operational knowledge remain in their approved locations and MUST NOT be hidden in a discarded plan.

### PDL-04.08 — Review completion against outcomes, not activity

A task or milestone is complete only when its stated output is reviewed, required checks have evidence, linked scope is updated, and dependencies or residual risks are dispositioned. Report blocked, skipped, failed, and unavailable checks accurately. Update remaining estimates and plan status from actual results.

## Prohibited conditions

- Starting material implementation with no approved scope, owner, acceptance, or applicable plan.
- Treating a task marked done, code merged, or a milestone reached as proof of outcome acceptance.
- Concealing uncertainty, unowned dependencies, failed checks, or scope changes.
- Deleting the only durable record of a decision, requirement, risk, or release result with a temporary plan.

## Decision guidance

A separate plan is appropriate when work spans multiple changes, owners, domains, dependencies, or release stages. A concise change plan is sufficient for a bounded and reversible task if it records expected behavior, affected requirements, risk, and verification. Escalate planning depth for data migrations, public APIs, supported-platform changes, authentication, licensing, destructive operations, and externally committed dates.

## Assessment procedure

**Examine:** compare the plan baseline with changes, dependencies, estimates, checks, and outcomes. Verify scope changes had impact review and authority.

**Interview:** ask owners to explain dependencies, contingency triggers, uncertainty, and how reported progress maps to accepted outputs.

**Test:** select completed and deferred items; verify outcome evidence and truthful status. Review whether planned checks covered high-risk paths and whether replanning followed material variance.

## Assessment determination

Pass when scope, priority, ownership, sequencing, uncertainty, risk, and completion are controlled with evidence. Fail where commitments lack authorization, risk-critical work has no contingency, or reported completion lacks acceptance. Not applicable requires rationale.

## Required evidence

Approved spec and plan or lightweight change record; priority/deferral rationale; dependency and risk records; change history; verification and completion evidence; stakeholder communications for material variance.

## Exceptions and nonconformance

A MUST exception requires the accountable delivery owner and relevant product/system authority. State urgent need, limited scope, risk, omitted controls, compensating checks, owner, and expiry. Emergency work follows `change-management/04-emergency-changes-and-risk-acceptance.md` and receives retrospective evidence and plan updates.

## Reference trail

Source IDs R1–R4 are in [00-references-trails.md](../trails/00-references-trails.md).
