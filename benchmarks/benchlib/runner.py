# Copyright (c) 2026 Torviello.
from __future__ import annotations

import argparse
import http.client
import json
import os
import secrets
import signal
import socket
import subprocess
import sys
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from benchlib.budget import compare_baseline, evaluate_budget
from benchlib.environment import (
    RssSampler,
    dependency_count,
    display_path,
    environment_manifest,
    file_sha256,
    git_value,
    idle_metrics,
)
from benchlib.environment import (
    runtime_libraries as loaded_runtime_libraries,
)
from benchlib.paths import (
    DEFAULT_BINARY,
    DEFAULT_CONFIG,
    DEFAULT_RATE_LIMIT,
    MODEL_ID,
    PROFILE,
    REPO_ROOT,
)
from benchlib.protocol import (
    _wait_for_live,
    _wait_for_ready,
    classify_request,
    make_jwt,
    make_png,
    post_json,
    quality_check,
    run_workload,
)


def _failed_quality_cases(quality: dict[str, Any]) -> str:
    failed = [case["name"] for case in quality["cases"] if not case["passed"]]
    return ", ".join(failed) if failed else "none"


def summary_markdown(result: dict[str, Any]) -> str:
    latency = result["latency"]["concurrency_1"]
    throughput = result["latency"]["concurrency_8"]
    quality = result["quality"]
    checks = result.get("budget_checks", [])
    rows = [
        "| Metric | Value | Budget | Result |",
        "|---|---:|---:|---|",
    ]
    for check in checks:
        rows.append(
            f"| {check['metric']} | {check['actual']} | {check['limit']} | "
            f"{'pass' if check['passed'] else 'FAIL'} |"
        )
    return "\n".join(
        [
            "# CPU classifier benchmark",
            "",
            f"- Generated: {result['generated_at']}",
            f"- Revision: `{result['revision']['commit']}`"
            f"{' (dirty)' if result['revision']['dirty'] else ''}",
            f"- Profile: `{result['profile']}`",
            f"- Workload: {result['workload']['description']}",
            f"- CPU: {result['environment']['cpu']}",
            f"- OS: {result['environment']['os']}",
            "",
            "## Latency and throughput",
            "",
            f"- p50: {latency['p50_ms']} ms",
            f"- p95: {latency['p95_ms']} ms",
            f"- p99: {latency['p99_ms']} ms",
            f"- Throughput at concurrency {throughput['concurrency']}: "
            f"{throughput['throughput_rps']} req/s",
            f"- Errors: {latency['error_count'] + throughput['error_count']}",
            "",
            "## Footprint",
            "",
            f"- Process start to live: {result['cold_start']['process_to_live_ms']} ms",
            f"- Model load: {result['cold_start']['load_ms']} ms",
            f"- Process to ready: {result['cold_start']['process_to_ready_ms']} ms",
            f"- Peak RSS: {result['memory']['peak_rss_bytes']} bytes",
            f"- Idle RSS: {result['idle']['rss_bytes']} bytes",
            f"- Idle CPU: {result['idle']['cpu_percent']}%",
            f"- Artifact bytes: {result['artifacts']['artifact_bytes']}",
            "",
            "## Quality",
            "",
            f"- Top-1 accuracy: {quality['accuracy']} ({quality['passed']}/{quality['total']})",
            f"- Failed cases: {_failed_quality_cases(quality)}",
            "",
            "## Budget",
            "",
            *rows,
            "",
            "Raw measurements are in `results.json`. Reproduction command is recorded there.",
            "",
        ]
    )


