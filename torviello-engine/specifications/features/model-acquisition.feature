@ENG-005 @MOD-02 @MOD-06 @HPA-4 @AC-ENG-11
Feature: Acquire and remove model assets safely
  Model downloads are bounded jobs with observable state, provenance, and
  integrity checks. Local paths and untrusted sources cannot escape policy.

  Background:
    Given a writable model cache directory and outbound network access

  Scenario: A download job progresses through observable states
    Given a client requests a model from a declared Hugging Face repository
    When the download starts
    Then the response includes a task ID and status "queued"
    And status transitions through downloading, verifying, and ready

  Scenario: Download progress streams until a terminal state
    Given an active download task
    When a client subscribes to its event stream
    Then each event carries task ID, state, and bytes transferred
    And the stream closes after the terminal state

  Scenario: Unsafe model names are rejected
    Given a request uses model_name "../escape"
    When the download request is validated
    Then the response is 400 with error code "model.invalid_name"
    And no file is written outside the cache directory

  Scenario: Non-HTTP sources are rejected
    Given a URL source uses the "file://" scheme
    When the download request is validated
    Then the response is 400 with error code "model.invalid_source"
    And no local file is read

  Scenario: Integrity failure quarantines the artifact
    Given a downloaded artifact does not match its declared digest
    When verification runs
    Then the task ends in "failed" with error code "model.digest_mismatch"
    And the artifact is not activated or listed as available

  Scenario: Deletion removes only managed assets
    Given a managed model exists in the cache
    When a client deletes it
    Then the task moves to deleted and the cache size decreases
    And an unrelated model's files remain unchanged
