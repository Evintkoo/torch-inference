"""Structural checks for the generated engine contract artifacts."""

from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator
from openapi_spec_validator import validate
from openapi_spec_validator.readers import read_from_filename

ROOT = Path(__file__).resolve().parents[1]
ENGINE = ROOT / "torviello-engine"
CONTRACTS = ENGINE / "contracts"
SCHEMAS = CONTRACTS / "schemas"
EVENTS = CONTRACTS / "events"
TRACEABILITY = CONTRACTS / "traceability.md"
HTTP_STATUS = SCHEMAS / "common" / "http-status.yaml"
HTTP_STATUS_DOC = SCHEMAS / "common" / "http-response-standards.md"


def _contracts_module():
    path = CONTRACTS / "tools" / "contracts.py"
    spec = importlib.util.spec_from_file_location("engine_contracts", path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _json_files() -> list[Path]:
    return sorted(SCHEMAS.rglob("*.schema.json")) + sorted((EVENTS / "schemas").glob("*.schema.json"))


def _resolve(document, value):
    ref = value.get("$ref")
    if not isinstance(ref, str) or not ref.startswith("#/"):
        return value
    target = document
    for part in ref.removeprefix("#/").split("/"):
        target = target[part.replace("~1", "/").replace("~0", "~")]
    return target


def _walk_refs(node):
    if isinstance(node, list):
        for item in node:
            yield from _walk_refs(item)
    elif isinstance(node, dict):
        ref = node.get("$ref")
        if isinstance(ref, str):
            yield ref
        for value in node.values():
            yield from _walk_refs(value)


def test_generated_artifacts_are_current() -> None:
    assert _contracts_module().check() == []


def test_openapi_document_is_valid() -> None:
    document, base_uri = read_from_filename(str(CONTRACTS / "openapi.yaml"))
    assert base_uri
    validate(document)


def test_every_schema_is_valid_json_schema() -> None:
    for path in _json_files():
        schema = json.loads(path.read_text(encoding="utf-8"))
        Draft202012Validator.check_schema(schema)


def test_every_schema_reference_resolves() -> None:
    schemas = {path.resolve(): json.loads(path.read_text(encoding="utf-8")) for path in _json_files()}
    ids = {schema["$id"]: path for path, schema in schemas.items()}
    for path, schema in schemas.items():
        for ref in _walk_refs(schema):
            if ref.startswith("#"):
                continue
            if ref.startswith("https://"):
                assert ref in ids, f"unresolved $id reference {ref} in {path}"
                continue
            target = (path.parent / ref).resolve()
            assert target in schemas, f"unresolved file reference {ref} in {path}"


def test_asyncapi_references_resolve() -> None:
    document = yaml.safe_load((EVENTS / "asyncapi.yaml").read_text(encoding="utf-8"))
    assert document["asyncapi"].startswith("3.")
    for ref in _walk_refs(document):
        if ".schema.json" not in ref:
            continue
        target = (EVENTS / ref).resolve()
        assert target.is_file(), f"unresolved AsyncAPI payload reference {ref}"


def test_every_openapi_operation_has_generated_schemas() -> None:
    document = yaml.safe_load((CONTRACTS / "openapi.yaml").read_text(encoding="utf-8"))
    generated = {path.name for path in (SCHEMAS / "operations").rglob("*.schema.json")}
    for path_item in document["paths"].values():
        for method, operation in path_item.items():
            if method not in {"get", "post", "put", "patch", "delete"}:
                continue
            operation_id = operation["operationId"]
            request = _resolve(document, operation.get("requestBody", {}))
            if request.get("content"):
                assert any(name.startswith(f"{operation_id}.request.") for name in generated), (
                    f"missing request schema for {operation_id}"
                )
            for status, response in operation.get("responses", {}).items():
                response = _resolve(document, response)
                if "application/json" in response.get("content", {}) or "application/problem+json" in response.get("content", {}):
                    assert f"{operation_id}.{status}.schema.json" in generated, (
                        f"missing response schema for {operation_id} {status}"
                    )


def test_every_component_has_a_standalone_schema() -> None:
    document = yaml.safe_load((CONTRACTS / "openapi.yaml").read_text(encoding="utf-8"))
    for name in document["components"]["schemas"]:
        matches = list(SCHEMAS.rglob(f"{name}.schema.json"))
        assert len(matches) == 1, f"expected one component schema for {name}, found {matches}"
        schema = json.loads(matches[0].read_text(encoding="utf-8"))
        assert schema["$id"].endswith(f"/{name}.schema.json")


def _http_status_catalog() -> dict:
    return yaml.safe_load(HTTP_STATUS.read_text(encoding="utf-8"))



def test_http_status_catalog_matches_its_schema() -> None:
    schema = json.loads(
        (CONTRACTS / "http-status.catalog.schema.json").read_text(encoding="utf-8")
    )
    Draft202012Validator.check_schema(schema)
    Draft202012Validator(schema).validate(json.loads(json.dumps(_http_status_catalog())))


def test_http_status_doc_details_match_the_catalog() -> None:
    catalog = _http_status_catalog()
    text = HTTP_STATUS_DOC.read_text(encoding="utf-8")
    rows = {}
    for line in text.splitlines():
        cells = [cell.strip() for cell in line.split("|")[1:-1]]
        if len(cells) == 7 and cells[0].isdigit():
            rows[int(cells[0])] = cells
    assert set(rows) == {entry["code"] for entry in catalog["assigned"]}
    for entry in catalog["assigned"]:
        row = rows[entry["code"]]
        headers = ", ".join(entry["required_headers"] + entry["optional_headers"]) or "—"
        cache = entry["cache_control"] or "—"
        codes = ", ".join(f"`{code}`" for code in entry["error_codes"]) or "—"
        if entry["error_category"]:
            codes += f"; category `{entry['error_category']}`"
        codes += "; retryable" if entry["retryable"] else "; not retryable"
        assert row[1] == entry["trigger"], f"status {entry['code']} trigger drift"
        assert row[2] == (entry["content_type"] or "—"), f"status {entry['code']} media drift"
        assert row[4] == headers, f"status {entry['code']} header drift"
        assert row[5] == f"{cache}; {entry['retry']}", f"status {entry['code']} cache/retry drift"
        assert row[6] == codes, f"status {entry['code']} error-code drift"

def test_http_status_catalog_covers_every_code() -> None:
    catalog = _http_status_catalog()
    assigned = {entry["code"] for entry in catalog["assigned"]}
    covered = set(assigned)
    for item in catalog["unassigned"]:
        bounds = str(item).split("-")
        start = int(bounds[0])
        end = int(bounds[-1])
        covered.update(range(start, end + 1))
    assert covered == set(range(100, 600)), f"missing: {sorted(set(range(100, 600)) - covered)}"
    total = len(assigned) + sum(
        int(str(item).split("-")[-1]) - int(str(item).split("-")[0]) + 1
        for item in catalog["unassigned"]
    )
    assert total == 500, f"status catalog overlaps: {total} entries for 500 codes"
    for entry in catalog["assigned"]:
        assert entry["engine"] in {"used", "conditional", "not-used"}, entry
        assert entry["body"] in {"none", "envelope", "problem+json", "per-operation", "location", "upgrade", "text", "binary", "sse"}, entry


def test_http_status_doc_matches_the_catalog() -> None:
    catalog = _http_status_catalog()
    text = HTTP_STATUS_DOC.read_text(encoding="utf-8")
    rows = {}
    for line in text.splitlines():
        cells = [cell.strip() for cell in line.split("|")[1:-1]]
        if len(cells) == 5 and cells[0].isdigit():
            rows[int(cells[0])] = cells
    for entry in catalog["assigned"]:
        row = rows.get(entry["code"])
        assert row is not None, f"status {entry['code']} missing from standards document"
        assert row[1] == entry["name"], f"status {entry['code']} name drift"
        assert row[2] == entry["reference"], f"status {entry['code']} reference drift"
        assert row[3] == entry["engine"], f"status {entry['code']} engine drift"
    assert "HPA-4" in text and "assurance-standard.md" in text


def test_one_status_schema_per_assigned_code() -> None:
    catalog = _http_status_catalog()
    status_files = sorted((SCHEMAS / "common" / "status").glob("*.schema.json"))
    assert {int(path.name.split(".")[0]) for path in status_files} == {
        entry["code"] for entry in catalog["assigned"]
    }, "expected exactly one status schema per assigned code"
    for entry in catalog["assigned"]:
        path = SCHEMAS / "common" / "status" / f"{entry['code']}.schema.json"
        schema = json.loads(path.read_text(encoding="utf-8"))
        assert schema["x-status"] == entry["code"]
        assert schema["x-engine-use"] == entry["engine"]
        assert schema["x-response-body"] == entry["body"]


def test_openapi_response_statuses_are_declared_and_allowed() -> None:
    document = yaml.safe_load((CONTRACTS / "openapi.yaml").read_text(encoding="utf-8"))
    catalog = {entry["code"]: entry for entry in _http_status_catalog()["assigned"]}
    for path, path_item in document["paths"].items():
        for method, operation in path_item.items():
            if method not in {"get", "post", "put", "patch", "delete"}:
                continue
            for status in operation.get("responses", {}):
                assert status.isdigit(), f"{method.upper()} {path} has non-numeric status {status}"
                code = int(status)
                assert code in catalog, f"{method.upper()} {path} uses undeclared status {code}"
                assert catalog[code]["engine"] != "not-used", (
                    f"{method.upper()} {path} uses prohibited status {code}"
                )
            assert "500" in operation.get("responses", {}), (
                f"{method.upper()} {path} must declare the internal-error response"
            )
    declared = {
        int(status)
        for operation in (
            op
            for path_item in document["paths"].values()
            for method, op in path_item.items()
            if method in {"get", "post", "put", "patch", "delete"}
        )
        for status in operation.get("responses", {})
        if status.isdigit()
    }
    used = {code for code, entry in catalog.items() if entry["engine"] == "used"}
    assert used <= declared, f"used statuses not declared in OpenAPI: {sorted(used - declared)}"


def test_traceability_operations_and_events_resolve() -> None:
    document = yaml.safe_load((CONTRACTS / "openapi.yaml").read_text(encoding="utf-8"))
    operation_ids = {
        operation["operationId"]
        for path_item in document["paths"].values()
        for method, operation in path_item.items()
        if method in {"get", "post", "put", "patch", "delete"}
    }
    catalog = yaml.safe_load((EVENTS / "catalog.yaml").read_text(encoding="utf-8"))
    event_names = {event["name"] for event in catalog["events"]}
    for line in TRACEABILITY.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| `"):
            continue
        cells = [cell.strip() for cell in line.split("|")[1:-1]]
        for operation in re.findall(r"`([A-Za-z][A-Za-z0-9]+)`", cells[3]):
            assert operation in operation_ids, f"traceability references unknown operation {operation}"
        for event in re.findall(r"`([a-z][a-z0-9]*(?:\.[a-z0-9_]+)+)`", cells[4]):
            if event.endswith(".*"):
                prefix = event.removesuffix(".*") + "."
                assert any(name.startswith(prefix) for name in event_names), event
            else:
                assert event in event_names, f"traceability references unknown event {event}"


def test_every_feature_scenario_is_covered_by_a_traceability_row() -> None:
    rows = {
        line.split("|")[1].strip().strip("`")
        for line in TRACEABILITY.read_text(encoding="utf-8").splitlines()
        if line.startswith("| `")
    }
    for path in (ENGINE / "specifications" / "features").glob("*.feature"):
        text = path.read_text(encoding="utf-8")
        assert "Scenario:" in text, f"{path.name} has no scenario"
        assert path.stem in rows, f"{path.stem} has scenarios but no traceability row"
        tags = {tag.lstrip("@") for tag in re.findall(r"@[A-Za-z0-9_-]+", text.splitlines()[0])}
        assert any(tag.startswith("AC-ENG-") for tag in tags), f"{path.name} has no acceptance tag"


def test_every_feature_has_a_traceability_row() -> None:
    features = {path.stem for path in (ENGINE / "specifications" / "features").glob("*.feature")}
    rows = {
        match.group(1)
        for line in TRACEABILITY.read_text(encoding="utf-8").splitlines()
        if line.startswith("| `")
        for match in [re.match(r"\| `([^`]+)`", line)]
        if match
    }
    assert features, "no feature specifications found"
    assert features - rows == set(), f"features missing from traceability: {sorted(features - rows)}"
    assert rows - features == set(), f"traceability rows without a feature: {sorted(rows - features)}"
