# Quality assurance test strategy and coverage

**Role:** quality-assurance  
**Document:** 02 of 04

## Trace the matrix before running anything

For each acceptance check, name the test category that proves it. An acceptance
check with no cell in the matrix is a gap to raise on the ticket, not something
to wave through.

| Evidence needed | Category | Where it lives |
|---|---|---|
| A function or module behaves as specified | unit | next to the module |
| An interface honors its contract (routes, schemas, exit codes) | contract | contract tests; OpenAPI validation |
| Components work together with real configuration | integration | feature-gated tests |
| The documented workflow completes end to end | end-to-end | scenario suites |
| Degraded, denied, or timed-out dependencies fail safely | failure injection | unit or integration |
| A claimed measurement (latency, memory, throughput) | benchmark | dated run with revision |
| A security property holds | security | OWASP WSTG-aligned checks on the touched surface |

## Coverage rules

- Map requirements to tests, not files to percentages: for each cited
  requirement id, name the test(s) that observe it. `rg -l "PDL-010"` finds the
  claim; the matrix names the proof.
- Every new failure mode gets a negative test: empty, maximum, malformed,
  unauthorized, timeout, unavailable dependency.
- Boundary values are explicit in the test, not implicit in a loop.
- A bug fix lands with the regression test that failed before the fix.
- Platform- or hardware-dependent code is tested with the feature disabled and
  enabled; the disabled path asserts the fallback, not just the absence of a
  crash.
- Where the build supports it, mutation-style spot checks are welcome evidence:
  flip the condition, watch the test fail, restore it. A suite that survives a
  deliberate bug is measuring execution, not correctness.

## Test design techniques

Use the ISTQB catalog deliberately, not by habit:

- Equivalence partitioning for ranges and formats — one representative per
  class, plus the class edges.
- Boundary value analysis at every limit: min, min+1, max-1, max, max+1.
- Decision tables for rule combinations (feature flag × role × state).
- State transition tests for anything with a lifecycle (session, job, ticket):
  every transition, and at least one attempted illegal transition.
- Error guessing informed by the design note's failure modes.

## Quality characteristics

For each ISO/IEC 25010 characteristic the change claims to affect, name the
check: performance efficiency (measured, with baseline), compatibility
(platform/feature matrix), reliability (failure injection), security (WSTG
checks), usability (with the designer's evidence), portability (disabled-path
fallbacks). A characteristic nobody tests is a claim nobody verified.

## Test design standards

- Deterministic: no unbounded sleeps, real networks, wall-clock dependence, or
  shared mutable state; use the injected clock and temp directories.
- One behavior per test; the name states the behavior and the expectation.
- Assertions observe outcomes (status, payload, exit code, metric), not
  implementation internals.
- Fixtures clean up after themselves; a test that leaks state is a defect.
- Skips require a reason and a linked ticket; an unconditional skip is a defect.

## Risk-based ordering

When time is bounded, test in this order and record what was not reached:

1. Acceptance checks of the ticket under review.
2. Regressions on paths the diff touches.
3. Failure and boundary paths of the new behavior.
4. Broader suites that cross shared boundaries (persistence, auth, API).
5. Performance or soak verification, only with a prior baseline to compare.
