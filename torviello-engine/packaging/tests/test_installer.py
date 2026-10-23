# Copyright (c) 2026 Torviello.
"""Tests for the deterministic Windows installer definition generator."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import zipfile
from pathlib import Path
from xml.etree import ElementTree

import pytest

DRIVER = Path(__file__).resolve().parents[1] / "torviello_package.py"
SPEC = importlib.util.spec_from_file_location("torviello_package", DRIVER)
assert SPEC and SPEC.loader
package = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(package)

INSTALLER = Path(__file__).resolve().parents[1] / "wix_installer.py"
ISPEC = importlib.util.spec_from_file_location("torviello_wix_installer", INSTALLER)
assert ISPEC and ISPEC.loader
installer = importlib.util.module_from_spec(ISPEC)
ISPEC.loader.exec_module(installer)

WIX_NAMESPACE = {"w": "http://wixtoolset.org/schemas/v4/wxs"}

MEMBERS = {
    "bin/torviello-engine.exe": b"MZ binary\r\n",
    "share/torviello/MANIFEST.json": b"{}\n",
    "share/torviello/LICENSE": b"MIT\n",
}


def release_manifest() -> dict:
    files = [
        {
            "path": member,
            "sha256": hashlib.sha256(payload).hexdigest(),
            "mode": "0755" if member.startswith("bin/") else "0644",
        }
        for member, payload in MEMBERS.items()
    ]
    return {
        "product": "torviello-engine",
        "version": "1.0.0",
        "target": "x86_64-pc-windows-msvc",
        "files": files,
    }


def write_archive(tmp_path: Path) -> Path:
    archive = tmp_path / "torviello-engine-1.0.0-engine-x86_64-pc-windows-msvc.zip"
    entries = [(name, payload, 0o755) for name, payload in MEMBERS.items()]
    package.write_zip(archive, entries, 0)
    return archive


def write_manifest(tmp_path: Path, archive: Path) -> Path:
    manifest = release_manifest()
    path = tmp_path / "release.manifest.json"
    path.write_text(json.dumps(manifest), encoding="utf-8")
    del archive
    return path


def test_definition_is_deterministic_and_complete(tmp_path: Path) -> None:
    archive = write_archive(tmp_path)
    manifest = write_manifest(tmp_path, archive)
    first = installer.installer_document(str(manifest), str(archive), str(tmp_path / "one"))
    second = installer.installer_document(str(manifest), str(archive), str(tmp_path / "two"))
    definition_one = Path(first["definition"]).read_text(encoding="utf-8")
    definition_two = Path(second["definition"]).read_text(encoding="utf-8")
    assert definition_one == definition_two

    root = ElementTree.fromstring(definition_one)  # noqa: S314 (definition is generated here)
    package_node = root.find("w:Package", WIX_NAMESPACE)
    assert package_node is not None
    assert package_node.get("Version") == "1.0.0"
    assert package_node.get("Manufacturer") == "Torviello"
    assert package_node.get("UpgradeCode") == installer.upgrade_code("torviello-engine")

    sources = {node.get("Source") for node in root.findall(".//w:File", WIX_NAMESPACE)}
    for member in MEMBERS:
        assert f"payload/{member}" in sources
        assert (tmp_path / "one" / f"payload/{member}").is_file()

    environments = {node.get("Name") for node in root.findall(".//w:Environment", WIX_NAMESPACE)}
    assert "PATH" in environments


def test_upgrade_code_is_stable_per_product() -> None:
    assert installer.upgrade_code("torviello-engine") == installer.upgrade_code("torviello-engine")
    assert installer.upgrade_code("torviello-engine") != installer.upgrade_code("other-product")


def test_component_guids_are_stable_per_member() -> None:
    member = "bin/torviello-engine.exe"
    assert installer.component_guid("torviello-engine", member) == installer.component_guid(
        "torviello-engine", member
    )


def test_missing_payload_member_is_rejected() -> None:
    manifest = release_manifest()
    manifest["files"].append(
        {"path": "share/torviello/MISSING.md", "sha256": "x", "mode": "0644"}
    )
    with pytest.raises(installer.InstallerError, match="MISSING.md"):
        installer.generate(manifest, list(MEMBERS))


def test_driver_installer_command_runs_without_wix(tmp_path: Path) -> None:
    archive = write_archive(tmp_path)
    manifest = write_manifest(tmp_path, archive)
    args = argparse.Namespace(
        manifest=str(manifest), archive=str(archive), out=str(tmp_path / "out"), wix=False
    )
    assert package.command_installer(args) == 0
    definitions = list((tmp_path / "out").glob("*.wxs"))
    assert len(definitions) == 1
    root = ElementTree.fromstring(  # noqa: S314 (definition is generated here)
        definitions[0].read_text(encoding="utf-8")
    )
    assert root.find("w:Package", WIX_NAMESPACE) is not None


def test_archive_members_carry_the_windows_binary_name(tmp_path: Path) -> None:
    spec = {"binary": "torviello-engine", "include": []}
    binary = tmp_path / "torviello-engine.exe"
    binary.write_bytes(b"MZ binary\r\n")
    entries = package.archive_entries(binary, spec, {})
    names = [name for name, _, _ in entries]
    assert "bin/torviello-engine.exe" in names
    assert "share/torviello/MANIFEST.json" in names


def test_zip_round_trip_through_the_driver(tmp_path: Path) -> None:
    archive = write_archive(tmp_path)
    document = {
        "artifact": {"name": archive.name, "sha256": package.sha256_file(archive)},
        "files": [],
    }
    manifest = tmp_path / "artifact.manifest.json"
    manifest.write_text(json.dumps(document), encoding="utf-8")
    assert package.command_verify(argparse.Namespace(manifest=str(manifest))) == 0


def test_written_payload_is_a_readable_zip(tmp_path: Path) -> None:
    archive = write_archive(tmp_path)
    with zipfile.ZipFile(archive) as bundle:
        assert bundle.read("bin/torviello-engine.exe") == MEMBERS["bin/torviello-engine.exe"]
