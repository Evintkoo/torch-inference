@ENG-016 @SEC-02 @SEC-03 @SEC-08 @SEC-10 @HPA-4 @AC-ENG-22
Feature: Authenticate, authorize, and harden the serving edge
  Local defaults stay safe, protected routes require valid credentials, and
  administrative mutations require stronger authorization than inference.

  Background:
    Given a configuration that declares the authentication mode

  Scenario: Local mode without authentication binds loopback only
    Given auth.enabled is false
    When the engine starts
    Then the listener binds 127.0.0.1 by default
    And protected mutation routes remain unavailable from non-loopback clients

  Scenario: Protected route rejects a missing token
    Given auth.enabled is true
    When a client calls a protected route without Authorization
    Then the response is 401 with a WWW-Authenticate challenge
    And no handler executes

  Scenario: Invalid or expired tokens are rejected
    Given a bearer token with a bad signature or past expiry
    When the request is authenticated
    Then the response is 401 with error code "auth.invalid_token"
    And token contents are not logged

  Scenario: Administrative routes require administrative scope
    Given a valid token without the administrative scope
    When the client mutates the registry
    Then the response is 403 with error code "auth.forbidden"
    And the mutation is not applied

  Scenario: Security headers are present on every response
    Given any HTTP response
    When headers are inspected
    Then CSP, X-Content-Type-Options, and X-Frame-Options are present
    And they do not allow unsafe inline script by default

  Scenario: Rate-limit identity cannot be spoofed by arbitrary headers
    Given a client supplies a forged forwarding header
    When rate limiting evaluates the request
    Then the identity follows the documented trusted-proxy policy
    And the client cannot reset its budget by changing the header
