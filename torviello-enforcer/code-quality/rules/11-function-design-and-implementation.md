# Function design and implementation procedure

**Control family:** code-quality  
**Control document:** CQ-11  
**Requirement trace:** ED-001–ED-005, ED-010–ED-014, CSC-005–CSC-009, PDL-006–PDL-007, PDL-013–PDL-014  
**Status:** Normative project control

## Control objective

Provide a repeatable method for designing, implementing, testing, and reviewing functions so each function has an understandable contract, owns the right amount of work, handles invalid input and failure deliberately, and remains easy to change.

## Applicability

Applies to new or materially changed functions, methods, closures, async tasks, handlers, callbacks, and public API operations in production code. Language-specific details below address Rust and TypeScript/JavaScript; other languages MUST apply equivalent typing, error, state, and test principles. Generated/vendor code is handled under its owning controls.

## Normative requirements

### CQ-11.01 — Start from behavior and boundary, not a desired code shape

Before writing a function, identify the caller/use case, requirement or defect, trigger, input source and trust level, expected output or state transition, side effects, failure cases, and required verification. Decide whether the behavior belongs in the caller, domain layer, adapter, or shared abstraction based on ownership and dependency direction. Do not introduce a helper or abstraction merely to shorten a line or satisfy a line-count target.

### CQ-11.02 — Give the function one cohesive responsibility

A function MUST have one primary responsibility and a name that describes its observable action or result. Split it when it coordinates independent policies, mixes transport with domain or persistence behavior, has unrelated error paths, or requires many unrelated inputs. Keep cohesive sequences together when splitting would hide invariants or force callers to reconstruct a transaction. Length alone is a review signal, not an automatic extraction rule.

### CQ-11.03 — Design an explicit contract

Define parameters, return value, state changes, error cases, resource behavior, and invariants before implementation. Prefer types that make invalid states unrepresentable and encode units, identity, validated input, or state transitions where beneficial. Use distinct input/configuration types when a long positional argument list is ambiguous. Public functions MUST document purpose, important preconditions, errors/panics, safety constraints, and examples where callers cannot infer them from types and tests.

### CQ-11.04 — Validate untrusted input at the authoritative boundary

Validate external data once at the first trusted boundary, convert it to a validated internal type, and preserve that invariant through internal calls. Enforce business invariants in the authoritative domain/storage boundary as applicable; UI or caller validation is supplementary. Define behavior for missing, malformed, oversized, out-of-range, duplicate, unauthorized, and contradictory input relevant to the contract. Avoid redundant validation that obscures which layer owns the invariant.

### CQ-11.05 — Make effects and ownership visible

Keep pure computation free of I/O when that improves deterministic reasoning. Place filesystem, network, database, clock, randomness, process, GPU, and logging effects behind explicit dependencies or narrow adapters where practical. In Rust, use ownership and borrowing to express lifetimes and mutability; clone only when ownership requires it and the cost is understood. Do not hide expensive work, blocking calls, global state, or network access behind names that imply a cheap local computation.

### CQ-11.06 — Define error behavior as part of the contract

Return typed errors/results for expected operational failures; reserve panic for violated internal invariants or unrecoverable programming defects, never ordinary bad input or routine service failure. Add context at a boundary without discarding the cause; map internal errors to stable user/API/operator responses at the owning layer. Do not leak secrets, personal data, SQL parameters, filesystem internals, or sensitive model inputs in errors/logs. Retry only when the operation is safe/idempotent or protected by an idempotency mechanism; bound attempts and backoff.

### CQ-11.07 — Bound resources, time, and concurrency

For functions that process input, await work, allocate, query, or schedule tasks, define input/collection bounds, timeout/cancellation behavior, concurrency limits, backpressure, cleanup, and partial-result semantics as applicable. Do not hold locks across unbounded I/O. Ensure cancellation and early returns release resources and leave state consistent. Avoid detached tasks unless their owner, shutdown behavior, error reporting, and lifetime are explicit.

### CQ-11.08 — Keep control flow direct and state transitions explicit

Use early returns for guard failures when they improve clarity, match branches to meaningful states, and avoid deeply nested conditionals or boolean flags with unclear meaning. Every state mutation MUST have a clear owner and order. Do not silently swallow errors, use broad catch-all branches, or add fallback behavior that changes security or correctness assumptions. Comment on rationale/invariants, not syntax already expressed by code.

### CQ-11.09 — Test the contract at the function’s appropriate seam

Test representative valid behavior, boundary values, invalid input, failure propagation, side effects, and invariant preservation. Prefer a pure unit test for deterministic logic; use focused integration/contract tests for database, filesystem, network, runtime, or framework behavior. Inject controllable clocks, providers, or storage dependencies when nondeterminism otherwise prevents meaningful tests. Avoid tests coupled to private implementation details unless they guard a documented invariant.

