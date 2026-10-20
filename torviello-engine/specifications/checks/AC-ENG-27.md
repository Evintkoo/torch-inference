# AC-ENG-27 — Publish and evolve a validated HTTP contract

**Check ID:** AC-ENG-27  
**Requirement:** ENG-021  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** The OpenAPI contract validates and matches the router, aliases are behaviorally identical, and deprecation and compatibility rules are followed. AC-ENG-27 verifies ENG-021 and fails when the threshold below is not met.
- **Measurable:** OpenAPI 3.2.1 validates and resolves with zero errors; zero lint findings; 100% bidirectional router parity; 100% alias equivalence; zero unintended breaking changes; 100% RFC 9457 error schema coverage.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-021; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-021 — Publish and evolve a validated HTTP contract

**Priority:** MUST  
**Requirement document:** [ENG-021](../../../requirements/items/ENG-021.md)

The engine MUST publish a machine-readable OpenAPI contract for its public HTTP surface, keep the router and document synchronized, make versioned aliases behaviorally identical, and follow an explicit deprecation and compatibility process for breaking changes.

**Acceptance summary:** The OpenAPI document validates and covers every public route.

## 2. Observable check

The OpenAPI contract validates and matches the router, aliases are behaviorally identical, and deprecation and compatibility rules are followed.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `api-contract-versioning.feature`

#### OpenAPI validates and matches the router

```gherkin
Scenario: OpenAPI validates and matches the router
    Given the engine publishes its OpenAPI document
    When the document is validated in CI
    Then it is valid OpenAPI 3.2.1
    And every public route in the router appears in the document
```

#### Versioned aliases use the same handler

```gherkin
Scenario: Versioned aliases use the same handler
    Given /classify/batch and /v1/classify/batch are public
    When identical requests are sent to both
    Then both produce the same status and body shape
    And the response identifies the same engine version
```

#### Operational endpoints remain unversioned

```gherkin
Scenario: Operational endpoints remain unversioned
    Given the documented operations surface
    When an operator calls health, metrics, or system routes
    Then those routes are available only under their documented paths
    And no duplicate versioned operational surface is advertised
```

#### Deprecation is announced before removal

```gherkin
Scenario: Deprecation is announced before removal
    Given a route or field is scheduled for removal
    When a client calls it during the migration window
    Then the response includes a deprecation signal and successor
    And the removal date is recorded in the contract changelog
```

#### Additive changes preserve compatibility

```gherkin
Scenario: Additive changes preserve compatibility
    Given a new optional response field is added
    When existing clients parse the response
    Then previously required fields and status codes are unchanged
    And the contract version records the additive change
```

#### Unknown routes return the standard envelope

