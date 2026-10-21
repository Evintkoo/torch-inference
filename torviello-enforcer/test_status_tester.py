"""Tests for the human-readable HTTP status contract tester."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
TOOL = ROOT / "torviello-engine" / "contracts" / "tools" / "status_tester.py"
CATALOG = ROOT / "torviello-engine" / "contracts" / "schemas" / "common" / "http-status.yaml"


def _tester_module():
    spec = importlib.util.spec_from_file_location("engine_status_tester", TOOL)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_status_contract_passes() -> None:
    report = _tester_module().run()
    assert report.ok, [failure.message for failure in report.failures]
    assert len(report.statuses) == 64
    assert report.examples_checked == 51
    assert report.operations == {"total": 32, "implemented": 13, "reserved": 19}


def test_human_report_is_readable(capsys) -> None:
    module = _tester_module()
    assert module.main(["status_tester.py"]) == 0
    output = capsys.readouterr().out
    assert "HTTP status contract tester" in output
    assert "PASS" in output
    assert "0 failures" in output
    assert "64 statuses" in output
    assert "Operations: 32 (13 implemented, 19 reserved)" in output
    assert "FAIL" not in output


def test_json_report_is_machine_readable(capsys) -> None:
    module = _tester_module()
    assert module.main(["status_tester.py", "--json"]) == 0
    payload = json.loads(capsys.readouterr().out)
    assert payload["ok"] is True
    assert payload["failures"] == []
    assert len(payload["statuses"]) == 64
    assert payload["operations"] == {"total": 32, "implemented": 13, "reserved": 19}


def test_drift_is_reported_with_context(tmp_path, monkeypatch) -> None:
    module = _tester_module()
    catalog = yaml.safe_load(CATALOG.read_text(encoding="utf-8"))
    entry = next(item for item in catalog["assigned"] if item["code"] == 204)
    entry["content_type"] = "application/json"
    changed = tmp_path / "http-status.yaml"
    changed.write_text(yaml.safe_dump(catalog, sort_keys=False), encoding="utf-8")
    monkeypatch.setattr(module, "CATALOG", changed)

    report = module.run()
    assert report.ok is False
    assert any("bodyless status" in failure.message for failure in report.failures)
