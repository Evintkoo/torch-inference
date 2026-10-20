"""Index checks for the rules README."""

import re
from pathlib import Path

RULES = Path(__file__).resolve().parent
README = RULES / "README.md"
DOMAINS = sorted(
    path for path in RULES.iterdir() if path.is_dir() and (path / "trails" / "00-references-trails.md").exists()
)


def test_readme_links_every_rule_domain() -> None:
    text = README.read_text(encoding="utf-8")
    assert len(DOMAINS) == 26, f"expected 26 rule domains, found {len(DOMAINS)}"
    for domain in DOMAINS:
        assert f"({domain.name}/trails/00-references-trails.md)" in text, (
            f"README does not link the {domain.name} domain"
        )


def test_readme_documents_control_language_and_navigation() -> None:
    text = README.read_text(encoding="utf-8")
    assert "control language and evidence" in text.lower(), "no control-language section"
    assert "how to navigate and expand coverage" in text.lower(), "no coverage guidance"
    assert re.search(r"BCP 14|RFC 2119", text), "no normative-language policy"
    assert "assurance-register.md" in text, "README does not link the assurance register"
