#!/usr/bin/env python3
# Copyright (c) 2026 Torviello.
"""Cross-platform release packaging driver.

The release definition lives in ``torviello-engine/packaging/packaging.toml``. This driver
requires only the Python 3.11+ standard library so the same entry point runs on
Windows, macOS, and Linux without a shell script or an extra build framework.

Usage:
    python packaging/torviello_package.py validate
    python packaging/torviello_package.py plan --profile engine
    python packaging/torviello_package.py prepare --profile full
    python packaging/torviello_package.py build --profile engine --offline
    python packaging/torviello_package.py verify dist/<artifact>.manifest.json
"""

from __future__ import annotations

import argparse
import functools
import gzip
import hashlib
import importlib.util
import io
import json
import logging
import os
import platform
import shutil
import subprocess
import sys
import tarfile
import tomllib
import zipfile
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST_PATH = ROOT / "torviello-engine" / "packaging" / "packaging.toml"
SCHEMA = 1
LOG = logging.getLogger("torviello.packaging")


class PackagingError(Exception):
    """Raised when the release definition or build inputs are invalid."""


def emit(message: str) -> None:
    sys.stdout.write(message + "\n")


def run(command: list[str], *, cwd: Path = ROOT, capture: bool = False) -> str:
    result = subprocess.run(  # noqa: S603 - fixed argv, no shell, no untrusted interpolation
        command,
        cwd=cwd,
        check=False,
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
    )
    if result.returncode != 0:
        detail = (result.stderr or "").strip().splitlines()
        reason = detail[-1] if detail else ""
        raise PackagingError(f"command failed ({result.returncode}): {' '.join(command)}: {reason}")
    return (result.stdout or "").strip()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def load_manifest() -> dict:
    if not MANIFEST_PATH.exists():
        missing = MANIFEST_PATH.relative_to(ROOT)
        raise PackagingError(f"missing release definition: {missing}")
    with MANIFEST_PATH.open("rb") as handle:
        try:
            data = tomllib.load(handle)
        except tomllib.TOMLDecodeError as error:
            location = MANIFEST_PATH.relative_to(ROOT)
            raise PackagingError(f"invalid TOML in {location}: {error}") from error
    if data.get("schema") != SCHEMA:
        schema = data.get("schema")
        raise PackagingError(f"unsupported packaging schema {schema!r}; expected {SCHEMA}")
    return data


def profile(data: dict, name: str) -> dict:
    profiles = data.get("profiles", {})
    if name not in profiles:
        known = ", ".join(sorted(profiles)) or "none"
        raise PackagingError(f"unknown profile {name!r}; available profiles: {known}")
    spec = profiles[name]
    for field in ("description", "features", "binary", "include"):
        if field not in spec:
            raise PackagingError(f"profile {name!r} is missing {field!r}")
    if not spec["features"]:
        raise PackagingError(f"profile {name!r} declares no Cargo features")
    return spec


def product_version(data: dict) -> str:
    product = data.get("product", {})
    source = ROOT / product.get("version_source", "")
    table = product.get("version_table", "")
    if not source.is_file():
        raise PackagingError(f"version source does not exist: {source}")
    with source.open("rb") as handle:
        document = tomllib.load(handle)
    node = document
    for part in table.split("."):
        if not isinstance(node, dict) or part not in node:
            raise PackagingError(f"version table {table!r} not found in {source.name}")
        node = node[part]
    version = node.get("version")
    if not isinstance(version, str) or not version:
        raise PackagingError(f"no version string in {source.name} table {table!r}")
    return version


def validate(data: dict) -> str:
    product = data.get("product", {})
    for field in ("name", "version_source", "version_table", "output_dir"):
        if not product.get(field):
            raise PackagingError(f"product is missing {field!r}")
    version = product_version(data)
    profiles = data.get("profiles", {})
    if not profiles:
        raise PackagingError("no release profiles are defined")
    for name in profiles:
        spec = profile(data, name)
        missing = [item for item in spec["include"] if not (ROOT / item).is_file()]
        if missing:
            raise PackagingError(f"profile {name!r} includes missing files: {missing}")
        if not spec["binary"].strip():
            raise PackagingError(f"profile {name!r} has an empty binary name")
        if "full" in spec["features"]:
            layout = spec.get("cache")
            if (
                not isinstance(layout, list)
                or not layout
                or not all(isinstance(entry, str) and entry.strip() for entry in layout)
            ):
                raise PackagingError(
                    f"profile {name!r} must document its libtorch cache layout as a "
                    "non-empty list of cache locations for offline builds"
                )
    return version


