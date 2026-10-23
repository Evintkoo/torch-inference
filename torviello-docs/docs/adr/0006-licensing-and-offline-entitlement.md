# ADR 0006: Source licensing and offline entitlement

## Status

Proposed. Date: 2026-10-22. Owner: product owner with legal review. The
current `LICENSE` is unchanged until review completes.

## Context

The repository currently ships the MIT license and a commercial-license notice
that says commercial use requires a separate agreement. MIT does not permit that
restriction, so the two statements conflict and the commercial restriction is
not enforceable as written. LIC-01 and ED-040 require an approved policy,
consistent notices, and legal review before the policy is published or enforced.

The product is a local-first inference engine. Paid use must work offline and
must not require a phone-home service or a Kubernetes control plane.

## Decision

### Source license

Adopt **PolyForm Noncommercial 1.0.0** for project-owned engine source and
offer commercial terms separately. PolyForm Noncommercial is purpose-built for
"free personal use, paid commercial use" and avoids pretending that an
OSI-approved permissive license contains a commercial restriction. Model
weights, datasets, fonts, and media keep their own licenses and are never
relicensed by this decision.

If legal review rejects PolyForm, the fallback is **AGPL-3.0-or-later** plus a
commercial exception. AGPL is OSI-approved and enforces network copyleft, but it
is a worse fit for proprietary embedding and requires more review.

Do not replace `LICENSE`, publish license claims, or enforce the commercial
restriction until counsel confirms ownership, contribution rights, dependency
compatibility, and the exact terms. Until then the repository remains MIT and
the commercial notice is marked as pending.

### Offline entitlement

Use a compact **Ed25519-signed license file**, not a JWT:

```json
{
  "version": 1,
  "license_id": "lic_...",
  "organization": "Example GmbH",
  "features": ["engine", "vulkan", "metal"],
  "issued_at": "2026-10-22T00:00:00Z",
  "expires_at": "2027-10-22T00:00:00Z",
  "grace_days": 30,
  "machine": null,
  "signature": "base64url..."
}
```

- The engine embeds only the public key; the signing key stays in the release
  system and never enters this repository.
- Verification rejects unknown versions, algorithms, or fields; checks the
  signature over the canonical payload, `expires_at`, and optional machine
  binding; and never executes or trusts license content beyond its claims.
- After expiry, paid features keep working for `grace_days` (default 30) and
  then degrade to the free local profile. The last accepted timestamp is stored
  in SQLite so a clock rollback cannot extend the grace indefinitely.
- No network call is required. Online activation, if offered, only delivers a
  signed file; it is not an enforcement dependency.

### Packaging

Every release bundle includes the selected source license, commercial terms,
third-party notices, SBOM, model-license inventory, and the public verification
key. Packaging fails if any required notice or key is missing. Containers carry
the same notices under `/usr/share/doc/torviello/`.

## Consequences

- The commercial restriction becomes legally coherent only after the license
  file and notices change together.
- Offline installs can be licensed without a hosted control plane, matching the
  local-first product boundary.
- Lost or leaked license files are replaceable; leaked private keys require a
  key rotation and a new release, not a phone-home kill switch.
- Entitlement checks add a startup dependency on the license file only for paid
  features; the free profile keeps running without one.

## Evidence and open questions

- Confirmed inconsistency: `LICENSE` is MIT; `COMMERCIAL_LICENSE.md` restricts
  commercial use. No legal review is recorded yet.
- Not implemented: license parser, Ed25519 verification, SQLite last-seen
  storage, and packaging notice gate. This ADR fixes the design before code.
- Open: copyright owner entity, contribution attestation (DCO versus CLA),
  machine-binding policy, and whether AGPL is preferred over PolyForm.
