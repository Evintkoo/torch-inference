# Copyright (c) 2026 Torviello.
"""HTTP status response schema generation.

One JSON Schema is generated per assigned status code from the approved
machine-readable policy in `contracts/schemas/common/http-status.yaml`.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "schemas" / "common" / "http-status.yaml"


def _load_yaml(path: Path) -> dict[str, Any]:
    loaded = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(loaded, dict):
        raise ValueError(f"expected a mapping in {path}")
    return loaded


def _problem_example(code: int, entry: dict[str, Any]) -> dict[str, Any]:
    codes = entry["error_codes"]
    example: dict[str, Any] = {
        "type": f"https://torviello.local/problems/{codes[0].replace('.', '-')}"
        if codes
        else f"https://torviello.local/problems/status-{code}",
        "title": entry["name"],
        "status": code,
        "code": codes[0] if codes else "framework_error",
        "category": entry["error_category"] or "internal",
        "detail": entry["trigger"],
        "instance": "urn:torviello:request:00000000-0000-4000-8000-000000000000",
        "request_id": "00000000-0000-4000-8000-000000000000",
        "retryable": entry["retryable"],
    }
    if entry["retryable"]:
        example["retry_after_ms"] = 60_000
    return example


def _envelope_example() -> dict[str, Any]:
    return {
        "data": {},
        "meta": {
            "latency_ms": 0,
            "model_id": "engine-demo-tensor",
            "postprocessing_applied": False,
            "version": "1.0.0",
            "request_id": "00000000-0000-4000-8000-000000000000",
        },
    }


def _body_schema(body: str) -> dict[str, Any]:
    if body == "envelope":
        return {"$ref": "../Envelope.schema.json"}
    if body == "problem+json":
        return {"$ref": "../ErrorEnvelope.schema.json"}
    if body == "per-operation":
        return {}
    if body in {"none", "location", "upgrade"}:
        return {"type": "null"}
    return {"type": "string"}


def _example(code: int, entry: dict[str, Any]) -> list[Any] | None:
    if entry["body"] == "problem+json" and entry["engine"] != "not-used":
        return [_problem_example(code, entry)]
    if entry["body"] == "envelope":
        return [_envelope_example()]
    if entry["body"] in {"none", "location", "upgrade"}:
        return [None]
    return None


def status_schemas(schema_base: str) -> dict[Path, dict[str, Any]]:
    catalog = _load_yaml(CATALOG)
    header_rules = catalog["headers"]
    schemas: dict[Path, dict[str, Any]] = {}
    for entry in catalog["assigned"]:
        code = entry["code"]
        path = ROOT / "schemas" / "common" / "status" / f"{code}.schema.json"
        body = _body_schema(entry["body"])

        content = (
            f"Content: {entry['content_type']} ({entry['schema']})."
            if entry["content_type"] is not None
            else "Content: none."
        )
        headers = (
            f"Required headers: {', '.join(entry['required_headers'])}."
            if entry["required_headers"]
            else "Required headers: none."
        )
        description = (
            f"{entry['reference']}; class {entry['class']}; engine use: {entry['engine']}.\n"
            f"Trigger: {entry['trigger']}\n{content}\n{headers}\n"
            f"Cache-Control: {entry['cache_control'] or 'none'}; retry: {entry['retry']}."
        )
        contract = {
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
        schema: dict[str, Any] = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": f"{schema_base}/common/status/{code}.schema.json",
            "title": f"{code} {entry['name']}",
            "description": description,
            "x-status": code,
            "x-engine-use": entry["engine"],
            "x-response-body": entry["body"],
            "x-response-contract": contract,
            **body,
        }
        if entry["required_headers"]:
            schema["x-required-headers"] = entry["required_headers"]
        selected_headers = {
            name: header_rules[name]
            for name in entry["required_headers"] + entry["optional_headers"]
            if name in header_rules
        }
        if selected_headers:
            schema["x-header-rules"] = selected_headers
        example = _example(code, entry)
        if example is not None:
            schema["examples"] = example
        schemas[path] = schema
    return schemas
