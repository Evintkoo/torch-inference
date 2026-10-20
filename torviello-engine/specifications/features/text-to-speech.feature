@ENG-008 @API-02 @PERF-05 @HPA-4 @AC-ENG-14
Feature: Synthesize speech in full and streaming modes
  TTS validates text and parameters, selects an engine deterministically, and
  streams audio with bounded gaps between chunks.

  Background:
    Given at least one TTS engine is loaded with a default voice

  Scenario: Full synthesis returns a playable WAV
    Given text "Hello world" and voice "af_heart"
    When the client calls full synthesis
    Then the response is audio/wav with a valid header
    And it reports sample rate 24000 and mono channel layout

  Scenario: Streaming synthesis returns PCM chunks
    Given a multi-sentence text
    When the client calls streaming synthesis
    Then the response content type is audio/pcm
    And chunks are 16-bit little-endian PCM at 24000 Hz mono
    And the first chunk arrives before the complete text is synthesized

  Scenario: Empty text is rejected
    Given the request text is empty
    When the request is validated
    Then the response is 400 with error code "tts.empty_text"
    And no engine is invoked

  Scenario: Parameters are clamped to supported ranges
    Given speed 99 and pitch 0.01
    When synthesis runs
    Then speed is clamped to 4.0 and pitch to 0.5
    And the response metadata records the applied values

  Scenario: A stuck engine closes the stream with a timeout
    Given the engine produces no chunk within the configured chunk timeout
    When the client consumes the stream
    Then the stream terminates with error code "tts.chunk_timeout"
    And the connection is closed rather than held open

  Scenario: Unknown engine or voice is rejected
    Given the request names engine "missing-engine"
    When the request is validated
    Then the response is 404 with error code "tts.engine_not_found"
    And no fallback engine is used silently
