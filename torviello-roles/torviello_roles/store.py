# Copyright (c) 2026 Torviello.
"""Ticket store for the Torviello delivery process.

Tickets are the durable work memory for people and agents. A ticket is one
Markdown file with TOML front matter under ``tickets/``. The store derives every
view from those files, so there is no second index that can drift.

The module deliberately uses only the Python standard library. Tests exercise
the same functions the CLI uses, with an explicit store root and clock.
"""

from __future__ import annotations

import json
import re
import tomllib
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

STATUSES = ("backlog", "ready", "in_progress", "blocked", "review", "done", "cancelled")
OPEN_STATUSES = ("backlog", "ready", "in_progress", "blocked", "review")
ACTIVE_STATUSES = ("in_progress", "review")
PRIORITIES = ("P0", "P1", "P2", "P3")
UNASSIGNED = "unassigned"

TRANSITIONS = {
    "backlog": {"ready", "in_progress", "cancelled"},
    "ready": {"backlog", "in_progress", "blocked", "cancelled"},
    "in_progress": {"ready", "blocked", "review", "done", "cancelled"},
    "blocked": {"ready", "in_progress", "cancelled"},
    "review": {"in_progress", "blocked", "done"},
    "done": set(),
    "cancelled": {"backlog"},
}

REQUIRED_FIELDS = (
    "id",
    "title",
    "status",
    "priority",
    "owner",
    "created",
    "updated",
)
LIST_FIELDS = ("requirements", "controls", "depends_on", "labels")
KEY_ORDER = REQUIRED_FIELDS + LIST_FIELDS

FRONT_MATTER = "+++"
ID_PATTERN = re.compile(r"^(?P<id>\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*$")
REQUIREMENT_PATTERN = re.compile(r"^[A-Z]{2,4}-\d{3}$")
CONTROL_PATTERN = re.compile(r"^[A-Z]{2,4}-\d{2}$")


class TicketError(Exception):
    """Raised when a ticket file or store operation is invalid."""


@dataclass
class Ticket:
    """One tracked unit of work."""

    id: str
    title: str
    status: str
    priority: str
    owner: str
    created: str
    updated: str
    requirements: list[str] = field(default_factory=list)
    controls: list[str] = field(default_factory=list)
    depends_on: list[str] = field(default_factory=list)
    labels: list[str] = field(default_factory=list)
    body: str = ""

    def __post_init__(self) -> None:
        self.body = self.body.lstrip("\n")

    @property
    def is_open(self) -> bool:
        return self.status in OPEN_STATUSES

    def to_dict(self) -> dict[str, object]:
        data: dict[str, object] = {
            "id": self.id,
            "title": self.title,
            "status": self.status,
            "priority": self.priority,
            "owner": self.owner,
            "created": self.created,
            "updated": self.updated,
        }
        for name in LIST_FIELDS:
            data[name] = getattr(self, name)
        return data

    def render(self) -> str:
        lines = [FRONT_MATTER]
        for name in KEY_ORDER:
            value = getattr(self, name)
            lines.append(f"{name} = {_encode(value)}")
        lines.append(FRONT_MATTER)
        body = self.body if self.body.endswith("\n") else f"{self.body}\n"
        return "\n".join(lines) + "\n" + (body if body.strip() else "")

    def log_entries(self) -> list[str]:
        return [line for line in self.body.splitlines() if line.startswith("- ")]

    def last_log(self) -> str:
        entries = self.log_entries()
        return entries[-1][2:] if entries else ""

    def evidence(self) -> str:
        for entry in reversed(self.log_entries()):
            if "evidence:" in entry.lower():
                return entry[2:]
        return ""

    def append_log(self, message: str, today: str) -> None:
        entry = f"- {today} — {message.strip()}"
        if "## Log" in self.body:
            head, _, tail = self.body.partition("## Log")
            head = head.rstrip("\n")
            existing = "\n".join(line for line in tail.splitlines() if line.strip())
            log = f"{existing}\n{entry}" if existing else entry
            self.body = f"{head}\n\n## Log\n\n{log}\n"
        else:
            self.body = f"{self.body.rstrip()}\n\n## Log\n\n{entry}\n"
        self.updated = today


def _encode(value: object) -> str:
    if isinstance(value, list):
        return "[" + ", ".join(json.dumps(item, ensure_ascii=False) for item in value) + "]"
    return json.dumps(value, ensure_ascii=False)


def _decode(front: dict[str, object], path: Path) -> Ticket:
    for name in REQUIRED_FIELDS:
        if name not in front:
            raise TicketError(f"{path.name}: missing required field {name!r}")
    data: dict[str, object] = dict(front)
    for name in LIST_FIELDS:
        value = data.get(name, [])
        if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
            raise TicketError(f"{path.name}: field {name!r} must be a list of strings")
        data[name] = value
    return Ticket(**{name: data[name] for name in Ticket.__dataclass_fields__ if name != "body"})


