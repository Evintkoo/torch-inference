# change-management enforcement tests

Generated conformance tests for the **change-management** domain. One test enforces each numbered rule document against the repository's product source; one test verifies the reference trail resolves.

## Files

- `test_NN_*.py` — one per rule document.
- `test_change_management_00_references_trails.py` — trail-integrity test.

## Validation

```sh
uv run --locked pytest torviello-enforcer/change-management
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Do not hand-edit these files. Change the rule or the generator and regenerate.
