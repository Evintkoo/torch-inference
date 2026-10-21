from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENGINE = ROOT / "torviello-engine"
REQUIREMENTS = ROOT / "requirements"


def _local_links(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    links = re.findall(r"\[[^\]]*\]\(([^)\s]+)", text)
    return [link for link in links if not link.startswith(("#", "http://", "https://", "mailto:"))]


def test_every_engine_markdown_is_hpa4_governed() -> None:
    documents = sorted(ENGINE.rglob("*.md"))
    assert len(documents) == 138
    for document in documents:
        text = document.read_text(encoding="utf-8")
        assert "HPA-4" in text, document
        assert "assurance-standard.md" in text, document


def test_every_engine_feature_is_hpa4_tagged() -> None:
    features = sorted((ENGINE / "specifications" / "features").glob("*.feature"))
    assert len(features) == 27
    for feature in features:
        assert "@HPA-4" in feature.read_text(encoding="utf-8").splitlines()[0], feature


def test_agents_and_readmes_have_assurance_controls() -> None:
    agents = sorted(ENGINE.rglob("AGENTS.md"))
    assert agents
    for document in agents:
        assert "## Assurance gates" in document.read_text(encoding="utf-8"), document
    for document in sorted(ENGINE.rglob("README.md")):
        text = document.read_text(encoding="utf-8")
        assert "## Validation" in text, document
        assert "## Status" in text, document


def test_engine_markdown_local_links_resolve() -> None:
    documents = [ROOT / "README.md", ROOT / "AGENTS.md", *sorted(ENGINE.rglob("*.md"))]
    documents += [
        REQUIREMENTS / "assurance-standard.md",
        REQUIREMENTS / "engine-runtime.md",
        *sorted((REQUIREMENTS / "items").glob("ENG-*.md")),
    ]
    missing: list[str] = []
    for document in documents:
        for link in _local_links(document):
            target = (document.parent / link.split("#", 1)[0]).resolve()
            if not target.exists():
                missing.append(f"{document.relative_to(ROOT)} -> {link}")
    assert not missing, "\n".join(missing)


def test_engine_requirements_carry_hpa4_gates() -> None:
    documents = sorted((REQUIREMENTS / "items").glob("ENG-*.md"))
    assert len(documents) == 26
    for document in documents:
        text = document.read_text(encoding="utf-8")
        assert "HPA-4" in text, document
        assert "### 6.0 HPA-4 acceptance rule" in text, document
        assert "### 11.1 Highest-standard failure conditions" in text, document


def test_acceptance_criteria_is_binary_and_complete() -> None:
    text = (ENGINE / "specifications" / "acceptance-criteria.md").read_text(encoding="utf-8")
    assert len(re.findall(r"^\| \[AC-ENG-\d{2}\]\(checks/AC-ENG-\d{2}\.md\) \|", text, re.M)) == 32
    assert "## 4. Failure criteria" in text
    assert "No waiver" in text or "no waiver" in text
    assert "section 4" in text


def test_standard_baseline_is_current() -> None:
    standard = (REQUIREMENTS / "assurance-standard.md").read_text(encoding="utf-8")
    for baseline in (
        "OpenAPI 3.2.1",
        "CycloneDX 1.7",
        "AISVS 1.01",
        "ASVS 5.0.0",
        "OpenTelemetry Semantic Conventions 1.44.0",
        "SLSA v1.2",
    ):
        assert baseline in standard, baseline
    assert "v1.2 initial public draft is tracked but not normative" in standard
    assert (ENGINE / "contracts" / "openapi.yaml").read_text(encoding="utf-8").startswith("openapi: 3.2.1\n")

    documents = [*sorted(ENGINE.rglob("*.md")), *sorted((REQUIREMENTS / "items").glob("ENG-*.md"))]
    stale = ("OpenAPI 3.1", "CycloneDX 1.6", "ASVS 5.0 Level")
    for document in documents:
        text = document.read_text(encoding="utf-8")
        for marker in stale:
            assert marker not in text, f"{document}: stale {marker}"
        assert not re.search(r"AISVS 1\.0(?![0-9])", text), f"{document}: stale AISVS 1.0"


def test_acceptance_checks_are_smart() -> None:
    criteria = (ENGINE / "specifications" / "acceptance-criteria.md").read_text(encoding="utf-8")
    assert "### 1.1 SMART specification contract" in criteria
    rows = re.findall(
        r"^\| \[(AC-ENG-\d{2})\]\(checks/AC-ENG-\d{2}\.md\) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$",
        criteria,
        re.M,
    )
    assert len(rows) == 32
    for check_id, requirement, threshold, adversarial, kind in rows:
        assert re.search(r"[A-Z]{2,3}-\d{3}", requirement), check_id
        assert re.search(r"\d|zero", threshold, re.I), check_id
        assert adversarial.strip(), check_id
        assert kind.strip() in {"Automated", "Review"}, check_id

    checks = sorted((ENGINE / "specifications" / "checks").glob("AC-ENG-*.md"))
    assert len(checks) == 32
    for document in checks:
        text = document.read_text(encoding="utf-8")
        assert "### SMART specification" in text, document
        for label in ("Specific:", "Measurable:", "Achievable:", "Relevant:", "Time-bound:"):
            assert f"**{label}**" in text, f"{document}: missing {label}"
        specific = re.search(r"\*\*Specific:\*\* (.+)", text)
        assert specific and re.search(r"[A-Z]{2,3}-\d{3}", specific.group(1)), document
        measurable = re.search(r"\*\*Measurable:\*\* (.+)", text)
        assert measurable and re.search(r"\d|zero|100%", measurable.group(1), re.I), document
        achievable = re.search(r"\*\*Achievable:\*\* (.+)", text)
        assert achievable and (
            "CI matrix" in achievable.group(1) or "independent reviewers" in achievable.group(1)
        ), document
        relevant = re.search(r"\*\*Relevant:\*\* (.+)", text)
        assert relevant and re.search(r"[A-Z]{2,3}-\d{3}", relevant.group(1)), document
        time_bound = re.search(r"\*\*Time-bound:\*\* (.+)", text)
        assert time_bound and "2027-01-31" in time_bound.group(1), document
        assert time_bound and "re-measured" in time_bound.group(1).lower(), document


def test_feature_scenarios_trace_to_smart_checks() -> None:
    features = sorted((ENGINE / "specifications" / "features").glob("*.feature"))
    assert len(features) == 27
    for feature in features:
        text = feature.read_text(encoding="utf-8")
        assert re.search(r"@AC-ENG-\d{2}", text.splitlines()[0]), feature
        assert "Scenario:" in text, feature
        assert "Then " in text, feature
        assert "When " in text, feature
