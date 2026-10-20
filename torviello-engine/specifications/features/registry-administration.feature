@ENG-025 @MOD-03 @SEC-03 @HPA-4 @AC-ENG-31
Feature: Administer the model registry safely
  Registry mutations are authorized, validated, auditable, and confined to the
  configured model root.

  Background:
    Given auth is enabled and an operator holds the administrative scope

  Scenario: Register a local model descriptor
    Given a valid descriptor inside the model root
    When the operator registers it
    Then the registry reports the model ID and metadata
    And one audit record captures actor, action, target, and result

  Scenario: Directory scan is bounded
    Given a model root containing many files
    When the operator requests a scan
    Then only supported model files are registered
    And the scan respects file count and depth limits

  Scenario: Metadata export is complete and stable
    Given the registry contains registered models
    When an operator exports it
    Then the export contains every registered model with stable IDs
    And secrets and absolute host paths are absent

  Scenario: Path escape is rejected
    Given a descriptor path resolves outside the model root through symlinks
    When registration validates it
    Then the response is 400 with error code "model.path_outside_root"
    And the target file is not read

  Scenario: Unauthorized mutation is denied and audited
    Given a caller without administrative scope
    When it attempts to register or delete a model
    Then the response is 403
    And an audit record captures the denied action

  Scenario: Audit records are immutable through the API
    Given an audit record exists
    When any client calls the API
    Then no endpoint updates or deletes the record
    And export preserves its original fields
