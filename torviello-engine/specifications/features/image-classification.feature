@ENG-010 @API-02 @API-03 @HPA-4 @AC-ENG-16
Feature: Classify images in batch and progressive modes
  Classification validates the batch, preserves submission order, bounds
  per-image size, and can emit one event per image.

  Background:
    Given a loaded image classification model with ImageNet labels

  Scenario: Batch classification preserves order
    Given three base64 images submitted in order A, B, C
    When the batch completes
    Then results contain three entries in the same order
    And each entry reports at most top_k predictions sorted by confidence

  Scenario: Progressive classification emits per-image events
    Given a batch of three images
    When the client consumes the SSE stream
    Then one event is emitted per image with its index and predictions
    And a final done event reports total count and batch duration

  Scenario: Empty batch is rejected
    Given the images array is empty
    When the request is validated
    Then the response is 400 with error code "classify.empty_batch"
    And no backend runs

  Scenario: Batch size is bounded
    Given the request contains 129 images
    When the request is validated
    Then the response is 400 with error code "classify.batch_too_large"
    And the limit of 128 is reported

  Scenario: Per-image payload is bounded
    Given one base64 item exceeds classify_image_limit_mb
    When the request is validated
    Then the response is 413 with error code "classify.image_too_large"
    And the item index is reported

  Scenario: Invalid base64 is rejected with an index
    Given image at index 2 is not valid base64
    When decoding runs
    Then the response is 400 naming index 2
    And no predictions are returned for any image

  Scenario: Model input dimensions are validated
    Given model_width 0
    When the request is validated
    Then the response is 400 with error code "classify.invalid_dimensions"
    And no backend allocation occurs
