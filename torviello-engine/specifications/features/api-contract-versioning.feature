@ENG-021 @API-01 @API-04 @GOV-08 @HPA-4 @AC-ENG-27
Feature: Publish, version, and evolve the HTTP contract
  The public surface is described by a validated machine-readable contract,
  versioned aliases behave identically, and breaking changes follow deprecation.

  Background:
    Given a built engine artifact

  Scenario: OpenAPI validates and matches the router
    Given the engine publishes its OpenAPI document
    When the document is validated in CI
    Then it is valid OpenAPI 3.1
    And every public route in the router appears in the document

  Scenario: Versioned aliases use the same handler
    Given /classify/batch and /v1/classify/batch are public
    When identical requests are sent to both
    Then both produce the same status and body shape
    And the response identifies the same engine version

  Scenario: Operational endpoints remain unversioned
    Given the documented operations surface
    When an operator calls health, metrics, or system routes
    Then those routes are available only under their documented paths
    And no duplicate versioned operational surface is advertised

  Scenario: Deprecation is announced before removal
    Given a route or field is scheduled for removal
    When a client calls it during the migration window
    Then the response includes a deprecation signal and successor
    And the removal date is recorded in the contract changelog

  Scenario: Additive changes preserve compatibility
    Given a new optional response field is added
    When existing clients parse the response
    Then previously required fields and status codes are unchanged
    And the contract version records the additive change

  Scenario: Unknown routes return the standard envelope
    Given a client calls an undocumented path
    When the router has no match
    Then the response is 404 with the standard error envelope
    And the request ID is returned
