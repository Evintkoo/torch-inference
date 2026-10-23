# Agents: tests

- Test observable behavior: parsing, serialization, transitions, validation,
  brief ranking, and CLI exit codes.
- Use the `store_root` fixture and the `--today` clock; never read or write the
  real ticket store from a test.
- Do not weaken or delete a test to make a change pass.
- Add a regression test for every fixed defect.
