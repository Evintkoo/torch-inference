@PA-002 @RP-001 @RP-002 @RP-014 @ED-011 @HPA-4 @AC-ENG-06
Feature: Load TOML configuration and expose engine capabilities
  The engine reads a TOML configuration, validates it before serving, and
  reports the configured models and backends without requiring an account,
  control plane, or outbound network.

  Background:
    Given a local TOML configuration for profile "local"

  Scenario: Report configured capabilities
    Given the configuration declares model "tiny" with backend "cpu"
    When the engine starts successfully
    Then health reports status "ok" and the engine version
    And the model catalog lists model "tiny" with backend "cpu"

  Scenario: Reject unknown configuration keys
    Given the configuration contains an unknown key "accelerator"
    When the engine starts
    Then startup fails with error code "config.unknown_key"
    And no server accepts requests

  Scenario: Empty model catalog is valid
    Given the configuration declares no models
    When the engine starts successfully
    Then health reports status "ok"
    And the model catalog is empty

  Scenario: Local mode requires no network
    Given all required model assets are present
    When the engine starts with outbound network access disabled
    Then health reports status "ok"
    And no account or control-plane call is attempted
