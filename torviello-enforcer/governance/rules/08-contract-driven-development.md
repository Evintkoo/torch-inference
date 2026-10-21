# Contract-Driven Development (CDD)

**Control family:** governance
**Control document:** GOV-08
**Requirement trace:** CSC-005, ED-052, ED-055
**Status:** Normative project control

## Control objective

Contract-Driven Development fixes how components interact. Interfaces, inputs, outputs, errors, events, and versioning MUST be defined in machine-readable contracts that consumers and providers agree on, and contract changes MUST be versioned and verified by contract tests rather than prose. The contract MUST be approved before tests and implementation are written against it.

## Applicability

This control applies to every change that adds or modifies an interface, API endpoint, event, message, schema, or integration boundary. A change with no external or cross-component interaction MAY record CDD as not applicable with a decision owner. Product-specific choices remain governed by approved requirements and decision records.

## Normative requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are interpreted as described by IETF BCP 14 only when they appear in all capitals.

### GOV-08.01 — Every interface and event between components MUST be defined…

**Requirement:** Every interface and event between components MUST be defined in a machine-readable contract covering endpoints or channels, inputs, outputs, error shapes, and event payloads. OpenAPI, JSON Schema, AsyncAPI, or an equivalent schema format MUST be used; prose alone MUST NOT be the contract.

### GOV-08.02 — Consumers and providers MUST agree on the contract, and the…

**Requirement:** Consumers and providers MUST agree on the contract, and the repository MUST contain contract tests that verify both sides against it. A contract without a failing-then-passing contract test MUST NOT be treated as verified.

### GOV-08.03 — Contract changes MUST be versioned and MUST state…

**Requirement:** Contract changes MUST be versioned and MUST state compatibility impact. A breaking change MUST have a migration or deprecation path, and the affected consumers MUST be identified before the change is released.

### GOV-08.04 — Contracts MUST be linted or validated by tooling as part of…

**Requirement:** Contracts MUST be linted or validated by tooling as part of the required checks, and validation failures MUST block the change. A schema that is not parsed by any check is unverified documentation.

### GOV-08.05 — Every contract element used by implementation or tests MUST be…

**Requirement:** Every contract element used by implementation or tests MUST be traceable to a specification and requirement identifier, and the contract MUST be referenced by the tests that exercise it. An orphan endpoint or event is a defect.

### GOV-08.06 — An approved contract MUST NOT be altered to match an…

**Requirement:** An approved contract MUST NOT be altered to match an implementation that does not satisfy it. Contract changes REQUIRE human authority and MUST be recorded as a contract decision with consumer impact and versioning.

### GOV-08.07 — Contracts MUST precede contract tests and provider implementation…

**Requirement:** For every interface change, the machine-readable contract MUST be authored, reviewed, and approved before contract tests are written, and contract tests MUST be written and observed failing before provider implementation. A test or implementation that introduces or changes an undecided interface MUST be rejected until the contract is updated and approved. The mandatory order is contract → failing test → implementation.

### GOV-08.08 — Every operation declared in an HTTP contract MUST be exercised…

**Requirement:** Every operation declared in an HTTP contract MUST be exercised against the running provider by a contract integration test that uses the operation's declared method and path. The test MUST fail when the operation is unrouted, returns a status or media type not declared for that operation, or violates the contract's required headers, cache policy, body fields, or allowed error codes. Operations declared reserved MUST return the declared `501` problem response; operations not declared reserved MUST NOT return `501`.

## Prohibited conditions

- Describing an interface only in prose, comments, or documentation without a machine-readable schema.
- Shipping a contract change without contract tests or without a version and compatibility statement.
- Changing an approved contract to hide an implementation defect.
- Leaving endpoints or events in the contract that no specification, test, or implementation references.
- Treating schema file presence as contract verification.
- Leaving an operation declared in the contract unexercised by a provider integration test.
- Marking an operation reserved while returning a success response, or marking it implemented while returning `501`.
- Writing contract tests or provider implementation before the affected contract is approved.
- Using implementation or test expectations to define an interface after the fact.

## Assessment procedure

1. Identify the changed interfaces, events, and schemas and locate their machine-readable contracts.
2. Confirm inputs, outputs, errors, events, and versioning are defined and the contract was approved before tests or implementation.
3. Verify contract tests exist, were authored after the contract and observed failing before implementation, run against both consumer and provider, and pass. For HTTP contracts, confirm every declared operation is exercised against the running router.
4. Check contract linting or validation runs in the required checks.
5. Trace contract elements to specifications and requirement identifiers.
6. Record the result and any compatibility decisions in the governance assurance register.

## Assessment determination

The control passes only when machine-readable contracts define the affected interfaces, the contract was approved before contract tests and implementation, contract tests verify both sides and pass, validation runs in required checks, every declared HTTP operation is exercised against the running provider, and every used contract element traces to a specification and requirement. Prose-only contracts, missing contract tests, unversioned breaking changes, or orphan elements are failures.

## Required evidence

- Machine-readable interface and event contracts with version information.
- Contract tests and their command results.
- Schema linting or validation results.
- Consumer/provider agreement and compatibility or migration record.
- Evidence that the contract was approved before contract tests and implementation (contract and test revision order).
- Trace from contract elements to specifications, requirement identifiers, and tests.
- Runtime operation-usage matrix showing every declared operation, its declared statuses, and the observed router result.

## Exceptions and nonconformance

An exception MUST identify the affected clauses, reason, risk, compensating controls, accountable approver, remediation owner, and expiry/review date, and MUST be recorded in the [assurance register](../assurance-register.md) before it is effective. An interface shipped without a verified contract is nonconforming and MUST NOT be reported as passing.

## Implementation guidance

Keep contracts in a discoverable schema location and generate or validate consumer and provider bindings from them. Reference the contract path and version in the tests and specification.

## Reference trail

See [00-references-trails.md](../trails/00-references-trails.md) for sources and requirement mapping.
