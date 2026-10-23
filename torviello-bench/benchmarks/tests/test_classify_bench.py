# Copyright (c) 2026 Torviello.
from __future__ import annotations

import base64
import json

from benchlib import budget as budget_rules
from benchlib import protocol


def sample_result() -> dict:
    return {
        "latency": {
            "concurrency_1": {"p95_ms": 12.5, "p99_ms": 18.0},
            "concurrency_8": {"throughput_rps": 900.0},
        },
        "cold_start": {"process_to_live_ms": 300.0, "process_to_ready_ms": 500.0},
        "idle": {"rss_bytes": 100_000, "cpu_percent": 0.5},
        "memory": {"peak_rss_bytes": 200_000},
        "artifacts": {"artifact_bytes": 1_000_000},
        "quality": {"accuracy": 1.0},
    }


def test_percentile_uses_nearest_rank() -> None:
    values = [float(value) for value in range(1, 101)]
    assert protocol.percentile(values, 0.50) == 50.0
    assert protocol.percentile(values, 0.95) == 95.0
    assert protocol.percentile(values, 0.99) == 99.0
    assert protocol.percentile([3.0], 0.95) == 3.0


def test_multipart_contains_image_model_and_top_k() -> None:
    body = protocol.multipart_body(b"png-bytes", 3)
    assert b'name="images"' in body
    assert b"image/png" in body
    assert b"png-bytes" in body
    assert b"engine-demo-torchscript" in body
    assert b'name="top_k"' in body
    assert body.endswith(f"--{protocol.BOUNDARY}--\r\n".encode())


def test_png_has_valid_signature_and_dimensions() -> None:
    image = protocol.make_png(32, 32, (255, 0, 0))
    assert image.startswith(b"\x89PNG\r\n\x1a\n")
    assert b"IHDR" in image
    assert image.endswith(b"IEND\xaeB`\x82")


def test_jwt_has_three_url_safe_segments() -> None:
    token = protocol.make_jwt("x" * 48, 60)
    segments = token.split(".")
    assert len(segments) == 3
    for segment in segments:
        base64.urlsafe_b64decode(segment + "=" * (-len(segment) % 4))
    payload = json.loads(base64.urlsafe_b64decode(segments[1] + "=" * (-len(segments[1]) % 4)))
    assert payload["roles"] == ["admin"]
    assert payload["sub"] == "benchmark"


def test_budget_passes_when_all_limits_hold() -> None:
    budget = {
        "metrics": {
            "p95_latency_ms_max": 250,
            "throughput_rps_min": 100,
            "peak_rss_bytes_max": 1_000_000,
            "quality_accuracy_min": 1.0,
        }
    }
    checks = budget_rules.evaluate_budget(sample_result(), budget)
    assert all(check["passed"] for check in checks)


def test_budget_fails_on_latency_and_quality_breach() -> None:
    budget = {
        "metrics": {
            "p95_latency_ms_max": 10,
            "quality_accuracy_min": 0.99,
        }
    }
    result = sample_result()
    result["quality"]["accuracy"] = 0.8
    checks = budget_rules.evaluate_budget(result, budget)
    assert [check["metric"] for check in checks] == ["p95_latency_ms", "quality_accuracy"]
    assert not any(check["passed"] for check in checks)


def test_baseline_detects_regression_and_throughput_loss() -> None:
    baseline = sample_result()
    current = sample_result()
    current["latency"]["concurrency_1"]["p95_ms"] = 14.0
    current["latency"]["concurrency_8"]["throughput_rps"] = 600.0
    checks = budget_rules.compare_baseline(current, baseline, 20.0)
    outcomes = {check["metric"]: check["passed"] for check in checks}
    assert outcomes["p95_latency_ms"] is True
    assert outcomes["throughput_rps"] is False
