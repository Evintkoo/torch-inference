# Evaluation-Driven Development (EDD)

**Control family:** governance
**Control document:** GOV-10
**Requirement trace:** ED-014, ED-042, ED-054, ED-055
**Status:** Normative project control

## Control objective

Evaluation-Driven Development decides whether the complete solution is acceptable. Before release, the project MUST evaluate functionality, contract conformance, authorization, performance, and release-blocking defects against pre-established thresholds, and MUST record dated metrics and a release decision. Evaluation is broader than rerunning unit tests.

## Applicability

This control applies to every release candidate and every change that claims completion of a requirement or feature. A change that is not part of a release candidate MAY record EDD as not applicable with a decision owner. Product-specific choices remain governed by approved requirements and decision records.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### GOV-10.01 — Release thresholds MUST be defined before evaluation begins…

**Requirement:** Release thresholds MUST be defined before evaluation begins and MUST cover functionality, contract verification, authorization, performance, and release-blocking defects. Thresholds MUST be measurable, owned, and recorded in an evaluation plan.

### GOV-10.02 — Evaluation MUST produce a dated report with the command…

**Requirement:** Evaluation MUST produce a dated report with the command, scope, environment, metrics, dataset or workload, and results for each threshold. It MUST include checks beyond unit tests, such as contract tests, authorization tests, performance measurements, and defect review.

### GOV-10.03 — Each threshold MUST receive an explicit pass or fail…

**Requirement:** Each threshold MUST receive an explicit pass or fail result. An unmet threshold MUST be reported as a failure and MUST block release until resolved or covered by an approved, time-bounded exception; it MUST NOT be redefined, narrowed, or excluded after the result is known.

### GOV-10.04 — A named decision owner MUST record the release decision…

**Requirement:** A named decision owner MUST record the release decision against the evaluation report. Automation MAY collect results, but the release gate MUST NOT be marked passed on document presence, partial scope, or an unrecorded verbal decision.

### GOV-10.05 — Evaluation findings MUST route back to the stage that must…

**Requirement:** Evaluation findings MUST route back to the stage that must change — domain, specification, contract, or implementation — and the return MUST be recorded with the affected clause and requirement. Repeating evaluation after a fix MUST use the same thresholds.

### GOV-10.06 — An evaluation MUST NOT relax thresholds, remove critical…

**Requirement:** An evaluation MUST NOT relax thresholds, remove critical cases, or redefine success to make a release pass. Such a change REQUIRES human authority and MUST be recorded as a threshold decision with the accountable owner and the risk accepted.

### GOV-10.07 — Every critical requirement MUST have evaluation evidence…

**Requirement:** Every critical requirement MUST have evaluation evidence that resolves from the requirement to the report and result. Missing or stale evaluation evidence MUST be reported as a failure or an explicit assessment limitation, never as a pass.

## Prohibited conditions

- Defining thresholds after seeing results or moving a threshold to match a failing metric.
- Treating unit tests alone as a complete evaluation.
- Reporting a release gate as passed without a dated report and a named decision owner.
- Removing failing cases, narrowing scope, or redefining success to obtain a pass.
- Ignoring evaluation findings instead of routing them back to the affected stage.
- Claiming product conformance from rules text, document presence, or an empty report.

## Assessment procedure

1. Locate the evaluation plan and confirm thresholds were defined before evaluation.
2. Confirm the report is dated and records command, scope, environment, metrics, and results.
3. Check each threshold has an explicit pass or fail and that failures block release or have an approved exception.
4. Confirm the named decision owner and release decision are recorded.
5. Verify findings route back to the affected stage with the requirement or clause identifier.
6. Confirm every critical requirement resolves to evaluation evidence.
7. Record the result in the governance assurance register.

## Assessment determination

The control passes only when thresholds were pre-established, a dated report covers functionality, contracts, authorization, performance, and release-blocking defects, each threshold has an explicit result, failures block release or have an approved exception, a named owner recorded the decision, and findings are routed back. Missing thresholds, post-hoc threshold changes, partial scope, or absent evidence are failures.

## Required evidence

- Evaluation plan with measurable thresholds and owners.
- Dated evaluation report with command, scope, environment, metrics, dataset or workload, and results.
- Per-threshold pass or fail results and the release decision.
- Approved exceptions with expiry and owner for any unmet threshold.
- Finding-to-stage routing and the re-evaluation record.
- Trace from critical requirements to their evaluation evidence.

## Exceptions and nonconformance

An exception MUST identify the affected clauses, the unmet threshold, reason, risk and impacted parties, compensating controls, accountable approver, remediation owner, and expiry/review date, and MUST be recorded in the [assurance register](../assurance-register.md) before it is effective. An unmet threshold without an approved exception is a release blocker and MUST NOT be reported as a pass.

## Implementation guidance

Keep the evaluation plan under version control and generate the report from the executed checks where possible. Store datasets or workload definitions with the report so results are reproducible.

## Reference trail

See [00-references-trails.md](../trails/00-references-trails.md) for sources and requirement mapping.
