# security domain

**Development stage:** EDD

This directory contains 13 normative control document(s) and the generated enforcement tests for the **security** domain (Application and product security). The rule documents are normative; the tests enforce them against the repository's product source.

## Layout

- [`trails/00-references-trails.md`](trails/00-references-trails.md) — authoritative sources, requirement mapping, lifecycle coverage.
- [`rules/`](rules/) — numbered, self-contained control documents.
- [`tests/`](tests/) — generated conformance tests, one per control plus a trail-integrity test. Do not hand-edit.

## Control catalog

| Control | Rule document | Requirement trace | Enforcement test | Control |
|---|---|---|---|---|
| SEC-01 | [01-threat-model-and-security-requirements.md](rules/01-threat-model-and-security-requirements.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | [tests/test_01_threat_model_and_security_requirements.py](tests/test_01_threat_model_and_security_requirements.py) | Threat model and security requirements |
| SEC-02 | [02-identity-authentication-and-account-lifecycle.md](rules/02-identity-authentication-and-account-lifecycle.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | [tests/test_02_identity_authentication_and_account_lifecycle.py](tests/test_02_identity_authentication_and_account_lifecycle.py) | Identity, authentication, and account lifecycle |
| SEC-03 | [03-authorization-and-administrative-access.md](rules/03-authorization-and-administrative-access.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | [tests/test_03_authorization_and_administrative_access.py](tests/test_03_authorization_and_administrative_access.py) | Authorization and administrative access |
| SEC-04 | [04-input-file-and-resource-security.md](rules/04-input-file-and-resource-security.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | [tests/test_04_input_file_and_resource_security.py](tests/test_04_input_file_and_resource_security.py) | Input, file, and resource security |
| SEC-05 | [05-secrets-cryptography-and-sensitive-data.md](rules/05-secrets-cryptography-and-sensitive-data.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | [tests/test_05_secrets_cryptography_and_sensitive_data.py](tests/test_05_secrets_cryptography_and_sensitive_data.py) | Secrets, cryptography, and sensitive data |
| SEC-06 | [06-software-and-model-supply-chain.md](rules/06-software-and-model-supply-chain.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | [tests/test_06_software_and_model_supply_chain.py](tests/test_06_software_and_model_supply_chain.py) | Software and model supply chain |
| SEC-07 | [07-vulnerability-response-and-assurance.md](rules/07-vulnerability-response-and-assurance.md) | SO-001–SO-005, SO-010–SO-014, SO-031, RP-031 | [tests/test_07_vulnerability_response_and_assurance.py](tests/test_07_vulnerability_response_and_assurance.py) | Vulnerability response and assurance |
| SEC-08 | [08-network-boundaries-and-transport-security.md](rules/08-network-boundaries-and-transport-security.md) | SO-002–SO-004, SO-010–SO-012 | [tests/test_08_network_boundaries_and_transport_security.py](tests/test_08_network_boundaries_and_transport_security.py) | Network boundaries and transport security |
| SEC-09 | [09-privacy-data-minimization-and-inference-boundaries.md](rules/09-privacy-data-minimization-and-inference-boundaries.md) | SO-004, SO-010–SO-014, SO-020–SO-024, RP-032–RP-034 | [tests/test_09_privacy_data_minimization_and_inference_boundaries.py](tests/test_09_privacy_data_minimization_and_inference_boundaries.py) | Privacy, data minimization, and inference boundaries |
| SEC-10 | [10-secure-defaults-and-abuse-resilience.md](rules/10-secure-defaults-and-abuse-resilience.md) | SO-002–SO-005, SO-010–SO-014, SO-030–SO-032 | [tests/test_10_secure_defaults_and_abuse_resilience.py](tests/test_10_secure_defaults_and_abuse_resilience.py) | Secure defaults and abuse resilience |
| SEC-11 | [11-application-security-testing-and-control-coverage.md](rules/11-application-security-testing-and-control-coverage.md) | SO-010–SO-014, ED-011, ED-014 | [tests/test_11_application_security_testing_and_control_coverage.py](tests/test_11_application_security_testing_and_control_coverage.py) | Application security testing and control coverage |
| SEC-12 | [12-personnel-security-and-human-access-lifecycle.md](rules/12-personnel-security-and-human-access-lifecycle.md) | ORG-001, ORG-010–ORG-012, SO-001–SO-005, SO-010–SO-014 | [tests/test_12_personnel_security_and_human_access_lifecycle.py](tests/test_12_personnel_security_and_human_access_lifecycle.py) | Personnel Security and Human Access Lifecycle |
| SEC-13 | [13-physical-workspace-remote-work-and-asset-protection.md](rules/13-physical-workspace-remote-work-and-asset-protection.md) | ORG-010–ORG-013, ORG-023, SO-001–SO-005, SO-010–SO-014, RP-020–RP-024 | [tests/test_13_physical_workspace_remote_work_and_asset_protection.py](tests/test_13_physical_workspace_remote_work_and_asset_protection.py) | Physical Workspace Remote Work and Asset Protection |

## Detailed controls

### SEC-01 — Threat model and security requirements

**Objective.** These controls govern **threat model and security requirements**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** SO-001–SO-005, SO-010–SO-014, SO-031, RP-031

**Normative requirements:**

- **SEC-01.01 — Before implementing or materially changing a security-sensitive capability.** Before implementing or materially changing a security-sensitive capability, the project MUST document assets, actors, trust boundaries, entry points, abuse cases, mitigations, and residual risk.
- **SEC-01.02 — Threat models MUST cover public APIs, local control surfaces.** Threat models MUST cover public APIs, local control surfaces, authentication, authorization, uploads, model files, registry changes, dependency/build inputs, updates, persistence, and hosted-service links.
- **SEC-01.03 — Map production web/API controls to applicable OWASP ASVS 5.** The project MUST map production web/API controls to applicable OWASP ASVS 5.0.0 Level 2 requirements. Map production AI/model lifecycle controls to applicable OWASP AISVS 1.01 Level 2 requirements. The project MUST also record each versioned control ID and justified exclusion.
- **SEC-01.04 — Use NIST SSDF practices throughout design, development, review, release.** The project MUST maintain a versioned implementation mapping for NIST SSDF Version 1.1 (SP 800-218) across design, development, review, release, vulnerability response, and remediation. The mapping MUST identify each selected practice and the project control/evidence that implements it; list non-selected practices with scope and rationale; and be reviewed before release and when a supported development profile changes. Citing SSDF MUST NOT be represented as certification or full conformance.
- **SEC-01.05 — Review threat assumptions at release and whenever data flows.** The project MUST review threat assumptions at release and whenever data flows, privileges, network exposure, model loading, storage, or update paths change.

**Rule document:** [rules/01-threat-model-and-security-requirements.md](rules/01-threat-model-and-security-requirements.md)

**Enforcement:** [tests/test_01_threat_model_and_security_requirements.py](tests/test_01_threat_model_and_security_requirements.py)

**Prohibited conditions:**

- The project MUST NOT treat a vulnerability scan as a threat model or as evidence that all controls work
- The project MUST NOT say “OWASP compliant” or “certified” without a formal scope, assessment, and evidence
- The project MUST NOT defer high-impact risks without a named owner, mitigation, and expiry/review date
### SEC-02 — Identity, authentication, and account lifecycle

**Objective.** These controls govern **identity, authentication, and account lifecycle**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** SO-001–SO-005, SO-010–SO-014, SO-031, RP-031

**Normative requirements:**

- **SEC-02.01 — Define identity requirements before expanding authentication code.** The project MUST define identity requirements before expanding authentication code. The project MUST also specify local users, hosted accounts, device enrollment, service identities, engine-to-platform authentication, unauthenticated local mode, and offline behavior.
- **SEC-02.02 — Specify enrollment, login, logout, recovery, session expiry, refresh, revocation.** The project MUST specify enrollment, login, logout, recovery, session expiry, refresh, revocation, account deletion, key rotation, and audit events before implementation.
- **SEC-02.03 — Use established password hashing and cryptographic libraries.** The project MUST use established password hashing and cryptographic libraries. The project MUST also generate credentials with cryptographically secure randomness; use short-lived scoped tokens and rotateable signing keys.
- **SEC-02.04 — Keep local loopback usage account-free where the product profile.** The project MUST keep local loopback usage account-free where the product profile permits it. Network-exposed deployments require an explicit auth policy and safe defaults.
- **SEC-02.05 — Protect credentials in transit with TLS for networked production.** The project MUST protect credentials in transit with TLS for networked production deployments. The project MUST also validate production key material at startup and fail closed when required secrets are missing or weak.

**Rule document:** [rules/02-identity-authentication-and-account-lifecycle.md](rules/02-identity-authentication-and-account-lifecycle.md)

**Enforcement:** [tests/test_02_identity_authentication_and_account_lifecycle.py](tests/test_02_identity_authentication_and_account_lifecycle.py)

**Prohibited conditions:**

- The project MUST NOT ship known/default production secrets or use hard-coded credentials
- The project MUST NOT invent an account model, token lifetime, or recovery flow without an approved specification
- The project MUST NOT log passwords, bearer tokens, API keys, refresh tokens, or signing keys
- The project MUST NOT require hosted authentication for offline local inference unless the user explicitly selects an online entitlement mode
### SEC-03 — Authorization and administrative access

**Objective.** These controls govern **authorization and administrative access**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** SO-001–SO-005, SO-010–SO-014, SO-031, RP-031

**Normative requirements:**

- **SEC-03.01 — Apply deny-by-default authorization to every operation and resource.** The project MUST apply deny-by-default authorization to every operation and resource. The project MUST also define roles/scopes for inference, model administration, registry changes, user management, billing/licensing, and system configuration.
- **SEC-03.02 — Enforce authorization at the service/domain boundary, not only in.** The project MUST enforce authorization at the service/domain boundary, not only in UI controls or route naming. The project MUST also check ownership for object-level access and tenant isolation for hosted deployments.
- **SEC-03.03 — Separate read, create, update, promote, revoke, and delete permissions.** The project MUST separate read, create, update, promote, revoke, and delete permissions where impact differs. The project MUST also require stronger controls for high-impact administration when specified by the threat model.
- **SEC-03.04 — Audit privileged actions with actor, target, time, outcome.** The project MUST audit privileged actions with actor, target, time, outcome, and correlation context. The project MUST also ensure logs cannot be edited through the same ordinary admin permission.
- **SEC-03.05 — Keep health and metrics routes minimally informative and explicitly.** The project MUST keep health and metrics routes minimally informative and explicitly categorized as public, internal, or privileged.

**Rule document:** [rules/03-authorization-and-administrative-access.md](rules/03-authorization-and-administrative-access.md)

**Enforcement:** [tests/test_03_authorization_and_administrative_access.py](tests/test_03_authorization_and_administrative_access.py)

**Prohibited conditions:**

- The project MUST NOT treat authentication as authorization
- The project MUST NOT rely on hidden buttons, unguessable IDs, or client-side checks to protect data
- The project MUST NOT use wildcard CORS or permissive default roles for production exposure
### SEC-04 — Input, file, and resource security

**Objective.** These controls govern **input, file, and resource security**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** SO-001–SO-005, SO-010–SO-014, SO-031, RP-031

**Normative requirements:**

- **SEC-04.01 — Validate type, size, structure, dimensions, duration, encoding, path.** The project MUST validate type, size, structure, dimensions, duration, encoding, path, and resource cost before parsing or inference. The project MUST also apply independent limits at network, parser, queue, and model boundaries.
- **SEC-04.02 — Protect against path traversal, symlink escape, archive bombs, decompression.** The project MUST protect against path traversal, symlink escape, archive bombs, decompression bombs, parser crashes, SSRF, command injection, and unsafe deserialization.
- **SEC-04.03 — Use allowlisted sources for remote fetches.** The project MUST use allowlisted sources for remote fetches. The project MUST also restrict schemes, redirects, resolved addresses, ports, response sizes, and timeouts; block loopback/private/link-local destinations unless specifically required.
- **SEC-04.04 — Run model/file parsing with least privilege and bounded memory/CPU/time.** The project MUST run model/file parsing with least privilege and bounded memory/CPU/time. The project MUST NOT execute model-provided code or custom operators without an explicit security review and isolation design.
- **SEC-04.05 — Use safe output encoding and content security policy.** The project MUST use safe output encoding and content security policy for web views. The project MUST also treat model outputs as untrusted when rendered or used to construct downstream operations.
- **SEC-04.06 — Apply bounded concurrency, request size, queue depth, and timeouts.** The project MUST apply bounded concurrency, request size, queue depth, and timeouts to prevent denial of service.

**Rule document:** [rules/04-input-file-and-resource-security.md](rules/04-input-file-and-resource-security.md)

**Enforcement:** [tests/test_04_input_file_and_resource_security.py](tests/test_04_input_file_and_resource_security.py)

**Prohibited conditions:**

- The project MUST NOT trust MIME types or filenames supplied by clients
- The project MUST NOT follow arbitrary model URLs or redirects to internal network services
- The project MUST NOT deserialize executable or unsafe formats from untrusted sources in the main privileged process
### SEC-05 — Secrets, cryptography, and sensitive data

**Objective.** These controls govern **secrets, cryptography, and sensitive data**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** SO-001–SO-005, SO-010–SO-014, SO-031, RP-031

**Normative requirements:**

- **SEC-05.01 — Use maintained cryptographic libraries and standard algorithms.** The project MUST use maintained cryptographic libraries and standard algorithms. The project MUST NOT implement cryptographic primitives or protocols directly.
- **SEC-05.02 — Store secrets in an appropriate OS/orchestrator secret store.** Each supported deployment profile MUST name an approved secret store and enforce least-privilege read access. Prefer an OS or orchestrator secret manager; when one is unavailable, use a protected file readable only by the owning service identity on encrypted storage. The profile MUST define rotation and revocation steps and MUST fail closed if required secret material cannot be loaded or its access protections cannot be verified.
- **SEC-05.03 — Protect sensitive data in transit and at rest according.** The project MUST protect sensitive data in transit and at rest according to classification and deployment threat model. Minimize retention and define deletion behavior.
- **SEC-05.04 — Keep secrets out of source control, logs, telemetry, crash.** The project MUST keep secrets out of source control, logs, telemetry, crash reports, screenshots, URLs, and support bundles. Redact at system boundaries and test redaction.
- **SEC-05.05 — Use constant-time comparison for secret-derived authenticators where relevant.** Every comparison of a secret-derived authenticator, including a password verifier, MAC, or token, MUST use a constant-time comparison. The project MUST generate secrets with cryptographically secure randomness and MUST fail closed if required entropy or key material is unavailable.

**Rule document:** [rules/05-secrets-cryptography-and-sensitive-data.md](rules/05-secrets-cryptography-and-sensitive-data.md)

**Enforcement:** [tests/test_05_secrets_cryptography_and_sensitive_data.py](tests/test_05_secrets_cryptography_and_sensitive_data.py)

**Prohibited conditions:**

- The project MUST NOT invent custom encryption, password hashing, or token formats
- The project MUST NOT reuse one secret across environments or unrelated systems
- The project MUST NOT persist inference prompts/uploads by default or expose them in diagnostics
### SEC-06 — Software and model supply chain

**Objective.** These controls govern **software and model supply chain**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** SO-001–SO-005, SO-010–SO-014, SO-031, RP-031

**Normative requirements:**

- **SEC-06.01 — Pin and review build dependencies and release inputs.** The project MUST pin and review build dependencies and release inputs. The project MUST also generate an SBOM and preserve provenance for every release.
- **SEC-06.02 — Scan dependencies, source, secrets, containers, and model artifacts.** The project MUST scan dependencies, source, secrets, containers, and model artifacts. Triage findings using exploitability and deployment context; block unsafe releases under the documented severity gate.
- **SEC-06.03 — Download models only from configured trusted sources.** The project MUST download models only from configured trusted sources. The project MUST also verify digest/signature and license/source metadata before installation or activation.
- **SEC-06.04 — Preserve model and software version identity.** The project MUST preserve model and software version identity. Updates are atomic and have a rollback path; failed verification never replaces a known-good artifact.
- **SEC-06.05 — Review build workflows and credentials as production security boundaries.** The project MUST review build workflows and credentials as production security boundaries. The project MUST also use least privilege and short-lived credentials for release automation.

**Rule document:** [rules/06-software-and-model-supply-chain.md](rules/06-software-and-model-supply-chain.md)

**Enforcement:** [tests/test_06_software_and_model_supply_chain.py](tests/test_06_software_and_model_supply_chain.py)

**Prohibited conditions:**

- The project MUST NOT assume a public package or model host guarantees artifact integrity or license rights
- The project MUST NOT release unsigned/unverifiable artifacts when the distribution channel supports verification
- The project MUST NOT load partial, corrupt, or unreviewed model artifacts
### SEC-07 — Vulnerability response and assurance

**Objective.** These controls govern **vulnerability response and assurance**. The intended outcome is that every applicable requirement is implemented at the correct system boundary, produces the specified behavior under normal and adverse conditions, and can be verified from current repository or runtime evidence.

**Requirements traced:** SO-001–SO-005, SO-010–SO-014, SO-031, RP-031

**Normative requirements:**

- **SEC-07.01 — Maintain a security policy with a private reporting path.** The project MUST maintain a security policy with a private reporting path, acknowledgement and triage expectations, supported versions, severity model, patch process, and coordinated disclosure approach.
- **SEC-07.02 — Track each vulnerability with affected versions, exposure, severity, exploitability.** The project MUST track each vulnerability with affected versions, exposure, severity, exploitability, owner, remediation target, mitigation, and release status.
- **SEC-07.03 — Prioritize remotely exploitable and privilege-escalation findings.** The project MUST prioritize remotely exploitable and privilege-escalation findings. A release exception requires a named risk owner, impact rationale, compensating controls, and expiry/review date.
- **SEC-07.04 — Perform a security review before production releases and after.** The project MUST perform a security review before production releases and after material changes to identity, API exposure, model loading, update, or persistence boundaries.
- **SEC-07.05 — Use ASVS/AISVS verification as a testable control catalog.** The project MUST use ASVS/AISVS verification as a testable control catalog; maintain versioned evidence and unresolved gaps.

**Rule document:** [rules/07-vulnerability-response-and-assurance.md](rules/07-vulnerability-response-and-assurance.md)

**Enforcement:** [tests/test_07_vulnerability_response_and_assurance.py](tests/test_07_vulnerability_response_and_assurance.py)

**Prohibited conditions:**

- The project MUST NOT close a finding because a scanner stopped reporting it without confirming the underlying risk is addressed
- The project MUST NOT publish exploit details before coordinating with the project owner and affected users
- The project MUST NOT claim production security based only on passing automated scans
### SEC-08 — Network boundaries and transport security

**Objective.** This control defines the intended outcome for **network boundaries and transport security** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** SO-002–SO-004, SO-010–SO-012

**Normative requirements:**

- **SEC-08.01 — Every listener MUST declare intended interface, audience….** **Requirement:** Every listener MUST declare intended interface, audience, authentication policy, TLS termination point, proxy trust, allowed origins, and firewall assumptions for each deployment profile.
- **SEC-08.02 — Loopback-only local mode MUST bind to loopback and MUST….** **Requirement:** Loopback-only local mode MUST bind to loopback and MUST reject or clearly warn when configuration exposes it to a non-loopback interface without an explicit network-exposure policy.
- **SEC-08.03 — Production network traffic carrying credentials, user data….** **Requirement:** Production network traffic carrying credentials, user data, model metadata with access impact, or administrative changes MUST use authenticated TLS with validated peer identity and supported protocol/cipher policy.
- **SEC-08.04 — Proxy-derived identity and forwarding headers MUST be trusted only….** **Requirement:** Proxy-derived identity and forwarding headers MUST be trusted only from configured proxy hops. The service MUST ignore spoofed forwarded headers from direct clients.
- **SEC-08.05 — CORS MUST use explicit origins, methods, headers….** **Requirement:** CORS MUST use explicit origins, methods, headers, and credential policy. Wildcard origins MUST NOT be combined with credentials; browser security headers and cache policy MUST match the UI/API threat model.
- **SEC-08.06 — Outbound connections MUST use destination allowlists where feasible….** **Requirement:** Outbound connections MUST use destination allowlists where feasible, validate DNS results and redirects, block prohibited address ranges, and revalidate after redirect or DNS change to resist SSRF and rebinding.
- **SEC-08.07 — DNS, proxy, TLS, certificate-expiry….** **Requirement:** DNS, proxy, TLS, certificate-expiry, and upstream timeout failures MUST be observable and fail safely without falling back to plaintext or an untrusted endpoint.

**Rule document:** [rules/08-network-boundaries-and-transport-security.md](rules/08-network-boundaries-and-transport-security.md)

**Enforcement:** [tests/test_08_network_boundaries_and_transport_security.py](tests/test_08_network_boundaries_and_transport_security.py)

**Prohibited conditions:**

- Do not treat network location or private IP range as proof of caller identity.
- Do not expose metrics, debug, profiling, or admin routes publicly by default.
### SEC-09 — Privacy, data minimization, and inference boundaries

**Objective.** This control defines the intended outcome for **privacy, data minimization, and inference boundaries** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** SO-004, SO-010–SO-014, SO-020–SO-024, RP-032–RP-034

**Normative requirements:**

- **SEC-09.01 — Each product profile MUST identify personal, sensitive….** **Requirement:** Each product profile MUST identify personal, sensitive, confidential, and security-relevant data processed at collection, inference, persistence, telemetry, support, and deletion boundaries.
- **SEC-09.02 — Inference inputs and outputs MUST be processed in memory….** **Requirement:** Inference inputs and outputs MUST be processed in memory only by default. Persistence, remote export, training reuse, analytics, or support access MUST require explicit product behavior, disclosure, and retention controls.
- **SEC-09.03 — Data collection MUST be limited to fields necessary….** **Requirement:** Data collection MUST be limited to fields necessary for a stated feature or operational purpose. Optional telemetry MUST be opt-in for local/offline profiles and MUST expose a clear disable path.
- **SEC-09.04 — Access to stored prompts, outputs, credentials….** **Requirement:** Access to stored prompts, outputs, credentials, identity records, and audit data MUST be separated by role and purpose; support access MUST be time-bounded, approved, and audited.
- **SEC-09.05 — Privacy-sensitive operations MUST define deletion scope, backup expiry….** **Requirement:** Privacy-sensitive operations MUST define deletion scope, backup expiry, export, retention exceptions, and legal hold behavior before implementation.
- **SEC-09.06 — Privacy risk review MUST consider inference re-identification, model….** **Requirement:** Privacy risk review MUST consider inference re-identification, model memorization claims, prompt injection into logs, third-party provider handling, and accidental output exposure through caches or shared traces.
- **SEC-09.07 — Incident response MUST include a process to determine whether….** **Requirement:** Incident response MUST include a process to determine whether personal or sensitive data was exposed, preserve minimal forensic evidence, contain access, and notify affected parties according to approved legal/product policy.

**Rule document:** [rules/09-privacy-data-minimization-and-inference-boundaries.md](rules/09-privacy-data-minimization-and-inference-boundaries.md)

**Enforcement:** [tests/test_09_privacy_data_minimization_and_inference_boundaries.py](tests/test_09_privacy_data_minimization_and_inference_boundaries.py)

**Prohibited conditions:**

- Do not promise that model outputs are anonymous or private without evaluation and a defined system boundary.
- Do not reuse customer prompts or outputs for model training or product analytics by implication.
### SEC-10 — Secure defaults and abuse resilience

**Objective.** This control defines the intended outcome for **secure defaults and abuse resilience** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** SO-002–SO-005, SO-010–SO-014, SO-030–SO-032

**Normative requirements:**

- **SEC-10.01 — Every security-relevant setting MUST have a safe default….** **Requirement:** Every security-relevant setting MUST have a safe default for its deployment profile and a validation rule preventing known-dangerous combinations.
- **SEC-10.02 — Authentication MUST be required for remote administrative and persistent….** **Requirement:** Authentication MUST be required for remote administrative and persistent user-data operations. Local account-free operation MUST be restricted to a clearly defined local exposure boundary.
- **SEC-10.03 — Authentication and authorization failures MUST not disclose credential validity….** **Requirement:** Authentication and authorization failures MUST not disclose credential validity, protected object existence, tenant membership, or internal policy details beyond what the caller needs to remediate.
- **SEC-10.04 — Expensive operations MUST enforce per-actor and global resource budgets….** **Requirement:** Expensive operations MUST enforce per-actor and global resource budgets, deadline, queue admission, cancellation, and retry ceilings; budgets MUST apply to preprocessing, model download, inference, and response serialization.
- **SEC-10.05 — Resource exhaustion MUST degrade predictably: reject new work….** **Requirement:** Resource exhaustion MUST degrade predictably: reject new work, protect existing work according to policy, preserve essential health/administrative recovery, and avoid process-wide failure from one request.
- **SEC-10.06 — Abuse detection MUST correlate repeated authentication failures, model-download….** **Requirement:** Abuse detection MUST correlate repeated authentication failures, model-download abuse, sensitive business flow automation, and unusual resource consumption with bounded signals and privacy-safe retention.
- **SEC-10.07 — Security controls MUST fail closed when their required key….** **Requirement:** Security controls MUST fail closed when their required key, policy, validator, or authorization dependency is unavailable; availability exceptions require a named decision and a bounded degraded mode.

**Rule document:** [rules/10-secure-defaults-and-abuse-resilience.md](rules/10-secure-defaults-and-abuse-resilience.md)

**Enforcement:** [tests/test_10_secure_defaults_and_abuse_resilience.py](tests/test_10_secure_defaults_and_abuse_resilience.py)

**Prohibited conditions:**

- Do not use permissive defaults for CORS, debug routes, administrative roles, model sources, or remote listeners.
- Do not allow a request to reserve unbounded CPU, memory, disk, accelerator memory, or queue capacity.
### SEC-11 — Application security testing and control coverage

**Objective.** This control defines the intended outcome for **application security testing and control coverage** and the evidence needed to assess it across normal operation, boundary conditions, failures, and change.

**Requirements traced:** SO-010–SO-014, ED-011, ED-014

**Normative requirements:**

- **SEC-11.01 — Every externally reachable or privileged feature MUST have….** **Requirement:** Every externally reachable or privileged feature MUST have a threat-informed security test plan covering actors, assets, entry points, trust boundaries, abuse cases, and expected denial behavior.
- **SEC-11.02 — Production APIs MUST be assessed against applicable OWASP ASVS….** **Requirement:** Production APIs MUST be assessed against applicable OWASP ASVS 5.0.0 requirements, and AI/model lifecycle controls against applicable OWASP AISVS 1.01 requirements; the exact versioned control IDs, exclusions, and evidence MUST be recorded.
- **SEC-11.03 — API risk review MUST account for OWASP API Security….** **Requirement:** API risk review MUST account for OWASP API Security Top 10 risks including object/property/function authorization, authentication, resource consumption, sensitive business flow abuse, SSRF, misconfiguration, inventory, and unsafe upstream API consumption where applicable.
- **SEC-11.04 — Automated tests MUST include static analysis, dependency….** **Requirement:** Automated tests MUST include static analysis, dependency and secret checks, and dynamic or integration tests appropriate to exposed interfaces. Scanner findings MUST be triaged; scanner silence MUST not substitute for design review or targeted tests.
- **SEC-11.05 — Untrusted parsers, archive handling, model formats….** **Requirement:** Untrusted parsers, archive handling, model formats, and protocol boundaries SHOULD receive property-based or fuzz testing with time/memory bounds and retained regression cases for confirmed defects.
- **SEC-11.06 — Security test fixtures MUST be synthetic or approved….** **Requirement:** Security test fixtures MUST be synthetic or approved, isolated from production credentials, and cleaned after use; test artifacts MUST be access-controlled when they contain vulnerability details.
- **SEC-11.07 — Release security review MUST verify unresolved findings, exceptions….** **Requirement:** Release security review MUST verify unresolved findings, exceptions, threat-model changes, dependency exposure, model integrity, and patch status for each shipped profile.

**Rule document:** [rules/11-application-security-testing-and-control-coverage.md](rules/11-application-security-testing-and-control-coverage.md)

**Enforcement:** [tests/test_11_application_security_testing_and_control_coverage.py](tests/test_11_application_security_testing_and_control_coverage.py)

**Prohibited conditions:**

- Do not claim “OWASP compliant” because a checklist or scanner passed.
- Do not leave known exploitable findings unowned or without an explicit release decision.
### SEC-12 — Personnel Security and Human Access Lifecycle

**Objective.** Human and agent-operated identities are security principals. Identity proofing, role authorization, training, privileged activity, transfer, emergency access, and separation must follow a traceable lifecycle tied to job function and risk.

**Requirements traced:** ORG-001, ORG-010–ORG-012, SO-001–SO-005, SO-010–SO-014

**Normative requirements:**

- **SEC-12.01 — Every person and human-operated agent identity with access….** **Requirement:** Every person and human-operated agent identity with access to organizational systems MUST use an individually attributable account or a controlled service identity with an accountable human owner. Shared accounts are prohibited except for a documented technical necessity with compensating attribution and rotation.
- **SEC-12.02 — Access MUST be based on a current role/task need….** **Requirement:** Access MUST be based on a current role/task need, approved by the resource owner, scoped to least privilege, and time-bounded where practical. Authentication strength and screening MUST reflect data sensitivity, privilege, exposure, and applicable law.
- **SEC-12.03 — Administrative roles MUST be distinct from everyday accounts where….** **Requirement:** Administrative roles MUST be distinct from everyday accounts where supported, protected by strong authentication, and used only for authorized administrative tasks. High-impact actions MUST be logged and independently approved or reviewed according to risk.
- **SEC-12.04 — Access MUST be reviewed at role change, contract….** **Requirement:** Access MUST be reviewed at role change, contract end, incident, privilege elevation, system ownership change, and periodic intervals based on risk. Remove dormant, excessive, orphaned, and conflicting access; record reviewer, scope, decision, and closure.
- **SEC-12.05 — Break-glass access MUST have an incident or change reference….** **Requirement:** Break-glass access MUST have an incident or change reference, narrow scope, strong authentication, alerting, expiry, and post-use independent review. Temporary grants MUST expire automatically or have an owner and tested revocation deadline.
- **SEC-12.06 — At separation or loss of authorization, disable accounts….** **Requirement:** At separation or loss of authorization, disable accounts, keys, tokens, active sessions, recovery methods, device certificates, signing credentials, and external access within risk-based deadlines. Confirm revocation across federated and supplier systems.
- **SEC-12.07 — Passwords, recovery codes, private keys….** **Requirement:** Passwords, recovery codes, private keys, and tokens MUST use approved secret-management and delivery paths. Never send credentials through ordinary chat/email or retain them in handoff, support, or personnel records.
- **SEC-12.08 — Identity and privileged activity records MUST allow attribution….** **Requirement:** Identity and privileged activity records MUST allow attribution, preserve integrity, alert on high-risk anomalies, and avoid recording authentication secrets. Investigate unexplained access or failed offboarding through the security incident process.

**Rule document:** [rules/12-personnel-security-and-human-access-lifecycle.md](rules/12-personnel-security-and-human-access-lifecycle.md)

**Enforcement:** [tests/test_12_personnel_security_and_human_access_lifecycle.py](tests/test_12_personnel_security_and_human_access_lifecycle.py)
### SEC-13 — Physical Workspace Remote Work and Asset Protection

**Objective.** People must protect devices, conversations, records, and physical access wherever work occurs. Controls must match the sensitivity of information and actual threat, remain usable for the workforce, and respect jurisdictional privacy and workplace rules.

**Requirements traced:** ORG-010–ORG-013, ORG-023, SO-001–SO-005, SO-010–SO-014, RP-020–RP-024

**Normative requirements:**

- **SEC-13.01 — The organization MUST define requirements for office, home….** **Requirement:** The organization MUST define requirements for office, home, travel, coworking, and other work locations based on information sensitivity, device type, local law, and customer/contract conditions. Restrictions or exceptions MUST be stated, approved, and supported with practical alternatives.
- **SEC-13.02 — Work devices MUST use approved authentication, encryption….** **Requirement:** Work devices MUST use approved authentication, encryption, screen lock, supported security updates, endpoint protection where available, and remote lock/wipe capability proportionate to risk. Removable media MUST be restricted, encrypted, inventoried, and sanitized before reuse or disposal.
- **SEC-13.03 — Workers MUST position screens, control printing, secure….** **Requirement:** Workers MUST position screens, control printing, secure paper records, and avoid discussing confidential work where unauthorized people can see or hear it. Use privacy filters, locked storage, secure disposal, or private rooms where sensitivity warrants.
- **SEC-13.04 — Work locations that host sensitive systems, records….** **Requirement:** Work locations that host sensitive systems, records, or equipment MUST identify authorized access, visitor escort/record requirements, key/card custody, alarm response, and lost credential escalation. Do not leave visitors unattended in restricted areas.
- **SEC-13.05 — When working while traveling, protect devices from theft….** **Requirement:** When working while traveling, protect devices from theft, shoulder surfing, tampering, and unattended access; use approved network protections and avoid sensitive work where privacy cannot be assured. Report loss, suspected tampering, border seizure, or exposure promptly.
- **SEC-13.06 — Loss, theft, damage, unexpected access….** **Requirement:** Loss, theft, damage, unexpected access, fire, flood, power failure, or environmental hazard affecting work assets MUST be reported through a defined route. The owner MUST assess credential revocation, data exposure, business continuity, recovery, and notification needs.
- **SEC-13.07 — Before transfer, return, resale, or disposal….** **Requirement:** Before transfer, return, resale, or disposal, remove organizational accounts and securely erase storage under an approved method; recover licenses and accessories; verify disposal for sensitive media; and record custody transfer where required.
- **SEC-13.08 — People MUST receive concise guidance for the locations….** **Requirement:** People MUST receive concise guidance for the locations and devices they use, including reporting lost assets, safe travel, remote meetings, printing, and household/shared-device boundaries. Training MUST NOT rely on surveillance of personal spaces.

**Rule document:** [rules/13-physical-workspace-remote-work-and-asset-protection.md](rules/13-physical-workspace-remote-work-and-asset-protection.md)

**Enforcement:** [tests/test_13_physical_workspace_remote_work_and_asset_protection.py](tests/test_13_physical_workspace_remote_work_and_asset_protection.py)

## Verification

From the repository root:

```sh
uv run --locked pytest torviello-enforcer/security
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Regenerate tests after changing a rule document. A control passes only when every applicable MUST requirement is implemented and supported by current evidence; missing product behavior fails the generated test with an explicit no-evidence message. Record exceptions in [`governance/assurance-register.md`](../governance/assurance-register.md).
