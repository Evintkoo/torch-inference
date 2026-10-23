# Designer accessibility and usability evidence

**Role:** designer  
**Document:** 03 of 05

## Accessibility criteria per element

The baseline is WCAG 2.2 Level AA for every user-facing surface. Every
interactive element carries, in the ticket:

- a name reachable by assistive technology (label or accessible name, not
  placeholder-only);
- one reachable keyboard path, including focus order and where focus lands
  after dialogs open, close, or fail;
- a visible focus indicator that survives the design;
- a target size and spacing that meets WCAG 2.2 AA;
- contrast ratios for text, disabled text, and indicators, with the measured
  values (tool output, not "looks fine");
- announced feedback for async outcomes (loading, success, failure) so state
  changes are not visual-only.

Error states announce themselves: the message is associated with the field or
region that caused it, and re-submission is possible without losing input.

## Evidence, not assurance

| Claim | Minimum evidence |
|---|---|
| Keyboard operable | recorded walkthrough of the named path, every stop listed |
| Screen-reader usable | recorded pass with the actual announcement text quoted |
| Contrast passes | tool output per foreground/background pair |
| Reduced-motion honored | observation with the OS setting enabled |
| Flow is learnable | usability pass notes: task, participants, completion, stalls |

A criterion without its evidence row is unverified and is reported as such.

## Usability passes

1. Define the task and the success signal before recruiting ("restart a failed
   job from the jobs view, unaided").
2. Run the task with the interface as built — not the mock — on the revision
   under test; record the revision.
3. Note where users stall, backtrack, or misread; each stall is a finding with
   the state it occurred in, checked against Nielsen's usability heuristics
   (visibility of status, error recovery, recognition over recall).
4. Log findings on the ticket with severity and the suggested state change;
   do not redesign inside the review.

## Handoff

The spec, the acceptance checks, and the evidence table stay in the ticket.
The next person must be able to re-run the verification from the ticket alone;
anything that exists only in a design tool or chat does not count.
