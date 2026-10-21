#!/usr/bin/env python3
# Copyright (c) 2026 Torviello.
"""Human-readable tester for the HTTP status contract.

Checks the policy catalog, its JSON Schema, every generated status schema, and
the examples embedded in those schemas. Exit status is 0 only when all checks
pass.

Usage:
    python contracts/tools/status_tester.py
    python contracts/tools/status_tester.py --verbose
    python contracts/tools/status_tester.py --json
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

import yaml
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "schemas" / "common" / "http-status.yaml"
CATALOG_SCHEMA = ROOT / "http-status.catalog.schema.json"
STATUS_DIR = ROOT / "schemas" / "common" / "status"
OPENAPI = ROOT / "openapi.yaml"


@dataclass
class Finding:
    level: str
    scope: str
    message: str
    path: str = ""


@dataclass
class Report:
    checks: int = 0
    passed: int = 0
    failures: list[Finding] = field(default_factory=list)
    warnings: list[Finding] = field(default_factory=list)
    statuses: list[dict[str, Any]] = field(default_factory=list)
    examples_checked: int = 0
    operations: dict[str, int] = field(default_factory=dict)

    @property
    def ok(self) -> bool:
        return not self.failures

    def pass_check(self) -> None:
        self.checks += 1
        self.passed += 1

    def fail(self, scope: str, message: str, path: str = "") -> None:
        self.checks += 1
        self.failures.append(Finding("FAIL", scope, message, path))

    def warn(self, scope: str, message: str, path: str = "") -> None:
        self.warnings.append(Finding("WARN", scope, message, path))


def _load_yaml(path: Path) -> dict[str, Any]:
    loaded = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(loaded, dict):
        raise ValueError(f"expected a mapping in {path}")
    return loaded


def _load_json(path: Path) -> dict[str, Any]:
    loaded = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(loaded, dict):
        raise ValueError(f"expected an object in {path}")
    return loaded


def _registry() -> Registry:
    resources = []
    for path in sorted((ROOT / "schemas").rglob("*.schema.json")):
        try:
            schema = _load_json(path)
        except (json.JSONDecodeError, ValueError):
            continue
        identifier = schema.get("$id")
        if isinstance(identifier, str):
            resources.append((identifier, Resource.from_contents(schema)))
    return Registry().with_resources(resources)


def _walk_refs(node: Any):
    if isinstance(node, list):
        for item in node:
            yield from _walk_refs(item)
    elif isinstance(node, dict):
        ref = node.get("$ref")
        if isinstance(ref, str):
            yield ref
        for value in node.values():
            yield from _walk_refs(value)


def _check_refs(report: Report, scope: str, schema: dict[str, Any], registry: Registry) -> None:
    resolver = registry.resolver(schema.get("$id", ""))
    for ref in _walk_refs(schema):
        try:
            resolver.lookup(ref)
        except Exception as exc:  # noqa: BLE001 - reported as a human-readable finding
            report.fail(scope, f"unresolvable $ref {ref!r}: {exc}")


def _schema_errors(validator: Draft202012Validator, instance: Any) -> list[str]:
    errors = []
    for error in sorted(validator.iter_errors(instance), key=lambda item: item.json_path):
        errors.append(f"{error.json_path or '$'}: {error.message}")
    return errors


def _check_catalog_schema(
    report: Report, catalog: dict[str, Any], schema: dict[str, Any]
) -> bool:
    try:
        Draft202012Validator.check_schema(schema)
    except Exception as exc:  # noqa: BLE001 - reported as a human-readable finding
        report.fail("catalog schema", f"invalid JSON Schema: {exc}")
        return False
    report.pass_check()

    normalized = json.loads(json.dumps(catalog))
    errors = _schema_errors(Draft202012Validator(schema), normalized)
    if errors:
        for error in errors:
            report.fail("catalog", error)
        return False
    report.pass_check()
    return True


def _check_coverage(report: Report, catalog: dict[str, Any]) -> None:
    codes = [entry["code"] for entry in catalog.get("assigned", [])]
    if len(codes) != len(set(codes)):
        duplicates = sorted({code for code in codes if codes.count(code) > 1})
        report.fail("coverage", f"duplicate status codes: {duplicates}")
    else:
        report.pass_check()

    covered: set[int] = set(codes)
    for item in catalog.get("unassigned", []):
        bounds = str(item).split("-")
        covered.update(range(int(bounds[0]), int(bounds[-1]) + 1))
    missing = sorted(set(range(100, 600)) - covered)
    extra = sorted(covered - set(range(100, 600)))
    if missing or extra:
        report.fail(
            "coverage",
            f"catalog does not partition 100-599: missing={missing[:10]} extra={extra[:10]}",
        )
    else:
        report.pass_check()


def _check_body(report: Report, scope: str, entry: dict[str, Any]) -> None:
    if entry["body"] == "problem+json":
        if entry["content_type"] != "application/problem+json":
            report.fail(scope, "problem+json body must use application/problem+json")
        if entry["schema"] != "ErrorEnvelope":
            report.fail(scope, "problem+json body must use ErrorEnvelope")
        if entry["engine"] == "used" and not entry["error_codes"]:
            report.fail(scope, "problem+json status must declare at least one error code")
    if entry["body"] == "envelope" and entry["schema"] not in {"Envelope", "per-operation"}:
        report.fail(scope, "envelope body must use Envelope or a per-operation schema")
    if entry["body"] == "none" and entry["content_type"] is not None:
        report.fail(scope, "bodyless status must not declare a content type")


def _check_catalog_entry(
    report: Report,
    entry: dict[str, Any],
    classes: dict[str, str],
    headers: dict[str, Any],
) -> None:
    code = entry["code"]
    scope = f"{code}"
    expected_class = classes[str(code // 100)]
    if entry["class"] != expected_class:
        report.fail(
            scope,
            f"class {entry['class']!r} does not match code class {expected_class!r}",
        )
    if entry["engine"] == "not-used":
        if entry["content_type"] is not None or entry["schema"] is not None:
            report.fail(scope, "not-used status must not declare response content")
        if entry["error_codes"] or entry["required_headers"]:
            report.fail(scope, "not-used status must not declare error codes or required headers")
        return
    if entry["retry"] == "retry-after" and "Retry-After" not in entry["required_headers"]:
        report.fail(scope, "retry-after policy requires the Retry-After header")
    for name in entry["required_headers"] + entry["optional_headers"]:
        if name not in headers:
            report.fail(scope, f"header {name!r} has no rule in the catalog headers map")
    _check_body(report, scope, entry)


def _check_catalog(report: Report, catalog: dict[str, Any], schema: dict[str, Any]) -> None:
    if not _check_catalog_schema(report, catalog, schema):
        return
    _check_coverage(report, catalog)
    classes = {str(key): value for key, value in catalog["classes"].items()}
    headers = catalog.get("headers", {})
    for entry in catalog.get("assigned", []):
        _check_catalog_entry(report, entry, classes, headers)
    report.pass_check()


def _check_contract(
    report: Report,
    scope: str,
    entry: dict[str, Any],
    contract: dict[str, Any],
) -> None:
    expected = {
        "content_type": entry["content_type"],
        "schema": entry["schema"],
        "required_headers": entry["required_headers"],
        "optional_headers": entry["optional_headers"],
        "cache_control": entry["cache_control"],
        "retry": entry["retry"],
        "body_fields": entry["body_fields"],
        "forbidden_body_fields": entry["forbidden_body_fields"],
        "error_codes": entry["error_codes"],
        "error_category": entry["error_category"],
        "retryable": entry["retryable"],
        "trigger": entry["trigger"],
    }
    for key, value in expected.items():
        if contract.get(key) != value:
            report.fail(scope, f"x-response-contract.{key} drift")


def _check_examples(
    report: Report,
    scope: str,
    schema: dict[str, Any],
    registry: Registry,
) -> int:
    checked = 0
    validator = Draft202012Validator(schema, registry=registry)
    for index, example in enumerate(schema.get("examples", [])):
        checked += 1
        for error in _schema_errors(validator, example):
            report.fail(scope, f"examples[{index}] {error}")
    return checked


def _check_status_schema(
    report: Report,
    code: int,
    entry: dict[str, Any],
    path: Path,
    registry: Registry,
) -> int:
    scope = path.name
    try:
        schema = _load_json(path)
    except (json.JSONDecodeError, ValueError) as exc:
        report.fail(scope, f"invalid JSON: {exc}")
        return 0
    try:
        Draft202012Validator.check_schema(schema)
    except Exception as exc:  # noqa: BLE001 - reported as a human-readable finding
        report.fail(scope, f"invalid JSON Schema: {exc}")
        return 0
    report.pass_check()

    _check_refs(report, scope, schema, registry)
    if schema.get("x-status") != code:
        report.fail(scope, f"x-status {schema.get('x-status')!r} != {code}")
    if schema.get("x-engine-use") != entry["engine"]:
        report.fail(scope, "x-engine-use drift")
    if schema.get("x-response-body") != entry["body"]:
        report.fail(scope, "x-response-body drift")
    contract = schema.get("x-response-contract")
    if not isinstance(contract, dict):
        report.fail(scope, "missing x-response-contract")
        return 0
    _check_contract(report, scope, entry, contract)
    if schema.get("x-required-headers", []) != entry["required_headers"]:
        report.fail(scope, "x-required-headers drift")
    rules = schema.get("x-header-rules", {})
    for name in entry["required_headers"]:
        if name not in rules:
            report.fail(scope, f"missing x-header-rules entry for {name}")

    report.statuses.append(
        {
            "code": code,
            "name": entry["name"],
            "engine": entry["engine"],
            "content_type": entry["content_type"],
            "required_headers": entry["required_headers"],
            "retry": entry["retry"],
        }
    )
    return _check_examples(report, scope, schema, registry)


def _check_operation(
    report: Report,
    operation_id: str,
    responses: dict[str, Any],
    entries: dict[int, dict[str, Any]],
    declared: set[int],
) -> bool:
    for status in responses:
        if not str(status).isdigit():
            report.fail("openapi", f"{operation_id} has non-numeric status {status!r}")
            continue
        code = int(status)
        declared.add(code)
        if code not in entries:
            report.fail("openapi", f"{operation_id} uses undeclared status {code}")
        elif entries[code]["engine"] == "not-used":
            report.fail("openapi", f"{operation_id} uses prohibited status {code}")
    if "500" not in responses:
        report.fail("openapi", f"{operation_id} does not declare 500")
    return "501" in responses


def _check_openapi(report: Report, catalog: dict[str, Any]) -> None:
    try:
        document = _load_yaml(OPENAPI)
    except (OSError, yaml.YAMLError, ValueError) as exc:
        report.fail("openapi", f"cannot load {OPENAPI}: {exc}")
        return
    entries = {entry["code"]: entry for entry in catalog["assigned"]}
    declared: set[int] = set()
    total = 0
    stubs = 0
    for path, path_item in document.get("paths", {}).items():
        for method, operation in path_item.items():
            if method not in {"get", "post", "put", "patch", "delete"}:
                continue
            total += 1
            operation_id = operation.get("operationId", f"{method} {path}")
            if _check_operation(
                report,
                operation_id,
                operation.get("responses", {}),
                entries,
                declared,
            ):
                stubs += 1
    used = {code for code, entry in entries.items() if entry["engine"] == "used"}
    missing = sorted(used - declared)
    if missing:
        report.fail("openapi", f"used statuses not declared by any operation: {missing}")
    else:
        report.pass_check()
    report.operations = {"total": total, "implemented": total - stubs, "reserved": stubs}
    report.pass_check()


def _check_schemas(
    report: Report,
    catalog: dict[str, Any],
    registry: Registry,
) -> None:
    entries = {entry["code"]: entry for entry in catalog["assigned"]}
    files = {int(path.name.split(".")[0]): path for path in STATUS_DIR.glob("*.schema.json")}
    if set(files) != set(entries):
        report.fail(
            "status files",
            f"expected one schema per assigned code; missing={sorted(set(entries) - set(files))} "
            f"orphan={sorted(set(files) - set(entries))}",
        )
    else:
        report.pass_check()

    examples_checked = 0
    for code, entry in sorted(entries.items()):
        path = files.get(code)
        if path is not None:
            examples_checked += _check_status_schema(report, code, entry, path, registry)
    report.examples_checked = examples_checked
    report.pass_check()


def run() -> Report:
    report = Report()
    try:
        catalog = _load_yaml(CATALOG)
    except (OSError, yaml.YAMLError, ValueError) as exc:
        report.fail("catalog", f"cannot load {CATALOG}: {exc}")
        return report
    try:
        schema = _load_json(CATALOG_SCHEMA)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        report.fail("catalog schema", f"cannot load {CATALOG_SCHEMA}: {exc}")
        return report

    _check_catalog(report, catalog, schema)
    _check_openapi(report, catalog)
    _check_schemas(report, catalog, _registry())
    return report


def _human(report: Report, verbose: bool) -> str:
    lines = [
        "HTTP status contract tester",
        f"Catalog: {CATALOG.relative_to(ROOT.parent)}",
        f"Schema:  {CATALOG_SCHEMA.relative_to(ROOT.parent)}",
        f"Status:  {STATUS_DIR.relative_to(ROOT.parent)}",
        f"OpenAPI: {OPENAPI.relative_to(ROOT.parent)}",
        "-" * 72,
    ]
    if report.operations:
        lines.append(
            f"Operations: {report.operations['total']} "
            f"({report.operations['implemented']} implemented, "
            f"{report.operations['reserved']} reserved)"
        )
    if verbose:
        for status in report.statuses:
            headers = ",".join(status["required_headers"]) or "-"
            lines.append(
                f"{status['code']}  {status['name']:<38} {status['engine']:<11} "
                f"{status['content_type'] or '-':<28} {headers:<20} {status['retry']}"
            )
        lines.append("-" * 72)
    for failure in report.failures:
        location = f" ({failure.path})" if failure.path else ""
        lines.append(f"FAIL  {failure.scope}: {failure.message}{location}")
    for warning in report.warnings:
        location = f" ({warning.path})" if warning.path else ""
        lines.append(f"WARN  {warning.scope}: {warning.message}{location}")
    if report.ok:
        lines.append(
            f"PASS  {report.passed} checks, 0 failures, {len(report.warnings)} warnings, "
        f"{len(report.statuses)} statuses, {report.examples_checked} examples"
        )
    else:
        lines.append(
            f"FAIL  {len(report.failures)} failures, {len(report.warnings)} warnings"
        )
    return "\n".join(lines)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="emit a machine-readable report")
    parser.add_argument("--verbose", action="store_true", help="list every status contract")
    args = parser.parse_args(argv[1:])

    report = run()
    if args.json:
        payload = {
            "ok": report.ok,
            "checks": report.checks,
            "passed": report.passed,
            "failures": [asdict(item) for item in report.failures],
            "warnings": [asdict(item) for item in report.warnings],
            "examples_checked": report.examples_checked,
            "operations": report.operations,
            "statuses": report.statuses,
        }
        sys.stdout.write(json.dumps(payload, indent=2) + "\n")
    else:
        sys.stdout.write(_human(report, args.verbose) + "\n")
    return 0 if report.ok else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
