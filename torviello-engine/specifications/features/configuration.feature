@ENG-001 @CFG-01 @CFG-03 @CFG-04 @GOV-07 @HPA-4 @AC-ENG-07
Feature: Resolve configuration before the engine serves traffic
  The engine reads one TOML configuration, applies a documented precedence,
  validates the complete candidate, and never exposes secret values.

  Background:
    Given a clean working directory containing no configuration file

  Scenario: Built-in defaults apply when no file exists
    Given the operator starts the engine without a configuration file
    When startup validation completes
    Then the effective configuration reports every default value and its source as "default"
    And no configuration file is created or rewritten

  Scenario: File values override defaults deterministically
    Given a TOML file sets server.port to 9100 and auth.enabled to false
    When the engine loads the configuration
    Then the effective server.port is 9100 and its source is "file"
    And every unset key retains its documented default

  Scenario: Unknown keys and invalid ranges fail before binding
    Given a TOML file contains an unknown key performance.turbo and server.port 0
    When the engine loads the configuration
    Then startup fails with setting-specific errors for both keys
    And no listener accepts requests

  Scenario: Environment overrides are namespaced and validated
    Given the environment sets TORVIELLO_SERVER__PORT to "not-a-number"
    When the engine loads the configuration
    Then startup fails naming TORVIELLO_SERVER__PORT and the expected type
    And the failure does not echo unrelated environment values

  Scenario: Invalid authentication configuration is rejected
    Given auth.enabled is true and jwt_secret is a checked-in placeholder
    When the engine loads the configuration
    Then startup fails with an actionable secret error
    And the secret value does not appear in the error text or logs

  Scenario: Effective configuration output is redacted
    Given a valid TOML file contains an authentication secret
    When an operator reads the effective configuration endpoint
    Then secret-bearing fields are reported as redacted
    And non-secret values retain their resolved values and sources
