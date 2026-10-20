@ENG-026 @PORT-01 @PORT-02 @ARC-02 @HPA-4 @AC-ENG-32
Feature: Build and run declared platform profiles
  Minimal, CPU, and accelerator profiles are explicit; unsupported platforms
  fail at build or startup with a documented reason.

  Background:
    Given a source checkout with pinned dependencies

  Scenario: Minimal profile excludes optional backends
    Given the minimal profile is selected
    When the artifact is built
    Then accelerator and optional service dependencies are absent
    And the engine still serves CPU inference for supported capabilities

  Scenario: Optional backend failure does not break the build
    Given the CPU profile is selected on a host without accelerators
    When the workspace builds and tests run
    Then optional provider code is not required
    And CPU tests pass

  Scenario: Declared target matrix is enforced
    Given a target in the supported matrix
    When CI builds it
    Then the build and smoke test pass or the target is explicitly unsupported
    And the support status is published

  Scenario: Accelerator profile is available only when declared
    Given the accelerator profile is selected
    When the provider runtime is missing at startup
    Then startup fails with "backend.unavailable"
    And a CPU fallback is used only if configuration permits it

  Scenario: Artifact metadata identifies contents
    Given a release artifact
    When an operator inspects its metadata
    Then it names the profile, version, commit, and included backends
    And the same metadata appears in the SBOM

  Scenario: Unsupported platform fails clearly
    Given an unsupported OS and architecture pair
    When installation is attempted
    Then the failure names the unsupported target
    And it does not install a partially functional binary