def parse_ticket(path: Path) -> Ticket:
    """Parse one ticket file, raising TicketError on malformed content."""
    text = path.read_text(encoding="utf-8")
    if not text.startswith(FRONT_MATTER + "\n"):
        raise TicketError(f"{path.name}: missing TOML front matter")
    _, _, remainder = text.partition(FRONT_MATTER + "\n")
    front_text, separator, body = remainder.partition("\n" + FRONT_MATTER)
    if not separator:
        raise TicketError(f"{path.name}: unterminated TOML front matter")
    try:
        front = tomllib.loads(front_text)
    except tomllib.TOMLDecodeError as error:
        raise TicketError(f"{path.name}: invalid TOML front matter: {error}") from error
    ticket = _decode(front, path)
    ticket.body = body.lstrip("\n")
    return ticket


def slugify(title: str, limit: int = 60) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    slug = slug[:limit].rstrip("-")
    if not slug:
        raise TicketError(f"title {title!r} produces an empty slug")
    return slug


def ticket_path(store: Path, ticket: Ticket) -> Path:
    return store / f"{ticket.id}-{slugify(ticket.title)}.md"


DOCUMENTATION_FILES = {"README.md", "AGENTS.md"}


def load_tickets(store: Path) -> list[Ticket]:
    """Load every ticket in the store, sorted by id."""
    tickets: list[Ticket] = []
    for path in sorted(store.glob("*.md")):
        if path.name in DOCUMENTATION_FILES:
            continue
        tickets.append(parse_ticket(path))
    return sorted(tickets, key=lambda ticket: ticket.id)


def next_id(store: Path) -> str:
    ids = [int(path.name[:4]) for path in store.glob("[0-9][0-9][0-9][0-9]-*.md")]
    return f"{(max(ids) + 1) if ids else 1:04d}"


def save_ticket(store: Path, ticket: Ticket) -> Path:
    for path in store.glob("*.md"):
        if path.name not in DOCUMENTATION_FILES and path.name.startswith(ticket.id + "-"):
            path.unlink()
    target = ticket_path(store, ticket)
    target.write_text(ticket.render(), encoding="utf-8")
    return target


def find(tickets: list[Ticket], ticket_id: str) -> Ticket:
    for ticket in tickets:
        if ticket.id == ticket_id:
            return ticket
    raise TicketError(f"ticket {ticket_id} does not exist")


def check_transition(ticket: Ticket, target: str) -> None:
    if target not in STATUSES:
        raise TicketError(f"unknown status {target!r}; expected one of {', '.join(STATUSES)}")
    if target == ticket.status:
        return
    if target not in TRANSITIONS[ticket.status]:
        raise TicketError(f"cannot move {ticket.id} from {ticket.status} to {target}")


def role_ids(roles: Path) -> set[str]:
    return {
        path.name
        for path in roles.iterdir()
        if path.is_dir() and any(path.glob("[0-9][0-9]-*.md"))
    }


def resolve_requirements(requirements: Path) -> set[str]:
    items = requirements / "items"
    return {path.stem for path in items.glob("[A-Z]*-[0-9][0-9][0-9].md")}


def validate(
    tickets: list[Ticket],
    roles: Path,
    requirements: Path | None = None,
) -> list[str]:
    """Return every store defect instead of stopping at the first one."""
    known_roles = role_ids(roles) | {UNASSIGNED}
    known_requirements = resolve_requirements(requirements) if requirements else None
    known_ids = {ticket.id for ticket in tickets}

    errors: list[str] = []
    if len(known_ids) != len(tickets):
        errors.append("duplicate ticket ids")

    for ticket in tickets:
        errors.extend(_validate_fields(ticket, known_roles))
        errors.extend(_validate_links(ticket, known_requirements, known_ids))

    errors.extend(_dependency_cycles(tickets))
    return errors


def _validate_fields(ticket: Ticket, known_roles: set[str]) -> list[str]:
    label = ticket.id
    errors: list[str] = []
    if not re.fullmatch(r"\d{4}", ticket.id):
        errors.append(f"{label}: id must be four digits")
    if not ticket.title.strip():
        errors.append(f"{label}: title is empty")
    if ticket.status not in STATUSES:
        errors.append(f"{label}: unknown status {ticket.status!r}")
    if ticket.priority not in PRIORITIES:
        errors.append(f"{label}: unknown priority {ticket.priority!r}")
    if ticket.owner not in known_roles:
        errors.append(f"{label}: owner {ticket.owner!r} has no role directory")
    for name in ("created", "updated"):
        try:
            date.fromisoformat(getattr(ticket, name))
        except ValueError:
            errors.append(f"{label}: {name} must be an ISO date")
    return errors


