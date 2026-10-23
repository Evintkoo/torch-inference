# Copyright (c) 2026 Torviello.
"""Unit tests for the cross-platform packaging driver."""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path

import pytest

DRIVER = Path(__file__).resolve().parents[1] / "torviello_package.py"
SPEC = importlib.util.spec_from_file_location("torviello_package", DRIVER)
assert SPEC and SPEC.loader
package = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(package)


def test_validate_reads_the_committed_definition() -> None:
    data = package.load_manifest()
    assert package.validate(data) == "1.0.0"
    assert set(data["profiles"]) == {"engine", "full"}


def test_unknown_profile_is_rejected() -> None:
    with pytest.raises(package.PackagingError, match="unknown profile"):
        package.profile(package.load_manifest(), "missing")


def test_plan_resolves_features_and_target() -> None:
    data = package.load_manifest()
    resolved = package.plan(data, "engine", target="x86_64-unknown-linux-gnu")
    assert resolved["features"] == ["engine"]
    assert resolved["target"] == "x86_64-unknown-linux-gnu"
    assert resolved["profile"] == "engine"
    assert "torviello-docs/docs/INSTALL.md" in resolved["include"]


def test_profile_without_features_is_rejected() -> None:
    data = package.load_manifest()
    data["profiles"]["engine"] = dict(data["profiles"]["engine"], features=[])
    with pytest.raises(package.PackagingError, match="declares no Cargo features"):
        package.validate(data)


def test_archive_bytes_are_deterministic(tmp_path: Path) -> None:
    entries = [
        ("share/torviello/b.txt", b"second\n", 0o644),
        ("bin/torviello-engine", b"binary\n", 0o755),
        ("share/torviello/a.txt", b"first\n", 0o644),
    ]
    first = tmp_path / "first.tar.gz"
    second = tmp_path / "second.tar.gz"
    package.write_tar_gz(first, entries, 0)
    package.write_tar_gz(second, entries, 0)
    assert first.read_bytes() == second.read_bytes()


def test_verify_accepts_a_matching_digest(tmp_path: Path) -> None:
    archive = tmp_path / "artifact.tar.gz"
    archive.write_bytes(b"payload")
    manifest = tmp_path / "artifact.manifest.json"
    document = {
        "artifact": {"name": "artifact.tar.gz", "sha256": package.sha256_file(archive)},
        "files": [],
    }
    manifest.write_text(json.dumps(document), encoding="utf-8")
    args = argparse.Namespace(manifest=str(manifest))
    assert package.command_verify(args) == 0


def test_verify_rejects_a_tampered_artifact(tmp_path: Path) -> None:
    archive = tmp_path / "artifact.tar.gz"
    archive.write_bytes(b"payload")
    manifest = tmp_path / "artifact.manifest.json"
    document = {
        "artifact": {"name": "artifact.tar.gz", "sha256": package.sha256_file(archive)},
        "files": [],
    }
    manifest.write_text(json.dumps(document), encoding="utf-8")
    archive.write_bytes(b"tampered")
    with pytest.raises(package.PackagingError, match="digest mismatch"):
        package.command_verify(argparse.Namespace(manifest=str(manifest)))