def _spawn_engine(
    binary: Path, config: Path, port: int, secret: str, log_path: Path
) -> tuple[subprocess.Popen[bytes], Any]:
    environment = os.environ.copy()
    environment.update(
        {
            "TORCH_CONFIG": str(config),
            "TORCH_PORT": str(port),
            "TORCH_AUTH_JWT_SECRET": secret,
            "TORCH_RATE_LIMIT_PER_MINUTE": str(DEFAULT_RATE_LIMIT),
        }
    )
    log = log_path.open("wb")
    process = subprocess.Popen(  # noqa: S603
        [str(binary)],
        cwd=REPO_ROOT,
        env=environment,
        stdout=log,
        stderr=subprocess.STDOUT,
    )
    return process, log


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def run(args: argparse.Namespace) -> dict[str, Any]:
    binary = (REPO_ROOT / args.binary).resolve()
    config = (REPO_ROOT / args.config).resolve()
    output = (REPO_ROOT / args.output).resolve()
    summary_path = (
        (REPO_ROOT / args.summary).resolve() if args.summary else output.with_suffix(".md")
    )
    if not binary.is_file():
        raise FileNotFoundError(
            f"missing {binary}; build with cargo build --release --locked "
            "--no-default-features --features torchscript"
        )
    output.parent.mkdir(parents=True, exist_ok=True)
    log_path = output.parent / "server.log"
    secret = os.environ.get("TORCH_BENCH_SECRET") or secrets.token_urlsafe(48)
    port = args.port or _free_port()
    token = make_jwt(secret)
    process, log = _spawn_engine(binary, config, port, secret, log_path)
    sampler = RssSampler(process.pid)
    try:
        with sampler:
            process_to_live_ms = _wait_for_live(port, args.startup_timeout)
            load_started = time.perf_counter()
            status, load_body = post_json(port, f"/models/{MODEL_ID}/load", token, {})
            load_ms = (time.perf_counter() - load_started) * 1000
            if status != 202 or load_body.get("data", {}).get("state") != "ready":
                raise RuntimeError(f"model load failed: {status} {load_body}")
            ready_started = time.perf_counter()
            _wait_for_ready(port, token, args.startup_timeout)
            ready_after_load_ms = (time.perf_counter() - ready_started) * 1000
            image = make_png(32, 32, (255, 0, 0))
            for _ in range(args.warmup):
                connection = http.client.HTTPConnection("127.0.0.1", port, timeout=30)
                try:
                    status, body = classify_request(connection, token, image)
                finally:
                    connection.close()
                if status != 200:
                    raise RuntimeError(f"warmup failed: {status} {body}")
            idle = idle_metrics(process.pid, args.idle_seconds)
            latency = run_workload(port, token, image, args.requests, args.concurrency)
            throughput = run_workload(
                port, token, image, args.requests, args.throughput_concurrency
            )
            quality = quality_check(port, token)
    finally:
        process.send_signal(signal.SIGTERM)
        try:
            process.wait(timeout=args.shutdown_timeout)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)
        log.close()
    model_asset = REPO_ROOT / "models" / MODEL_ID / "asset.bin"
    artifact_bytes = binary.stat().st_size + model_asset.stat().st_size
    runtime_libraries, runtime_library_bytes = loaded_runtime_libraries(binary)
    result = {
        "schema_version": 1,
        "generated_at": datetime.now(UTC).isoformat(),
        "profile": PROFILE,
        "revision": {
            "commit": git_value("rev-parse", "HEAD"),
            "dirty": bool(git_value("status", "--porcelain")),
            "binary_sha256": file_sha256(binary),
            "model_sha256": file_sha256(model_asset),
        },
        "command": " ".join(sys.argv),
        "environment": environment_manifest(binary),
        "config": {
            "file": display_path(config),
            "rate_limit_per_minute": DEFAULT_RATE_LIMIT,
            "auth": "HS256 bearer",
            "overrides": [
                "TORCH_CONFIG",
                "TORCH_PORT",
                "TORCH_AUTH_JWT_SECRET",
                "TORCH_RATE_LIMIT_PER_MINUTE",
            ],
        },
        "workload": {
            "description": "32x32 PNG, batch 1, top_k 1, one warm model",
            "model_id": MODEL_ID,
            "image_width": 32,
            "image_height": 32,
            "batch_size": 1,
            "top_k": 1,
            "warmup_requests": args.warmup,
        },
        "cold_start": {
            "process_to_live_ms": round(process_to_live_ms, 3),
            "load_ms": round(load_ms, 3),
            "ready_after_load_ms": round(ready_after_load_ms, 3),
            "process_to_ready_ms": round(process_to_live_ms + load_ms + ready_after_load_ms, 3),
        },
        "idle": idle,
        "memory": {"peak_rss_bytes": sampler.peak_rss_bytes},
        "latency": {
            "concurrency_1": latency,
            "concurrency_8": throughput,
        },
        "quality": quality,
        "artifacts": {
            "binary_bytes": binary.stat().st_size,
            "model_bytes": model_asset.stat().st_size,
            "artifact_bytes": artifact_bytes,
            "runtime_libraries": runtime_libraries,
            "runtime_libraries_bytes": runtime_library_bytes,
            "dependency_count": dependency_count(),
        },
        "server_log": display_path(log_path),
    }
    if args.budget:
        budget_path = (REPO_ROOT / args.budget).resolve()
        budget = json.loads(budget_path.read_text())
        checks = evaluate_budget(result, budget)
        result["budget"] = {
            "file": display_path(budget_path),
            "owner": budget.get("owner"),
            "review_date": budget.get("review_date"),
        }
        result["budget_checks"] = checks
        result["passed"] = all(check["passed"] for check in checks)
    if args.baseline:
        baseline_path = (REPO_ROOT / args.baseline).resolve()
        baseline = json.loads(baseline_path.read_text())
        tolerance = float(args.regression_tolerance)
        checks = compare_baseline(result, baseline, tolerance)
        result["baseline"] = {
            "file": display_path(baseline_path),
            "tolerance_percent": tolerance,
        }
        result["baseline_checks"] = checks
        result["passed"] = result.get("passed", True) and all(check["passed"] for check in checks)
    result.setdefault("passed", True)
    output.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n")
    summary_path.write_text(summary_markdown(result))
    return result


def parser() -> argparse.ArgumentParser:
    arguments = argparse.ArgumentParser(description=__doc__)
    arguments.add_argument("--binary", default=str(DEFAULT_BINARY))
    arguments.add_argument("--config", default=str(DEFAULT_CONFIG))
    arguments.add_argument("--output", default="target/benchmark/results.json")
    arguments.add_argument("--summary", default=None)
    arguments.add_argument("--budget", default=None)
    arguments.add_argument("--baseline", default=None)
    arguments.add_argument("--regression-tolerance", type=float, default=20.0)
    arguments.add_argument("--requests", type=int, default=1000)
    arguments.add_argument("--warmup", type=int, default=30)
    arguments.add_argument("--concurrency", type=int, default=1)
    arguments.add_argument("--throughput-concurrency", type=int, default=8)
    arguments.add_argument("--idle-seconds", type=float, default=3.0)
    arguments.add_argument("--startup-timeout", type=float, default=60.0)
    arguments.add_argument("--shutdown-timeout", type=float, default=15.0)
    arguments.add_argument("--port", type=int, default=0)
    return arguments


def main() -> int:
    args = parser().parse_args()
    result = run(args)
    sys.stdout.write(summary_markdown(result) + "\n")
    return 0 if result["passed"] else 1
