# torviello-landing/contracts/deployment

Part of **torviello-landing** — Public landing page and marketing site.

## Purpose

Machine-readable interface contract for the unit's deployment tooling.

## Contents

- [`deploy-contract.json`](deploy-contract.json) — v1.0.0: commands (`deploy`,
  `rollback`), flags, environment variables, exit codes (0/2/3/4/5/6/7),
  remote layout (`releases/<id>/` + `current` symlink invariants), release-id
  format, and the on-server verification marker.

## Validation

The contract is validated and cross-checked against the implementation by the
integration suite:

```sh
cd torviello-landing && bun test tests/integration
```

The contract test asserts the document parses, carries all required sections,
and that every command, flag, environment variable, exit code, pattern, and
marker named here appears in `deploy/deploy.sh`.

## Status

Active — contract v1.0.0 implemented and verified (ticket
[0043](../../../torviello-roles/tickets/0043-integrate-landing-page-deployment-to-the-oracle-server.md)).
