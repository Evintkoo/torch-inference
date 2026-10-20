@ENG-015 @PERF-02 @SEC-10 @HPA-4 @AC-ENG-21
Feature: Bound requests and degrade predictably
  Every inbound boundary has a limit, every wait has a deadline, and every
  overload response tells the client whether retrying can help.

  Background:
    Given configured body, item, queue, and timeout limits

  Scenario: Request body limit is enforced before parsing
    Given a JSON body larger than json_body_limit_mb
    When the request arrives
    Then the response is 413 with error code "request.too_large"
    And the body is not fully buffered

  Scenario: Per-item limits are enforced independently
    Given a batch body within the total limit but one item above its item limit
    When the request is validated
    Then the response is 413 naming the item
    And no item is processed

  Scenario: Inference timeout returns gateway timeout
    Given a backend call exceeds the configured inference deadline
    When the request completes
    Then the response is 504 with error code "inference.timeout"
    And the worker slot is released

  Scenario: Repeated backend failure opens the circuit
    Given the backend fails beyond the configured threshold
    When a new request arrives during the open interval
    Then the response is 503 with error code "backend.circuit_open"
    And the backend is not called

  Scenario: Circuit recovery is probed
    Given the circuit open interval has elapsed
    When a probe request succeeds
    Then the circuit closes
    And normal traffic resumes

  Scenario: Concurrency saturation rejects rather than queues unboundedly
    Given every bulkhead permit is in use
    When another request arrives
    Then the response is 429 with error code "engine.busy"
    And the queue depth does not grow without bound

  Scenario: Rate limiting is local and observable
    Given a client exceeds the per-IP request budget
    When the next request arrives
    Then the response is 429 with a Retry-After header
    And health and metrics probes remain exempt
