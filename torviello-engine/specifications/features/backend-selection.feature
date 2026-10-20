@ENG-003 @PERF-04 @RP-012 @HPA-4 @AC-ENG-09
Feature: Select and report an execution backend truthfully
  Backend selection is explicit, observable, and limited to providers the
  running build can actually execute.

  Background:
    Given a build with a declared set of compiled execution providers

  Scenario: Automatic selection prefers an available accelerator
    Given device.device_type is "auto"
    And a supported CUDA device and runtime are available
    When the engine initializes execution
    Then the selected backend is "cuda"
    And the selection reason is recorded

  Scenario: Automatic selection falls back to CPU when no accelerator is usable
    Given device.device_type is "auto"
    And no accelerator runtime is available
    When the engine initializes execution
    Then the selected backend is "cpu"
    And health reports CPU as the active backend without claiming accelerator support

  Scenario: Explicit accelerator request fails when unavailable
    Given device.device_type is "cuda"
    And the running build has no CUDA provider
    When the engine initializes execution
    Then startup fails with error code "backend.unavailable"
    And it does not silently switch to CPU

  Scenario: Capability output excludes compiled but unusable providers
    Given the binary was compiled with an optional provider
    And the provider runtime cannot be loaded on this host
    When capabilities are reported
    Then the provider is marked unavailable with a reason
    And no endpoint reports it as an active backend

  Scenario: Precision flags are reflected in the reported profile
    Given device.use_fp16 is true and the selected backend supports it
    When the engine reports its runtime profile
    Then the profile names the precision and device
    And requests that require unsupported precision are rejected explicitly
