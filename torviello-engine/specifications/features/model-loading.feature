@ENG-006 @MOD-05 @RP-014 @HPA-4 @AC-ENG-12
Feature: Load, isolate, and unload models
  Model loading is a bounded lifecycle. Concurrent requests share one load,
  in-flight inference is never invalidated by eviction, and paths are confined.

  Background:
    Given a verified model asset inside the configured model root

  Scenario: Load reaches a ready state
    Given the model is not loaded
    When a client requests a load
    Then the model transitions through loading to ready
    And subsequent inference reports the same model ID and backend

  Scenario: Concurrent loads are coalesced
    Given two clients request the same model load at the same time
    When both requests complete
    Then one load operation is performed
    And both responses report the same ready state

  Scenario: Unload refuses to strand in-flight work
    Given a long inference request is active on the model
    When a client requests unload
    Then unload is deferred until the request completes or is cancelled
    And the model is not freed while referenced

  Scenario: Model capacity is enforced or explicitly unlimited
    Given performance.max_loaded_models is configured
    When a new load would exceed the limit
    Then the engine applies the documented eviction or rejection policy
    And the response identifies the limit and affected model

  Scenario: Registration paths cannot escape the model root
    Given a registration request names a path outside the configured model root
    When the registry validates the path
    Then the response is 400 with error code "model.path_outside_root"
    And no file is read or registered

  Scenario: Unknown model execution is rejected before dispatch
    Given no model is loaded with ID "missing-model"
    When a client submits an inference request for it
    Then the response is 404 with error code "model.not_found"
    And no backend execution is attempted