def _validate_links(
    ticket: Ticket,
    known_requirements: set[str] | None,
    known_ids: set[str],
) -> list[str]:
    label = ticket.id
    errors: list[str] = []
    if ticket.status == "done" and not any(
        "evidence:" in entry.lower() for entry in ticket.log_entries()
    ):
        errors.append(f"{label}: done ticket has no evidence entry")
    for dependency in ticket.depends_on:
        if dependency == ticket.id:
            errors.append(f"{label}: depends on itself")
        elif dependency not in known_ids:
            errors.append(f"{label}: depends on unknown ticket {dependency}")
    for requirement in ticket.requirements:
        if not REQUIREMENT_PATTERN.match(requirement):
            errors.append(f"{label}: malformed requirement id {requirement!r}")
        elif known_requirements is not None and requirement not in known_requirements:
            errors.append(f"{label}: requirement {requirement} has no item document")
    for control in ticket.controls:
        if not CONTROL_PATTERN.match(control):
            errors.append(f"{label}: malformed control id {control!r}")
    return errors


def _dependency_cycles(tickets: list[Ticket]) -> list[str]:
    graph = {ticket.id: list(ticket.depends_on) for ticket in tickets}
    state: dict[str, int] = {}
    errors: list[str] = []

    def visit(node: str, trail: list[str]) -> None:
        if state.get(node) == 1:
            cycle = " -> ".join([*trail, node])
            errors.append(f"dependency cycle: {cycle}")
            return
        if state.get(node) == 2:
            return
        state[node] = 1
        for dependency in graph.get(node, []):
            if dependency in graph:
                visit(dependency, [*trail, node])
        state[node] = 2

    for ticket_id in graph:
        visit(ticket_id, [])
    return errors


def summary(tickets: list[Ticket]) -> dict[str, object]:
    """Build the PM session brief from current ticket state."""
    open_tickets = [ticket for ticket in tickets if ticket.is_open]

    def ranked(items: list[Ticket]) -> list[dict[str, str]]:
        return _ranked(items)

    return {
        "total": len(tickets),
        "open": len(open_tickets),
        "counts": {
            status: sum(1 for item in tickets if item.status == status) for status in STATUSES
        },
        "active": ranked([item for item in open_tickets if item.status in ACTIVE_STATUSES]),
        "ready": ranked([item for item in open_tickets if item.status == "ready"]),
        "blocked": ranked([item for item in open_tickets if item.status == "blocked"]),
        "next": ranked([item for item in open_tickets if item.status == "ready"])[:1],
        "recent": [
            {
                "id": item.id,
                "updated": item.updated,
                "status": item.status,
                "title": item.title,
                "last_log": item.last_log(),
            }
            for item in sorted(tickets, key=lambda item: (item.updated, item.id), reverse=True)[:5]
        ],
    }


def _ranked(items: list[Ticket]) -> list[dict[str, str]]:
    ordered = sorted(items, key=lambda item: (PRIORITIES.index(item.priority), item.id))
    return [
        {
            "id": item.id,
            "priority": item.priority,
            "status": item.status,
            "owner": item.owner,
            "title": item.title,
            "last_log": item.last_log(),
            "evidence": item.evidence(),
        }
        for item in ordered
    ]


def report(tickets: list[Ticket], since: str, today: str) -> dict[str, object]:
    """Build an audience-neutral report from the same store state as the brief."""
    open_tickets = [ticket for ticket in tickets if ticket.is_open]
    done_since = [
        ticket for ticket in tickets if ticket.status == "done" and ticket.updated >= since
    ]
    return {
        "generated": today,
        "since": since,
        "total": len(tickets),
        "open": len(open_tickets),
        "counts": {
            status: sum(1 for item in tickets if item.status == status) for status in STATUSES
        },
        "active": _ranked([item for item in open_tickets if item.status in ACTIVE_STATUSES]),
        "blocked": _ranked([item for item in open_tickets if item.status == "blocked"]),
        "ready": _ranked([item for item in open_tickets if item.status == "ready"]),
        "next": _ranked([item for item in open_tickets if item.status == "ready"])[:1],
        "done_since": _ranked(done_since),
        "recent": [
            {
                "id": item.id,
                "updated": item.updated,
                "status": item.status,
                "title": item.title,
            }
            for item in sorted(tickets, key=lambda item: (item.updated, item.id), reverse=True)[:10]
        ],
    }
