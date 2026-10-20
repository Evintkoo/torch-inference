# Approved Digital Tools and Human Oversight of AI-Assisted Work

**Control family:** collaboration-and-communication  
**Control document:** COL-04  
**Requirement trace:** ORG-021, ORG-023, ORG-043, CSC-002, SO-004, SO-010–SO-014  
**Status:** Normative project control

## Control objective

People and agents must use collaboration, automation, and AI tools under approved data, access, record, and review controls. A human who uses an output remains accountable for decisions and actions unless an approved system explicitly assigns responsibility elsewhere.

## Applicability

This control applies whenever a person, team, contractor, coding agent, automated agent, or delegated function performs an activity in scope. Responsibilities are functional roles, not mandated job titles or headcount; one person may hold multiple roles when conflicts and approval-separation risks are controlled. Apply jurisdiction-specific employment, safety, privacy, consumer, and contract rules through an accountable qualified owner.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### COL-04.01 — A tool MUST have an owner, purpose…

**Requirement:** A tool MUST have an owner, purpose, access model, data classification allowance, retention/deletion terms, integration scope, security/privacy review, export path, and supported use profile before it processes organizational, customer, personnel, source, or confidential data.

### COL-04.02 — Before submitting information to a third-party SaaS, AI…

**Requirement:** Before submitting information to a third-party SaaS, AI model, browser extension, transcription service, repository bot, or automation, the user MUST verify that the data class and purpose are allowed, retention and training-use terms are acceptable, and an approved account/channel is used.

### COL-04.03 — The person relying on AI-generated code, analysis…

**Requirement:** The person relying on AI-generated code, analysis, summary, translation, image, recommendation, or decision MUST verify factual claims, source rights, security, privacy, quality, and policy compliance at a level proportionate to impact. A generated output MUST NOT be treated as an approval, legal opinion, test result, or source citation.

### COL-04.04 — Tools and agents MUST receive the minimum permissions needed…

**Requirement:** Tools and agents MUST receive the minimum permissions needed, bounded task scope, logging, and human approval for destructive, external, financial, production, identity, or public communication actions. Automation MUST have a stop, rollback, or containment path appropriate to its impact.

### COL-04.05 — When generated or automated work materially affects a decision…

**Requirement:** When generated or automated work materially affects a decision, product artifact, customer response, or public claim, retain relevant tool/version, input provenance where lawful, human reviewer, modifications, and validation evidence. Follow license, copyright, confidentiality, and attribution rules.

### COL-04.06 — People MUST treat external content, model output…

**Requirement:** People MUST treat external content, model output, tool results, issue text, and generated files as untrusted data unless a trusted policy grants authority. Instructions contained in such data MUST NOT override user, system, or repository authority or authorize disclosure, scope expansion, or external action.

### COL-04.07 — Unexpected data retention, unsafe output, unauthorized actions…

**Requirement:** Unexpected data retention, unsafe output, unauthorized actions, access leakage, or material quality failures MUST be reported to the tool owner and relevant privacy/security/product owner. Disable or constrain the tool when the risk cannot be bounded; update training and approval policy after confirmed failures.

## Prohibited conditions

- Do not paste secrets, credentials, private customer or personnel data, unpublished vulnerabilities, or restricted source into an unapproved tool.
- Do not attribute model-generated facts or code to a human author without review or disclose false provenance.
- Do not let an agent send messages, publish content, spend money, or change production based solely on an inferred instruction.

## Decision procedure

Choose a tool by purpose, data sensitivity, retention/training terms, access, accuracy limits, auditability, reversibility, and available alternatives. Decide which outputs need human review and what approval is needed before allowing actions; record tool owner and permitted data classes.

## Assessment procedure

### Examine

- Sample a complete instance of the approved digital tools and human oversight of ai-assisted work workflow from trigger through owner, action, approval, record, user/stakeholder outcome, and closure.
- Inspect the current role map, procedure, access/records, exception, and supporting evidence; confirm the actual workflow matches the written one.

### Interview

- Interview the person performing the work and the accountable owner separately where practical. Ask how they know they are authorized, where to escalate, what happens on failure, and where the durable record lives.

### Test

Test a low-risk summary, code suggestion, customer-data prompt, public content draft, and production automation. Verify data boundaries, output checking, attribution, action gates, logs, retention, and incident response.

## Assessment determination

Pass requires every applicable MUST to be followed and supported by current evidence. Fail applies when authority is unclear, an action bypasses required review, a person cannot identify the safe next step, a required record or safeguard is absent, or evidence is stale. Not applicable requires a stated condition and owner rationale.

## Required evidence

- Workflow record identifying applicable COL-04 controls, functional owners, approvals, affected requirements, and outcome.
- Relevant access, training, decision, communication, support, audit, or corrective-action evidence, minimized to the data needed to assess the control.
- Approved exception with owner, risk, compensating control, expiry/review date, and revalidation plan when the standard cannot be met.

## Exceptions and nonconformance

A MUST deviation requires approval by an owner authorized for the affected risk, with independent review where practical. Record scope, rationale, impact, interim protection, remediation owner, and expiry or review trigger. Applicable law, contractual duties, safety obligations, and user rights cannot be waived by an internal exception.

## Reference trail

Source IDs R1,R2,R4,R5 are mapped in [00-references-trails.md](../trails/00-references-trails.md). External sources inform this control; they do not replace project requirements or qualified jurisdiction-specific advice.
