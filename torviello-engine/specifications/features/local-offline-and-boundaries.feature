@ENG-024 @PA-002 @ARC-02 @SEC-08 @HPA-4 @AC-ENG-30
Feature: Run locally without an account or control plane
  Local inference works offline once assets exist. Optional services are
  explicit, isolated, and never required for the core engine to serve.

  Background:
    Given a prepared local model directory and no outbound network

  Scenario: Core engine starts and serves offline
    Given all required model assets are present
    When the engine starts with outbound network disabled
    Then local inference endpoints serve requests
    And no account or control-plane call is attempted

  Scenario: Missing assets produce actionable local guidance
    Given a required asset is absent and downloads are disabled
    When a client requests that capability
    Then the response explains the missing asset and local placement path
    And it does not attempt a hidden download

  Scenario: Optional assistant service is disabled by default
    Given no LLM upstream is configured
    When the engine starts
    Then assistant routes report "not_configured"
    And core inference capabilities remain available

  Scenario: Optional service failure does not degrade local inference
    Given the configured upstream is unreachable
    When local classification and TTS run
    Then both succeed
    And the upstream failure is reported only for assistant routes

  Scenario: No hosted dependency in the inference path
    Given network egress is blocked at the host firewall
    When a valid local inference request runs
    Then it completes within its deadline
    And the trace shows no external network call

  Scenario: Local data does not leave the host
    Given telemetry is disabled
    When inference completes
    Then inputs and outputs remain on the host
    And no analytics endpoint is contacted
