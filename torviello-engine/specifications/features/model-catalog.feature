@ENG-004 @MOD-01 @API-01 @HPA-4 @AC-ENG-10
Feature: Present a truthful model catalog
  Every model has a stable identity and its availability, load state, and
  capabilities are reported without conflating catalog, cache, and runtime.

  Background:
    Given a model registry with at least one entry and an empty model cache

  Scenario: Catalog entries expose stable identity
    Given a registry entry with ID "kokoro-82m"
    When a client lists the catalog
    Then the entry reports ID "kokoro-82m", task, format, and declared backend
    And repeated requests return the same ID

  Scenario: Availability reflects the filesystem
    Given "kokoro-82m" is listed in the registry but no asset exists locally
    When a client lists the catalog
    Then the entry reports availability "not_downloaded"
    And it is not reported as loaded

  Scenario: Loaded state reflects the runtime
    Given the "kokoro-82m" assets exist and the model is initialized
    When a client lists the catalog
    Then the entry reports availability "available" and loaded true
    And the response names the selected backend

  Scenario: Duplicate model IDs are rejected
    Given two descriptors declare the same model ID
    When the catalog is validated
    Then validation fails with error code "model.duplicate_id"
    And neither descriptor is silently preferred

  Scenario: Unknown model lookup returns a stable error
    Given no model has ID "missing-model"
    When a client requests metadata for "missing-model"
    Then the response is 404 with error code "model.not_found"
    And the error envelope includes the request identifier
