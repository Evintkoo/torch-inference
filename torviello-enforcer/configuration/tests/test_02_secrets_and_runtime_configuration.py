"""Repo-wide conformance test for torviello-enforcer/configuration/rules/02-secrets-and-runtime-configuration.md (controls CFG-02)."""

import re
from pathlib import Path

import pytest

CONTROL = "CFG-02"
HERE = Path(__file__).resolve()
RULES_ROOT = HERE.parents[3]
SOURCE = RULES_ROOT

LANGUAGE_BY_SUFFIX = {
    ".rs": "rust",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".py": "python",
    ".go": "go",
    ".java": "java",
    ".kt": "kotlin",
    ".kts": "kotlin",
    ".c": "c",
    ".cc": "c++",
    ".cpp": "c++",
    ".h": "c/c++",
    ".hpp": "c++",
    ".cs": "csharp",
    ".rb": "ruby",
    ".php": "php",
    ".swift": "swift",
    ".sh": "shell",
    ".bash": "shell",
    ".zsh": "shell",
    ".ps1": "powershell",
    ".sql": "sql",
    ".vue": "vue",
    ".svelte": "svelte",
}
EXCLUDED_PARTS = {
    ".git",
    "target",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    "dist",
    "build",
    ".pytest_cache",
}
EXCLUDED_PREFIXES = {("torviello-enforcer",), ("requirements",), ("notes",)}
TEXT_SUFFIXES = {
    ".toml",
    ".json",
    ".yaml",
    ".yml",
    ".xml",
    ".ini",
    ".cfg",
    ".env",
    ".lock",
    ".gradle",
    ".mod",
}
MANIFEST_NAMES = {
    "Cargo.toml",
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "requirements-dev.txt",
    "Pipfile",
    "go.mod",
    "pom.xml",
    "build.gradle",
    "build.gradle.kts",
    "Gemfile",
    "composer.json",
    "Package.swift",
    "Directory.Build.props",
}
LOCKFILE_NAMES = {
    "Cargo.lock",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lockb",
    "poetry.lock",
    "uv.lock",
    "Pipfile.lock",
    "go.sum",
    "Gemfile.lock",
    "composer.lock",
    "packages.lock.json",
}


def src(*parts: str) -> Path:
    return SOURCE.joinpath(*parts)


def is_excluded(path: Path) -> bool:
    parts = path.relative_to(SOURCE).parts
    if any(part in EXCLUDED_PARTS for part in parts):
        return True
    return any(parts[: len(prefix)] == prefix for prefix in EXCLUDED_PREFIXES)


def all_files(suffixes: set[str] | None = None) -> list[Path]:
    result: list[Path] = []
    for path in SOURCE.rglob("*"):
        if not path.is_file() or is_excluded(path):
            continue
        if suffixes is not None and path.suffix.lower() not in suffixes:
            continue
        result.append(path)
    return sorted(result)


def files(glob: str, root: str = ".") -> list[Path]:
    base = SOURCE if root == "." else src(*root.split("/"))
    if not base.exists():
        return []
    return sorted(path for path in base.rglob(glob) if path.is_file() and not is_excluded(path))


def source_files() -> list[Path]:
    return all_files(set(LANGUAGE_BY_SUFFIX))


def languages() -> list[str]:
    return sorted({LANGUAGE_BY_SUFFIX[path.suffix.lower()] for path in source_files()})


def lang_files(language: str) -> list[Path]:
    return [path for path in source_files() if LANGUAGE_BY_SUFFIX[path.suffix.lower()] == language]


def read_path(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def read_all(paths: list[Path]) -> str:
    return "\n".join(read_path(path) for path in paths)


def read(rel: str) -> str:
    path = src(*rel.split("/"))
    if not path.exists():
        pytest.fail(f"[{CONTROL}] missing required artifact: {rel}")
    return read_path(path)


def code_text(language: str | None = None, root: str | None = None) -> str:
    if root is not None:
        return "\n".join(read_path(path) for path in files("*", root) if path.suffix.lower() in LANGUAGE_BY_SUFFIX)
    paths = lang_files(language) if language else source_files()
    return "\n".join(read_path(path) for path in paths)


def count(pattern: str, language: str | None = None, root: str | None = None) -> int:
    text = code_text(language=language, root=root)
    return len(re.findall(pattern, text, re.M))


def manifests() -> list[Path]:
    return [path for path in all_files(TEXT_SUFFIXES) if path.name in MANIFEST_NAMES]


def manifest_text() -> str:
    return read_all(manifests())


def lockfiles() -> list[Path]:
    return [path for path in all_files(TEXT_SUFFIXES) if path.name in LOCKFILE_NAMES]


def workflow_text() -> str:
    return read_all(
        [path for path in all_files({".yml", ".yaml"}) if ".github" in path.parts and "workflows" in path.parts]
    )


def config_files() -> list[Path]:
    result: list[Path] = []
    for path in all_files(TEXT_SUFFIXES):
        if path.name in LOCKFILE_NAMES or path.name in {"tsconfig.json", "jsconfig.json", "package-lock.json"}:
            continue
        if any(part in {"config", "configs", ".config"} for part in path.parts):
            result.append(path)
        elif path.parent == SOURCE and path.suffix.lower() in {".toml", ".yaml", ".yml", ".ini", ".cfg"}:
            result.append(path)
    return sorted(result)


def config_text() -> str:
    return read_all(config_files())


def discovered_tests() -> list[Path]:
    result: list[Path] = []
    for path in all_files(set(LANGUAGE_BY_SUFFIX)):
        parts = path.relative_to(SOURCE).parts
        if "test" in parts or "tests" in parts:
            result.append(path)
        elif path.name.startswith("test_") or path.name.endswith(("_test.rs", "_test.py", ".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx")):
            result.append(path)
    return result


def require(condition: object, message: str) -> None:
    if not condition:
        pytest.fail(f"[{CONTROL}] {message}")


def evidence(message: str) -> None:
    pytest.fail(f"[{CONTROL}] No source-observable evidence: {message}")


def test_configuration_02_secrets_and_runtime_configuration() -> None:
    """Assert this rule across the repository's multi-language source tree."""
    if not SOURCE.is_dir():
        pytest.fail(f"[{CONTROL}] source tree not found: {SOURCE}")
    require(source_files(), "no product source files found in the repository")
    require(languages(), "no product source language detected")
    committed = config_text() + manifest_text()
    require(
        not re.search(
            r"(?:secret|password|api[_-]?key|token)\s*[:=]\s*[\"'][^\"']{6,}[\"']",
            committed,
            re.I,
        )
        or not re.search(r"your[-_]|change[-_]?me|example|placeholder|dummy", committed, re.I),
        "committed configuration contains literal or placeholder secrets",
    )
    require(
        re.search(r"std::env::var|process\.env|os\.environ|os\.getenv|ENV\[", code_text()),
        "secrets are not injectable from the environment",
    )
    require(
        any(src(name).exists() for name in (".env.example", "docs/CONFIGURATION.md", "docs/configuration.md")),
        "no documented secret-injection path",
    )
