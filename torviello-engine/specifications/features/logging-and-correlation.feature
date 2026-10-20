@ENG-020 @OBS-01 @OBS-03 @SEC-05 @HPA-4 @AC-ENG-26
Feature: Correlate requests through structured logs
  Every request has an identifier, logs are structured, and sensitive payloads
  never reach log sinks or diagnostic bundles.

  Background:
    Given structured logging is enabled at level "info"

  Scenario: Correlation ID is assigned at ingress
    Given a request without a correlation header
    When it enters the server
    Then the server assigns a unique identifier
    And the response and log records carry it

  Scenario: Caller-supplied correlation is validated
    Given a request supplies an oversized or malformed correlation header
    When it enters the server
    Then the value is rejected or replaced safely
    And log injection through that header is impossible

  Scenario: Rejected requests are still logged
    Given auth or rate limiting rejects a request
    When the decision is made
    Then a structured record includes method, path, status, latency, and request ID
    And the record does not include credentials or payload bodies

  Scenario: Prompt, audio, and image content stay out of logs
    Given an inference request contains user text, audio, or image bytes
    When the request is logged
    Then only bounded metadata such as size and content type are recorded
    And raw content is absent

  Scenario: Upstream trace context propagates
    Given tracing is enabled
    When the engine calls an optional upstream
    Then the trace context is propagated in the documented header
    And a rejected upstream does not break local correlation

  Scenario: Diagnostic access is controlled
    Given an operator requests logs
    When the request is authorized
    Then only declared log files inside the log root are readable
    And path traversal outside that root is rejected
