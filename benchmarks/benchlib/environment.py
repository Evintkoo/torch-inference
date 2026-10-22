# Copyright (c) 2026 Torviello.
from __future__ import annotations

import hashlib
import os
import platform
import re
import subprocess
import sys
import threading
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from benchlib.paths import CARGO, GIT, PS, REPO_ROOT


def _command_output(*args: str) -> str:
    completed = subprocess.run(  # noqa: S603
        args, check=False, capture_output=True, text=True
    )
    return completed.stdout.strip()


def _parse_cpu_time(value: str) -> float:
    parts = value.split(":")
    if len(parts) == 2:
        minutes, seconds = parts
        return int(minutes) * 60 + float(seconds)
    if len(parts) == 3:
        hours, minutes, seconds = parts
        return int(hours) * 3600 + int(minutes) * 60 + float(seconds)
    raise ValueError(f"unsupported CPU time: {value}")


def read_process_sample(pid: int) -> tuple[int, float]:
    completed = subprocess.run(  # noqa: S603
        [PS, "-o", "rss=,time=", "-p", str(pid)],
        check=False,
        capture_output=True,
        text=True,
    )
    fields = completed.stdout.split()
    if len(fields) < 2:
        raise RuntimeError(f"process {pid} is not running")
    return int(fields[0]) * 1024, _parse_cpu_time(fields[1])


class RssSampler:
    def __init__(self, pid: int, interval_seconds: float = 0.05) -> None:
        self.pid = pid
        self.interval_seconds = interval_seconds
        self.peak_rss_bytes = 0
        self._stop = threading.Event()
        self._thread = threading.Thread(target=self._run, daemon=True)

    def _run(self) -> None:
        while not self._stop.is_set():
            try:
                rss, _ = read_process_sample(self.pid)
                self.peak_rss_bytes = max(self.peak_rss_bytes, rss)
            except OSError, RuntimeError, ValueError:
                pass
            self._stop.wait(self.interval_seconds)

    def __enter__(self) -> RssSampler:
        self._thread.start()
        return self

    def __exit__(self, *_args: object) -> None:
        self._stop.set()
        self._thread.join(timeout=2)


def idle_metrics(pid: int, seconds: float) -> dict[str, Any]:
    rss_before, cpu_before = read_process_sample(pid)
    started = time.perf_counter()
    time.sleep(seconds)
    rss_after, cpu_after = read_process_sample(pid)
    elapsed = time.perf_counter() - started
    return {
        "window_seconds": round(elapsed, 3),
        "rss_bytes": rss_after,
        "rss_before_bytes": rss_before,
        "cpu_seconds_delta": round(cpu_after - cpu_before, 6),
        "cpu_percent": round((cpu_after - cpu_before) / elapsed * 100, 3),
    }


def git_value(*args: str) -> str:
    return _command_output(GIT, *args)


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def dependency_count() -> int:
    completed = subprocess.run(  # noqa: S603
        [
            CARGO,
            "tree",
            "-p",
            "torviello-engine",
            "--no-default-features",
            "--features",
            "torchscript",
            "--edges",
            "normal",
            "--prefix",
            "none",
        ],
        cwd=REPO_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    names = set()
    for line in completed.stdout.splitlines():
        match = re.match(r"^(\S+) v", line)
        if match:
            names.add(match.group(1))
    return len(names)


def runtime_libraries(binary: Path) -> tuple[list[str], int]:
    if sys.platform == "darwin":
        output = _command_output("otool", "-L", str(binary))
        candidates = [line.strip().split(" (", 1)[0] for line in output.splitlines()[1:]]
    else:
        output = _command_output("ldd", str(binary))
        candidates = [
            line.strip().split(" => ", 1)[-1].split(" (", 1)[0] for line in output.splitlines()
        ]
    unique = {
        str(path.resolve())
        for value in candidates
        if (path := Path(value)).is_file() and ("libtorch" in path.name or "libc10" in path.name)
    }
    return sorted(unique), sum(Path(path).stat().st_size for path in unique)


def _cpu_model() -> str:
    if sys.platform == "darwin":
        value = _command_output("sysctl", "-n", "machdep.cpu.brand_string")
        if value:
            return value
    elif sys.platform.startswith("linux"):
        for line in Path("/proc/cpuinfo").read_text().splitlines():
            if line.lower().startswith("model name"):
                return line.split(":", 1)[1].strip()
    return platform.processor() or "unknown"


def _physical_memory_bytes() -> int | None:
    if sys.platform == "darwin":
        value = _command_output("sysctl", "-n", "hw.memsize")
        return int(value) if value.isdigit() else None
    if sys.platform.startswith("linux"):
        for line in Path("/proc/meminfo").read_text().splitlines():
            if line.startswith("MemTotal:"):
                return int(line.split()[1]) * 1024
    return None


def _os_details() -> tuple[str, str]:
    if sys.platform == "darwin":
        return (
            _command_output("sw_vers", "-productVersion"),
            _command_output("sw_vers", "-buildVersion"),
        )
    if sys.platform.startswith("linux"):
        version = platform.release()
        for line in Path("/etc/os-release").read_text().splitlines():
            if line.startswith("PRETTY_NAME="):
                version = line.split("=", 1)[1].strip().strip('"')
                break
        return version, platform.release()
    return platform.version(), platform.release()


def environment_manifest(binary: Path) -> dict[str, Any]:
    libraries, library_bytes = runtime_libraries(binary)
    os_version, os_build = _os_details()
    return {
        "captured_at": datetime.now(UTC).isoformat(),
        "os": platform.platform(),
        "os_version": os_version,
        "os_build": os_build,
        "machine": platform.machine(),
        "cpu": _cpu_model(),
        "cpu_count": os.cpu_count(),
        "physical_memory_bytes": _physical_memory_bytes(),
        "python": platform.python_version(),
        "rustc": _command_output("rustc", "-V"),
        "cargo": _command_output("cargo", "-V"),
        "libtorch": os.environ.get("LIBTORCH", "/opt/homebrew"),
        "runtime_libraries": libraries,
        "runtime_libraries_bytes": library_bytes,
    }


def display_path(path: Path) -> str:
    try:
        return str(path.relative_to(REPO_ROOT))
    except ValueError:
        return str(path)
