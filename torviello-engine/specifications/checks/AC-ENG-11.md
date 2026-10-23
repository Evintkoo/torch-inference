# AC-ENG-11 — Acquire, verify, and remove model assets safely

**Check ID:** AC-ENG-11  
**Requirement:** ENG-005  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Scaffold implementation exists for local acquisition, https transport, digest verification, status, and progress; deletion, archive fuzzing, TLA+/Loom evidence, and evaluation evidence are absent. Not accepted.

### SMART specification

- **Specific:** Acquisition jobs are bounded and observable, unsafe sources and destinations are rejected, integrity is verified before activation, and deletion stays inside managed assets. AC-ENG-11 verifies ENG-005 and fails when the threshold below is not met.
- **Measurable:** 100% of traversal, absolute-path, symlink, hardlink, special-file, and archive-bomb cases are rejected; zero writes outside the root; 100% integrity verification before activation; zero partial assets visible; 24 CPU-hours of archive fuzzing.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-005; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-005 — Acquire, verify, and remove model assets safely

**Priority:** MUST  
**Requirement document:** [ENG-005](../../../torviello-enforcer/requirements/items/ENG-005.md)

Model acquisition MUST run as bounded, observable jobs; validate source schemes, names, and destinations; verify provenance and integrity before activation; and delete only managed assets inside the configured cache root.

**Acceptance summary:** A valid source creates a task ID and advances through documented states.

## 2. Observable check

Acquisition jobs are bounded and observable, unsafe sources and destinations are rejected, integrity is verified before activation, and deletion stays inside managed assets.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `model-acquisition.feature`

#### A download job progresses through observable states

```gherkin
Scenario: A download job progresses through observable states
    Given a client requests a model from a declared Hugging Face repository
    When the download starts
    Then the response includes a task ID and status "queued"
    And status transitions through downloading, verifying, and ready
```

#### Download progress streams until a terminal state

```gherkin
Scenario: Download progress streams until a terminal state
    Given an active download task
    When a client subscribes to its event stream
    Then each event carries task ID, state, and bytes transferred
    And the stream closes after the terminal state
```

#### Unsafe model names are rejected

```gherkin
Scenario: Unsafe model names are rejected
    Given a request uses model_name "../escape"
    When the download request is validated
    Then the response is 400 with error code "model.invalid_name"
    And no file is written outside the cache directory
```

#### Non-HTTP sources are rejected

```gherkin
Scenario: Non-HTTP sources are rejected
    Given a URL source uses the "file://" scheme
    When the download request is validated
    Then the response is 400 with error code "model.invalid_source"
    And no local file is read
```

#### Integrity failure quarantines the artifact

```gherkin
Scenario: Integrity failure quarantines the artifact
    Given a downloaded artifact does not match its declared digest
    When verification runs
    Then the task ends in "failed" with error code "model.digest_mismatch"
    And the artifact is not activated or listed as available
```

#### Deletion removes only managed assets