def git(*args: str) -> str:
    try:
        return run(["git", *args], capture=True)
    except (PackagingError, FileNotFoundError):
        return ""


def source_revision() -> str:
    return git("rev-parse", "HEAD") or "unknown"


def source_state() -> str:
    return "dirty" if git("status", "--porcelain") else "clean"


def source_epoch() -> int:
    override = os.environ.get("SOURCE_DATE_EPOCH")
    if override and override.isdigit():
        return int(override)
    stamp = git("log", "-1", "--format=%ct")
    return int(stamp) if stamp.isdigit() else 0


def target_triple() -> str:
    try:
        output = run(["rustc", "-vV"], capture=True)
    except (PackagingError, FileNotFoundError):
        raise PackagingError("rustc is not available; install the pinned Rust toolchain") from None
    for line in output.splitlines():
        if line.startswith("host: "):
            return line.removeprefix("host: ").strip()
    raise PackagingError("rustc did not report a host target triple")


def lockfile_digests() -> dict:
    result = {}
    for name in ("Cargo.lock", "uv.lock", "package-lock.json"):
        path = ROOT / name
        if path.is_file():
            result[name] = sha256_file(path)
    return result


def toolchain() -> dict:
    versions = {}
    for name, command in (("rustc", ["rustc", "--version"]), ("cargo", ["cargo", "--version"])):
        try:
            versions[name] = run(command, capture=True)
        except (PackagingError, FileNotFoundError):
            versions[name] = "unavailable"
    return versions


def plan(data: dict, name: str, *, target: str | None = None) -> dict:
    spec = profile(data, name)
    product = data["product"]
    return {
        "product": product["name"],
        "version": product_version(data),
        "profile": name,
        "description": spec["description"],
        "features": spec["features"],
        "binary": spec["binary"],
        "target": target or target_triple(),
        "output_dir": product["output_dir"],
        "include": spec["include"],
        "cache": spec.get("cache", []),
        "source_revision": source_revision(),
        "source_state": source_state(),
    }


def cargo_command(spec: dict, *, target: str | None, offline: bool, release: bool) -> list[str]:
    features = ",".join(spec["features"])
    command = ["cargo", "build", "--locked", "--no-default-features", "--features", features]
    if release:
        command.append("--release")
    if target:
        command.extend(["--target", target])
    if offline:
        command.append("--offline")
    return command


def build_binary(spec: dict, *, target: str | None, offline: bool) -> Path:
    run(cargo_command(spec, target=target, offline=offline, release=True))
    base = ROOT / "target"
    if target:
        base = base / target
    name = spec["binary"]
    if sys.platform == "win32":
        name += ".exe"
    binary = base / "release" / name
    if not binary.is_file():
        raise PackagingError(f"cargo did not produce {binary.relative_to(ROOT)}")
    return binary


def deterministic_bytes(data: bytes) -> bytes:
    return json.dumps(data, sort_keys=True, indent=2).encode("utf-8") + b"\n"


def archive_entries(binary: Path, spec: dict, provenance: dict) -> list[tuple[str, bytes, int]]:
    entries = [(f"bin/{binary.name}", binary.read_bytes(), 0o755)]
    for item in spec["include"]:
        entries.append((f"share/torviello/{item}", (ROOT / item).read_bytes(), 0o644))
    entries.append(("share/torviello/MANIFEST.json", deterministic_bytes(provenance), 0o644))
    return sorted(entries, key=lambda entry: entry[0])


