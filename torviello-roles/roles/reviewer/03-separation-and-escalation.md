# Reviewer separation and escalation

**Role:** reviewer  
**Document:** 03 of 03

## Separation

A reviewer must not approve a change they authored when the governing control
requires independent review. Record the reviewer's role separately from the
author's role in the ticket log so the separation is visible.

## Escalation

Escalate instead of approving when the review exposes:

- a change to approved behavior, a contract, a threshold, or an exception;
- a security, privacy, legal, licensing, or release decision;
- a conflict between the ticket, the implementation, and the governing artifact;
- missing evidence that the author cannot produce.

Record the decision needed, the accountable owner, and the effect on the ticket.
An escalated ticket stays open; silence is not approval.
