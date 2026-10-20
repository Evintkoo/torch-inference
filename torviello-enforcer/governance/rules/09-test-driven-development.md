# Test-Driven Development (TDD)

**Control family:** governance
**Control document:** GOV-09
**Requirement trace:** CSC-009, ED-010, ED-011, ED-053, ED-055
**Status:** Normative project control

## Control objective

Test-Driven Development verifies correctness while implementation proceeds. Approved behaviors and edge cases MUST be driven by failing tests through the RED → GREEN → REFACTOR cycle, with unit, contract, and integration tests kept in their categories. A passing run on a weakened, skipped, or deleted test MUST NOT count as verification.

## Applicability

This control applies to every change that adds or modifies executable behavior, interfaces, or test suites. Documentation-only or non-executable artifact changes MAY record TDD as not applicable with a decision owner. Product-specific choices remain governed by approved requirements and decision records.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### GOV-09.01 — Each approved behavior and edge case MUST be driven by a test…

**Requirement:** Each approved behavior and edge case MUST be driven by a test that fails for the right reason before the implementation exists (RED), then passes after the minimal implementation (GREEN), and remains passing through refactoring (REFACTOR). The cycle MAY repeat per behavior, but the failing-first evidence MUST exist.

### GOV-09.02 — Unit, contract, integration, and end-to-end tests MUST be kept…

**Requirement:** Unit, contract, integration, and end-to-end tests MUST be kept in their dedicated categories and MUST be independently selectable with documented prerequisites. A monolith test command that cannot isolate a category is insufficient.

### GOV-09.03 — Tests MUST be deterministic and MUST NOT depend on…

**Requirement:** Tests MUST be deterministic and MUST NOT depend on unbounded sleeps, external networks, shared mutable state, or ordering between tests. Flaky, skipped, or quarantined tests MUST be reported and MUST NOT be counted as passing evidence.

### GOV-09.04 — Contract and integration behavior MUST be verified by…

**Requirement:** Contract and integration behavior MUST be verified by tests that exercise the approved contract and its error paths, not only the happy path. Model, hardware, or environment-dependent tests MUST state their prerequisites and MUST NOT silently skip on unsupported environments.

### GOV-09.05 — Tests MUST NOT be weakened, skipped, deleted, or made…

**Requirement:** Tests MUST NOT be weakened, skipped, deleted, or made non-asserting to make a change pass. Such a change REQUIRES human authority and MUST be recorded with the affected requirement and the reason; a green run on a weakened test MUST NOT be reported as verification.

### GOV-09.06 — Every test MUST be traceable to a requirement, specification, or…

**Requirement:** Every test MUST be traceable to a requirement, specification, or contract, and the repository MUST record the command and result used to produce the passing evidence. Coverage claims MUST name the tests and the scope they cover.

## Prohibited conditions

- Writing implementation first and adding tests that cannot fail afterward.
- Deleting, skipping, or narrowing assertions to obtain a green run.
- Counting a flaky test, a quarantined test, or a skipped test as verification.
- Running a single undifferentiated test command that cannot select the required category.
- Claiming verification without recording the command and result that produced it.

## Assessment procedure

1. Identify the requirement, specification, or contract each changed test verifies.
2. Confirm a failing-first test exists for each new behavior or edge case.
3. Run the required test categories independently and record the commands and results.
4. Inspect the change history for weakened, skipped, or deleted tests and for secrets or external dependencies.
5. Confirm contract, error-path, and environment-dependent tests state their prerequisites.
6. Record the result in the governance assurance register.

## Assessment determination

The control passes only when approved behaviors have failing-first tests, required categories are independently selectable, tests are deterministic and traceable, and the recorded commands and results show them passing without weakening. Missing failing-first evidence, non-deterministic tests, or weakened tests are failures.

## Required evidence

- Failing-first test and its failure output before implementation.
- Passing test output after implementation, with the exact command.
- Test category layout and independent selection commands.
- Trace from tests to requirement, specification, or contract identifiers.
- Record of any test change that required human authority.

## Exceptions and nonconformance

An exception MUST identify the affected clauses, reason, risk, compensating controls, accountable approver, remediation owner, and expiry/review date, and MUST be recorded in the [assurance register](../assurance-register.md) before it is effective. A change that passes only because a test was weakened is nonconforming and MUST NOT be reported as passing.

## Implementation guidance

Commit the failing test before the implementation when practical. Keep test names carrying the requirement identifier and the behavior, so coverage and traceability are mechanical.

## Reference trail

See [00-references-trails.md](../trails/00-references-trails.md) for sources and requirement mapping.
