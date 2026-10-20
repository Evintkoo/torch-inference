"""Completeness checks for per-requirement and per-check documents."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIREMENTS = ROOT / "requirements"
ITEMS = REQUIREMENTS / "items"
CHECKS = {
    "torviello-engine": ROOT / "torviello-engine" / "specifications" / "acceptance-criteria.md",
    "torviello-bench": ROOT / "torviello-bench" / "specifications" / "acceptance-criteria.md",
}

REQUIRED_REQUIREMENT_SECTIONS = (
    "## 1. Normative requirement",
    "## 2. Why this requirement exists",
    "## 3. Priority and interpretation",
    "## 4. Scope and applicability",
    "## 5. Detailed obligations",
    "## 6. Acceptance criteria",
    "## 8. Prohibited conditions",
    "## 9. Verification procedure",
    "## 10. Required evidence",
    "## 11. Failure conditions",
    "## 12. Related requirements",
    "## 14. Traceability",
    "## 15. Change control",
)

REQUIRED_CHECK_SECTIONS = (
    "## 1. Requirement",
    "## 2. Observable check",
    "## 3. Feature scenarios",
    "## 4. Rule obligations",
    "## 5. Prohibited conditions",
    "## 6. Procedure",
    "## 7. Pass criteria",
    "## 8. Fail criteria",
    "## 9. Required evidence",
    "## 11. Traceability",
    "## 12. Change control",
)


def requirement_ids() -> dict[str, Path]:
    found: dict[str, Path] = {}
    for source in REQUIREMENTS.glob("*.md"):
        for match in re.finditer(r"^\|\s*\[([A-Z]{2,4}-\d{3})\]\(items/\1\.md\)\s*\|", source.read_text(), re.M):
            found[match.group(1)] = source
    return found


def check_ids() -> dict[str, Path]:
    found: dict[str, Path] = {}
    for source in CHECKS.values():
        for match in re.finditer(r"^\|\s*\[(AC-[A-Z]+-\d{2})\]\(checks/\1\.md\)\s*\|", source.read_text(), re.M):
            found[match.group(1)] = source
    return found


def test_every_requirement_id_has_a_complete_document() -> None:
    ids = requirement_ids()
    assert ids, "no requirement ID rows were found"
    for req_id, source in ids.items():
        doc = ITEMS / f"{req_id}.md"
        assert doc.exists(), f"{req_id}: missing requirements/items/{req_id}.md (source {source.name})"
        text = doc.read_text()
        assert text.startswith(f"# {req_id} — "), f"{req_id}: document heading does not start with the ID"
        assert not text.splitlines()[0].endswith("..."), f"{req_id}: document title is truncated"
        for label in (f"**Requirement ID:** {req_id}", "**Priority:**", "**Source:**", "**Acceptance checks:**", "**Rule controls:**"):
            assert label in text, f"{req_id}: missing metadata {label}"
        for section in REQUIRED_REQUIREMENT_SECTIONS:
            assert section in text, f"{req_id}: missing section {section}"
        assert "No enforcer control traces this requirement." not in text, f"{req_id}: no rule control mapping"
        assert f"](../{source.name})" in text, f"{req_id}: source link does not resolve to {source.name}"
        assert len(text.split()) >= 1200, f"{req_id}: document is too thin ({len(text.split())} words)"


def test_requirement_documents_have_no_orphans() -> None:
    ids = set(requirement_ids())
    docs = {path.stem for path in ITEMS.glob("*.md") if path.name not in {"README.md", "AGENTS.md"}}
    assert docs == ids, f"orphan or missing requirement documents: extra={sorted(docs - ids)}, missing={sorted(ids - docs)}"


def test_every_check_id_has_a_complete_document() -> None:
    ids = check_ids()
    assert ids, "no acceptance-check rows were found"
    for check_id, source in ids.items():
        unit = next(name for name, path in CHECKS.items() if path == source)
        doc = ROOT / unit / "specifications" / "checks" / f"{check_id}.md"
        assert doc.exists(), f"{check_id}: missing check document"
        text = doc.read_text()
        assert text.startswith(f"# {check_id} — "), f"{check_id}: document heading does not start with the ID"
        assert not text.splitlines()[0].endswith("..."), f"{check_id}: document title is truncated"
        for label in (f"**Check ID:** {check_id}", "**Requirement:**", "**Type:**", "**Source:**"):
            assert label in text, f"{check_id}: missing metadata {label}"
        for section in REQUIRED_CHECK_SECTIONS:
            assert section in text, f"{check_id}: missing section {section}"
        assert "No rule control traces this check." not in text, f"{check_id}: no rule control mapping"
        assert source.name in text, f"{check_id}: source link does not reference {source.name}"
        assert len(text.split()) >= 1000, f"{check_id}: document is too thin ({len(text.split())} words)"


def test_check_documents_have_no_orphans() -> None:
    ids = set(check_ids())
    docs: set[str] = set()
    for unit in CHECKS:
        docs.update(path.stem for path in (ROOT / unit / "specifications" / "checks").glob("AC-*.md"))
    assert docs == ids, f"orphan or missing check documents: extra={sorted(docs - ids)}, missing={sorted(ids - docs)}"
