# AC-ENG-30 — Preserve local offline operation and optional service boundaries

**Check ID:** AC-ENG-30  
**Requirement:** ENG-024  
**Type:** Automated  
**Source:** [acceptance-criteria.md](../acceptance-criteria.md)  
**Status:** Specified; no implementation or evaluation evidence is recorded in this repository.

### SMART specification

- **Specific:** Local inference works offline with prepared assets, acquisition is explicit, optional services are isolated, and outbound endpoints are documented and disabled by default. AC-ENG-30 verifies ENG-024 and fails when the threshold below is not met.
- **Measurable:** 100% of local capability matrix passes with egress blocked; zero external connections, DNS lookups, telemetry, account checks, or hidden downloads; 100% endpoint inventory mapped to configuration gates; local readiness unchanged during upstream failure.
- **Achievable:** Automated evidence from the shipping artifact on the declared CI matrix (Ubuntu 24.04 and macOS 15, Rust stable, Python 3.15, Node 22), with the stated fuzzing budget where applicable; test doubles, debug-only paths, and documentation do not count.
- **Relevant:** ENG-024; mapped HPA-4 controls and §4 failure criteria; failure blocks release acceptance.
- **Time-bound:** Review by 2027-01-31 (window 2026-10-20 to 2027-01-31); evidence is valid only for the current revision and must be re-measured on every §7 trigger.

## 1. Requirement

### ENG-024 — Preserve local offline operation and optional service boundaries

**Priority:** MUST  
**Requirement document:** [ENG-024](../../../torviello-enforcer/requirements/items/ENG-024.md)

The core engine MUST start and serve supported local inference with no account, control plane, or outbound network once required assets exist; optional upstream services MUST be explicit, disabled by default, and isolated so their failure cannot degrade local inference.

**Acceptance summary:** With assets present and egress blocked, local inference endpoints serve successfully.

## 2. Observable check

Local inference works offline with prepared assets, acquisition is explicit, optional services are isolated, and outbound endpoints are documented and disabled by default.

The check is satisfied only when the result is produced by the shipping engine and is reproducible from the recorded procedure. A debug-only path, a unit-test double, a documentation statement, or a passing build does not satisfy it. The check must include the relevant negative or boundary case named by the requirement, not only the success path.

## 3. Feature scenarios

Feature: `local-offline-and-boundaries.feature`

#### Core engine starts and serves offline

```gherkin
Scenario: Core engine starts and serves offline
    Given all required model assets are present
    When the engine starts with outbound network disabled
    Then local inference endpoints serve requests
    And no account or control-plane call is attempted
```

#### Missing assets produce actionable local guidance

```gherkin
Scenario: Missing assets produce actionable local guidance
    Given a required asset is absent and downloads are disabled
    When a client requests that capability
    Then the response explains the missing asset and local placement path
    And it does not attempt a hidden download
```

#### Optional assistant service is disabled by default

```gherkin
Scenario: Optional assistant service is disabled by default
    Given no LLM upstream is configured
    When the engine starts
    Then assistant routes report "not_configured"
    And core inference capabilities remain available
```

#### Optional service failure does not degrade local inference

```gherkin
Scenario: Optional service failure does not degrade local inference
    Given the configured upstream is unreachable
    When local classification and TTS run
    Then both succeed
    And the upstream failure is reported only for assistant routes
```

#### No hosted dependency in the inference path

```gherkin
Scenario: No hosted dependency in the inference path
    Given network egress is blocked at the host firewall
    When a valid local inference request runs
    Then it completes within its deadline
    And the trace shows no external network call
```

#### Local data does not leave the host

```gherkin
Scenario: Local data does not leave the host
    Given telemetry is disabled
    When inference completes
    Then inputs and outputs remain on the host
    And no analytics endpoint is contacted
```

## 4. Rule obligations

| Control | Title | Rule document |
|---|---|---|
| ARC-02 | Optional capabilities and build profiles | [02-optional-capabilities-and-build-profiles.md](../../../torviello-enforcer/architecture/rules/02-optional-capabilities-and-build-profiles.md) |
| SEC-08 | Network boundaries and transport security | [08-network-boundaries-and-transport-security.md](../../../torviello-enforcer/security/rules/08-network-boundaries-and-transport-security.md) |
| OPS-03 | Installation, service managers, and deployment profiles | [03-installation-service-managers-and-deployment-profiles.md](../../../torviello-enforcer/operations/rules/03-installation-service-managers-and-deployment-profiles.md) |

#### ARC-02.01 — Make hardware backends and large optional runtimes selectable capabilities

The project MUST make hardware backends and large optional runtimes selectable capabilities. Disabled capabilities MUST NOT pull their runtime dependencies into a minimal profile.

#### ARC-02.02 — Use additive Cargo features named after user-visible capabilities

The project MUST use additive Cargo features named after user-visible capabilities and document their dependency effects. It MUST NOT use features that silently change unrelated behavior.

#### ARC-02.03 — Publish build profiles for minimal CPU, supported CPU features

The project MUST publish build profiles for minimal CPU, supported CPU features, and each supported accelerator family. The matrix states exact OS, architecture, runtime, driver, and toolchain requirements.

#### ARC-02.04 — Each adapter MUST implement the same model lifecycle contract

Each adapter MUST implement the same model lifecycle contract: capability discovery, load, readiness, inference, cancellation, shutdown, and typed failure

#### ARC-02.05 — Record architecture decisions for module boundaries, backend interfaces, serialization

The project MUST record architecture decisions for module boundaries, backend interfaces, serialization, persistence, or compatibility, including alternatives and migration cost.

#### SEC-08.01 — Every listener MUST declare intended interface, audience…

**Requirement:** Every listener MUST declare intended interface, audience, authentication policy, TLS termination point, proxy trust, allowed origins, and firewall assumptions for each deployment profile.

