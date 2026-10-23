+++
id = "0004"
title = "Decide the external API style for the first release"
status = "blocked"
priority = "P0"
owner = "product-manager"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["ED-052"]
controls = ["API-01"]
depends_on = []
labels = ["decision", "api"]
+++
## Outcome

OD-004 is decided by the accountable API owner: REST/JSON with OpenAPI,
gRPC, or both, plus the stable error envelope. The decision unblocks contract
work that currently rests on an open choice.

## Acceptance

- [ ] A reviewed decision record states the chosen style, versioning, and error shape.
- [ ] Affected contracts and tests cite the decision.
- [ ] The public surface is documented for client authors.

## Log

- 2026-10-23 — created
- 2026-10-23 — blocked: OD-004 remains open; the API owner must decide before contracts are fixed
