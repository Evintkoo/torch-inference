@ENG-012 @API-05 @API-03 @HPA-4 @AC-ENG-18
Feature: Proxy OpenAI-compatible assistant traffic
  The assistant surface forwards requests without inventing compatibility and
  reports upstream failures distinctly from engine inference failures.

  Background:
    Given the optional LLM microservice is configured at a loopback address

  Scenario: Chat completion passes through
    Given the upstream service is healthy
    When the client posts an OpenAI-compatible chat completion
    Then the response preserves the upstream status and JSON body
    And the request carries a correlation identifier to the upstream

  Scenario: Streaming completion preserves SSE framing
    Given the request sets stream true
    When the upstream emits server-sent events
    Then the proxy forwards events without buffering the full response
    And the stream terminates when the upstream closes

  Scenario: Upstream unavailability is reported as gateway failure
    Given the upstream service is not listening
    When the client calls the assistant route
    Then the response is 503 with error code "upstream.unavailable"
    And the engine remains healthy for local inference

  Scenario: Oversized proxied bodies are bounded
    Given a proxy request exceeds the configured body limit
    When the request is read
    Then the response is 413 with error code "request.too_large"
    And the upstream receives no partial body

  Scenario: Proxy routes are absent when no upstream is configured
    Given no LLM upstream is configured
    When a client calls an assistant route
    Then the response is 404 with error code "upstream.not_configured"
    And no outbound connection is attempted
