@RP-016 @RP-017 @ED-012 @PA-021
Feature: Substantiate competitive performance and footprint claims
  Torviello claims "fastest" or "lightest" only inside a declared, reproducible
  envelope. Every claim compares the shipping configuration against pinned
  competitors on identical hardware, and footprint budgets gate the release.

  Background:
    Given a versioned competitor set and reference hardware manifest
    And the minimal CPU profile for the release under test

  Scenario: Claim only inside the tested envelope
    Given every contender runs through the same harness and environment
    When the reference workload completes at the declared concurrency
    Then results report p50, p95, and p99 latency, throughput, peak memory, cold start, idle cost, and artifact size
    And any "fastest" or "lightest" claim states the tested models, hardware, precision, batch, and date

  Scenario: Fail the release when a footprint budget regresses
    Given a budget for minimal-profile artifact size, cold start, idle RSS, and peak memory
    When a release exceeds a budget or its regression tolerance
    Then the release gate fails
    And the regression is reported with the measured and budgeted values

  Scenario: Reject a speedup that degrades output quality
    Given a configuration that improves latency by reducing output quality or correctness
    When the benchmark quality check runs on the same workload
    Then the result is rejected as non-comparable
    And it is not published as a performance win

  Scenario: Retract a stale competitive claim
    Given a published claim whose evidence predates the current competitor or runtime version
    When the claim is reviewed for release
    Then the claim is retracted or requalified with a new measured result
    And the evidence record states the reason for the change

  Scenario: Compare vendor numbers only with a documented reconciliation
    Given a competitor publishes vendor benchmark numbers
    When those numbers are cited alongside local measurements
    Then the evidence records the environment and methodology differences
    And no equivalence is asserted without a reconciliation run
