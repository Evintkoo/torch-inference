# Copyright (c) 2026 Torviello.
"""Agentic ticket CLI.

Run from the repository root::

    uv run python -m torviello_roles brief
    uv run python -m torviello_roles new "Short outcome" --owner engineer
    uv run python -m torviello_roles start 0007
    uv run python -m torviello_roles report --since 2026-10-16
    uv run python -m torviello_roles done 0007 --evidence "uv run pytest passed"

The CLI writes only to the ticket store. It never edits requirements, rules, or
source code, so a ticket cannot silently become the specification.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date, timedelta
from pathlib import Path

from . import store
from .store import Ticket, TicketError

ROOT = Path(__file__).resolve().parents[1]


def emit(message: str = "") -> None:
    sys.stdout.write(message + "\n")


def fail(message: str) -> int:
    sys.stderr.write(f"error: {message}\n")
    return 1


def split_values(values: list[str] | None) -> list[str]:
    result: list[str] = []
    for value in values or []:
        result.extend(part.strip() for part in value.split(",") if part.strip())
    return result


def store_paths(args: argparse.Namespace) -> tuple[Path, Path, Path | None]:
    root = Path(args.root).resolve() if args.root else ROOT
    requirements = root.parent / "torviello-enforcer" / "requirements"
    return root / "tickets", root / "roles", requirements if requirements.is_dir() else None


def load(args: argparse.Namespace) -> list[Ticket]:
    tickets_dir, _, _ = store_paths(args)
    if not tickets_dir.is_dir():
        raise TicketError(f"ticket store not found: {tickets_dir}")
    return store.load_tickets(tickets_dir)


def save(args: argparse.Namespace, ticket: Ticket) -> Path:
    tickets_dir, _, _ = store_paths(args)
    return store.save_ticket(tickets_dir, ticket)


def acceptance_body(acceptance: list[str]) -> str:
    items = split_values(acceptance) or ["Not recorded yet."]
    return "\n".join(f"- [ ] {item}" for item in items)


def cmd_new(args: argparse.Namespace) -> int:
    tickets_dir, _, _ = store_paths(args)
    if not tickets_dir.is_dir():
        raise TicketError(f"ticket store not found: {tickets_dir}")
    title = args.title.strip()
    if not title:
        raise TicketError("title must not be empty")
    today = args.today or date.today().isoformat()
    ticket = Ticket(
        id=store.next_id(tickets_dir),
        title=title,
        status=args.status,
        priority=args.priority,
        owner=args.owner,
        created=today,
        updated=today,
        requirements=split_values(args.requires),
        controls=split_values(args.controls),
        depends_on=split_values(args.depends_on),
        labels=split_values(args.label),
        body=(
            f"\n## Outcome\n\n{args.outcome or 'Not recorded yet.'}\n\n"
            f"## Acceptance\n\n{acceptance_body(args.acceptance)}\n\n"
            f"## Log\n\n- {today} — created\n"
        ),
    )
    path = save(args, ticket)
    emit(f"{ticket.id} {path.name}")
    return 0


def cmd_list(args: argparse.Namespace) -> int:
    tickets = load(args)
    selected = [
        ticket
        for ticket in tickets
        if (args.all or ticket.is_open)
        and (not args.status or ticket.status in split_values(args.status))
        and (not args.owner or ticket.owner == args.owner)
        and (not args.priority or ticket.priority in split_values(args.priority))
    ]
    selected.sort(key=lambda ticket: (store.PRIORITIES.index(ticket.priority), ticket.id))
    if args.json:
        emit(json.dumps([ticket.to_dict() for ticket in selected], indent=2, ensure_ascii=False))
        return 0
    if not selected:
        emit("No tickets match.")
        return 0
    for ticket in selected:
        emit(
            f"{ticket.id}  {ticket.status:<11} {ticket.priority}  "
            f"{ticket.owner:<16} {ticket.title}"
        )
    return 0


def cmd_show(args: argparse.Namespace) -> int:
    ticket = store.find(load(args), args.id)
    if args.json:
        emit(json.dumps(ticket.to_dict(), indent=2, ensure_ascii=False))
        return 0
    emit(f"{ticket.id} — {ticket.title}")
    emit(
        f"status: {ticket.status}  priority: {ticket.priority}  owner: {ticket.owner}  "
        f"updated: {ticket.updated}"
    )
    if ticket.requirements:
        emit(f"requirements: {', '.join(ticket.requirements)}")
    if ticket.controls:
        emit(f"controls: {', '.join(ticket.controls)}")
    if ticket.depends_on:
        emit(f"depends on: {', '.join(ticket.depends_on)}")
    if ticket.labels:
        emit(f"labels: {', '.join(ticket.labels)}")
    if ticket.body.strip():
        emit()
        emit(ticket.body.rstrip())
    return 0


def cmd_brief(args: argparse.Namespace) -> int:
    tickets = load(args)
    brief = store.summary(tickets)
    if args.json:
        emit(json.dumps(brief, indent=2, ensure_ascii=False))
        return 0
    counts = brief["counts"]
    emit(f"Ticket brief — {args.today or date.today().isoformat()}")
    emit(
        f"Total: {brief['total']}  open: {brief['open']}  "
        f"in progress: {counts['in_progress']}  review: {counts['review']}  "
        f"blocked: {counts['blocked']}"
    )
    for heading, key in (("In progress", "active"), ("Ready", "ready"), ("Blocked", "blocked")):
        rows = brief[key]
        if not rows:
            continue
        emit()
        emit(heading)
        for row in rows:
            emit(f"  {row['id']}  {row['priority']}  {row['owner']:<16} {row['title']}")
    if brief["next"]:
        item = brief["next"][0]
        emit()
        emit(f"Next up: {item['id']} — {item['title']} ({item['owner']})")
    if brief["recent"]:
        emit()
        emit("Recently updated")
        for item in brief["recent"]:
            emit(f"  {item['updated']}  {item['id']}  {item['status']:<11} {item['title']}")
    return 0


def report_since(args: argparse.Namespace) -> tuple[str, str]:
    today = args.today or date.today().isoformat()
    if args.since:
        try:
            date.fromisoformat(args.since)
        except ValueError as error:
            raise TicketError(f"--since must be an ISO date, got {args.since!r}") from error
        return args.since, today
    start = date.fromisoformat(today) - timedelta(days=7)
    return start.isoformat(), today


def render_report(payload: dict[str, object]) -> str:
    counts = payload["counts"]
    lines = [
        f"# Ticket report — {payload['generated']}",
        "",
        f"Done work counted since {payload['since']}.",
        "",
        "## Summary",
        "",
        f"- Total: {payload['total']}; open: {payload['open']}; done: {counts['done']}",
        f"- In progress: {counts['in_progress']}; review: {counts['review']}; "
        f"blocked: {counts['blocked']}; ready: {counts['ready']}",
    ]
    sections = (
        ("Active work", payload["active"], "last_log"),
        ("Blocked", payload["blocked"], "last_log"),
        ("Next", payload["next"], None),
        (f"Done since {payload['since']}", payload["done_since"], "evidence"),
        ("Recently updated", payload["recent"], None),
    )
    for heading, rows, detail in sections:
        lines.extend(["", f"## {heading}", ""])
        if not rows:
            lines.append("_None._")
            continue
        for row in rows:
            status = row.get("status", "")
            updated = f"{row['updated']}  " if "updated" in row else ""
            line = (
                f"- {updated}{row['id']}  {row.get('priority', '')}  {status:<11} "
                f"{row.get('owner', '')}  {row['title']}"
            )
            if detail and row.get(detail):
                line += f"\n  {row[detail]}"
            lines.append(line)
    return "\n".join(lines)


def cmd_report(args: argparse.Namespace) -> int:
    since, today = report_since(args)
    payload = store.report(load(args), since, today)
    if args.format == "json":
        emit(json.dumps(payload, indent=2, ensure_ascii=False))
        return 0
    emit(render_report(payload))
    return 0


def cmd_start(args: argparse.Namespace) -> int:
    ticket = store.find(load(args), args.id)
    store.check_transition(ticket, "in_progress")
    ticket.status = "in_progress"
    ticket.append_log("started", args.today or date.today().isoformat())
    save(args, ticket)
    emit(f"{ticket.id} {ticket.status}")
    return 0


def cmd_move(args: argparse.Namespace) -> int:
    ticket = store.find(load(args), args.id)
    store.check_transition(ticket, args.status)
    ticket.status = args.status
    reason = f": {args.reason}" if args.reason else ""
    ticket.append_log(
        f"status -> {args.status}{reason}", args.today or date.today().isoformat()
    )
    save(args, ticket)
    emit(f"{ticket.id} {ticket.status}")
    return 0


def cmd_block(args: argparse.Namespace) -> int:
    ticket = store.find(load(args), args.id)
    store.check_transition(ticket, "blocked")
    ticket.status = "blocked"
    ticket.append_log(f"blocked: {args.reason}", args.today or date.today().isoformat())
    save(args, ticket)
    emit(f"{ticket.id} blocked")
    return 0


def cmd_log(args: argparse.Namespace) -> int:
    ticket = store.find(load(args), args.id)
    ticket.append_log(args.message, args.today or date.today().isoformat())
    save(args, ticket)
    emit(f"{ticket.id} logged")
    return 0


def cmd_done(args: argparse.Namespace) -> int:
    ticket = store.find(load(args), args.id)
    store.check_transition(ticket, "done")
    if not args.evidence.strip():
        raise TicketError("done requires --evidence with the check that was run")
    ticket.status = "done"
    ticket.append_log(f"evidence: {args.evidence}", args.today or date.today().isoformat())
    save(args, ticket)
    emit(f"{ticket.id} done")
    return 0


def cmd_check(args: argparse.Namespace) -> int:
    tickets = load(args)
    _, roles, requirements = store_paths(args)
    errors = store.validate(tickets, roles, requirements)
    if errors:
        for error in errors:
            sys.stderr.write(f"error: {error}\n")
        return 1
    emit(f"ok: {len(tickets)} tickets")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="torviello_roles", description=__doc__)
    parser.add_argument("--root", help="store root (defaults to the torviello-roles directory)")
    parser.add_argument("--today", help=argparse.SUPPRESS)
    subparsers = parser.add_subparsers(dest="command", required=True)

    new = subparsers.add_parser("new", help="create a ticket")
    new.add_argument("title")
    new.add_argument("--owner", default=store.UNASSIGNED)
    new.add_argument("--priority", choices=store.PRIORITIES, default="P2")
    new.add_argument("--status", choices=store.STATUSES, default="backlog")
    new.add_argument("--requires", action="append", help="requirement id (repeatable)")
    new.add_argument("--controls", action="append", help="control id (repeatable)")
    new.add_argument("--depends-on", action="append", help="ticket id (repeatable)")
    new.add_argument("--label", action="append", help="label (repeatable, comma-separated)")
    new.add_argument("--outcome", help="observable outcome")
    new.add_argument("--acceptance", action="append", help="acceptance check (repeatable)")
    new.set_defaults(func=cmd_new)

    listing = subparsers.add_parser("list", help="list tickets")
    listing.add_argument("--status", action="append")
    listing.add_argument("--owner")
    listing.add_argument("--priority", action="append")
    listing.add_argument("--all", action="store_true", help="include done and cancelled tickets")
    listing.add_argument("--json", action="store_true")
    listing.set_defaults(func=cmd_list)

    show = subparsers.add_parser("show", help="show one ticket")
    show.add_argument("id")
    show.add_argument("--json", action="store_true")
    show.set_defaults(func=cmd_show)

    brief = subparsers.add_parser("brief", help="print the session brief")
    brief.add_argument("--json", action="store_true")
    brief.set_defaults(func=cmd_brief)

    report = subparsers.add_parser("report", help="build a status report from the store")
    report.add_argument("--format", choices=("markdown", "json"), default="markdown")
    report.add_argument("--since", help="ISO date for completed work (default: today - 7 days)")
    report.set_defaults(func=cmd_report)

    start = subparsers.add_parser("start", help="move a ticket to in_progress")
    start.add_argument("id")
    start.set_defaults(func=cmd_start)

    move = subparsers.add_parser("move", help="move a ticket to an allowed status")
    move.add_argument("id")
    move.add_argument("status", choices=store.STATUSES)
    move.add_argument("--reason")
    move.set_defaults(func=cmd_move)

    block = subparsers.add_parser("block", help="block a ticket with a reason")
    block.add_argument("id")
    block.add_argument("--reason", required=True)
    block.set_defaults(func=cmd_block)

    log = subparsers.add_parser("log", help="append a dated note")
    log.add_argument("id")
    log.add_argument("message")
    log.set_defaults(func=cmd_log)

    done = subparsers.add_parser("done", help="close a ticket with evidence")
    done.add_argument("id")
    done.add_argument("--evidence", required=True)
    done.set_defaults(func=cmd_done)

    check = subparsers.add_parser("check", help="validate the ticket store")
    check.set_defaults(func=cmd_check)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except TicketError as error:
        return fail(str(error))


if __name__ == "__main__":
    raise SystemExit(main())
