# Copyright (c) 2026 Torviello.
from __future__ import annotations

import shutil
from pathlib import Path

MODEL_ID = "engine-demo-torchscript"
PROFILE = "minimal-cpu-torchscript"
DEFAULT_BINARY = Path("target/release/torviello-engine")
DEFAULT_CONFIG = Path("config/default.toml")
DEFAULT_RATE_LIMIT = 100_000
REPO_ROOT = Path(__file__).resolve().parents[2]
PS = shutil.which("ps") or "/bin/ps"
CARGO = shutil.which("cargo") or "cargo"
GIT = shutil.which("git") or "git"
