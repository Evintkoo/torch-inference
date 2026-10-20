@ENG-002 @OPS-01 @ARC-04 @HPA-4 @AC-ENG-08
Feature: Start, become ready, and stop the engine in bounded stages
  Startup is ordered and observable. Readiness reflects the ability to serve
  the configured workload, and shutdown drains work without corrupting state.

  Background:
    Given a valid engine configuration and a prepared model directory

  Scenario: Validation precedes listener binding
    Given the configuration is valid
    When the engine starts
    Then it validates configuration and required paths before binding the socket
    And it reports the bound address only after the listener is active

  Scenario: Readiness follows engine initialization
    Given the engine has bound its listener but has not initialized required models
    When a readiness probe runs
    Then readiness reports "not_ready" with the pending stage
    And the liveness probe still reports "alive"

  Scenario: Ready engine serves requests
    Given all required models are initialized
    When the readiness probe runs
    Then readiness reports "ready"
    And the response names the engine version and selected backend

  Scenario: A failed optional model does not crash the process
    Given one optional model fails to initialize
    When the engine finishes startup
    Then the process remains alive and readiness reflects degraded capability
    And the failure is reported with the model ID and a stable error code

  Scenario: Graceful shutdown drains in-flight work
    Given a long-running inference request is active
    When the engine receives a termination signal
    Then it stops accepting new connections
    And it completes or cancels the request within the shutdown deadline
    And it exits with a recorded status

  Scenario: Shutdown deadline is enforced
    Given a request ignores cancellation past the shutdown deadline
    When the engine receives a termination signal
    Then the process exits within the configured grace window
    And the forced termination is recorded as an operational event
