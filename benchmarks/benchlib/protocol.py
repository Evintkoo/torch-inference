# Copyright (c) 2026 Torviello.
from __future__ import annotations

import base64
import concurrent.futures
import hashlib
import hmac
import http.client
import json
import math
import struct
import time
import zlib
from typing import Any

from benchlib.paths import MODEL_ID

BOUNDARY = "torviello-bench-boundary"


def _png_chunk(kind: bytes, payload: bytes) -> bytes:
    checksum = zlib.crc32(kind + payload) & 0xFFFF_FFFF
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", checksum)


def make_png(width: int, height: int, color: tuple[int, int, int]) -> bytes:
    row = b"\x00" + bytes(color) * width
    raw = row * height
    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + _png_chunk(b"IHDR", header)
        + _png_chunk(b"IDAT", zlib.compress(raw, 9))
        + _png_chunk(b"IEND", b"")
    )


def _base64url(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def make_jwt(secret: str, lifetime_seconds: int = 3600) -> str:
    header = _base64url(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    claims = _base64url(
        json.dumps(
            {
                "sub": "benchmark",
                "roles": ["admin"],
                "actor": "classify-bench",
                "exp": int(time.time()) + lifetime_seconds,
            }
        ).encode()
    )
    signing_input = f"{header}.{claims}".encode()
    signature = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    return f"{header}.{claims}.{_base64url(signature)}"


def multipart_body(image: bytes, top_k: int = 1) -> bytes:
    lines = [
        f"--{BOUNDARY}\r\n".encode(),
        b'Content-Disposition: form-data; name="images"; filename="image.png"\r\n',
        b"Content-Type: image/png\r\n\r\n",
        image,
        b"\r\n",
        f"--{BOUNDARY}\r\n".encode(),
        b'Content-Disposition: form-data; name="model_id"\r\n\r\n',
        MODEL_ID.encode(),
        b"\r\n",
        f"--{BOUNDARY}\r\n".encode(),
        b'Content-Disposition: form-data; name="top_k"\r\n\r\n',
        str(top_k).encode(),
        b"\r\n",
        f"--{BOUNDARY}--\r\n".encode(),
    ]
    return b"".join(lines)


def percentile(values: list[float], fraction: float) -> float:
    if not values:
        raise ValueError("percentile requires at least one value")
    ordered = sorted(values)
    rank = max(1, math.ceil(fraction * len(ordered)))
    return ordered[rank - 1]


def _http_request(
    connection: http.client.HTTPConnection,
    method: str,
    path: str,
    body: bytes | None = None,
    headers: dict[str, str] | None = None,
) -> tuple[int, bytes]:
    connection.request(method, path, body=body, headers=headers or {})
    response = connection.getresponse()
    return response.status, response.read()


def _wait_for_live(port: int, timeout_seconds: float) -> float:
    started = time.perf_counter()
    deadline = started + timeout_seconds
    while time.perf_counter() < deadline:
        connection = http.client.HTTPConnection("127.0.0.1", port, timeout=1)
        try:
            status, _ = _http_request(connection, "GET", "/health/live")
            if status == 200:
                return (time.perf_counter() - started) * 1000
        except OSError:
            pass
        finally:
            connection.close()
        time.sleep(0.05)
    raise TimeoutError(f"engine did not become live within {timeout_seconds}s")


def _wait_for_ready(port: int, token: str, timeout_seconds: float) -> float:
    started = time.perf_counter()
    deadline = started + timeout_seconds
    headers = {"Authorization": f"Bearer {token}"}
    while time.perf_counter() < deadline:
        connection = http.client.HTTPConnection("127.0.0.1", port, timeout=1)
        try:
            status, _ = _http_request(connection, "GET", "/health/ready", headers=headers)
            if status == 200:
                return (time.perf_counter() - started) * 1000
        except OSError:
            pass
        finally:
            connection.close()
        time.sleep(0.05)
    raise TimeoutError(f"engine did not become ready within {timeout_seconds}s")


def post_json(
    port: int, path: str, token: str, payload: dict[str, Any], timeout: float = 30
) -> tuple[int, dict[str, Any]]:
    body = json.dumps(payload).encode()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Content-Length": str(len(body)),
    }
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=timeout)
    try:
        status, response = _http_request(connection, "POST", path, body, headers)
    finally:
        connection.close()
    return status, json.loads(response) if response else {}


