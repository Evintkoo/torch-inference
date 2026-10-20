@ENG-007 @API-01 @API-03 @HPA-4 @AC-ENG-13
Feature: Return one attributable inference envelope
  Every inference response identifies what ran, where it ran, how long it
  took, and which request produced it.

  Background:
    Given a loaded model and a valid inference request

  Scenario: Successful inference returns result metadata
    Given classification succeeds for one image
    When the client receives the response
    Then the body contains "data" and "meta"
    And meta reports model ID, latency in milliseconds, engine version, and request ID
    And meta reports whether postprocessing ran

  Scenario: Request identifier matches the transport correlation
    Given a client sends correlation ID "req-123"
    When inference succeeds
    Then meta.request_id is "req-123"
    And the same identifier appears in the response header and log record

  Scenario: Postprocessing can be skipped explicitly
    Given a request sets skip_postprocess to true
    When inference succeeds
    Then meta.postprocessing_applied is false
    And meta.postprocess_steps is empty

  Scenario: Postprocessing warnings are preserved
    Given postprocessing clamps an out-of-range probability
    When inference succeeds
    Then the result is returned
    And meta.warnings names the applied correction

  Scenario: Failure does not produce a partial success envelope
    Given the backend fails after dispatch
    When the request completes
    Then the response uses the error envelope and a non-2xx status
    And no "data" field suggests successful inference

  Scenario: Latency is measured around execution
    Given a backend call takes at least 10 milliseconds
    When the response is produced
    Then meta.latency_ms is greater than or equal to the measured backend duration
    And it excludes client transfer time
