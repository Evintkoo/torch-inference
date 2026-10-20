@ENG-014 @PERF-05 @PERF-02 @HPA-4 @AC-ENG-20
Feature: Batch, cache, and coalesce inference work
  Optimizations preserve result identity and ordering while keeping resource
  use bounded and observable.

  Background:
    Given batching and caching are enabled in configuration

  Scenario: Identical requests share a cache entry
    Given a successful inference result is cached
    When an identical request arrives before expiry
    Then the cached result is returned with the original result metadata
    And the cache hit metric increments

  Scenario: Cache keys distinguish model and input
    Given two requests differ only in model ID
    When both execute
    Then they produce separate cache entries
    And no result crosses model boundaries

  Scenario: Concurrent duplicate requests are coalesced
    Given two identical requests arrive while the first is executing
    When the first completes
    Then both callers receive the same result
    And the backend executes once

  Scenario: Batch ordering is preserved
    Given a batch of requests with distinct inputs
    When the batch completes
    Then each caller receives the result for its own input
    And no caller receives another request's output

  Scenario: Batch wait is bounded
    Given the queue has fewer items than the configured minimum
    When the batch timeout expires
    Then the partial batch executes
    And the wait time does not exceed the configured maximum

  Scenario: Cache capacity and expiry are enforced
    Given the cache reaches its configured size
    When a new entry is inserted
    Then eviction follows the documented LRU policy
    And expired entries are never served

  Scenario: Optimization statistics are observable
    Given requests have produced hits, misses, evictions, and batches
    When an operator reads statistics
    Then the counts reconcile with the recorded request history
    And no payload contents appear in the statistics
