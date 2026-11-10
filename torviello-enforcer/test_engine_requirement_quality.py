"""HPA-4 quality gates for the engine requirement and acceptance set."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIREMENTS = ROOT / "torviello-enforcer" / "requirements"
ITEMS = REQUIREMENTS / "items"
ENGINE = ROOT / "torviello-engine"
CHECKS = ENGINE / "specifications" / "checks"
FEATURES = ENGINE / "specifications" / "features"
CONTRACT = ENGINE / "contracts" / "openapi.yaml"
ASSURANCE = REQUIREMENTS / "assurance-standard.md"
CRITERIA = ENGINE / "specifications" / "acceptance-criteria.md"

REQUIREMENT_SECTIONS = (
    "### 5.2 Highest-standard assurance",
    "### 6.1 Highest-standard gates",
    "### 9.1 Highest-standard procedure",
    "### 10.1 Highest-standard evidence",
    "### 11.1 Highest-standard failure conditions",
)
CHECK_SECTIONS = ("### 9.1 Highest-standard evidence",)
VAGUE = re.compile(r"\b(TBD|TBC|etc\.|and so on|as appropriate|if possible|reasonable|approximately)\b", re.I)


def engine_ids() -> dict[str, Path]:
    text = (REQUIREMENTS / "engine-runtime.md").read_text()
    return {match.group(1): Path(match.group(2)) for match in re.finditer(
        r"^\|\s*\[(ENG-\d{3})\]\((items/ENG-\d{3}\.md)\)\s*\|", text, re.M
    )}


def check_id_for(req_id: str) -> str:
    text = CRITERIA.read_text()
    match = re.search(rf"^\|\s*\[(AC-ENG-\d{{2}})\]\(checks/AC-ENG-\d{{2}}\.md\)\s*\|\s*{req_id}\s*\|", text, re.M)
    assert match, f"{req_id}: no acceptance-criteria row"
    return match.group(1)


def test_engine_requirements_meet_hpa4_structure() -> None:
    ids = engine_ids()
    assert len(ids) == 26, f"expected 26 engine requirements, found {len(ids)}"
    for req_id, rel in ids.items():
        doc = REQUIREMENTS / rel
        assert doc.exists(), f"{req_id}: missing {rel}"
        text = doc.read_text()
        assert text.startswith(f"# {req_id} — "), f"{req_id}: invalid heading"
        assert "[assurance-standard.md](../assurance-standard.md)" in text, f"{req_id}: missing assurance link"
        assert "**Priority:**" in text and "**Rule controls:**" in text
        for section in REQUIREMENT_SECTIONS:
            assert section in text, f"{req_id}: missing {section}"
        assert re.search(r"\| Assurance standard \| \[assurance-standard\.md\]", text), f"{req_id}: missing assurance trace row"
        for section in ("## 1. Normative requirement", "## 6. Acceptance criteria", "## 10. Required evidence", "## 11. Failure conditions"):
            body = text.split(section, 1)[1].split("\n## ", 1)[0]
            assert not VAGUE.search(body), f"{req_id}: vague term in {section}"
        assert text.count("\n- ") >= 12, f"{req_id}: evidence or obligation list is too thin"


def test_engine_checks_meet_hpa4_structure() -> None:
    for req_id in engine_ids():
        check_id = check_id_for(req_id)
        doc = CHECKS / f"{check_id}.md"
        assert doc.exists(), f"{check_id}: missing check document"
        text = doc.read_text()
        assert text.startswith(f"# {check_id} — "), f"{check_id}: invalid heading"
        assert f"**Requirement:** {req_id}" in text, f"{check_id}: wrong requirement"
        assert "[HPA-4](../../../torviello-enforcer/requirements/assurance-standard.md)" in text, f"{check_id}: missing HPA-4 link"
        for section in CHECK_SECTIONS:
            assert section in text, f"{check_id}: missing {section}"
        assert "Highest-standard assurance evidence is missing" in text, f"{check_id}: missing assurance fail condition"
        fail_body = text.split("## 8. Fail criteria", 1)[1].split("\n## ", 1)[0]
        assert not VAGUE.search(fail_body), f"{check_id}: vague term in fail criteria"


def test_engine_features_are_traceable_and_adversarial() -> None:
    for req_id in engine_ids():
        feature_tag = f"@{req_id}"
        matches = [p for p in FEATURES.glob("*.feature") if feature_tag in p.read_text()]
        assert len(matches) == 1, f"{req_id}: expected exactly one tagged feature, found {len(matches)}"
        text = matches[0].read_text()
        scenarios = re.findall(r"^\s*Scenario(?: Outline)?:", text, re.M)
        assert len(scenarios) >= 2, f"{req_id}: fewer than two scenarios"
        negative = re.search(r"(?i)(reject|invalid|malformed|unknown|failure|exceed|denied|unavailable|timeout|disconnect|cancel|oversiz)", text)
        assert negative, f"{req_id}: no negative, boundary, or failure scenario"


def test_contract_uses_hpa4_error_and_assurance_standard() -> None:
    text = CONTRACT.read_text()
    assert "openapi: 3.2" in text, "contract is not OpenAPI 3.2"
    assert text.count("application/problem+json") >= 10, "error responses do not use RFC 9457 media type"
    assert not re.search(r'application/json:\n\s+schema: \{ \$ref: "#/components/schemas/ErrorEnvelope" \}', text)
    for field in ("type:", "title:", "status:", "detail:", "instance:", "code:", "request_id:"):
        assert field in text.split("ErrorEnvelope:", 1)[1], f"ErrorEnvelope missing {field}"
    assert "assurance_level: HPA-4" in text
    assert "assurance_standard: requirements/assurance-standard.md" in text
    assert "error_media_type: application/problem+json" in text


def test_assurance_standard_and_domain_records_are_complete() -> None:
    text = ASSURANCE.read_text()
    for section in ("## 2. Requirement quality gates", "## 3. Verification obligations by risk", "## 4. Evidence thresholds", "## 6. Exceptions", "## 7. Overclaiming"):
        assert section in text, f"assurance standard missing {section}"
    for threshold in ("100% branch", "≥ 90%", "≥ 24 CPU-hours", "SLSA Build Level 3", "RFC 9457"):
        assert threshold in text, f"assurance standard missing threshold {threshold}"
    rules = (ENGINE / "domain" / "business-rules.md").read_text()
    assert "ENG-RULE-052" in rules
    invariants = (ENGINE / "domain" / "invariants.md").read_text()
    assert "INV-50" in invariants


def test_engine_features_carry_their_acceptance_check() -> None:
    from test_engine_requirement_quality import check_id_for  # noqa: PLC0415

    for req_id in engine_ids():
        expected = check_id_for(req_id)
        matches = [p for p in FEATURES.glob("*.feature") if f"@{req_id}" in p.read_text()]
        assert len(matches) == 1, f"{req_id}: expected one feature"
        text = matches[0].read_text()
        ac_tags = set(re.findall(r"@(AC-ENG-\d{2})", text))
        assert ac_tags == {expected}, f"{matches[0].name}: expected @{expected}, found {sorted(ac_tags)}"
    first = (FEATURES / "load-config-and-list-models.feature").read_text()
    assert "@AC-ENG-06" in first
