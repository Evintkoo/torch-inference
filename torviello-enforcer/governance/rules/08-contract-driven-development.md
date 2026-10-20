# Contract-Driven Development (CDD)

**Control family:** governance
**Control document:** GOV-08
**Requirement trace:** CSC-005, ED-052, ED-055
**Status:** Normative project control

## Control objective

Contract-Driven Development fixes how components interact. Interfaces, inputs, outputs, errors, events, and versioning MUST be defined in machine-readable contracts that consumers and providers agree on, and contract changes MUST be versioned and verified by contract tests rather than prose.

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

## Prohibited conditions

- Describing an interface only in prose, comments, or documentation without a machine-readable schema.
- Shipping a contract change without contract tests or without a version and compatibility statement.
- Changing an approved contract to hide an implementation defect.
- Leaving endpoints or events in the contract that no specification, test, or implementation references.
- Treating schema file presence as contract verification.

## Assessment procedure

1. Identify the changed interfaces, events, and schemas and locate their machine-readable contracts.
2. Confirm inputs, outputs, errors, events, and versioning are defined.
3. Verify contract tests exist, run against both consumer and provider, and pass.
4. Check contract linting or validation runs in the required checks.
5. Trace contract elements to specifications and requirement identifiers.
6. Record the result and any compatibility decisions in the governance assurance register.

## Assessment determination

The control passes only when machine-readable contracts define the affected interfaces, contract tests verify both sides and pass, validation runs in required checks, and every used contract element traces to a specification and requirement. Prose-only contracts, missing contract tests, unversioned breaking changes, or orphan elements are failures.

## Required evidence

- Machine-readable interface and event contracts with version information.
- Contract tests and their command results.
- Schema linting or validation results.
- Consumer/provider agreement and compatibility or migration record.
- Trace from contract elements to specifications, requirement identifiers, and tests.

## Exceptions and nonconformance

An exception MUST identify the affected clauses, reason, risk, compensating controls, accountable approver, remediation owner, and expiry/review date, and MUST be recorded in the [assurance register](../assurance-register.md) before it is effective. An interface shipped without a verified contract is nonconforming and MUST NOT be reported as passing.

## Implementation guidance

Keep contracts in a discoverable schema location and generate or validate consumer and provider bindings from them. Reference the contract path and version in the tests and specification.

## Reference trail

See [00-references-trails.md](../trails/00-references-trails.md) for sources and requirement mapping.
