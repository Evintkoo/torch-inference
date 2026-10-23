# ADR 0004: Delegate hosted authentication to OIDC

## Status

Accepted. Date: 2026-10-22. Owner: security owner.

## Context

The engine is local-first and must keep working offline without an account. The
managed offering needs login, organizations, entitlements, and revocation
across a web console, desktop app, and CLI. Implementing an identity provider
inside this repository would add password storage, MFA, recovery, and abuse
handling to a codebase that should stay an inference server.

OWASP recommends standard protocols over bespoke authentication, PKCE for
public clients, and strict JWT algorithm, issuer, and audience validation
([Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet),
[OAuth 2.0](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet),
[JWT](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet)).
NIST SP 800-63B-4 requires a phishing-resistant option at AAL2 and phishing
resistance at AAL3
([NIST SP 800-63B-4](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63b-4.pdf)).
OIDC providers already supply passkeys, MFA, recovery, and audit.

## Options considered

1. **Build accounts and passwords in the engine.** Rejected: expands the
   attack surface and operational burden, and duplicates an identity provider.
2. **Long-lived API keys only.** Useful for automation, but no user lifecycle,
   MFA, revocation, or organization model.
3. **External OIDC provider with the engine as a resource server.** Keeps
   credentials out of this repository, supports SSO, passkeys, and revocation,
   and lets self-hosted operators bring their own provider.

## Decision

- **Local mode:** no account. Loopback keeps the existing HS256 shared-secret
  JWT for development and single-node use. HS256 is rejected when the engine is
  bound beyond loopback; hosted mode accepts only asymmetric OIDC tokens.
- **Hosted mode:** login is delegated to an external OIDC provider. The web
  console uses authorization code with PKCE (S256) through a backend-for-frontend
  session; tokens never enter browser storage. The CLI and desktop app use the
  device authorization grant (RFC 8628) and keep refresh tokens in the OS
  keychain. Passkeys/MFA are enforced at the provider.
- **Resource server:** the engine validates asymmetric access tokens with an
  algorithm allowlist (ES256 preferred; RS256/PS256 allowed), required `iss`,
  `aud`, `exp`, `nbf`, `sub`, and a 60-second clock skew. Keys are selected by
  `kid` from a cached JWKS for the configured issuer; `jku`, `x5u`, and inline
  `jwk` headers are never trusted. No HS256 key is accepted in hosted mode.
- **Claims:** `sub`, `org_id`, `roles`, `scope`, and `jti`. Roles are
  `inference`, `operator`, and `admin`; organization and entitlement claims are
  authorization inputs, not identity proof.
- **Entitlements:** the cloud service issues a signed, short-lived entitlement
  claim for hosted use and a signed offline license file for air-gapped installs.
  The engine verifies the signature and expiry and grants a 30-day offline grace
  period after the last successful renewal.
- **Lifetimes:** access tokens 10 minutes, refresh tokens 8 hours with rotation
  and reuse detection, and revocation at the provider. The engine logs `sub`,
  `org_id`, and `jti` for audit but never logs tokens or secrets.

## Consequences

- Passwords, MFA enrollment, recovery, and account deletion are out of scope for
  this repository; the provider owns them.
- Operators must configure an issuer, audience, and JWKS URL before remote
  clients can authenticate. There is no hosted login without network access.
- Offline installs depend on the signed license file and its grace period.
- Provider choice (managed service versus self-hosted Keycloak) remains an
  operational decision, not an engine code change.

## Evidence and open questions

- Implemented: loopback-only HS256 verification for local mode, route
  access control enforced in middleware, role/scope authorization, audit
  context (`sub`, `org_id`, `jti`), and asymmetric OIDC resource-server validation with an
  ES256/RS256/PS256 allowlist, required claims, `kid`-selected cached JWKS,
  bounded streaming fetch size/time, no redirects, and rejection of `jku`,
  `x5u`, inline `jwk`, and shared-secret algorithms. Device flow, the hosted
  provider choice, entitlements, and offline licenses remain follow-up work.
- Open: which provider the managed offering uses, billing-to-entitlement
  mapping, and the exact grace-period policy for paid offline licenses.
