# Rule-test generator

`generate_rule_tests.py` generates one self-contained, repo-wide, language-agnostic conformance test per numbered rule document and one trail-integrity test per reference trail, written into the rule domain next to the document it enforces.

## Usage

```sh
uv run --locked python torviello-enforcer/tools/generate_rule_tests.py
```

Do not import the generator from tests. Generated tests must remain self-contained. Generated files are placed in `torviello-enforcer/<domain>/` beside the rule documents.
