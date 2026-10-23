# Copyright (c) 2026 Torviello.
"""Fixtures for the ticket-store tests."""

from __future__ import annotations

from pathlib import Path

import pytest


@pytest.fixture
def store_root(tmp_path: Path) -> Path:
    """Create an isolated store with a role map and requirement items."""
    root = tmp_path / "torviello-roles"
    (root / "tickets").mkdir(parents=True)
    roles = root / "roles"
    for role, document in (
        ("product-manager", "01-mission-and-memory.md"),
        ("engineer", "01-accountability-and-scope.md"),
    ):
        (roles / role).mkdir(parents=True)
        (roles / role / document).write_text(f"# {role}\n", encoding="utf-8")
    requirements = tmp_path / "requirements" / "items"
    requirements.mkdir(parents=True)
    for requirement in ("PDL-010", "PDL-011"):
        (requirements / f"{requirement}.md").write_text("# Requirement\n", encoding="utf-8")
    return root
