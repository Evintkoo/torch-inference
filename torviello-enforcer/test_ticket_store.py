# Copyright (c) 2026 Torviello.
"""Conformance checks for the repository ticket store and role map (GOV-11)."""

from __future__ import annotations

from pathlib import Path

from torviello_roles import store

ROOT = Path(__file__).resolve().parents[1]
ROLES = ROOT / "torviello-roles" / "roles"
TICKETS = ROOT / "torviello-roles" / "tickets"
REQUIREMENTS = ROOT / "requirements"


def test_ticket_store_is_valid() -> None:
    tickets = store.load_tickets(TICKETS)

    assert tickets, "the ticket store is empty"
    assert store.validate(tickets, ROLES, REQUIREMENTS) == []
    assert store.next_id(TICKETS) == f"{int(max(ticket.id for ticket in tickets)) + 1:04d}"


def test_every_ticket_has_evidence_ready_acceptance() -> None:
    for ticket in store.load_tickets(TICKETS):
        assert "## Acceptance" in ticket.body, f"{ticket.id}: no acceptance section"
        assert "## Log" in ticket.body, f"{ticket.id}: no log section"
        assert ticket.log_entries(), f"{ticket.id}: empty log"


def test_every_role_is_a_numbered_directory() -> None:
    roles = store.role_ids(ROLES)

    assert roles, "no role directories found"
    for role in roles:
        directory = ROLES / role
        assert (directory / "README.md").exists(), f"{role}: missing README.md"
        documents = sorted(directory.glob("[0-9][0-9]-*.md"))
        assert documents, f"{role}: no numbered documents"
        assert [document.name for document in documents] == sorted(
            document.name for document in documents
        )
