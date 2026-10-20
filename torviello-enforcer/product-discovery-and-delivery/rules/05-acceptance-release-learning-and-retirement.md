# Acceptance, release, learning, and retirement

**Control family:** product-discovery-and-delivery  
**Control document:** PDL-05  
**Requirement trace:** PDL-013–PDL-017, ED-011, ED-042  
**Status:** Normative project control

## Control objective

Demonstrate that the delivered change meets approved outcomes, make a controlled release decision, observe actual results, and safely change or retire capabilities when evidence warrants it.

## Applicability

Applies to product capabilities, services, APIs, data stores, model artifacts, deployment profiles, documentation sites, workflows, and public commitments from implementation acceptance through operation and end of life.

## Normative requirements

### PDL-05.01 — Verify requirements and validate the intended outcome

Before acceptance, map each applicable requirement to implementation evidence and a check appropriate to its risk. Verification asks whether the specified behavior was built; validation asks whether evidence supports that it solves the intended problem for affected users/operators. Record both where they differ. Include expected, boundary, failure, compatibility, security, accessibility, and recovery evidence as applicable.

### PDL-05.02 — Make acceptance authority and residual limitations explicit

The designated owner MUST decide accept, reject, conditionally accept, or defer against predeclared criteria. Record tested revision/profile, evidence, failed or unavailable checks, known limitations, residual risks, approved exceptions, migration and rollback readiness. Conditional acceptance MUST identify scope, conditions, owner, expiry, and prohibited use. Agents MAY report evidence but MUST NOT invent delegated approval.

### PDL-05.03 — Apply domain release gates before exposure

A release or staged exposure MUST satisfy applicable release, security, license, verification, portability, operations, documentation, support, and stakeholder-communication controls. Define rollout cohort/criteria, monitoring, stop/rollback trigger, responsible operator, and user impact. For public launch or irreversible data change, obtain the explicitly authorized decision before exposure.

### PDL-05.04 — Observe outcomes and act on feedback

For a material change, define post-release signals tied to intended outcomes, safety/security/reliability constraints, and user/operator experience. Set an owner and review point proportionate to risk. Review telemetry, support requests, complaints, incidents, accessibility feedback, regressions, and cost within their privacy and retention limits. Decide to continue, improve, constrain, roll back, or retire; record reasons and resulting work.

### PDL-05.05 — Maintain traceability and communicate material changes

Update the requirement disposition and links to design, code/change, verification, release, and operational evidence. Communicate behavior, compatibility, migration, support, and known limitations to affected audiences through approved channels. Keep public claims consistent with tested profiles and evidence; coordinate incident or safety communications under applicable controls.

### PDL-05.06 — Manage changes after acceptance

A change to an accepted requirement, interface, supported profile, data behavior, risk treatment, or acceptance threshold MUST receive impact analysis, owner approval, updated baseline, and re-verification of affected claims. Preserve history so reviewers can determine which revision was approved and why.

### PDL-05.07 — Retire capabilities and work products safely

Before retirement, identify affected users, clients, operators, integrations, data, models, credentials, dependencies, published artifacts, and contractual commitments. Define notice and transition period, replacement or export path, migration, backup/deletion schedule, access revocation, support end date, rollback limits, and evidence retention. Verify that shutdown removes exposed services and secrets and that retained records meet policy. For an immediate security or safety shutdown, document the emergency rationale and follow incident controls.

### PDL-05.08 — Feed incidents and failures back into the lifecycle

Material failure, near miss, support pattern, or unmet requirement MUST produce a blameless evidence-based review proportionate to impact. Identify contributing system/process conditions, affected requirements and controls, containment, corrective action owner, due/review trigger, and how effectiveness will be verified. Update rules, specifications, tests, plans, or training when findings show a systemic gap; do not close corrective action solely because a ticket was filed.

## Prohibited conditions

- Acceptance based solely on implementation completion or author assertion.
- Release with unknown critical failures or risks lacking authorized disposition.
- Public claims beyond tested and supported behavior.
- Retiring a service or data capability without resolving user transition, access, and retention obligations.

## Assessment procedure

**Examine:** trace requirements to tests and release evidence; inspect approvals, rollout/rollback, outcome signals, corrective actions, and retirement records.

**Interview:** ask the accepting owner and operator how stop conditions, residual limitations, and feedback decisions are handled.

**Test:** reproduce sampled acceptance evidence or release gates where feasible; simulate a rollout stop or retirement procedure for high-impact systems according to operations rules.

## Assessment determination

Pass when acceptance, release, operational learning, and retirement decisions are evidence-based, authorized, and traceable. Fail when release gates are bypassed, evidence cannot support claims, or users/data/dependencies are abandoned without a controlled transition. Not applicable requires rationale.

## Required evidence

Traceability/acceptance matrix; test and review results; release authorization and rollout plan; outcome review; incident/corrective-action records; deprecation/retirement plan and closure evidence where applicable.

## Exceptions and nonconformance

A MUST exception requires accountable product/system authority plus applicable release, security, privacy, legal, operations, or safety authority. Record scope, users/profiles affected, residual risk, mitigation, owner, expiry, and communication. An exception cannot waive mandatory legal or contractual duties.

## Reference trail

Source IDs R1–R4 are in [00-references-trails.md](../trails/00-references-trails.md).
