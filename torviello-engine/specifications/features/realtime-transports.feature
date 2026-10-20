@ENG-013 @API-02 @API-04 @HPA-4 @AC-ENG-19
Feature: Serve realtime audio and vision over WebSocket
  WebSocket sessions have explicit negotiation, bounded frames, ordered
  responses, and deterministic cleanup on disconnect.

  Background:
    Given the engine is ready and the requested model is loaded

  Scenario: Audio socket announces readiness
    Given a client upgrades the audio WebSocket
    When the connection is established
    Then the server sends {"type":"ready"}
    And the session accepts JSON control frames and binary PCM frames

  Scenario: Streaming TTS emits ordered audio
    Given the client sends a tts control frame with text
    When synthesis runs
    Then the server sends a tts_meta frame followed by binary PCM chunks
    And it sends tts_done after the final chunk

  Scenario: Streaming STT bounds the utterance
    Given the client sends stt_begin with sample_rate 16000
    And streams f32 little-endian PCM frames
    When the client sends stt_end
    Then the server returns one transcript frame
    And it rejects frames that exceed the session buffer limit

  Scenario: Vision sockets require a config frame
    Given a client connects to the classification or detection socket
    When it sends binary frames before a config frame
    Then the server returns an error frame
    And no inference runs

  Scenario: Invalid control frames are rejected
    Given a malformed JSON control frame
    When the server processes it
    Then it returns an error frame with a stable code
    And the session remains usable

  Scenario: Disconnect releases session resources
    Given an active WebSocket session
    When the client disconnects abruptly
    Then the server stops synthesis or inference for that session
    And session-scoped buffers are released