```gherkin
Scenario: Deletion removes only managed assets
    Given a managed model exists in the cache
    When a client deletes it
    Then the task moves to deleted and the cache size decreases
    And an unrelated model's files remain unchanged
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| MOD-02 | Secure download, install, and activation | [02-secure-download-install-and-activation.md](../../../torviello-enforcer/models/rules/02-secure-download-install-and-activation.md) |
| MOD-06 | Model provenance, installation, and update trust | [06-model-provenance-installation-and-update-trust.md](../../../torviello-enforcer/models/rules/06-model-provenance-installation-and-update-trust.md) |
| SEC-06 | Software and model supply chain | [06-software-and-model-supply-chain.md](../../../torviello-enforcer/security/rules/06-software-and-model-supply-chain.md) |
| SEC-04 | Input, file, and resource security | [04-input-file-and-resource-security.md](../../../torviello-enforcer/security/rules/04-input-file-and-resource-security.md) |

#### MOD-02.01 — Restrict downloads to configured or allowlisted sources

The project MUST restrict downloads to configured or allowlisted sources. The project MUST also enforce TLS verification, safe redirect rules, connection and total timeouts, maximum size, disk-space checks, and bounded retries.

#### MOD-02.02 — Verify a cryptographic digest or signature before extracting

The project MUST verify a cryptographic digest or signature before extracting or loading an artifact. Reject mismatches and retain evidence of the verification result.

#### MOD-02.03 — Extract archives into a staging directory after rejecting absolute

The project MUST extract archives into a staging directory after rejecting absolute paths, parent traversal, links outside the destination, duplicate collisions, and excessive expanded size.

#### MOD-02.04 — Install and activate atomically

The project MUST install and activate atomically. A failed or interrupted download, extraction, or model load leaves the prior active artifact intact.

#### MOD-02.05 — Separate download state, installed state, and active state

The project MUST separate download state, installed state, and active state. The project MUST also report each explicitly to operators and readiness checks.

#### MOD-02.06 — Provide a preloaded/offline installation path for restricted deployments

The project MUST provide a preloaded/offline installation path for restricted deployments.

#### MOD-06.01 — Model manifests MUST bind publisher identity, immutable model/version…

**Requirement:** Model manifests MUST bind publisher identity, immutable model/version identity, file list, size, cryptographic digest, license, compatibility metadata, and any signature or attestation to the exact bytes installed.

#### MOD-06.02 — Downloaded model files MUST be written to an isolated…

**Requirement:** Downloaded model files MUST be written to an isolated temporary location, size-limited during transfer, verified before activation, and atomically moved into the immutable content-addressed store only after complete validation.

#### MOD-06.03 — Archive extraction MUST reject path traversal, absolute paths…

**Requirement:** Archive extraction MUST reject path traversal, absolute paths, duplicate/conflicting paths, symlink escape, excessive file count, excessive expansion, and special device files.

#### MOD-06.04 — Update trust MUST define trusted roots, key rotation…

**Requirement:** Update trust MUST define trusted roots, key rotation, expiration, rollback/freeze/mix-and-match defenses, metadata freshness, and recovery when signing keys are suspected compromised; use TUF or an equivalent reviewed update framework for remote catalogs.

#### MOD-06.05 — Failed network, signature, digest, license…

**Requirement:** Failed network, signature, digest, license, compatibility, disk-write, or activation checks MUST preserve the last known-good model and leave a diagnosable failure record.

#### MOD-06.06 — Local/offline installation MUST have an import path that verifies…

**Requirement:** Local/offline installation MUST have an import path that verifies the same identity, integrity, license, and compatibility data as remote installation.

#### MOD-06.07 — Model deletion MUST distinguish user-owned, shared, active…

**Requirement:** Model deletion MUST distinguish user-owned, shared, active, cached, and system-provided assets; active references MUST be released safely before bytes are removed.

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

#### SEC-04.01 — Validate type, size, structure, dimensions, duration, encoding, path

The project MUST validate type, size, structure, dimensions, duration, encoding, path, and resource cost before parsing or inference. The project MUST also apply independent limits at network, parser, queue, and model boundaries.

#### SEC-04.02 — Protect against path traversal, symlink escape, archive bombs, decompression

The project MUST protect against path traversal, symlink escape, archive bombs, decompression bombs, parser crashes, SSRF, command injection, and unsafe deserialization.

#### SEC-04.03 — Use allowlisted sources for remote fetches

The project MUST use allowlisted sources for remote fetches. The project MUST also restrict schemes, redirects, resolved addresses, ports, response sizes, and timeouts; block loopback/private/link-local destinations unless specifically required.

#### SEC-04.04 — Run model/file parsing with least privilege and bounded memory/CPU/time

The project MUST run model/file parsing with least privilege and bounded memory/CPU/time. The project MUST NOT execute model-provided code or custom operators without an explicit security review and isolation design.

#### SEC-04.05 — Use safe output encoding and content security policy

The project MUST use safe output encoding and content security policy for web views. The project MUST also treat model outputs as untrusted when rendered or used to construct downstream operations.

#### SEC-04.06 — Apply bounded concurrency, request size, queue depth, and timeouts

The project MUST apply bounded concurrency, request size, queue depth, and timeouts to prevent denial of service.

## 5. Prohibited conditions

- Do not activate an unverified artifact or expose a partial download as ready.
- Do not accept arbitrary local paths or file URLs from a remote client.
- Do not follow a model name or link outside the configured cache root.
- Do not leave a failed download in the available set.
- Do not delete unmanaged files during cache cleanup.

## 6. Procedure

- 1. Start a download from a prepared test source and poll status and event streams.
- 2. Attempt traversal names, a file:// source, and a destination symlink that escapes the cache.
- 3. Serve a deliberately corrupt artifact and observe verification and activation behavior.
- 4. Delete a managed model and compare cache contents before and after.
- 5. Inspect state transitions and terminal reasons for each case.
- 6. Record source fixtures, commands, and observed filesystem changes.

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

- Task state transcripts and event streams for a successful and failed download.
- Rejection responses for unsafe names, schemes, and paths.
- Digest verification output and the post-failure availability listing.
- Before-and-after cache inventories for deletion.
- Evidence that no file was created outside the cache root.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- Fuzz logs, the malicious corpus, and zero-finding reports.
- Digest and signature verification records tied to the activated bytes.
- Crash-consistency evidence showing no partial asset becomes available.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- No other check is recorded for this requirement.

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-005](../../../torviello-enforcer/requirements/items/ENG-005.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [model-acquisition.feature](../features/model-acquisition.feature) |
| Rule controls | MOD-02, MOD-06, SEC-06, SEC-04 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
