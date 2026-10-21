#!/usr/bin/env python3
# Copyright (c) 2026 Torviello.
"""Generate and validate the engine contract schema artifacts.

Layout:
  contracts/schemas/<domain>/<Component>.schema.json
  contracts/schemas/operations/<domain>/<operationId>.<status>.schema.json
  contracts/schemas/common/status/<code>.schema.json
  contracts/events/schemas/<domain>/<event>.schema.json
  contracts/events/asyncapi.yaml

Source of truth:
  contracts/openapi.yaml
  contracts/events/catalog.yaml

Run `python contracts/tools/contracts.py generate` after editing a source.
Run `python contracts/tools/contracts.py check` in CI.
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path
from typing import Any

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
from status import status_schemas  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OPENAPI = ROOT / "openapi.yaml"
CATALOG = ROOT / "events" / "catalog.yaml"
SCHEMA_DIR = ROOT / "schemas"
OPERATIONS_DIR = SCHEMA_DIR / "operations"
EVENT_SCHEMA_DIR = ROOT / "events" / "schemas"
ASYNCAPI = ROOT / "events" / "asyncapi.yaml"

SCHEMA_BASE = "https://torviello.local/contracts/schemas"
EVENT_SCHEMA_BASE = "https://torviello.local/contracts/events/schemas"
REF_PREFIX = "#/components/schemas/"

TYPE_MAP = {
    "string": {"type": "string"},
    "integer": {"type": "integer"},
    "number": {"type": "number"},
    "boolean": {"type": "boolean"},
    "object": {"type": "object"},
}

COMPONENT_DOMAINS = {
    "Envelope": "common",
    "Meta": "common",
    "ErrorEnvelope": "common",
    "HealthSnapshot": "health",
    "Liveness": "health",
    "Readiness": "health",
    "ModelSummary": "catalog",
    "ModelDetail": "catalog",
    "ModelSlot": "models",
    "DownloadRequest": "models",
    "DownloadJob": "models",
    "DownloadProgressEvent": "models",
    "ModelRegistration": "models",
    "TtsRequest": "speech",
    "SttRequest": "speech",
    "Transcript": "speech",
    "ClassifyRequest": "vision",
    "Classification": "vision",
    "DetectRequest": "vision",
    "DetectionResult": "vision",
    "ChatRequest": "assistant",
    "ChatResponse": "assistant",
    "ChatStreamEvent": "assistant",
    "SystemInfo": "system",
    "LogView": "system",
}

TAG_DOMAINS = {
    "Health": "health",
    "Catalog": "catalog",
    "Models": "models",
    "Speech": "speech",
    "Vision": "vision",
    "Assistant": "assistant",
    "Observability": "observability",
    "Administration": "administration",
}

EVENT_DOMAINS = {
    "engine": "lifecycle",
    "config": "configuration",
    "model": "models",
    "inference": "inference",
    "stream": "streaming",
    "session": "streaming",
    "auth": "security",
    "ratelimit": "limits",
    "limit": "limits",
    "backend": "operations",
    "circuit": "operations",
    "metric": "operations",
    "log": "operations",
}


def _load_yaml(path: Path) -> dict[str, Any]:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def _relative(source: Path, target: Path) -> str:
    return os.path.relpath(target, source.parent).replace(os.sep, "/")


def _component_path(name: str) -> Path:
    return SCHEMA_DIR / COMPONENT_DOMAINS[name] / f"{name}.schema.json"


def _event_path(name: str) -> Path:
    return EVENT_SCHEMA_DIR / EVENT_DOMAINS[name.split(".", 1)[0]] / f"{name}.schema.json"


def _operation_path(operation: dict[str, Any], key: str) -> Path:
    tags = operation.get("tags") or ["Observability"]
    domain = TAG_DOMAINS.get(tags[0], "other")
    return OPERATIONS_DIR / domain / f"{key}.schema.json"


def _drop_nullable(node: Any) -> Any:
    if isinstance(node, list):
        return [_drop_nullable(item) for item in node]
    if not isinstance(node, dict):
        return node
    node = {key: _drop_nullable(value) for key, value in node.items()}
    if node.pop("nullable", False) is True and isinstance(node.get("type"), str):
        node["type"] = [node["type"], "null"]
    return node


def _rewrite_refs(node: Any, source: Path, components: dict[str, Path]) -> Any:
    if isinstance(node, list):
        return [_rewrite_refs(item, source, components) for item in node]
    if not isinstance(node, dict):
        return node
    result = {key: _rewrite_refs(value, source, components) for key, value in node.items()}
    ref = result.get("$ref")
    if isinstance(ref, str) and ref.startswith(REF_PREFIX):
        name = ref.removeprefix(REF_PREFIX)
        result["$ref"] = _relative(source, components[name])
    return result


def _component_paths() -> dict[str, Path]:
    document = _load_yaml(OPENAPI)
    return {name: _component_path(name) for name in document["components"]["schemas"]}


def _resolve_local(document: dict[str, Any], value: dict[str, Any]) -> dict[str, Any]:
    ref = value.get("$ref")
    if not isinstance(ref, str) or not ref.startswith("#/"):
        return value
    target: Any = document
    for part in ref.removeprefix("#/").split("/"):
        target = target[part.replace("~1", "/").replace("~0", "~")]
    return target


def _structured(content: dict[str, Any]) -> list[tuple[str, dict[str, Any]]]:
    structured: list[tuple[str, dict[str, Any]]] = []
    for media_type, media in content.items():
        schema = media.get("schema") if isinstance(media, dict) else None
        if isinstance(schema, dict):
            structured.append((media_type, schema))
    return structured


def component_schemas() -> dict[Path, dict[str, Any]]:
    document = _load_yaml(OPENAPI)
    components = _component_paths()
    schemas: dict[Path, dict[str, Any]] = {}
    for name, schema in document["components"]["schemas"].items():
        path = components[name]
        body = _rewrite_refs(_drop_nullable(schema), path, components)
        schemas[path] = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": f"{SCHEMA_BASE}/{COMPONENT_DOMAINS[name]}/{name}.schema.json",
            "title": name,
            **body,
        }
    return schemas


def operation_schemas() -> dict[Path, dict[str, Any]]:
    document = _load_yaml(OPENAPI)
    components = _component_paths()
    schemas: dict[Path, dict[str, Any]] = {}
    for path_item in document["paths"].values():
        for method, operation in path_item.items():
            if method not in {"get", "post", "put", "patch", "delete"}:
                continue
            operation_id = operation["operationId"]
            request_body = _resolve_local(document, operation.get("requestBody", {}))
            for media_type, schema in _structured(request_body.get("content", {})):
                key = f"{operation_id}.request.{media_type.split('/')[-1].replace('+', '-')}"
                path = _operation_path(operation, key)
                body = _rewrite_refs(_drop_nullable(schema), path, components)
                schemas[path] = {
                    "$schema": "https://json-schema.org/draft/2020-12/schema",
                    "$id": f"{SCHEMA_BASE}/operations/{path.parent.name}/{key}.schema.json",
                    "title": f"{operation_id} request ({media_type})",
                    **body,
                }
            for status, response in operation.get("responses", {}).items():
                resolved = _resolve_local(document, response)
                for media_type, schema in _structured(resolved.get("content", {})):
                    if media_type not in {"application/json", "application/problem+json"}:
                        continue
                    key = f"{operation_id}.{status}"
                    path = _operation_path(operation, key)
                    body = _rewrite_refs(_drop_nullable(schema), path, components)
                    schemas[path] = {
                        "$schema": "https://json-schema.org/draft/2020-12/schema",
                        "$id": f"{SCHEMA_BASE}/operations/{path.parent.name}/{key}.schema.json",
                        "title": f"{operation_id} response {status}",
                        **body,
                    }
    return schemas


def _field_schema(spec: str) -> tuple[dict[str, Any], bool]:
    optional = spec.endswith("?")
    name = spec.removesuffix("?")
    if name.endswith("[]"):
        item = TYPE_MAP[name.removesuffix("[]")].copy()
        schema: dict[str, Any] = {"type": "array", "items": item}
    else:
        schema = TYPE_MAP[name].copy()
    if optional and isinstance(schema["type"], str):
        schema["type"] = [schema["type"], "null"]
    return schema, optional


def event_schemas() -> tuple[dict[Path, dict[str, Any]], dict[str, Any]]:
    catalog = _load_yaml(CATALOG)
    envelope = catalog["envelope"]
    schemas: dict[Path, dict[str, Any]] = {}
    for event in catalog["events"]:
        name = event["name"]
        path = _event_path(name)
        properties = {key: dict(value) for key, value in envelope["properties"].items()}
        required = list(envelope["required"])
        properties["event_type"] = {"type": "string", "const": name}
        for field, spec in event["payload"].items():
            properties[field], optional = _field_schema(spec)
            if not optional and field not in required:
                required.append(field)
        schemas[path] = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": f"{EVENT_SCHEMA_BASE}/{path.parent.name}/{name}.schema.json",
            "title": name,
            "description": event["description"],
            "type": "object",
            "required": required,
            "properties": properties,
            "x-requirement": event["requirement"],
        }
    return schemas, catalog


def asyncapi(catalog: dict[str, Any]) -> dict[str, Any]:
    names = {event["name"] for event in catalog["events"]}
    messages: dict[str, Any] = {}

    def message(key: str, event: str) -> None:
        if key not in messages:
            if event in names:
                payload: dict[str, Any] = {"$ref": _relative(ASYNCAPI, _event_path(event))}
                messages[key] = {"name": key, "payload": payload}
            else:
                messages[key] = {
                    "name": key,
                    "contentType": "audio/pcm",
                    "payload": {"type": "string", "contentEncoding": "base64"},
                }

    message("DownloadProgress", "model.download_progress")
    message("DownloadVerified", "model.download_verified")
    message("DownloadFailed", "model.download_failed")
    message("ModelActivated", "model.activated")
    messages["ChatStreamEvent"] = {
        "name": "ChatStreamEvent",
        "payload": {"$ref": _relative(ASYNCAPI, _component_path("ChatStreamEvent"))},
    }
    message("AudioChunk", "audio.chunk")
    for event in [
        "stream.opened",
        "stream.first_frame",
        "stream.completed",
        "stream.failed",
        "stream.disconnected",
        "session.opened",
        "session.configured",
        "session.error",
        "session.closed",
    ]:
        message(event, event)

    channels = {
        "modelDownloadProgress": {
            "address": "/models/{modelId}/download/progress",
            "messages": {
                "progress": {"$ref": "#/components/messages/DownloadProgress"},
                "verified": {"$ref": "#/components/messages/DownloadVerified"},
                "failed": {"$ref": "#/components/messages/DownloadFailed"},
                "activated": {"$ref": "#/components/messages/ModelActivated"},
            },
        },
        "ttsStream": {
            "address": "/tts/stream",
            "messages": {"chunk": {"$ref": "#/components/messages/AudioChunk"}},
        },
        "chatStream": {
            "address": "/v1/chat/completions",
            "messages": {"delta": {"$ref": "#/components/messages/ChatStreamEvent"}},
        },
        "audioSession": {
            "address": "/ws/audio",
            "messages": {
                "opened": {"$ref": "#/components/messages/stream.opened"},
                "firstFrame": {"$ref": "#/components/messages/stream.first_frame"},
                "completed": {"$ref": "#/components/messages/stream.completed"},
                "failed": {"$ref": "#/components/messages/stream.failed"},
                "disconnected": {"$ref": "#/components/messages/stream.disconnected"},
            },
        },
        "classificationSession": {
            "address": "/ws/classify",
            "messages": {
                "opened": {"$ref": "#/components/messages/session.opened"},
                "configured": {"$ref": "#/components/messages/session.configured"},
                "error": {"$ref": "#/components/messages/session.error"},
                "closed": {"$ref": "#/components/messages/session.closed"},
            },
        },
        "detectionSession": {
            "address": "/ws/detect",
            "messages": {
                "opened": {"$ref": "#/components/messages/session.opened"},
                "configured": {"$ref": "#/components/messages/session.configured"},
                "error": {"$ref": "#/components/messages/session.error"},
                "closed": {"$ref": "#/components/messages/session.closed"},
            },
        },
    }
    operations = {
        f"receive_{channel}": {
            "action": "receive",
            "channel": {"$ref": f"#/channels/{channel}"},
        }
        for channel in channels
    }
    return {
        "asyncapi": "3.0.0",
        "info": {
            "title": "Torviello Engine event streams",
            "version": catalog["version"],
            "description": (
                "SSE and WebSocket transport contracts. Domain event payloads "
                "are versioned JSON Schema 2020-12."
            ),
        },
        "defaultContentType": "application/json",
        "servers": {
            "local": {"host": "127.0.0.1:8000", "protocol": "http"},
        },
        "channels": channels,
        "operations": operations,
        "components": {"messages": messages},
    }


def expected_files() -> dict[Path, str]:
    files: dict[Path, str] = {}
    for path, schema in component_schemas().items():
        files[path] = json.dumps(schema, indent=2) + "\n"
    for path, schema in operation_schemas().items():
        files[path] = json.dumps(schema, indent=2) + "\n"
    for path, schema in status_schemas(SCHEMA_BASE).items():
        files[path] = json.dumps(schema, indent=2) + "\n"
    schemas, catalog = event_schemas()
    for path, schema in schemas.items():
        files[path] = json.dumps(schema, indent=2) + "\n"
    files[ASYNCAPI] = yaml.safe_dump(asyncapi(catalog), sort_keys=False, allow_unicode=True)
    return files


def generate() -> None:
    for directory in (SCHEMA_DIR, EVENT_SCHEMA_DIR):
        directory.mkdir(parents=True, exist_ok=True)
        for stale in directory.rglob("*.schema.json"):
            stale.unlink()
        for child in sorted((path for path in directory.rglob("*") if path.is_dir()), reverse=True):
            if not any(child.iterdir()):
                child.rmdir()
    for path, content in expected_files().items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    sys.stdout.write(f"generated {len(expected_files())} contract artifacts\n")


def _artifact_errors() -> list[str]:
    errors: list[str] = []
    expected = expected_files()
    for path, content in expected.items():
        if not path.exists():
            errors.append(f"missing generated artifact: {path.relative_to(ROOT)}")
        elif path.read_text(encoding="utf-8") != content:
            errors.append(f"stale generated artifact: {path.relative_to(ROOT)} (run generate)")
    for directory in (SCHEMA_DIR, EVENT_SCHEMA_DIR):
        if directory.exists():
            for path in directory.rglob("*.schema.json"):
                if path not in expected:
                    errors.append(f"orphan generated artifact: {path.relative_to(ROOT)}")
    return errors


def _syntax_errors() -> list[str]:
    errors: list[str] = []
    for path in expected_files():
        try:
            if path.suffix == ".json":
                json.loads(path.read_text(encoding="utf-8"))
            elif path.suffix == ".yaml":
                _load_yaml(path)
        except (json.JSONDecodeError, yaml.YAMLError) as exc:
            errors.append(f"invalid {path.suffix} {path.relative_to(ROOT)}: {exc}")
    return errors


def _event_errors() -> list[str]:
    errors: list[str] = []
    events_md = (ROOT.parent / "domain" / "events.md").read_text(encoding="utf-8")
    documented = set(re.findall(r"^\| `([a-z]+\.[a-z_]+)` \|", events_md, re.MULTILINE))
    generated = {event["name"] for event in _load_yaml(CATALOG)["events"]}
    for missing in sorted(documented - generated):
        errors.append(f"event documented but not cataloged: {missing}")
    for extra in sorted(generated - documented):
        errors.append(f"event cataloged but not documented: {extra}")
    return errors


def check() -> list[str]:
    return _artifact_errors() + _syntax_errors() + _event_errors()


def main(argv: list[str]) -> int:
    if len(argv) != 2 or argv[1] not in {"generate", "check"}:
        sys.stderr.write("usage: contracts.py generate|check\n")
        return 2
    if argv[1] == "generate":
        generate()
        return 0
    errors = check()
    for error in errors:
        sys.stderr.write(f"{error}\n")
    if errors:
        return 1
    sys.stdout.write("contract artifacts are current\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
