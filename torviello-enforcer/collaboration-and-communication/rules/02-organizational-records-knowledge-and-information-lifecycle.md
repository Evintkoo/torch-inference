# Organizational Records Knowledge and Information Lifecycle

**Control family:** collaboration-and-communication  
**Control document:** COL-02  
**Requirement trace:** ORG-021, ORG-023–ORG-024, ORG-043, CSC-001, ED-030  
**Status:** Normative project control

## Control objective

Information created during work must have a source of truth, owner, audience, access level, retention, and update path. The organization must preserve what future workers need while minimizing personal, confidential, and duplicate records.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### COL-02.01 — A record owner MUST identify purpose, sensitivity…

**Requirement:** A record owner MUST identify purpose, sensitivity, authoritative status, audience, access, retention trigger, and applicable legal hold for material decisions, contracts, incidents, support cases, releases, training, and procedures. Apply approved classifications and data minimization rules.

### COL-02.02 — For each process or decision, designate the authoritative…

**Requirement:** For each process or decision, designate the authoritative record and link secondary discussion to it. Copies and summaries MUST identify their source and date; where systems conflict, the record owner MUST resolve and announce the canonical version.

### COL-02.03 — Operational, security, support, and recovery procedures…

**Requirement:** Operational, security, support, and recovery procedures MUST identify prerequisites, role, safe steps, expected outcome, failure/escalation, last review, and verification method. Test high-impact procedures periodically and after material change or incident.

### COL-02.04 — When a role, owner, vendor…

**Requirement:** When a role, owner, vendor, or product area changes, transfer decision context, undocumented constraints, credentials via approved secret management, open risks, and current work to an authorized successor. Do not place secrets in documentation or handoff notes.

### COL-02.05 — Authoritative records MUST have access appropriate to sensitivity…

**Requirement:** Authoritative records MUST have access appropriate to sensitivity, identifiable owners, version/change history proportionate to importance, and recovery from accidental deletion or corruption. Changes to policy, approvals, or audit evidence MUST preserve who changed what and when.

### COL-02.06 — Retain records only for the approved business, legal…

**Requirement:** Retain records only for the approved business, legal, safety, security, or contractual purpose. At the retention trigger, delete or archive through the approved process; legal holds suspend ordinary deletion only for the scoped records and duration.

### COL-02.07 — For critical capabilities and procedures, identify single-person dependency…

**Requirement:** For critical capabilities and procedures, identify single-person dependency, recovery time, and backup competence. Mitigate through cross-training, tested documentation, successor assignment, vendor transition, or explicit accepted risk.

### COL-02.08 — Workers MUST be able to locate current procedures…

**Requirement:** Workers MUST be able to locate current procedures, decisions, ownership, escalation contacts, and approved templates without relying on private introductions. Keep material readable and accessible to intended users and provide controlled alternatives when a person cannot use the default channel.

## Prohibited conditions

- Do not place credentials, private keys, personal data, or customer payloads in general knowledge bases.
- Do not leave a material decision in a personal inbox, draft, or tool without an authoritative record.
- Do not preserve duplicate records indefinitely without a purpose, owner, and retention rule.

## Decision procedure

Classify by purpose and sensitivity first; then choose the authoritative system, audience, access, retention, and deletion/hold process. For records that might be evidence of an incident, contract, or employment matter, seek the designated owner’s advice before changing or destroying them.

## Assessment procedure

### Examine

- Sample a complete instance of the organizational records knowledge and information lifecycle workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Test a decision record, runbook, support case, personnel-related record, and legal hold. Verify discoverability, access denial, version history, correction, retention, deletion, and key-person handoff.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable COL-02 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2,R3 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
