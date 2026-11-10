# Copyright (c) 2026 Torviello.
"""A failed engine start must surface the engine's own log.

2026-11-10 CI defect (performance-cpu, ticket 0048): the runner raised
``TimeoutError: engine did not become live within 60.0s`` while the engine's
``server.log`` — which holds the actual startup error — stayed on disk, so CI
showed no cause. The fixture binary below is generated at test time inside
tmp_path; the repository commits no shell scripts (GOV-13).
"""

from __future__ import annotations

from pathlib import Path

import pytest
from benchlib import runner as bench_runner

BOOT_LINE = "FAKE-ENGINE-BOOT-MSG config rejected"


def _fake_engine(tmp_path: Path) -> Path:
    """An executable that boots, logs one line, and never serves traffic."""
    binary = tmp_path / "engine-under-test"
    binary.write_text(
        "#!/usr/bin/env python3\n"
        "import time\n"
        f"print({BOOT_LINE!r}, flush=True)\n"
        "time.sleep(300)\n",
        encoding="utf-8",
    )
    binary.chmod(0o755)
    return binary


def test_a_failed_start_reports_the_engine_log_tail(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Keep the spawned fake engine from seeing a real bench secret; the run
    # must fail on liveness long before any authenticated call matters.
    monkeypatch.delenv("TORCH_BENCH_SECRET", raising=False)
    binary = _fake_engine(tmp_path)
    output = tmp_path / "results.json"
    args = bench_runner.parser().parse_args(
        [
            "--binary",
            str(binary),
            "--output",
            str(output),
            "--startup-timeout",
            "2",
            "--shutdown-timeout",
            "2",
            "--requests",
            "1",
            "--warmup",
            "0",
            "--idle-seconds",
            "0",
        ]
    )
    with pytest.raises(Exception) as excinfo:
        bench_runner.run(args)
    message = str(excinfo.value)
    assert BOOT_LINE in message, (
        f"engine log tail missing from the failure: {message!r}"
    )
    assert "server.log" in message or str(output.parent) in message, (
        f"failure does not name the engine log location: {message!r}"
    )
