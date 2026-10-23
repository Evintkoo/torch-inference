# AC-ENG-31 — Administer the registry with authorization and audit

**Check ID:** AC-ENG-31  
**Requirement:** ENG-025  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Registry mutations are authorized and validated, paths and scans are confined, every mutation is auditable, and export is stable and redacted. AC-ENG-31 verifies ENG-025 and fails when the threshold below is not met.
- **Measurable:** 100% of administrative authorization matrix cases pass; zero unaudited mutations; zero audit-chain tampering undetected; 100% atomic and idempotent registration/removal; zero path or scan escape; 100% redacted export.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-025; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-025 — Administer the registry with authorization and audit

**Priority:** SHOULD  
**Requirement document:** [ENG-025](../../../torviello-enforcer/requirements/items/ENG-025.md)

Registry mutation MUST require administrative authority, validate descriptors and paths, confine scans to the configured root, record actor, action, target, and result for every mutation, and expose an export that preserves stable identity without secrets or host paths.

**Acceptance summary:** An authorized registration returns the model ID and metadata.

## 2. Observable check

Registry mutations are authorized and validated, paths and scans are confined, every mutation is auditable, and export is stable and redacted.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `registry-administration.feature`

#### Register a local model descriptor

```gherkin
Scenario: Register a local model descriptor
    Given a valid descriptor inside the model root
    When the operator registers it
    Then the registry reports the model ID and metadata
    And one audit record captures actor, action, target, and result
```

#### Directory scan is bounded

```gherkin
Scenario: Directory scan is bounded
    Given a model root containing many files
    When the operator requests a scan
    Then only supported model files are registered
    And the scan respects file count and depth limits
```

#### Metadata export is complete and stable

```gherkin
Scenario: Metadata export is complete and stable
    Given the registry contains registered models
    When an operator exports it
    Then the export contains every registered model with stable IDs
    And secrets and absolute host paths are absent
```

#### Path escape is rejected

```gherkin
Scenario: Path escape is rejected
    Given a descriptor path resolves outside the model root through symlinks
    When registration validates it
    Then the response is 400 with error code "model.path_outside_root"
    And the target file is not read
```

#### Unauthorized mutation is denied and audited

```gherkin
Scenario: Unauthorized mutation is denied and audited
    Given a caller without administrative scope
    When it attempts to register or delete a model
    Then the response is 403
    And an audit record captures the denied action
```

#### Audit records are immutable through the API

```gherkin
Scenario: Audit records are immutable through the API
    Given an audit record exists
    When any client calls the API
    Then no endpoint updates or deletes the record
    And export preserves its original fields
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| MOD-03 | Registry administration and audit | [03-registry-administration-and-audit.md](../../../torviello-enforcer/models/rules/03-registry-administration-and-audit.md) |
| SEC-03 | Authorization and administrative access | [03-authorization-and-administrative-access.md](../../../torviello-enforcer/security/rules/03-authorization-and-administrative-access.md) |
| SEC-06 | Software and model supply chain | [06-software-and-model-supply-chain.md](../../../torviello-enforcer/security/rules/06-software-and-model-supply-chain.md) |

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

#### SEC-03.01 — Apply deny-by-default authorization to every operation and resource

The project MUST apply deny-by-default authorization to every operation and resource. The project MUST also define roles/scopes for inference, model administration, registry changes, user management, billing/licensing, and system configuration.

#### SEC-03.02 — Enforce authorization at the service/domain boundary, not only in

The project MUST enforce authorization at the service/domain boundary, not only in UI controls or route naming. The project MUST also check ownership for object-level access and tenant isolation for hosted deployments.

#### SEC-03.03 — Separate read, create, update, promote, revoke, and delete permissions

The project MUST separate read, create, update, promote, revoke, and delete permissions where impact differs. The project MUST also require stronger controls for high-impact administration when specified by the threat model.

#### SEC-03.04 — Audit privileged actions with actor, target, time, outcome

The project MUST audit privileged actions with actor, target, time, outcome, and correlation context. The project MUST also ensure logs cannot be edited through the same ordinary admin permission.

#### SEC-03.05 — Keep health and metrics routes minimally informative and explicitly

The project MUST keep health and metrics routes minimally informative and explicitly categorized as public, internal, or privileged.

#### SEC-06.01 — Pin and review build dependencies and release inputs

The project MUST pin and review build dependencies and release inputs. The project MUST also generate an SBOM and preserve provenance for every release.

#### SEC-06.02 — Scan dependencies, source, secrets, containers, and model artifacts

The project MUST scan dependencies, source, secrets, containers, and model artifacts. Triage findings using exploitability and deployment context; block unsafe releases under the documented severity gate.

#### SEC-06.03 — Download models only from configured trusted sources

The project MUST download models only from configured trusted sources. The project MUST also verify digest/signature and license/source metadata before installation or activation.

#### SEC-06.04 — Preserve model and software version identity

The project MUST preserve model and software version identity. Updates are atomic and have a rollback path; failed verification never replaces a known-good artifact.

#### SEC-06.05 — Review build workflows and credentials as production security boundaries

The project MUST review build workflows and credentials as production security boundaries. The project MUST also use least privilege and short-lived credentials for release automation.

## 5. Prohibited conditions

- Do not allow inference clients to register or delete models.
- Do not trust a client-supplied absolute path.
- Do not scan an unbounded directory tree.
- Do not omit the actor or target from a mutation record.
- Do not leak credentials or host paths in an export.

## 6. Procedure

- 1. Register a valid descriptor with an administrative token.
- 2. Attempt the same mutation with a non-admin token and inspect the audit record.
- 3. Attempt traversal and symlink escape paths.
- 4. Scan a prepared directory with supported and unsupported files.
- 5. Export the registry and inspect identity, redaction, and completeness.
- 6. Attempt to modify an audit record through the API.

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

- Registration response and audit entry.
- 403 response and denial record.
- Path-escape rejection evidence.
- Scan inventory and bounds behavior.
- Export content and redaction inspection.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- The authorization matrix and denied-case records.
- The audit-chain integrity report.
- Crash-consistency and idempotency results.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-025](../../../torviello-enforcer/requirements/items/ENG-025.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [registry-administration.feature](../features/registry-administration.feature) |
| Rule controls | MOD-03, SEC-03, SEC-06 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
