@ENG-009 @API-02 @SEC-04 @HPA-4 @AC-ENG-15
Feature: Transcribe and validate uploaded audio
  Audio ingress is size- and duration-bounded, format-checked, and transcribed
  with optional timestamp segments.

  Background:
    Given a supported audio model is loaded

  Scenario: Transcribe a WAV upload
    Given a valid mono WAV file under the size limit
    When the client calls transcription
    Then the response contains text, language, and confidence
    And segments are absent unless timestamps were requested

  Scenario: Timestamps add segment bounds
    Given the client requests timestamps
    When transcription succeeds
    Then each segment reports start and end seconds in ascending order
    And segment text concatenates to the response text

  Scenario: Invalid audio is rejected
    Given the uploaded bytes are not decodable audio
    When the request is validated
    Then the response is 400 with error code "audio.invalid_format"
    And no model inference runs

  Scenario: Oversized uploads return 413 before decoding
    Given the upload exceeds multipart_audio_limit_mb
    When the request is read
    Then the response is 413 with error code "audio.too_large"
    And memory use stays bounded by the configured limit

  Scenario: Excessive duration is rejected
    Given a valid audio file longer than audio_max_duration_secs
    When the request is validated
    Then the response is 400 with error code "audio.too_long"
    And decoding stops at the configured bound

  Scenario: Validation without inference reports metadata
    Given a valid audio upload
    When the client calls audio validation
    Then the response reports format, sample rate, channels, and duration
    And it reports valid true with an empty errors array
