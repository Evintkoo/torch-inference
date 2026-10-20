# Solution alternatives and experimentation

**Control family:** product-discovery-and-delivery  
**Control document:** PDL-03  
**Requirement trace:** PDL-005, PDL-008–PDL-009, PDL-016  
**Status:** Normative project control

## Control objective

Select solutions through explicit, evidence-based decisions and use bounded investigations to reduce uncertainty without confusing experimental artifacts with supported product behavior.

## Applicability

Applies to choices with material impact on architecture, security, data, supported platforms, vendors, user workflows, licenses, operational burden, cost, or public commitments. Small reversible choices may be recorded in the change description if it preserves the required decision evidence.

## Normative requirements

### PDL-03.01 — Compare feasible alternatives against declared criteria

For each material choice, compare at least the proposed option, a credible alternative, and doing nothing or deferring where feasible. Criteria MUST derive from approved requirements and include lifecycle cost, user impact, risks, compatibility, performance/resource behavior, operational burden, security/privacy, reversibility, and exit options as relevant. Record evidence, uncertainty, tradeoffs, rejected options, and why the selected option best satisfies the criteria.

### PDL-03.02 — Record decision authority and reconsideration triggers

A decision record MUST identify the accountable authority, consulted roles, affected requirements, scope, date/revision, assumptions, constraints, consequences, and conditions that require review or reversal. Agents and implementers MUST NOT treat a proposal, brainstorm, or unapproved decision as authorization to commit to an irreversible or externally visible choice.

### PDL-03.03 — Define experiments before running them

A prototype, proof of concept, benchmark, pilot, user study, or other experiment MUST state the question or hypothesis, method, target context, sample/workload, success and stop criteria, data/safety constraints, owner, time/cost bound, and intended decision. Do not expand an experiment into production use without the applicable engineering, security, support, release, and operations gates.

### PDL-03.04 — Ensure experiments produce interpretable evidence

Record the environment, revision, configuration, inputs, controls/baseline, repetitions or sample limitations, observed results, uncertainty, anomalies, and deviations from protocol. Protect participants and production systems; use synthetic or minimized data when it can answer the question. A benchmark MUST follow the performance rules and MUST NOT generalize beyond its hardware, model, workload, and measurement limits.

### PDL-03.05 — Close experiments with an explicit outcome

Conclude with adopt, reject, iterate, or inconclusive; map evidence to the predefined criteria and document limitations, follow-up questions, owner, and resulting requirement/decision changes. Negative results MUST be retained. Do not cherry-pick successful runs or redefine success after observing results without disclosing the change and rerunning or qualifying conclusions.

### PDL-03.06 — Bound prototype exposure and remove or promote artifacts deliberately

Label prototypes and temporary tools with purpose, owner, data classification, intended audience, expiry, known gaps, and whether they MAY be deployed. Before promotion, review architecture, code quality, tests, accessibility, security, privacy, compatibility, licensing, documentation, support, monitoring, and recovery. Otherwise remove or archive safely, including associated data and credentials.

## Prohibited conditions

- Selecting a material design solely from familiarity, preference, or sunk cost.
- Using a prototype, pilot, or benchmark as evidence of production readiness without applicable gates.
- Running experiments with uncontrolled sensitive data or unbounded impact on users/services.
- Treating inconclusive evidence as confirmation.

## Assessment procedure

**Examine:** inspect decision criteria, alternatives, authority, experiment plan/results, environment, and transition/removal disposition.

**Interview:** ask the decision owner what evidence could change the decision and how results affected the requirements.

**Test:** reproduce representative experiment results where practical; compare observed data to declared thresholds and inspect whether production promotion satisfied domain gates.

## Assessment determination

Pass when material choices are reasoned and authorized, experiments are bounded and reproducible enough for their claims, and artifacts have a deliberate disposition. Fail for hidden uncertainty, unsafe experiment exposure, post-hoc success criteria, or undocumented production promotion.

## Required evidence

Decision record; experiment protocol and results; data/participant handling where relevant; prototype classification and disposition; approvals and resulting requirement/spec changes.

## Exceptions and nonconformance

A MUST exception requires the accountable product/system owner plus applicable security, privacy, operations, or legal authority. Include exposure, compensating controls, scope, owner, and expiry. Experiments may not waive legal, contractual, or safety duties.

## Reference trail

Source IDs R1–R4 are in [00-references-trails.md](../trails/00-references-trails.md).
