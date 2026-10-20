"""Whole-corpus consistency checks for the numbered rule documents."""

import re
from pathlib import Path

RULES = Path(__file__).resolve().parent
REQUIREMENTS = Path(__file__).resolve().parents[1] / "requirements"

NUMBERED = sorted(
    doc
    for doc in RULES.glob("*/rules/*.md")
    if doc.name != "00-references-trails.md" and doc.name[:2].isdigit()
)

REQUIRED_SECTIONS = {
    "Control objective",
    "Applicability",
    "Normative requirements",
    "Prohibited conditions",
    "Assessment procedure",
    "Assessment determination",
    "Required evidence",
    "Exceptions and nonconformance",
    "Reference trail",
}


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_all_rule_documents_have_metadata_and_sections() -> None:
    assert len(NUMBERED) == 154, f"expected 154 numbered rule documents, found {len(NUMBERED)}"
    for doc in NUMBERED:
        text = read(doc)
        assert re.search(r"^\*\*Control family:\*\* ", text, re.M), f"{doc}: missing control family"
        assert re.search(r"^\*\*Control document:\*\* [A-Z]+-\d+", text, re.M), f"{doc}: missing control ID"
        assert re.search(r"^\*\*Requirement trace:\*\* ", text, re.M), f"{doc}: missing requirement trace"
        assert "**Status:** Normative project control" in text, f"{doc}: missing normative status"
        for section in REQUIRED_SECTIONS:
            assert f"## {section}" in text, f"{doc}: missing section {section}"


def test_control_ids_and_clause_ids_are_unique() -> None:
    controls: list[str] = []
    clauses: list[str] = []
    for doc in NUMBERED:
        text = read(doc)
        control = re.search(r"^\*\*Control document:\*\* ([A-Z]+-\d+)", text, re.M)
        assert control, f"{doc}: no control ID"
        controls.append(control.group(1))
        clauses.extend(re.findall(r"^### ([A-Z]+-\d+\.\d+) — ", text, re.M))
    assert len(controls) == len(set(controls)), "duplicate control document IDs"
    assert len(clauses) == len(set(clauses)), "duplicate clause IDs"


def test_every_control_has_numbered_requirements() -> None:
    for doc in NUMBERED:
        text = read(doc)
        control = re.search(r"^\*\*Control document:\*\* ([A-Z]+-\d+)", text, re.M).group(1)
        clause_ids = re.findall(rf"^### ({re.escape(control)}\.\d+) — ", text, re.M)
        assert clause_ids, f"{doc}: no numbered requirements for {control}"
        for clause_id in clause_ids:
            body = text.split(f"### {clause_id} — ", 1)[1].split("\n### ", 1)[0]
            requirement = body.split("\n## ", 1)[0].strip()
            assert requirement, f"{doc}: requirement text missing for {clause_id}"


def test_reference_trails_map_every_rule_and_define_every_source() -> None:
    for trail in sorted(RULES.glob("*/trails/00-references-trails.md")):
        text = read(trail)
        sources = set(re.findall(r"^### (R\d+) — ", text, re.M))
        cited: set[str] = set()
        for cell in re.findall(r"\| R[0-9, ]+ \|", text):
            cited.update(re.findall(r"R\d+", cell))
        assert cited <= sources, f"{trail}: undefined sources {sorted(cited - sources)}"
        domain = trail.parents[1]
        for doc in sorted((domain / "rules").glob("[0-9][0-9]-*.md")):
            if doc.name == "00-references-trails.md":
                continue
            assert doc.name in text, f"{trail}: rule document {doc.name} is not mapped"


def test_requirement_ids_resolve_to_requirement_documents() -> None:
    requirement_text = "\n".join(read(path) for path in REQUIREMENTS.rglob("*.md"))
    for doc in NUMBERED:
        for req_id in set(re.findall(r"\b[A-Z]{2}-\d{3}\b", read(doc))):
            assert re.search(rf"\b{re.escape(req_id)}\b", requirement_text), (
                f"{doc}: requirement ID {req_id} does not resolve"
            )


def test_every_rule_links_its_reference_trail() -> None:
    for doc in NUMBERED:
        assert "00-references-trails.md" in read(doc), (
            f"{doc}: does not link its domain reference trail"
        )


def test_every_reference_trail_declares_one_development_stage_word() -> None:
    stages = {"DDD", "SDD", "CDD", "TDD", "EDD"}
    for trail in sorted(RULES.glob("*/trails/00-references-trails.md")):
        found = re.findall(r"^\*\*Development stage:\*\* (\w+)$", read(trail), re.M)
        assert len(found) == 1, f"{trail}: expected exactly one development stage word, found {found}"
        assert found[0] in stages, f"{trail}: unsupported development stage {found[0]!r}"