#### SEC-08.02 — Loopback-only local mode MUST bind to loopback and MUST…

**Requirement:** Loopback-only local mode MUST bind to loopback and MUST reject or clearly warn when configuration exposes it to a non-loopback interface without an explicit network-exposure policy.

#### SEC-08.03 — Production network traffic carrying credentials, user data…

**Requirement:** Production network traffic carrying credentials, user data, model metadata with access impact, or administrative changes MUST use authenticated TLS with validated peer identity and supported protocol/cipher policy.

#### SEC-08.04 — Proxy-derived identity and forwarding headers MUST be trusted only…

**Requirement:** Proxy-derived identity and forwarding headers MUST be trusted only from configured proxy hops. The service MUST ignore spoofed forwarded headers from direct clients.

#### SEC-08.05 — CORS MUST use explicit origins, methods, headers…

**Requirement:** CORS MUST use explicit origins, methods, headers, and credential policy. Wildcard origins MUST NOT be combined with credentials; browser security headers and cache policy MUST match the UI/API threat model.

#### SEC-08.06 — Outbound connections MUST use destination allowlists where feasible…

**Requirement:** Outbound connections MUST use destination allowlists where feasible, validate DNS results and redirects, block prohibited address ranges, and revalidate after redirect or DNS change to resist SSRF and rebinding.

#### SEC-08.07 — DNS, proxy, TLS, certificate-expiry…

**Requirement:** DNS, proxy, TLS, certificate-expiry, and upstream timeout failures MUST be observable and fail safely without falling back to plaintext or an untrusted endpoint.

#### OPS-03.01 — Every supported deployment profile MUST state target OS/architecture…

**Requirement:** Every supported deployment profile MUST state target OS/architecture, prerequisites, filesystem paths, service identity, required ports, data directories, model storage, configuration source, and network dependencies.

#### OPS-03.02 — Install and upgrade procedures MUST be repeatable from…

**Requirement:** Install and upgrade procedures MUST be repeatable from a clean machine and MUST distinguish administrator actions from service-user actions. The service MUST run with least privilege and writable paths limited to documented state/cache locations.

#### OPS-03.03 — Service definitions MUST set restart policy, startup ordering…

**Requirement:** Service definitions MUST set restart policy, startup ordering, graceful stop timeout, environment/config source, resource limits, and log routing appropriate to the target service manager.

#### OPS-03.04 — Container images MUST pin base image identity, use…

**Requirement:** Container images MUST pin base image identity, use non-root execution where feasible, include only runtime artifacts, define health checks, and avoid embedding secrets or mutable model downloads in image layers.

#### OPS-03.05 — Network listeners MUST bind to the intended interface by…

**Requirement:** Network listeners MUST bind to the intended interface by default. Remote exposure MUST require an explicit deployment choice and documented authentication, TLS termination, firewall, and proxy trust policy.

#### OPS-03.06 — First startup MUST distinguish missing prerequisites from corrupt state…

**Requirement:** First startup MUST distinguish missing prerequisites from corrupt state and transient dependency failures; automated restart MUST use backoff and MUST not create a restart loop that hides permanent configuration errors.

#### OPS-03.07 — Installation MUST preserve user data and configuration on upgrade…

**Requirement:** Installation MUST preserve user data and configuration on upgrade; uninstall MUST explain which state is retained or removed and require explicit confirmation before destructive deletion.

## 5. Prohibited conditions

- Do not require an account, control plane, or network call for local inference.
- Do not perform an unadvertised download from a serving request.
- Do not let an optional upstream gate engine readiness.
- Do not send prompts, audio, images, or results to an external endpoint by default.
- Do not hide an outbound dependency in a helper library.

## 6. Procedure

- 1. Prepare assets, block egress, and run each local capability.
- 2. Remove one asset, disable downloads, and request that capability.
- 3. Run with no assistant upstream configured and with an unreachable one.
- 4. Inspect runtime and network observations for outbound calls.
- 5. Check telemetry defaults and configuration.
- 6. Record hosts, network policy, requests, and observations.

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

- Offline inference success with egress blocked.
- Missing-asset guidance without network activity.
- Unconfigured and failed upstream behavior with local health.
- Outbound destination inventory and telemetry defaults.
- Network trace showing no external call in the local path.

- The command or inspection, revision, environment, and configuration used.
- The observed result for the success case and each applicable negative or boundary case.
- A link from the change or evaluation record to the evidence.
- For an unmet check, an approved exception with owner, rationale, compensating measures, expiry, and remediation plan.

### 9.1 Highest-standard evidence

Under [HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md), this check additionally requires:

- The egress capture and blocked-network results.
- The endpoint inventory mapped to configuration gates.
- The local readiness timeline during upstream failure.

The evidence MUST be reproducible, tied to the source revision and configuration, and retained. A happy-path-only result, a missing fuzz or formal artifact where applicable, an unsigned provenance file, or a threshold below the recorded target fails the check.

## 10. Related checks

- AC-ENG-04 — see [AC-ENG-04](AC-ENG-04.md)

## 11. Traceability

| Type | Reference |
|---|---|
| Requirement | [ENG-024](../../../torviello-enforcer/requirements/items/ENG-024.md) |
| Specification | [acceptance-criteria.md](../acceptance-criteria.md) |
| Feature | [local-offline-and-boundaries.feature](../features/local-offline-and-boundaries.feature) |
| Rule controls | ARC-02, SEC-08, OPS-03 |
| Unit | torviello-engine |

## 12. Change control

Update this check in the same change as its requirement, rule controls, feature scenarios, or acceptance criteria. Do not weaken the observable result, a scenario, a boundary case, or an evidence requirement to make an implementation pass.
