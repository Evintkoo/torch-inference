# Work item tracking and role memory

**Control family:** governance  
**Control document:** GOV-11  
**Requirement trace:** CSC-005, ED-011, ED-042, ORG-001, ORG-002, PDL-010, PDL-011, PDL-013, PDL-014  
**Status:** Normative project control

## Control objective

Work must have one durable, current, and reviewable record of what is intended, who owns it, what is blocked, what decision was made, and what evidence exists. The record must survive session restarts, agent handoffs, and context loss without becoming a substitute for approved requirements, specifications, contracts, decision records, or release approval.

## Applicability

This control applies to tracked work performed by people, teams, contractors, coding agents, or automated agents in this repository. It applies to feature work, remediation, documentation, rule changes, packaging, operations, and research that produces a committed artifact. A purely local experiment that produces no committed artifact MAY remain untracked when the actor records why it is not a commitment. Emergency incident response MAY open or update the record during the response rather than before it, provided the record is completed before closure.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### GOV-11.01 — A work item that changes a committed artifact MUST have a ticket before implementation

**Requirement:** Before implementation starts, a work item that changes a committed artifact MUST have exactly one ticket in the ticket store that names its owner, outcome, and acceptance checks. The ticket MUST cite the requirement IDs, control IDs, and dependent tickets that constrain the work, or state that none apply. Splitting an item into several tickets MUST preserve the trace to the original outcome.

### GOV-11.02 — The ticket MUST state an observable outcome and acceptance checks

**Requirement:** A ticket MUST state the observable outcome, the acceptance checks that decide completion, and the evidence expected for each check. An acceptance check MUST be reproducible by another actor and MUST NOT be satisfied by document presence alone. A ticket that cannot state how completion is observed MUST remain unready and MUST NOT be started.

### GOV-11.03 — The ticket store MUST be the durable memory of status, decisions, blockers, and evidence

**Requirement:** Material status changes, decisions, blockers, and verification results MUST be recorded in the ticket store in the same work period in which they occur. The record MUST be dated and append-only: a correction MUST be a new entry, and history MUST NOT be rewritten or deleted. Recorded evidence MUST name the command, artifact, review, or observation; claims without evidence MUST be labeled as unverified.

### GOV-11.04 — A session or handoff MUST begin from the recorded state rather than from recollection

**Requirement:** At the start of a working session, the responsible role MUST read the current ticket brief and the log of every in-progress or blocked ticket before acting. The actor MUST confirm that the selected work is tracked, unblocked, owned, and consistent with the current requirements. If the recorded state conflicts with the working tree or the user's instruction, the actor MUST report the conflict and resolve the record before continuing.

### GOV-11.05 — Ticket status MUST follow the defined lifecycle and closure MUST require evidence

**Requirement:** Status MUST move only through the lifecycle defined by the ticket tooling, and the store MUST reject an undefined transition. A ticket MUST NOT be marked done until every acceptance check has recorded evidence and any required independent review is complete. A blocked ticket MUST record the missing input, the person or role who can unblock it, and the condition that ends the block. Cancelled or superseded work MUST be recorded with its reason and MUST NOT be deleted.

### GOV-11.06 — A ticket MUST NOT replace the governing artifact or grant authority

**Requirement:** A ticket MUST NOT define or change product behavior, an interface contract, an approved threshold, an exception, a security decision, or a release decision. Those changes MUST use the governing requirements, decision record, contract, or assurance process. A ticket MUST NOT grant approval authority to a role or agent; authority comes from the organization controls and approved decisions.

### GOV-11.07 — Ticket ownership MUST resolve to a documented role, and required independence MUST be preserved

**Requirement:** Every ticket MUST name an owner that resolves to a role directory containing numbered role documents in the role directory. Where an applicable control requires independent review or separation of duties, the reviewer MUST be a different accountable actor from the author and MUST record the review verdict in the ticket. An unresolved or absent owner MUST be treated as a defect, not as implicit assignment.

### GOV-11.08 — Ticket changes MUST be committed with the work they describe

**Requirement:** A code, rule, documentation, or configuration change MUST include the corresponding ticket update in the same commit or in a commit that immediately precedes or follows it, so the record and the artifact share a rollback point. A reported status MUST describe the committed evidence. Stale tickets MUST be corrected or closed before a release or completion report relies on them.

