# Copyright (c) 2026 Torviello.
"""The benchmark resolves the engine workspace layout (2026-11-10 CI defect:
performance-cpu looked for the binary under torviello-bench/target)."""

from benchlib.paths import DEFAULT_BINARY, DEFAULT_CONFIG, MODEL_ID, MODEL_ROOT, REPO_ROOT


def test_repo_root_is_the_cargo_workspace() -> None:
    assert (REPO_ROOT / "Cargo.toml").is_file()
    assert (REPO_ROOT / "Cargo.lock").is_file()


def test_default_config_is_the_engine_config() -> None:
    assert (REPO_ROOT / DEFAULT_CONFIG).is_file()


def test_binary_lives_in_the_workspace_target() -> None:
    assert DEFAULT_BINARY.parts[:2] == ("target", "release")


def test_model_asset_lives_under_the_engine_model_root() -> None:
    assert (REPO_ROOT / MODEL_ROOT / MODEL_ID / "asset.bin").is_file()
