# product-discovery-and-delivery enforcement tests

Generated conformance tests for the **product-discovery-and-delivery** domain. One test enforces each numbered rule document against the repository's product source; one test verifies the reference trail resolves.

## Files

- `test_NN_*.py` — one per rule document.
- `test_product_discovery_and_delivery_00_references_trails.py` — trail-integrity test.

## Validation

```sh
uv run --locked pytest torviello-enforcer/product-discovery-and-delivery
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Do not hand-edit these files. Change the rule or the generator and regenerate.