### GOV-11.09 — The ticket store MUST be validated by tooling in the required checks

**Requirement:** The ticket store MUST be validated by tooling in the required checks. Validation MUST detect malformed records, unknown status or priority values, owners without a role directory, unresolvable requirement IDs, dangling or cyclic dependencies, and done tickets without evidence. A validation failure MUST block the change. The tool MUST derive every view from the stored tickets and MUST NOT maintain a second index that can drift.

### GOV-11.10 — Detailed plans MAY remain outside the repository while commitments stay recorded

**Requirement:** Detailed implementation plans MAY be kept outside version control when the repository's planning policy requires it, but the ticket MUST still record the committed outcome, acceptance checks, owner, dependencies, and evidence links. A ticket MUST NOT be used to hide an unresolved decision that the governing process requires an authorized owner to decide.

## Prohibited conditions

- Starting committed work without a ticket, or creating a ticket after the change is complete for appearance.
- A ticket whose acceptance cannot be observed, or whose closure rests on a document existing.
- Rewriting, deleting, or backdating a ticket log to match a later outcome.
- Marking work done without recorded evidence or required independent review.
- Treating a ticket as a specification, contract, threshold decision, exception, or release approval.
- Assigning ownership to a role that has no role document, or leaving work ownerless.
- Storing credentials, tokens, personal data, or customer content in a ticket.
- Keeping a private second index or status board that contradicts the ticket store.
- Reporting completion from memory, chat history, or an unvalidated summary instead of the store.

## Decision procedure

For a work item:

1. Identify the governing requirement, specification, contract, or decision, and the accountable role.
2. Confirm a ticket exists with an outcome, acceptance checks, owner, and linked IDs.
3. Confirm the selected status is reachable and the blockers are recorded with an unblock owner.
4. Perform the work, appending dated evidence to the ticket as checks run.
5. Obtain the required review, then close the ticket with evidence or record the exception.
6. Commit the ticket update with the artifact so both can be reverted together.

Steps 1–2 and 5–6 require the responsible role; any step that changes requirements, contracts, thresholds, security posture, or release state requires the authorized human owner named by the governing control.

## Assessment procedure

### Examine

- Inspect the ticket store history and a sample of recent commits. Confirm that each committed change has a corresponding ticket with a traceable owner, outcome, acceptance checks, and evidence.
- Inspect the validation output and confirm that defects block the change rather than being reported and ignored.
- Compare a reported status with the store and the committed evidence; confirm that done means verified.

### Interview

- Ask the product-manager role how the session brief is used, how priorities and blockers are recorded, and what happens when a ticket conflicts with the working tree.
- Ask an engineer and a reviewer how they know what to do next, where evidence is recorded, and when they must escalate instead of approving.

### Test

- Create a deliberately invalid store in a temporary location: unknown owner, unknown status, dangling dependency, dependency cycle, and a done ticket without evidence. Confirm that validation reports every defect and exits non-zero.
- Remove a ticket update from a sample change and confirm the review process treats the change as incomplete rather than passing it.

## Assessment determination

Pass requires that tracked work is represented by tickets with observable acceptance and evidence, that status reflects committed work, that required independence is recorded, and that validation runs and blocks defects. Fail when committed work has no record, closure lacks evidence, the store drifts from a second status source, or a ticket is used to approve something the governing artifact reserves to an authorized owner. Not applicable requires a recorded reason for work that produced no committed artifact.

## Required evidence

- Ticket records with stable ids, owner roles, outcomes, acceptance checks, linked requirement and control IDs, and dated evidence.
- The validation command and its result for the current revision.
- Commit history showing ticket updates committed with their artifacts.
- Review records for work that requires independent review.
- Explicit cancelled or superseded records instead of deleted history.
- A recorded decision owner and governing artifact for any question a ticket could not decide.

## Exceptions and nonconformance

A MUST deviation requires approval from the accountable engineering or product owner before the change is treated as complete. Record the affected clauses, reason, scope, risk, compensating control, remediation owner, and review or expiry date in [the assurance register](../assurance-register.md). An exception does not amend this rule. Recurring exceptions require revising the process or resolving the underlying decision.

## Reference trail

Source IDs R2 and R3 are mapped in [00-references-trails.md](../trails/00-references-trails.md). The originating review request is retained in `notes/manual_review_checks.md` under "flow of development". External sources inform the control but do not replace its project-specific requirements.
