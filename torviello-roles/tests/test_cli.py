# Copyright (c) 2026 Torviello.
"""End-to-end behavior of the ticket CLI."""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from torviello_roles import cli


def run(store_root: Path, capsys: pytest.CaptureFixture[str], *args: str) -> tuple[int, str]:
    code = cli.main(["--root", str(store_root), "--today", "2026-10-23", *args])
    return code, capsys.readouterr().out


def test_new_list_start_and_done_flow(
    store_root: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    code, output = run(
        store_root,
        capsys,
        "new",
        "Track the first slice",
        "--owner",
        "engineer",
        "--priority",
        "P1",
        "--requires",
        "PDL-010",
        "--controls",
        "GOV-11",
        "--acceptance",
        "brief lists the ticket",
    )
    assert code == 0
    assert output.split()[0] == "0001"

    code, output = run(store_root, capsys, "list")
    assert code == 0
    assert "0001" in output
    assert "Track the first slice" in output
    assert "backlog" in output

    code, output = run(store_root, capsys, "start", "0001")
    assert code == 0
    assert "in_progress" in output

    code, output = run(store_root, capsys, "brief")
    assert code == 0
    assert "In progress" in output

    code, output = run(store_root, capsys, "done", "0001", "--evidence", "pytest passed")
    assert code == 0
    assert "done" in output

    code, output = run(store_root, capsys, "list", "--all")
    assert code == 0
    assert "done" in output


def test_brief_prioritizes_ready_work(
    store_root: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    run(store_root, capsys, "new", "Low value", "--priority", "P2")
    run(store_root, capsys, "new", "High value", "--priority", "P1")
    run(store_root, capsys, "move", "0001", "ready")
    run(store_root, capsys, "move", "0002", "ready")

    code, output = run(store_root, capsys, "brief")

    assert code == 0
    assert output.index("0002") < output.index("0001")
    assert "Next up: 0002" in output


def test_blocked_ticket_requires_a_reason(
    store_root: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    run(store_root, capsys, "new", "Needs a decision", "--status", "ready")

    code, output = run(store_root, capsys, "block", "0001", "--reason", "waiting for owner")

    assert code == 0
    assert "blocked" in output
    _, shown = run(store_root, capsys, "show", "0001")
    assert "waiting for owner" in shown
    assert "blocked" in shown


def test_check_reports_an_invalid_store(
    store_root: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    run(store_root, capsys, "new", "Unowned work")
    ticket = next((store_root / "tickets").glob("0001-*.md"))
    text = ticket.read_text(encoding="utf-8")
    ticket.write_text(text.replace('owner = "unassigned"', 'owner = "ghost"'), encoding="utf-8")

    code, _ = run(store_root, capsys, "check")

    assert code == 1


def test_check_passes_for_a_consistent_store(
    store_root: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    run(store_root, capsys, "new", "Owned work", "--owner", "engineer")

    code, output = run(store_root, capsys, "check")

    assert code == 0
    assert output.strip() == "ok: 1 tickets"


def test_json_output_is_machine_readable(
    store_root: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    run(store_root, capsys, "new", "JSON view", "--owner", "engineer")

    code, output = run(store_root, capsys, "list", "--json")

    assert code == 0
    payload = json.loads(output)
    assert payload[0]["title"] == "JSON view"
