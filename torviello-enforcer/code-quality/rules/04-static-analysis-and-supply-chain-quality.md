# Static analysis and dependency quality

**Control family:** code-quality  
**Control document:** CQ-04  
**Requirement trace:** ED-001–ED-002, ED-014, ED-020  
**Status:** Normative project control

## Control objective

This control defines the intended outcome for **static analysis and dependency quality** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

## Applicability

This document applies to new or materially changed code-quality behavior in all supported product profiles, including local/offline and hosted deployments where applicable. Requirements apply to design, implementation, configuration, packaging, operation, and tests whenever those stages affect the controlled outcome. A requirement’s stated condition limits its applicability; legacy behavior is included when changed or migrated.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174) when, and only when, they appear in all capitals.

### CQ-04.01 — Each production language MUST have a documented, versioned…

**Requirement:** Each production language MUST have a documented, versioned formatter, linter, compiler/static-analysis configuration, and CI invocation. Local and CI commands MUST produce equivalent policy results.

### CQ-04.02 — Production code MUST compile with the declared warning policy…

**Requirement:** Production code MUST compile with the declared warning policy. A lint suppression MUST be scoped to the smallest valid item, explain the exact false positive or intentional behavior, identify an owner, and have an expiry when the reason is temporary.

### CQ-04.03 — Dependency changes MUST be reviewed for purpose, maintenance…

**Requirement:** Dependency changes MUST be reviewed for purpose, maintenance status, security advisories, license, transitive additions, enabled features, native binaries, build scripts, and supported-platform effects.

### CQ-04.04 — Application dependency resolution MUST be locked for released binaries…

**Requirement:** Application dependency resolution MUST be locked for released binaries. Library packages MUST follow a documented policy for lockfiles and compatibility ranges.

### CQ-04.05 — Automated analysis findings MUST be triaged by reachability…

**Requirement:** Automated analysis findings MUST be triaged by reachability and impact, but severity downgrades MUST include a written rationale and reviewer. A clean scanner report MUST NOT be treated as evidence that manual review is unnecessary.

### CQ-04.06 — Build scripts and procedural macros MUST be treated as…

**Requirement:** Build scripts and procedural macros MUST be treated as executable supply-chain inputs. Their network access, filesystem access, environment reads, and generated output MUST be reviewed and constrained.

### CQ-04.07 — Analysis tools MUST fail clearly when unavailable or incompatible…

**Requirement:** Analysis tools MUST fail clearly when unavailable or incompatible; CI MUST NOT report success after a required analyzer was skipped.

## Prohibited conditions

- Do not enable every lint as a blanket policy without checking compatibility with the declared compiler and dependency set.
- Do not suppress warnings globally to silence newly introduced findings.

## Implementation guidance

Implement the control at the authoritative boundary where the rule’s risk or behavior originates. A downstream compensating check does not replace a required check at the API, module, storage, build, or operator boundary. Keep product-specific decisions tied to approved requirements and decision records; do not infer unresolved policy.

## Assessment procedure

Assess the design and its operation using the applicable methods below. The assessment MUST sample both the intended success path and relevant adverse or misuse cases.

### Examine

- Inspect the specification, implementation, configuration, data flow, and deployment artifacts relevant to static analysis and dependency quality. Trace each clause to the owner and enforcement point.
- Confirm default behavior, supported profiles, limits, error behavior, compatibility and rollback effects, and any exception are explicit.

### Interview

- Interview the accountable owner when the control depends on a manual procedure or operational role. Compare the explanation to approved procedures and recorded evidence; an interview alone does not prove technical enforcement.

### Test

- Verify pinned tool versions, exact commands, lockfile diff, analyzer failures, dependency advisories, and targeted suppression justifications.
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

Source IDs R1,R2 are mapped to this document in [00-references-trails.md](../trails/00-references-trails.md). The project requirements above remain normative; external sources establish technical context and assessment expectations.