### CQ-11.10 — Review API impact and maintenance cost

Before finalizing, inspect callers and public interfaces, error compatibility, performance/resource implications, accessibility/user-visible impact where relevant, and whether a new dependency or abstraction is warranted. Update docs, examples, API schemas, observability, and requirement trace for changed contracts. Prefer a small clear function contract over a generic framework unless multiple real use cases justify the framework.

## Implementation guidance

Apply the procedure below before and during implementation, not as a retrospective checklist. Use it with the system/module rules to select the right boundary and with security, API, persistence, performance, and verification rules when those effects apply. Existing function patterns are evidence to inspect, not automatic precedent when they conflict with approved requirements or create unsafe behavior.

## Function implementation procedure

1. **State the contract:** write a short behavior statement, inputs, output/state change, errors, side effects, resource bounds, and acceptance cases.
2. **Choose the owner:** locate the narrowest layer that owns the invariant and effect; confirm the function does not cross unrelated boundaries.
3. **Shape the types:** name domain concepts, encode validated states and units, choose parameter and result types, and define error mapping.
4. **Enumerate branches:** list normal, invalid, boundary, permission, dependency failure, timeout/cancellation, retry, and partial-completion cases that apply.
5. **Implement the simplest cohesive flow:** keep effects visible, invariants close to mutation, resource cleanup guaranteed, and control flow explicit.
6. **Verify locally:** run formatter/linter/type checks; add contract tests; use fakes only at effect boundaries and retain at least one integration check for critical adapters.
7. **Review callers and consequences:** inspect the diff, API compatibility, logs/metrics, performance, security, documentation, and module ownership.
8. **Record completion:** link requirement/control IDs, commands and results, skipped checks, known limitations, and follow-up owner; do not claim success for unavailable checks.

## Language-specific conventions

### Rust

- Prefer `Result<T, E>` for expected failure and `Option<T>` only when absence is an ordinary, semantically clear outcome. Use `?` to propagate errors with context at a meaningful boundary.
- Prefer borrowed inputs when ownership need not transfer; use `&mut` only for intentional mutation. Avoid unnecessary `clone`, `unwrap`, `expect`, `panic!`, and `unsafe`; every justified `unsafe` block documents its safety invariant and has focused tests/review.
- Prefer domain/newtype wrappers over primitive values where they prevent invalid input or confusion. Keep `async` functions nonblocking; use the approved blocking boundary for CPU/blocking operations and bound task/resource use.

### TypeScript/JavaScript

- Enable strict type checking for maintained production code. Represent absent/null/unknown states explicitly; validate external JSON, environment, storage, and API responses at runtime before treating them as domain types.
- Return/reject typed or discriminated outcomes at service boundaries; do not suppress rejected promises or use `any` to bypass an unclear contract. Keep DOM/framework effects at UI or adapter boundaries and clean up subscriptions, timers, and async work on lifecycle changes.

## Prohibited conditions

- A function that mixes authorization, domain policy, persistence, transport formatting, and presentation without a deliberate orchestrating boundary.
- Broad catch-and-ignore, silent defaulting of invalid configuration, unbounded retry, unbounded collection, or detached unowned work.
- Public APIs with undocumented panic/error/safety behavior or accidental exposure of internal error detail.
- Unit tests that mock away the behavior the requirement is meant to verify.

## Assessment procedure

**Examine:** contract, types, callers, side effects, resource bounds, errors, tests, and updated requirement/documentation traces.

**Interview:** ask a reviewer unfamiliar with the change to state the function’s purpose, valid inputs, effects, and failures from the signature/docs alone.

**Test:** run language checks and relevant tests; exercise one normal, one boundary, and one failure case per material contract. For resource or concurrency behavior, test limits, cancellation/failure cleanup, or contention at the appropriate integration seam.

## Assessment determination

Pass when the function has a cohesive and understandable contract, preserves invariants, handles relevant failures/resources, and is supported by appropriate tests. Fail when behavior depends on hidden state, common failures panic or disappear, resource work is unbounded, or tests do not cover the claimed contract. Not applicable requires scope and rationale.

## Required evidence

Function contract or public docs as needed; requirement/control trace; focused tests and relevant integration evidence; formatter/linter/type-check results; reviewed diff with limitations recorded.

## Exceptions and nonconformance

A MUST exception requires the owning engineering lead and relevant security/performance/domain authority. Record affected callers, reason, risk, compensation, owner, and expiry/review date. An unsafe block or public API exception requires explicit rationale and focused review; exception approval does not excuse missing safety invariants.

## Reference trail

Sources R1, R4, R5 are listed in [00-references-trails.md](../trails/00-references-trails.md).
