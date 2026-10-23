# Tests

Unit and command-level tests for the ticket store and CLI.

```sh
uv run pytest torviello-roles
```

The tests use an isolated temporary store, an explicit clock, and no network. A
test that depends on the real ticket store belongs in an integration check, not
here.
