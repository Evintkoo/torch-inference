# Copyright (c) 2026 Torviello.
from __future__ import annotations

import shutil
from pathlib import Path

MODEL_ID = "engine-demo-torchscript"
PROFILE = "minimal-cpu-torchscript"
DEFAULT_BINARY = Path("target/release/torviello-engine")
DEFAULT_CONFIG = Path("torviello-engine/config/default.toml")
MODEL_ROOT = Path("torviello-engine/models")
DEFAULT_RATE_LIMIT = 100_000
# benchlib -> benchmarks -> torviello-bench -> repository root (the Cargo workspace)
REPO_ROOT = Path(__file__).resolve().parents[3]
PS = shutil.which("ps") or "/bin/ps"
CARGO = shutil.which("cargo") or "cargo"
GIT = shutil.which("git") or "git"
