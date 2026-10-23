# AC-ENG-10 — Maintain stable model identity and a truthful catalog

**Check ID:** AC-ENG-10  
**Requirement:** ENG-004  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Model identity is stable and unique, and catalog responses distinguish registry, availability, download, and load state without leaking host details. AC-ENG-10 verifies ENG-004 and fails when the threshold below is not met.
- **Measurable:** 100% of catalog state combinations are independently reported; zero duplicate IDs or slots; 100% schema validation; zero host paths, credentials, or signed URLs; removal is atomic in 100% of crash-injection runs.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-004; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-004 — Maintain stable model identity and a truthful catalog

**Priority:** MUST  
**Requirement document:** [ENG-004](../../../torviello-enforcer/requirements/items/ENG-004.md)

Every model MUST have a stable, unique ID within a profile; the catalog MUST distinguish registry, availability, download, and load state, and MUST report only capabilities and metadata that match the running engine.

**Acceptance summary:** A registry entry with no local asset reports not_downloaded and loaded false.

## 2. Observable check

Model identity is stable and unique, and catalog responses distinguish registry, availability, download, and load state without leaking host details.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `model-catalog.feature`

#### Catalog entries expose stable identity

```gherkin
Scenario: Catalog entries expose stable identity
    Given a registry entry with ID "kokoro-82m"
    When a client lists the catalog
    Then the entry reports ID "kokoro-82m", task, format, and declared backend
    And repeated requests return the same ID
```

#### Availability reflects the filesystem

```gherkin
Scenario: Availability reflects the filesystem
    Given "kokoro-82m" is listed in the registry but no asset exists locally
    When a client lists the catalog
    Then the entry reports availability "not_downloaded"
    And it is not reported as loaded
```

#### Loaded state reflects the runtime

```gherkin
Scenario: Loaded state reflects the runtime
    Given the "kokoro-82m" assets exist and the model is initialized
    When a client lists the catalog
    Then the entry reports availability "available" and loaded true
    And the response names the selected backend
```

#### Duplicate model IDs are rejected

```gherkin
Scenario: Duplicate model IDs are rejected
    Given two descriptors declare the same model ID
    When the catalog is validated
    Then validation fails with error code "model.duplicate_id"
    And neither descriptor is silently preferred
```

#### Unknown model lookup returns a stable error

```gherkin
Scenario: Unknown model lookup returns a stable error
    Given no model has ID "missing-model"
    When a client requests metadata for "missing-model"
    Then the response is 404 with error code "model.not_found"
    And the error envelope includes the request identifier
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| MOD-01 | Model identity, metadata, and compatibility | [01-model-identity-metadata-and-compatibility.md](../../../torviello-enforcer/models/rules/01-model-identity-metadata-and-compatibility.md) |
| API-01 | API contracts and schemas | [01-api-contracts-and-schemas.md](../../../torviello-enforcer/api/rules/01-api-contracts-and-schemas.md) |
| MOD-03 | Registry administration and audit | [03-registry-administration-and-audit.md](../../../torviello-enforcer/models/rules/03-registry-administration-and-audit.md) |

#### MOD-01.01 — Give each model artifact a stable model ID

The project MUST give each model artifact a stable model ID and immutable version or digest. Registry records specify task, format, source, license, input/output schema, tokenizer/preprocessor requirements, runtime/provider constraints, memory estimates, supported platform, and verification status.

#### MOD-01.02 — Separate model metadata from model bytes

The project MUST separate model metadata from model bytes. A registry entry cannot claim available or ready until the corresponding artifact is present, digest-verified, compatible, and successfully loaded for the selected runtime.

#### MOD-01.03 — Treat model files, tokenizer data, configuration, and metadata as

The project MUST treat model files, tokenizer data, configuration, and metadata as untrusted supply-chain inputs. The project MUST also record provenance and permitted redistribution.

#### MOD-01.04 — Define compatibility checks explicitly

The project MUST define compatibility checks explicitly. The project MUST NOT infer task, architecture, or provider support from filenames or extensions alone.

#### MOD-01.05 — Preserve immutable version history

The project MUST preserve immutable version history. Updating a model means creating a new version and an explicit promotion or rollback operation.

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

#### MOD-03.01 — Registry mutations MUST require authenticated identity and least-privilege authorization

Registry mutations MUST require authenticated identity and least-privilege authorization. The project MUST also separate view, add, promote, rollback, and delete permissions where the product requires distinct roles.

#### MOD-03.02 — Validate edits through one schema and policy layer whether

The project MUST validate edits through one schema and policy layer whether they arrive through an admin API or a controlled manual file change.

#### MOD-03.03 — Audit actor, time, action, target model/version, outcome, and change

The project MUST audit actor, time, action, target model/version, outcome, and change identifier. The project MUST NOT log tokens or secret configuration values.

#### MOD-03.04 — Make changes transactional: validate a candidate, persist it safely

The project MUST make changes transactional: validate a candidate, persist it safely, then publish the new version. The project MUST provide a rollback to the last known-good registry state.

#### MOD-03.05 — The standalone engine MUST operate with a local registry/cache

The standalone engine MUST operate with a local registry/cache and MUST NOT require a hosted control plane for local inference

## 5. Prohibited conditions

- Do not derive model identity from a display name or filesystem path.
- Do not report a registry entry as loaded without a live runtime object.
- Do not silently choose one of two duplicate IDs.
- Do not leak cache paths, tokens, or signed URLs in catalog output.
- Do not reorder or rename IDs between compatible releases.

## 6. Procedure

- 1. Prepare a registry with one entry and an empty cache; list the catalog and inspect state fields.
- 2. Populate the asset and initialize the model; repeat the listing.
- 3. Introduce a duplicate ID and run catalog validation.
- 4. Request an unknown ID and inspect the error envelope.
- 5. Inspect the raw response for absolute paths or secrets.
- 6. Compare the unversioned and versioned listing responses.

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

- Catalog responses before and after asset placement and initialization.
- Validation failure for the duplicate ID.
- Unknown-lookup error envelope with request ID.
- A redaction inspection of the catalog response.
- A field-by-field comparison of the two API prefixes.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- The formal state model and the property-test report.
- A state-combination response matrix validated against the contract.
- Restart evidence showing identity reconstruction without in-memory display text.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- AC-ENG-03 — see [AC-ENG-03](AC-ENG-03.md)

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-004](../../../torviello-enforcer/requirements/items/ENG-004.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [model-catalog.feature](../features/model-catalog.feature) |
| Rule controls | MOD-01, API-01, MOD-03 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
