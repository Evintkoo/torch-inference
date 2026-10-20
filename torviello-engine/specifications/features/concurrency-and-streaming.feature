@ENG-022 @ARC-04 @PERF-02 @HPA-4 @AC-ENG-28
Feature: Keep the reactor responsive under concurrent work
  Blocking inference runs off the request loop, streams respect backpressure,
  and shutdown releases workers and sessions deterministically.

  Background:
    Given a multi-core host and a configured worker pool

  Scenario: CPU-bound inference does not stall the reactor
    Given one long CPU-bound inference is running
    When a health request arrives
    Then health responds before the inference completes
    And the inference runs on a blocking-capable worker

  Scenario: Worker pool bounds concurrency
    Given every worker is busy
    When additional work arrives
    Then the queue follows the documented admission policy
    And no unbounded task backlog is created

  Scenario: Streaming applies backpressure
    Given a slow client consumes a stream
    When the producer outpaces the client
    Then the producer waits on the bounded channel
    And memory does not grow without limit

  Scenario: Client disconnect cancels work
    Given a client disconnects during streaming synthesis
    When the transport notices the close
    Then synthesis for that request stops
    And the concurrency slot is released

  Scenario: Shutdown terminates idle workers
    Given the engine is shutting down
    When workers become idle
    Then they stop within the shutdown deadline
    And shutdown does not wait indefinitely for idle threads

  Scenario: Concurrent sessions remain isolated
    Given two WebSocket sessions run different models
    When both stream simultaneously
    Then each session receives only its own results
    And one session's failure does not close the other
