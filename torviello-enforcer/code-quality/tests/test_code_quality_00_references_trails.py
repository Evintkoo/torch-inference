"""Reference-trail integrity test for torviello-enforcer/code-quality/trails/00-references-trails.md."""

import re
from pathlib import Path

CONTROL = "__CONTROLS__"
HERE = Path(__file__).resolve()
RULES_ROOT = HERE.parents[3]
DOCUMENT = HERE.parents[1] / "trails" / "00-references-trails.md"
REQUIREMENTS = RULES_ROOT / "torviello-enforcer" / "requirements"


def test_code_quality_reference_trail_resolves() -> None:
    """Assert every source and requirement reference in the trail resolves."""
    text = DOCUMENT.read_text(encoding="utf-8")
    sources = set(re.findall(r"^### (R\d+) —", text, re.M))
    cited = set()
    for cell in re.findall(r"\| R[0-9,]+ \|", text):
        cited.update(re.findall(r"R\d+", cell))
    assert cited <= sources, f"undefined sources cited: {sorted(cited - sources)}"

    requirement_text = "\n".join(
        path.read_text(encoding="utf-8") for path in REQUIREMENTS.rglob("*.md")
    )
    ids = set(re.findall(r"[A-Z]{2}-\d{3}\b", text))
    missing = sorted(i for i in ids if not re.search(r"\b" + re.escape(i) + r"\b", requirement_text))
    assert not missing, f"requirement IDs not found in requirements/: {missing}"
