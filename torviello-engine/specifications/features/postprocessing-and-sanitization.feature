@ENG-023 @API-01 @SEC-04 @HPA-4 @AC-ENG-29
Feature: Normalize outputs and sanitize inputs deterministically
  Postprocessing is explicit, reported, and reproducible; sanitization bounds
  text and image inputs without changing valid values.

  Background:
    Given postprocessing is enabled for the requested capability

  Scenario: Text input is bounded
    Given a text input exceeds max_text_length
    When sanitization runs
    Then the request is rejected with error code "input.text_too_long"
    And no truncated payload is executed as if complete

  Scenario: Image dimensions are bounded
    Given an image exceeds max_image_width or max_image_height
    When sanitization runs
    Then the request is rejected before decoding full pixels
    And the limit is reported

  Scenario: Probabilities are rounded deterministically
    Given probability_decimals is 4 and rounding is enabled
    When classification output is postprocessed
    Then every probability is rounded to four decimals
    And the ordering by confidence is preserved

  Scenario: Null values are removed or preserved by policy
    Given remove_null_values is true
    When an output object contains null fields
    Then those fields are omitted
    And required fields are never removed

  Scenario: Postprocessing steps are reported
    Given normalization and rounding are applied
    When the response is returned
    Then meta.postprocess_steps lists each applied step in order
    And meta.postprocessing_applied is true

  Scenario: Skipping postprocessing returns raw backend output
    Given skip_postprocess is true
    When inference succeeds
    Then the response reports raw values
    And sanitization still applies to the input boundary
