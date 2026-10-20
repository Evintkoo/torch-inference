# Problem discovery and evidence

**Control family:** product-discovery-and-delivery  
**Control document:** PDL-01  
**Requirement trace:** PDL-001–PDL-005, PDL-016  
**Status:** Normative project control

## Control objective

Ensure that work begins with a sufficiently supported account of the problem, affected people and systems, desired outcome, uncertainty, and decision authority. Prevent a proposed implementation from being mistaken for validated need.

## Applicability

Applies when creating or materially changing a product capability, service, deployment profile, operational workflow, public commitment, system boundary, or remediation. For routine, low-risk maintenance, apply the lightweight path in PDL-04 while retaining source, expected outcome, risk, and checks.

## Normative requirements

All-capital normative terms have BCP 14 meaning.

### PDL-01.01 — Preserve provenance and distinguish evidence types

The work owner MUST record where a need came from, when and under what conditions it was observed, who is affected, and who is authorized to decide. Records MUST distinguish direct observation or measured evidence from reported experience, interpretation, and assumption. Preserve links, versions, samples, reproduction steps, and limitations needed to revisit a material finding.

### PDL-01.02 — Describe current state and desired outcome

Before selecting a solution, the owner MUST state the current workflow or system behavior, the user or operational problem, affected actors and contexts, consequence and frequency where known, desired outcome, measurable signal, scope, and explicit non-goals. State how the problem framing could be disproved or materially changed.

### PDL-01.03 — Select a proportionate discovery method

Choose methods based on the uncertainty and impact being resolved. Options include code/configuration inspection, production telemetry, support and incident records, interviews, contextual observation, usability/accessibility review, stakeholder workshops, market or platform research, prototypes, and controlled experiments. Record why the evidence is relevant, sampling limits, selection bias, recency, and confidence. Do not treat popularity, one anecdote, or a model-generated claim as proof without corroboration proportionate to risk.

### PDL-01.04 — Protect research participants and sensitive evidence

Before collecting personal or confidential information, determine purpose, lawful/approved basis where applicable, consent or notice needs, minimization, access, retention, redaction, and deletion. Do not place secrets, credentials, personal data, vulnerability details, or commercially sensitive material in public specifications or broad-access planning records. Escalate jurisdiction-dependent obligations to the authorized owner before collection or publication.

### PDL-01.05 — Map impact and constraints across affected groups

Identify direct and indirect users, operators, maintainers, administrators, contributors, support staff, and external parties whose workflows or risks change. Consider accessibility, language, skills, network/offline conditions, supported hardware/OS, failure consequences, misuse, and groups excluded by the proposed direction. Record material benefits, burdens, and mitigations; do not assume a single “typical user.”

### PDL-01.06 — Keep uncertainty and unresolved decisions actionable

Maintain assumptions, unknowns, constraints, dependencies, risks, and open decisions with owner, evidence or approval needed, impact if unresolved, target/review trigger, and status. A release-critical unknown MUST block commitment or receive an explicit, authorized risk decision with scope, mitigations, and expiry. Do not silently turn uncertainty into a default product promise.

### PDL-01.07 — Close discovery with a decision

Conclude each material discovery effort with a recorded decision to proceed, investigate further, change framing, defer, or stop. Cite the evidence and confidence, affected requirement IDs, unresolved matters, and next owner. Preserve negative results and rejected hypotheses so later teams do not repeat work or present disproven assumptions as facts.

## Prohibited conditions

- Starting consequential work solely from an unexamined solution request.
- Presenting an assumption, estimate, prototype, or anecdote as measured fact.
- Collecting participant or production data without defined purpose and handling controls.
- Committing to a user, platform, legal, or service promise whose owner or evidence is unknown.

## Decision guidance

Use existing repository artifacts and reproducible runtime evidence before creating new research activity when they can answer the question. Use direct user/operator research when behavior, usability, accessibility, or actual workflow is uncertain. Use a prototype or spike when technical feasibility is uncertain; label it disposable or production-intended and isolate it accordingly. Increase independent review and evidence strength as impact, irreversibility, privacy, safety, or financial exposure rises.

## Assessment procedure

**Examine:** sample the problem record and trace source evidence, scope, affected groups, uncertainty, privacy handling, owner, and outcome decision. Check that the record is current and available to authorized reviewers.

**Interview:** ask the owner to distinguish observation, interpretation, and assumption; identify contrary evidence; and explain why the chosen research method fits the question.

**Test:** have an uninvolved reviewer reconstruct the problem and decision from retained material. Where claims concern observable behavior, reproduce the workflow or inspect the data/method. Fail if the decision depends on unavailable oral context or unsupported certainty.

## Assessment determination

Pass when applicable MUST clauses have current evidence and material unresolved matters have an owner and disposition. Fail when a solution is treated as a need, material groups or impacts are omitted, sensitive evidence is mishandled, or a critical unknown is hidden. Not applicable requires the work scope and rationale.

## Required evidence

Problem/discovery record; evidence links or reproducible artifacts; assumptions and open-decision log; impact and privacy assessment where applicable; outcome decision and owner.

## Exceptions and nonconformance

A MUST exception requires approval from the accountable product/system owner and, where privacy, security, safety, legal, or commercial obligations are involved, the relevant authority. Record risk, limited scope, compensating controls, remediation owner, and expiry/review date. Do not waive mandatory legal or contractual obligations.

## Reference trail

Source IDs R1–R4 are in [00-references-trails.md](../trails/00-references-trails.md).
