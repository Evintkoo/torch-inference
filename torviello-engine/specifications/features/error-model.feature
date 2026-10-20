@ENG-017 @API-01 @API-03 @HPA-4 @AC-ENG-23
Feature: Map failures to a stable error contract
  Clients can distinguish validation, identity, capacity, dependency, and
  internal failures without parsing prose or seeing internals.

  Background:
    Given the engine is serving the public API

  Scenario: Validation failures return 400
    Given a request contains an invalid parameter
    When validation runs
    Then the response is 400 with a stable error code
    And the message identifies the parameter without exposing internals

  Scenario: Missing resources return 404
    Given a request names an unknown model or route parameter
    When the handler resolves it
    Then the response is 404 with error code "resource.not_found"
    And no asynchronous side effect is started

  Scenario: Payload limits return 413
    Given a body or item exceeds its configured limit
    When the request is read
    Then the response is 413 with the affected limit
    And partial work is discarded

  Scenario: Capacity pressure returns 429 or 503 with retry guidance
    Given the engine is saturated or a circuit is open
    When the request is rejected
    Then the status is 429 or 503 according to the documented mapping
    And Retry-After is present when retry can succeed

  Scenario: Dependency timeout returns 504
    Given an internal or upstream dependency exceeds its deadline
    When the request completes
    Then the response is 504 with error code "dependency.timeout"
    And the request is not reported as a client error

  Scenario: Internal failures never leak implementation detail
    Given an unexpected internal error occurs
    When the error envelope is produced
    Then the body contains code, message, status, and request ID only
    And no stack trace, filesystem path, secret, or dependency host appears

  Scenario: Every error carries the correlation identifier
    Given any failed request
    When the response is inspected
    Then the request ID matches the log record
    And the identifier is safe to display to the caller
