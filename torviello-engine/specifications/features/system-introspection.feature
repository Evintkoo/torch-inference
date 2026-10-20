@ENG-019 @OBS-02 @PERF-01 @HPA-4 @AC-ENG-25
Feature: Inspect runtime, hardware, and performance
  Operators can see the effective runtime and measured behavior without
  exposing secrets or paying unbounded introspection cost.

  Background:
    Given a running engine with metrics enabled

  Scenario: System information describes hardware and runtime
    Given an operator requests system information
    When the response is produced
    Then it reports OS, architecture, CPU count, memory, runtime version, and uptime
    And GPU devices are listed only when a provider is usable

  Scenario: Effective configuration is redacted
    Given the configuration contains authentication and storage credentials
    When the operator requests effective configuration
    Then credentials are redacted
    And non-secret values match the running configuration

  Scenario: GPU statistics are truthful
    Given no accelerator is available
    When GPU statistics are requested
    Then the response reports an empty device list with a reason
    And it does not fabricate utilization or memory values

  Scenario: Performance metrics report percentiles
    Given completed requests with recorded latencies
    When performance is requested
    Then the response reports throughput and latency percentiles over the documented window
    And the window boundaries are stated

  Scenario: Profiling is bounded and explicit
    Given an operator requests a profile for one inference
    When profiling completes
    Then the response reports stage timings for that request
    And profiling does not remain enabled for unrelated traffic

  Scenario: Repeated introspection is cached or bounded
    Given many concurrent system information requests
    When the responses are produced
    Then hardware sampling is coalesced within the documented TTL
    And request latency is not dominated by repeated probes

  Scenario: Unsupported introspection request is rejected
    Given an operator requests an unknown introspection section
    When the request is validated
    Then the response is 400 with a stable code naming the section
    And no hardware probe or profile is started