```gherkin
Scenario: Unknown routes return the standard envelope
    Given a client calls an undocumented path
    When the router has no match
    Then the response is 404 with the standard error envelope
    And the request ID is returned
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| API-01 | API contracts and schemas | [01-api-contracts-and-schemas.md](../../../torviello-enforcer/api/rules/01-api-contracts-and-schemas.md) |
| API-04 | API inventory, evolution, and deprecation | [04-api-inventory-evolution-and-deprecation.md](../../../torviello-enforcer/api/rules/04-api-inventory-evolution-and-deprecation.md) |
| GOV-08 | Contract-Driven Development (CDD) | [08-contract-driven-development.md](../../../torviello-enforcer/governance/rules/08-contract-driven-development.md) |

#### API-01.01 — Maintain a machine-readable OpenAPI description for every public HTTP

The project MUST maintain a machine-readable OpenAPI description for every public HTTP API. The project MUST also treat it as a reviewed contract that describes paths, methods, schemas, validation constraints, authentication, authorization, status codes, error bodies, pagination, and streaming behavior.

#### API-01.02 — Keep request and response schemas in a dedicated API

The project MUST keep request and response schemas in a dedicated API schema module. The project MUST also group handlers by user-facing functionality. A handler MAY parse transport input, invoke a domain interface, and serialize a response; it MUST NOT own inference, persistence, registry policy, or cross-service business logic.

#### API-01.03 — Use one stable error envelope

The project MUST use one stable error envelope. The project MUST also include a safe error code and correlation identifier; return actionable client guidance without leaking stack traces, filesystem paths, secrets, internal service names, or dependency errors.

#### API-01.04 — Define compatibility for every endpoint

The project MUST define compatibility for every endpoint. Additive changes preserve existing semantics. Breaking changes require an explicit API version/deprecation plan, a migration window, and consumer-facing release notes.

#### API-01.05 — Generate reference documentation from the contract when practical

The project SHOULD generate reference documentation from the contract when practical. Handwritten endpoint examples MUST be checked against the current contract and implementation.

#### API-04.01 — The project MUST maintain an inventory of every externally…

**Requirement:** The project MUST maintain an inventory of every externally reachable API surface, including engine HTTP routes, admin routes, health/metrics endpoints, callbacks, internal service APIs exposed through a gateway, and protocol versions. Each entry MUST identify owner, audience, exposure, auth policy, lifecycle state, and contract location.

#### API-04.02 — Production API changes MUST be classified as compatible…

**Requirement:** Production API changes MUST be classified as compatible, conditionally compatible, or breaking against the published contract and known consumers. Reviewers MUST examine field requiredness, defaults, enum expansion, response shape, status codes, ordering, pagination, streaming framing, and authorization changes.

#### API-04.03 — Breaking changes MUST use a versioning and migration policy…

**Requirement:** Breaking changes MUST use a versioning and migration policy chosen for the product (URI, media type, or another explicit scheme), with a published compatibility window, migration guidance, sunset date, and owner. Deprecation notices MUST be observable before removal.

#### API-04.04 — Every deployed version MUST be discoverable by operators…

**Requirement:** Every deployed version MUST be discoverable by operators. Remove unsupported versions from the deployment inventory only after traffic and consumer evidence show that the deprecation window has completed.

#### API-04.05 — Debug, experimental, and internal endpoints MUST be…

**Requirement:** Debug, experimental, and internal endpoints MUST be excluded from production packages or protected by an explicit access policy. Their presence and exposure MUST be checked in release qualification.

#### API-04.06 — OpenAPI contracts MUST be reviewed in the same change…

**Requirement:** OpenAPI contracts MUST be reviewed in the same change as implementation. Generated schemas MUST be reproducible; generated diffs MUST not hide semantic changes in hand-maintained descriptions or security declarations.

#### GOV-08.01 — Every interface and event between components MUST be defined…

**Requirement:** Every interface and event between components MUST be defined in a machine-readable contract covering endpoints or channels, inputs, outputs, error shapes, and event payloads. OpenAPI, JSON Schema, AsyncAPI, or an equivalent schema format MUST be used; prose alone MUST NOT be the contract.

#### GOV-08.02 — Consumers and providers MUST agree on the contract, and the…

**Requirement:** Consumers and providers MUST agree on the contract, and the repository MUST contain contract tests that verify both sides against it. A contract without a failing-then-passing contract test MUST NOT be treated as verified.

#### GOV-08.03 — Contract changes MUST be versioned and MUST state…

**Requirement:** Contract changes MUST be versioned and MUST state compatibility impact. A breaking change MUST have a migration or deprecation path, and the affected consumers MUST be identified before the change is released.

#### GOV-08.04 — Contracts MUST be linted or validated by tooling as part of…

**Requirement:** Contracts MUST be linted or validated by tooling as part of the required checks, and validation failures MUST block the change. A schema that is not parsed by any check is unverified documentation.

#### GOV-08.05 — Every contract element used by implementation or tests MUST be…

**Requirement:** Every contract element used by implementation or tests MUST be traceable to a specification and requirement identifier, and the contract MUST be referenced by the tests that exercise it. An orphan endpoint or event is a defect.

#### GOV-08.06 — An approved contract MUST NOT be altered to match an…

**Requirement:** An approved contract MUST NOT be altered to match an implementation that does not satisfy it. Contract changes REQUIRE human authority and MUST be recorded as a contract decision with consumer impact and versioning.

## 5. Prohibited conditions

- Do not add a public route without documenting it.
- Do not let aliases drift to different handlers or schemas.
- Do not remove or rename a field without a migration path.
- Do not change status codes or error meanings in a compatible release.
- Do not treat internal Rust types as the public contract by accident.

## 6. Procedure

- 1. Validate the OpenAPI document and compare its paths with the router inventory.
- 2. Send equivalent requests to unversioned and versioned aliases and compare responses.
- 3. Inspect operational route exposure.
- 4. Call a route marked deprecated and inspect the signal.
- 5. Add a harmless optional field in a fixture and verify compatibility checks.
- 6. Record commands, route inventory, and comparison results.

## 7. Pass criteria

- The observable check in section 2 is satisfied through the shipping engine.
- Every applicable obligation in section 4 is met, including limits, failure behavior, and observability.
- Every feature scenario in section 3 is covered by an automated test or a recorded manual check.
- No prohibited condition in section 5 occurs.
- The result is reproducible from the recorded procedure and evidence.

- **HPA-4 gate:** every universal gate in [`acceptance-criteria.md`](../acceptance-criteria.md) section 2, the check-specific threshold in section 3, all section 9 evidence, and zero section 4 failure criteria MUST pass.
- The result MUST be reproducible on 3 independent runs against the shipping artifact; a skipped, stale, or summary-only result is not a pass.

## 8. Fail criteria

- Any one failure criterion in [`acceptance-criteria.md`](../acceptance-criteria.md) section 4 occurs.
- Any universal gate, check-specific threshold, or section 9 evidence requirement is unmet, missing, stale, or below threshold.
- The result is partial, conditional, non-reproducible, or depends on an unapproved exception.

- The observable result is absent, contradictory, or not reproducible.
- The check passes only through a debug path, test double, or non-shipping configuration.
- A required negative, boundary, or failure case is untested, skipped, or bypassed.
- A prohibited condition occurs.
- Evidence is stale or the implementation changed without re-running the check.
- An exception is unapproved, expired, or missing compensating measures.

- Highest-standard assurance evidence is missing, stale, or below the recorded threshold.

## 9. Required evidence

- OpenAPI validation output and route-coverage diff.
- Alias response comparison.
- Deprecation signal sample.
- Compatibility check for an additive change.
- Unknown-route error envelope.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../requirements/assurance-standard.md), this check additionally requires:

- Contract validation and lint reports.
- The bidirectional route-parity report.
- The breaking-change diff and alias-equivalence tests.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- AC-ENG-06 — see [AC-ENG-06](AC-ENG-06.md)

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-021](../../../requirements/items/ENG-021.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [api-contract-versioning.feature](../features/api-contract-versioning.feature) |
| Rule controls | API-01, API-04, GOV-08 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
