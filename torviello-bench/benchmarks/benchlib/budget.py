# Copyright (c) 2026 Torviello.
from __future__ import annotations

from typing import Any

METRIC_PATHS = {
    "p50_latency_ms": ("latency", "concurrency_1", "p50_ms"),
    "max_latency_ms": ("latency", "concurrency_1", "max_ms"),
    "p95_latency_ms": ("latency", "concurrency_1", "p95_ms"),
    "p99_latency_ms": ("latency", "concurrency_1", "p99_ms"),
    "throughput_rps": ("latency", "concurrency_8", "throughput_rps"),
    "cold_start_ms": ("cold_start", "process_to_live_ms"),
    "ready_ms": ("cold_start", "process_to_ready_ms"),
    "load_ms": ("cold_start", "load_ms"),
    "idle_rss_bytes": ("idle", "rss_bytes"),
    "idle_cpu_percent": ("idle", "cpu_percent"),
    "peak_rss_bytes": ("memory", "peak_rss_bytes"),
    "artifact_bytes": ("artifacts", "artifact_bytes"),
    "binary_bytes": ("artifacts", "binary_bytes"),
    "model_bytes": ("artifacts", "model_bytes"),
    "dependency_count": ("artifacts", "dependency_count"),
    "runtime_libraries_bytes": ("artifacts", "runtime_libraries_bytes"),
    "quality_accuracy": ("quality", "accuracy"),
}


def versioned_metric(result: dict[str, Any], name: str) -> float | int:
    value: Any = result
    for key in METRIC_PATHS[name]:
        value = value[key]
    return value


def evaluate_budget(result: dict[str, Any], budget: dict[str, Any]) -> list[dict[str, Any]]:
    checks = []
    for key, limit in budget["metrics"].items():
        if key.endswith("_max"):
            metric = key.removesuffix("_max")
            actual = versioned_metric(result, metric)
            passed = actual <= limit
            comparison = "max"
        elif key.endswith("_min"):
            metric = key.removesuffix("_min")
            actual = versioned_metric(result, metric)
            passed = actual >= limit
            comparison = "min"
        else:
            continue
        checks.append(
            {
                "metric": metric,
                "actual": actual,
                "limit": limit,
                "comparison": comparison,
                "passed": passed,
            }
        )
    return checks


def compare_baseline(
    result: dict[str, Any], baseline: dict[str, Any], tolerance_percent: float
) -> list[dict[str, Any]]:
    checks = []
    for metric in ("p95_latency_ms", "peak_rss_bytes", "artifact_bytes", "cold_start_ms"):
        actual = versioned_metric(result, metric)
        previous = versioned_metric(baseline, metric)
        allowed = previous * (1 + tolerance_percent / 100)
        checks.append(
            {
                "metric": metric,
                "baseline": previous,
                "actual": actual,
                "tolerance_percent": tolerance_percent,
                "passed": actual <= allowed,
            }
        )
    actual_throughput = versioned_metric(result, "throughput_rps")
    previous_throughput = versioned_metric(baseline, "throughput_rps")
    minimum = previous_throughput * (1 - tolerance_percent / 100)
    checks.append(
        {
            "metric": "throughput_rps",
            "baseline": previous_throughput,
            "actual": actual_throughput,
            "tolerance_percent": tolerance_percent,
            "passed": actual_throughput >= minimum,
        }
    )
    return checks