def classify_request(
    connection: http.client.HTTPConnection, token: str, image: bytes, top_k: int = 1
) -> tuple[int, dict[str, Any]]:
    body = multipart_body(image, top_k)
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": f"multipart/form-data; boundary={BOUNDARY}",
        "Content-Length": str(len(body)),
    }
    status, response = _http_request(connection, "POST", "/classify", body, headers)
    return status, json.loads(response) if response else {}


def _run_worker(
    port: int, token: str, image: bytes, requests: int
) -> tuple[list[float], list[str]]:
    latencies: list[float] = []
    errors: list[str] = []
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=30)
    try:
        connection.connect()
        for _ in range(requests):
            started = time.perf_counter()
            try:
                status, body = classify_request(connection, token, image)
            except OSError as error:
                errors.append(type(error).__name__)
                continue
            latencies.append((time.perf_counter() - started) * 1000)
            if status != 200:
                errors.append(f"status={status} code={body.get('code', 'unknown')}")
    finally:
        connection.close()
    return latencies, errors


def run_workload(
    port: int, token: str, image: bytes, requests: int, concurrency: int
) -> dict[str, Any]:
    base, remainder = divmod(requests, concurrency)
    started = time.perf_counter()
    latencies: list[float] = []
    errors: list[str] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [
            executor.submit(_run_worker, port, token, image, base + (1 if index < remainder else 0))
            for index in range(concurrency)
        ]
        for future in concurrent.futures.as_completed(futures):
            worker_latencies, worker_errors = future.result()
            latencies.extend(worker_latencies)
            errors.extend(worker_errors)
    wall_seconds = time.perf_counter() - started
    if not latencies:
        raise RuntimeError(f"no successful latency samples: {errors[:3]}")
    return {
        "requests": requests,
        "concurrency": concurrency,
        "wall_seconds": round(wall_seconds, 6),
        "throughput_rps": round(len(latencies) / wall_seconds, 3),
        "p50_ms": round(percentile(latencies, 0.50), 3),
        "p95_ms": round(percentile(latencies, 0.95), 3),
        "p99_ms": round(percentile(latencies, 0.99), 3),
        "max_ms": round(max(latencies), 3),
        "error_count": len(errors),
        "errors": errors[:10],
    }


def quality_cases() -> list[dict[str, Any]]:
    return [
        {"name": "red", "color": (255, 0, 0), "expected": "red"},
        {"name": "green", "color": (0, 255, 0), "expected": "green"},
        {"name": "blue", "color": (0, 0, 255), "expected": "blue"},
        {"name": "bright", "color": (255, 255, 255), "expected": "bright"},
        {"name": "dark", "color": (0, 0, 0), "expected": "dark"},
    ]


def quality_check(port: int, token: str) -> dict[str, Any]:
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=30)
    cases = []
    try:
        for case in quality_cases():
            image = make_png(32, 32, case["color"])
            status, body = classify_request(connection, token, image)
            predictions = body.get("data", [{}])[0].get("predictions", [])
            label = predictions[0].get("label") if predictions else None
            cases.append(
                {
                    "name": case["name"],
                    "expected": case["expected"],
                    "actual": label,
                    "status": status,
                    "passed": status == 200 and label == case["expected"],
                }
            )
    finally:
        connection.close()
    passed = sum(1 for case in cases if case["passed"])
    return {
        "cases": cases,
        "passed": passed,
        "total": len(cases),
        "accuracy": round(passed / len(cases), 4),
    }
