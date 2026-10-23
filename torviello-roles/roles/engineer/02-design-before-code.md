# Engineer design before code

**Role:** engineer  
**Document:** 02 of 05

## When a design is required

Anything that is not an obvious localized fix gets design notes on the ticket
before implementation: new modules, interface or schema changes, concurrency,
persistence, performance-sensitive paths, and anything with more than one
plausible approach. If the design is trivial to the point of skipping this,
say so in one log line; silence is not a decision.

## The design note

Append to the ticket, in this shape:

```text
- 2026-10-23 — design: <one-paragraph approach>
  alternatives: <option B — why rejected>
  interfaces: <functions/routes/types added or changed; contract-first if public>
  data: <entities, migrations, rollback>
  failure modes: <what breaks: backend down, malformed input, timeout, concurrent writer>
  complexity: <algorithmic and operational; expected scale>
  tests: <the checks that will prove each acceptance item>
```

Rules:

- Name the tradeoff, not just the choice. A rejected alternative recorded is
  worth more than a rationale invented later.
- Public interfaces are contract-first: the contract and its failing test
  change before the provider does.
- Persisted data gets a migration path and a rollback note in the design, not
  after the fact.
- Consider the ISO/IEC 25010 characteristics that matter for this change —
  functional suitability, performance efficiency, compatibility, reliability,
  security, maintainability, portability — and name the ones being traded
  away.
- Concurrency is designed, not discovered: identify shared state, the locking
  or ownership rule, and the interleaving that must be safe.

## Scale check

Before writing code, answer:

- What is the expected size (rows, requests, payload bytes) at 1× and at 100×?
- What degrades first, and what does the system do when it does?
- Which part of this design will be hardest to change in a year, and is that
  acceptable?

An answer that cannot be written down is a spike: time-box it, record findings
in the ticket, and then design.

## Exit criteria

- The design note is on the ticket and references the acceptance checks.
- Every acceptance check maps to a planned test.
- Interfaces that cross a boundary (API, schema, config, wire format) have
  their contract update identified.
- The engineer can name the failure modes and their handling without
  improvising during implementation.
