# Copyright (c) 2026 Torviello.
"""Behavior of the ticket store and its validation rules."""

from __future__ import annotations

from pathlib import Path

import pytest
from torviello_roles import store
from torviello_roles.store import Ticket, TicketError


def make_ticket(**overrides: object) -> Ticket:
    values: dict[str, object] = {
        "id": "0001",
        "title": "Track the work",
        "status": "backlog",
        "priority": "P2",
        "owner": "engineer",
        "created": "2026-10-23",
        "updated": "2026-10-23",
        "body": "\n## Outcome\n\nDone.\n\n## Log\n\n- 2026-10-23 — created\n",
    }
    values.update(overrides)
    return Ticket(**values)


def test_ticket_round_trips_through_markdown(tmp_path: Path) -> None:
    ticket = make_ticket(requirements=["PDL-010"], labels=["process"])
    path = tmp_path / "0001-track-the-work.md"
    path.write_text(ticket.render(), encoding="utf-8")

    parsed = store.parse_ticket(path)

    assert parsed == ticket


def test_next_id_starts_at_one_and_increments(tmp_path: Path) -> None:
    assert store.next_id(tmp_path) == "0001"
    (tmp_path / "0007-existing.md").write_text("placeholder", encoding="utf-8")
    assert store.next_id(tmp_path) == "0008"


def test_slugify_rejects_titles_without_letters() -> None:
    assert store.slugify("Decide the API style") == "decide-the-api-style"
    with pytest.raises(TicketError):
        store.slugify("---")


def test_save_ticket_replaces_the_file_when_the_title_changes(tmp_path: Path) -> None:
    ticket = make_ticket()
    store.save_ticket(tmp_path, ticket)
    ticket.title = "A sharper outcome"
    path = store.save_ticket(tmp_path, ticket)

    assert path.name == "0001-a-sharper-outcome.md"
    assert [item.name for item in tmp_path.glob("*.md")] == [path.name]


def test_transitions_reject_shortcuts() -> None:
    ticket = make_ticket()
    store.check_transition(ticket, "ready")
    store.check_transition(ticket, "cancelled")
    with pytest.raises(TicketError):
        store.check_transition(ticket, "done")

    done = make_ticket(status="done")
    with pytest.raises(TicketError):
        store.check_transition(done, "ready")


def test_validation_reports_every_defect(store_root: Path) -> None:
    roles = store_root / "roles"
    requirements = store_root.parent / "requirements"
    tickets = [
        make_ticket(owner="ghost", requirements=["PDL-999"]),
        make_ticket(
            id="0002",
            status="done",
            depends_on=["9999"],
            body="\n## Log\n\n- 2026-10-23 — closed\n",
        ),
    ]

    errors = store.validate(tickets, roles, requirements)

    joined = "\n".join(errors)
    assert "owner 'ghost' has no role directory" in joined
    assert "requirement PDL-999 has no item document" in joined
    assert "done ticket has no evidence entry" in joined
    assert "depends on unknown ticket 9999" in joined


def test_validation_detects_dependency_cycles(store_root: Path) -> None:
    tickets = [
        make_ticket(id="0001", depends_on=["0002"]),
        make_ticket(id="0002", depends_on=["0001"]),
    ]

    errors = store.validate(tickets, store_root / "roles")

    assert any(error.startswith("dependency cycle") for error in errors)


def test_summary_ranks_ready_work_and_keeps_recent_activity(store_root: Path) -> None:
    roles = store_root / "roles"
    tickets = [
        make_ticket(id="0001", status="in_progress"),
        make_ticket(id="0002", status="ready", priority="P2"),
        make_ticket(id="0003", status="ready", priority="P1"),
        make_ticket(id="0004", status="blocked"),
        make_ticket(id="0005", status="done", body="\n## Log\n\n- 2026-10-23 — evidence: ok\n"),
    ]
    assert store.validate(tickets, roles) == []

    brief = store.summary(tickets)

    assert brief["open"] == 4
    assert [row["id"] for row in brief["ready"]] == ["0003", "0002"]
    assert brief["next"][0]["id"] == "0003"
    assert brief["counts"]["blocked"] == 1
    assert brief["recent"][0]["id"] == "0005"


def test_append_log_keeps_history_in_order() -> None:
    ticket = make_ticket(body="\n## Log\n\n- 2026-10-22 — created\n")

    ticket.append_log("started", "2026-10-23")
    ticket.append_log("evidence: pytest", "2026-10-24")

    assert ticket.log_entries() == [
        "- 2026-10-22 — created",
        "- 2026-10-23 — started",
        "- 2026-10-24 — evidence: pytest",
    ]
    assert ticket.updated == "2026-10-24"
    assert "## Log\n\n- 2026-10-22" in ticket.body
    assert "\n\n\n" not in ticket.body
