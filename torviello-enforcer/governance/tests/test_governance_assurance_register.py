"""Structural checks for the governance assurance register."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
GOVERNANCE = Path(__file__).resolve().parents[1]
REGISTER = Path(__file__).resolve().parents[1] / "assurance-register.md"


def read() -> str:
    return REGISTER.read_text(encoding="utf-8")


def test_register_has_required_sections_and_columns() -> None:
    text = read()
    for section in (
        "Applicability and conformance assessments",
        "Exceptions",
        "Coverage procedure dry-runs",
    ):
        assert f"## {section}" in text, f"register is missing section: {section}"
    for column in (
        "Record ID",
        "Control/clause IDs",
        "Disposition",
        "Evidence/work record",
        "Reviewer",
        "Next review trigger",
    ):
        assert column in text, f"register is missing column: {column}"


def test_register_records_scope_and_dispositions() -> None:
    text = read()
    assert "154 numbered control documents" in text, "register does not state the control-document scope"
    assert "1,050 clause IDs" in text, "register does not state the clause-ID scope"
    dispositions = set(re.findall(r"\|\s*(pass|fail|not applicable|unresolved)[^|]*\|", text, re.I))
    assert {"pass", "fail"} <= {value.lower() for value in dispositions}, (
        "register does not record both pass and fail dispositions"
    )


def test_register_keeps_exceptions_evidence_based() -> None:
    text = read()
    assert "No exceptions recorded" in text, "exception section is not in its declared empty state"
    assert "nonconformance" in text.lower(), "register does not define nonconformance handling"
    assert "expired" in text.lower(), "register does not address expired exceptions"


def test_control_records_do_not_claim_operational_approval_without_measurement() -> None:
    records = sorted(GOVERNANCE.joinpath("records").glob("*.json"))
    assert len(records) == 39, "unexpected governance record count"  # +col-04.json (ticket 0048)
    for path in records:
        record = json.loads(path.read_text(encoding="utf-8"))
        metric = record["metric"]
        if metric["measurement_status"] == "not_yet_measured":
            assert record["status"] == "active", f"{path.name}: unmeasured control claims {record['status']}"
            assert record["assurance_scope"] == "structural_only", f"{path.name}: scope overclaim"
        else:
            assert record["status"] in {"approved", "monitored"}, f"{path.name}: measured control is {record['status']}"
            assert record["assurance_scope"] == "operational", f"{path.name}: measured control has wrong scope"
