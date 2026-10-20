@ENG-018 @OBS-02 @OPS-01 @HPA-4 @AC-ENG-24
Feature: Expose health, readiness, and metrics
  Probes distinguish process liveness from serving readiness, and metrics are
  bounded, labeled, and safe to scrape at high frequency.

  Background:
    Given a running engine with a configured model profile

  Scenario: Liveness reflects the process
    Given the engine process is running
    When the liveness probe runs
    Then it returns 200 while the runtime can accept work
    And it does not require a loaded model

  Scenario: Readiness reflects serving capability
    Given required models are initialized
    When the readiness probe runs
    Then it returns 200 with status "ready"
    And it returns 503 with pending components when they are not ready

  Scenario: Health reports subsystem status
    Given the engine is running
    When health is requested
    Then the response reports overall status, version, uptime, and per-subsystem checks
    And a failed optional subsystem does not report overall healthy

  Scenario: Metrics scrape is bounded
    Given high request volume
    When /metrics is scraped
    Then the response follows Prometheus text format
    And label cardinality is bounded by documented dimensions

  Scenario: Health and metrics bypass rate limiting
    Given the client has exhausted its request budget
    When it calls /health or /metrics
    Then the request is served
    And the probe endpoints are not counted against the inference budget

  Scenario: Dashboard stream reflects current state
    Given a client subscribes to the dashboard stream
    When metrics change
    Then events are emitted on the documented interval
    And the stream closes cleanly on client disconnect