def write_tar_gz(path: Path, entries: list[tuple[str, bytes, int]], epoch: int) -> None:
    with path.open("wb") as raw, gzip.GzipFile(filename="", mode="wb", fileobj=raw, mtime=0) as gz:
        with tarfile.open(fileobj=gz, mode="w", format=tarfile.GNU_FORMAT) as archive:
            for name, payload, mode in entries:
                info = tarfile.TarInfo(name)
                info.size = len(payload)
                info.mode = mode
                info.mtime = epoch
                info.uid = 0
                info.gid = 0
                info.uname = ""
                info.gname = ""
                archive.addfile(info, io.BytesIO(payload))


def write_zip(path: Path, entries: list[tuple[str, bytes, int]], epoch: int) -> None:
    moment = datetime.fromtimestamp(max(epoch, 315532800), tz=UTC).timetuple()[:6]
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, payload, mode in entries:
            info = zipfile.ZipInfo(name, date_time=moment)
            info.external_attr = (0o100000 | mode) << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, payload)


def serialize(path: Path, entries: list[tuple[str, bytes, int]], epoch: int) -> None:
    if sys.platform == "win32":
        write_zip(path, entries, epoch)
    else:
        write_tar_gz(path, entries, epoch)


@functools.lru_cache(maxsize=1)
def _load_wix_installer():
    """Load the sibling WiX generator module (the driver runs as a plain script)."""
    location = Path(__file__).resolve().parent / "wix_installer.py"
    spec = importlib.util.spec_from_file_location("torviello_wix_installer", location)
    if spec is None or spec.loader is None:
        raise PackagingError(f"cannot load installer generator: {location}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def command_validate(args: argparse.Namespace) -> int:
    data = load_manifest()
    version = validate(data)
    emit(f"valid: {data['product']['name']} {version} ({len(data['profiles'])} profiles)")
    return 0


def command_plan(args: argparse.Namespace) -> int:
    data = load_manifest()
    validate(data)
    emit(json.dumps(plan(data, args.profile, target=args.target), indent=2, sort_keys=True))
    return 0


def command_prepare(args: argparse.Namespace) -> int:
    data = load_manifest()
    validate(data)
    spec = profile(data, args.profile)
    run(["cargo", "fetch", "--locked"])
    if args.profile == "full":
        run(cargo_command(spec, target=args.target, offline=False, release=True))
    emit(f"prepared: {args.profile} profile inputs are cached; build --offline can now reuse them")
    return 0


def command_build(args: argparse.Namespace) -> int:
    data = load_manifest()
    version = validate(data)
    spec = profile(data, args.profile)
    target = args.target or target_triple()
    binary = build_binary(spec, target=args.target, offline=args.offline)

    epoch = source_epoch()
    revision = source_revision()
    files = [
        {"path": f"bin/{binary.name}", "sha256": sha256_file(binary), "mode": "0755"},
    ]
    for item in spec["include"]:
        files.append(
            {"path": f"share/torviello/{item}", "sha256": sha256_file(ROOT / item), "mode": "0644"}
        )
    files.sort(key=lambda entry: entry["path"])
    provenance = {
        "schema": SCHEMA,
        "product": data["product"]["name"],
        "version": version,
        "profile": args.profile,
        "description": spec["description"],
        "features": spec["features"],
        "target": target,
        "source_revision": revision,
        "source_state": source_state(),
        "source_date_epoch": epoch,
        "lockfiles": lockfile_digests(),
        "files": files,
    }

    output = ROOT / data["product"]["output_dir"]
    output.mkdir(parents=True, exist_ok=True)
    suffix = "zip" if sys.platform == "win32" else "tar.gz"
    archive = output / f"{data['product']['name']}-{version}-{args.profile}-{target}.{suffix}"
    serialize(archive, archive_entries(binary, spec, provenance), epoch)
    digest = sha256_file(archive)
    (output / f"{archive.name}.sha256").write_text(f"{digest}  {archive.name}\n", encoding="utf-8")

    release_manifest = {
        **provenance,
        "artifact": {"name": archive.name, "sha256": digest, "bytes": archive.stat().st_size},
        "command": " ".join(sys.argv),
        "builder": {
            "os": platform.platform(),
            "machine": platform.machine(),
            "python": platform.python_version(),
        },
        "toolchain": toolchain(),
        "built_at": datetime.now(tz=UTC).isoformat(),
    }
    manifest = output / f"{archive.name}.manifest.json"
    manifest.write_text(
        json.dumps(release_manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    summary = {"archive": str(archive), "manifest": str(manifest), "sha256": digest}
    emit(json.dumps(summary, indent=2))
    return 0


def command_verify(args: argparse.Namespace) -> int:
    manifest_path = Path(args.manifest).resolve()
    if not manifest_path.is_file():
        raise PackagingError(f"manifest does not exist: {manifest_path}")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    archive_path = manifest_path.parent / manifest["artifact"]["name"]
    if not archive_path.is_file():
        raise PackagingError(f"artifact does not exist: {archive_path}")
    actual = sha256_file(archive_path)
    expected = manifest["artifact"]["sha256"]
    if actual != expected:
        raise PackagingError(
            f"digest mismatch for {archive_path.name}: expected {expected}, got {actual}"
        )
    for entry in manifest["files"]:
        member = entry["path"]
        if member.startswith("bin/"):
            continue
        source = (ROOT / member.removeprefix("share/torviello/")).resolve()
        if source.is_file() and sha256_file(source) != entry["sha256"]:
            raise PackagingError(f"input changed after packaging: {member}")
    emit(f"verified: {archive_path.name} sha256={actual}")
    return 0


def wix_build_command(wix: str, definition: Path) -> tuple[list[str], Path]:
    """Return the `wix build` argv and the directory to run it from.

    The definition references its payload as relative Source="payload/..."
    paths, which WiX resolves against the working directory, so the build
    runs beside the definition with absolute in/out paths.
    """
    definition = definition.resolve()
    msi = definition.with_suffix(".msi")
    return [wix, "build", "-arch", "x64", "-out", str(msi), str(definition)], definition.parent


def command_installer(args: argparse.Namespace) -> int:
    wix_installer = _load_wix_installer()
    summary = wix_installer.installer_document(args.manifest, args.archive, args.out)
    definition = Path(summary["definition"])
    emit(json.dumps(summary, indent=2))
    if not args.wix:
        return 0
    wix = shutil.which("wix")
    if not wix:
        raise PackagingError(
            "wix toolset not found on PATH; install with `dotnet tool install --global wix`"
        )
    command, cwd = wix_build_command(wix, definition)
    run(command, cwd=cwd)
    emit(f"installer: {command[5]}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Build Torviello release artifacts from torviello-engine/packaging/packaging.toml"
        ),
    )
    commands = parser.add_subparsers(dest="command", required=True)

    validate = commands.add_parser("validate", help="validate the release definition and inputs")
    validate.set_defaults(handler=command_validate)

    plan_cmd = commands.add_parser("plan", help="print the resolved build plan as JSON")
    plan_cmd.add_argument("--profile", required=True)
    plan_cmd.add_argument("--target")
    plan_cmd.set_defaults(handler=command_plan)

    prepare = commands.add_parser(
        "prepare", help="cache dependencies while the network is available"
    )
    prepare.add_argument("--profile", required=True)
    prepare.add_argument("--target")
    prepare.set_defaults(handler=command_prepare)

    build = commands.add_parser("build", help="build and package one profile")
    build.add_argument("--profile", required=True)
    build.add_argument("--target")
    build.add_argument("--offline", action="store_true", help="pass --offline to Cargo")
    build.set_defaults(handler=command_build)

    verify = commands.add_parser("verify", help="verify an artifact against its release manifest")
    verify.add_argument("manifest")
    verify.set_defaults(handler=command_verify)

    installer = commands.add_parser(
        "installer", help="generate a Windows WiX installer definition from a release artifact"
    )
    installer.add_argument("--manifest", required=True)
    installer.add_argument("--archive", required=True)
    installer.add_argument("--out", required=True, help="output directory for payload and .wxs")
    installer.add_argument(
        "--wix", action="store_true", help="run `wix build` to produce the .msi (requires WiX)"
    )
    installer.set_defaults(handler=command_installer)
    return parser


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    args = build_parser().parse_args(argv)
    try:
        return args.handler(args)
    except PackagingError as error:
        LOG.error("packaging error: %s", error)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
