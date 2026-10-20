@ENG-011 @API-02 @API-03 @HPA-4 @AC-ENG-17
Feature: Detect objects in an uploaded image
  Detection validates version, size, thresholds, and image bounds before
  inference, then reports boxes with stable class labels.

  Background:
    Given a YOLO detection model is available for the requested version and size

  Scenario: Detect objects with default thresholds
    Given a valid image upload
    When the client omits threshold overrides
    Then the server applies configured defaults
    And results report detections, count, class names, and confidence

  Scenario: Per-request thresholds override defaults
    Given the client sets conf_threshold 0.6 and iou_threshold 0.3
    When detection runs
    Then every returned confidence is at least 0.6
    And the response metadata records the applied thresholds

  Scenario: Unsupported version or size is rejected
    Given model_version "v7"
    When the request is validated
    Then the response is 400 with error code "detect.invalid_model"
    And the supported versions are listed

  Scenario: Missing model returns a stable not-found error
    Given the requested model file is absent
    When detection is requested
    Then the response is 404 with error code "detect.model_not_found"
    And no substitute model is used

  Scenario: Oversized image is rejected
    Given the upload exceeds multipart_image_limit_mb
    When the request is read
    Then the response is 413 with error code "detect.image_too_large"
    And no decoder allocates beyond the limit

  Scenario: Zero-dimension images are rejected
    Given an image whose decoded width or height is zero
    When detection runs
    Then the response is 400 with error code "detect.invalid_image"
    And the model is not invoked
