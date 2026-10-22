"""Generate one repo-wide conformance test per numbered rule document.

Generated tests are self-contained and language-agnostic: they scan the whole
repository for Rust, TypeScript/JavaScript, Python, Go, shell, SQL, and other
product sources. Rules are repository-wide, not tied to one module or language.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RULES = ROOT / "torviello-enforcer"

HEADER = '''"""Repo-wide conformance test for torviello-enforcer/__REL__ (controls __CONTROLS__)."""

__IMPORTS__import re
from pathlib import Path

import pytest

CONTROL = "__CONTROLS__"
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
    return "\\n".join(read_path(path) for path in paths)


def read(rel: str) -> str:
    path = src(*rel.split("/"))
    if not path.exists():
        pytest.fail(f"[{CONTROL}] missing required artifact: {rel}")
    return read_path(path)


def code_text(language: str | None = None, root: str | None = None) -> str:
    if root is not None:
        return "\\n".join(read_path(path) for path in files("*", root) if path.suffix.lower() in LANGUAGE_BY_SUFFIX)
    paths = lang_files(language) if language else source_files()
    return "\\n".join(read_path(path) for path in paths)


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


def test___NAME__() -> None:
    """Assert this rule across the repository's multi-language source tree."""
    if not SOURCE.is_dir():
        pytest.fail(f"[{CONTROL}] source tree not found: {SOURCE}")
    require(source_files(), "no product source files found in the repository")
    require(languages(), "no product source language detected")
'''

FOOTER = ""


def lines(block: str) -> list[str]:
    bare = block.strip("\n")
    return [("    " + line if line.strip() else "") for line in bare.splitlines()]


BUNDLES: dict[str, str] = {}

BUNDLES["no_dead_code"] = r'''
hits = count(r"#!?\[allow\(dead_code\)\]")
require(hits == 0, f"dead_code suppressions remain in repository sources: {hits}")
'''

BUNDLES["no_println"] = r'''
hits = count(r"\bprintln!\s*\(|\beprintln!\s*\(|\bconsole\.(?:log|debug|info|warn|error)\s*\(|\bSystem\.out\.print|\bfmt\.Print(?:ln|f)?\s*\(|\bprint\s*\(")
require(hits == 0, f"stdout logging remains in repository sources: {hits}")
'''

BUNDLES["file_size"] = r'''
large = []
for path in source_files():
    length = len(read_path(path).splitlines())
    if length > 500:
        large.append((str(path.relative_to(SOURCE)), length))
require(not large, f"source files exceed 500 lines: {sorted(large)[:8]}")
'''

BUNDLES["fmt_lint"] = r'''
detected = set(languages())
cargo = manifest_text()
ci = workflow_text()
checks: dict[str, bool] = {}
if "rust" in detected:
    checks["rust"] = (
        (src("rustfmt.toml").exists() or src(".rustfmt.toml").exists())
        and ("clippy" in cargo or src("clippy.toml").exists() or src(".clippy.toml").exists())
        and "cargo fmt" in ci
        and "cargo clippy" in ci
    )
if detected & {"typescript", "javascript", "vue", "svelte"}:
    package = read("package.json") if src("package.json").exists() else ""
    checks["js/ts"] = (
        any(
            src(name).exists()
            for name in (
                "eslint.config.js",
                "eslint.config.mjs",
                "eslint.config.cjs",
                ".eslintrc",
                ".eslintrc.json",
                ".eslintrc.cjs",
            )
        )
        and ('"lint"' in package or "lint:" in package)
        and ("prettier" in package or src(".prettierrc").exists() or src("prettier.config.js").exists())
    )
if "python" in detected:
    checks["python"] = (
        any(src(name).exists() for name in ("ruff.toml", ".ruff.toml", ".flake8", ".pylintrc"))
        or "[tool.ruff]" in cargo
        or "[tool.black]" in cargo
        or "ruff" in ci
        or "black" in ci
    )
if "go" in detected:
    checks["go"] = src(".golangci.yml").exists() or src(".golangci.yaml").exists()
missing = sorted(language for language, ok in checks.items() if not ok)
require(not missing, f"languages without enforced lint/format configuration: {missing}")
'''

BUNDLES["web_lint"] = r'''
package = json.loads(read("package.json")) if src("package.json").exists() else {}
require("lint" in package.get("scripts", {}), "web workspace has no lint script")
require(
    any(
        src(name).exists()
        for name in (
            "eslint.config.js",
            "eslint.config.mjs",
            "eslint.config.cjs",
            ".eslintrc",
            ".eslintrc.json",
            ".eslintrc.cjs",
        )
    ),
    "no ESLint configuration for the web workspace",
)
'''

BUNDLES["ci"] = r'''
workflows = [p for p in all_files({".yml", ".yaml"}) if ".github" in p.parts and "workflows" in p.parts]
require(workflows, "no CI workflow files exist")
ci = workflow_text()
require("cargo" in ci or "rust" in ci or "rust" not in languages(), "CI does not build the Rust workspace")
require(any(token in ci for token in ("npm", "pnpm", "yarn", "bun")), "CI does not build the JS/TS workspace")
require(any(token in ci for token in ("pytest", "python", "ruff", "uv ")), "CI does not verify the Python workspace")
require(re.search(r"audit|trivy|dependabot|snyk|osv", ci, re.I), "CI has no dependency/security audit job")
'''

BUNDLES["tests"] = r'''
product_tests = discovered_tests()
require(product_tests, "no test files exist in the repository")
test_languages = sorted(
    {LANGUAGE_BY_SUFFIX[path.suffix.lower()] for path in product_tests if path.suffix.lower() in LANGUAGE_BY_SUFFIX}
)
require(len(test_languages) >= 2, f"tests cover only one language: {test_languages}")
'''

BUNDLES["openapi"] = r'''
specs = [
    path
    for path in all_files({".json", ".yaml", ".yml"})
    if "openapi" in path.name.lower() or "swagger" in path.name.lower()
]
require(specs, "no OpenAPI/Swagger contract file exists")
spec = read_all(specs)
require(re.search(r"openapi[\"']?\s*[:=]|swagger[\"']?\s*[:=]", spec, re.I), "contract has no OpenAPI version")
require(re.search(r"paths\s*[\"']?\s*[:=]", spec), "contract declares no paths")
'''

BUNDLES["openapi_coverage"] = r'''
specs = [
    path
    for path in all_files({".json", ".yaml", ".yml"})
    if "openapi" in path.name.lower() or "swagger" in path.name.lower()
]
require(specs, "no OpenAPI contract file exists")
spec = read_all(specs)
routes = set(
    re.findall(
        r"(?:route|get|post|put|patch|delete|use)\s*\(\s*[\"'](/[^\"']+)[\"']",
        code_text(),
        re.I,
    )
)
require(routes, "no route registrations found in the repository")
declared = set(re.findall(r"[\"']?(/[A-Za-z0-9_./{}:-]+)[\"']?\s*:", spec))
missing = sorted(route for route in routes if route not in declared and not any(path.startswith(route) for path in declared))
require(not missing, f"routes missing from the OpenAPI contract: {missing[:10]}")
'''

BUNDLES["api_schemas"] = r'''
schema_roots = [
    path
    for path in SOURCE.rglob("*")
    if path.is_dir()
    and path.name.lower() in {"schemas", "schema", "contracts", "dto", "dtos"}
    and "api" in str(path.relative_to(SOURCE)).lower()
]
require(schema_roots, "API schemas are not isolated in a dedicated api schema/contracts directory")
'''

BUNDLES["error_status"] = r'''
code = code_text()
require(
    re.search(r"\b(?:400|401|403|404|408|413|429|500|503|504)\b", code),
    "no explicit HTTP status mapping found in repository sources",
)
require(
    re.search(r"error[_-]?envelope|error[_-]?code|application/problem\+json|problem[_-]?details", code, re.I),
    "no stable error envelope/code contract found in repository sources",
)
'''

BUNDLES["idempotency"] = r'''
require(
    re.search(r"idempotency[_-]?key|idempotent[_-]?key", code_text(), re.I),
    "no idempotency-key contract exists in repository sources",
)
'''

BUNDLES["pagination"] = r'''
code = code_text()
require(
    re.search(r"\bcursor\b", code, re.I) and re.search(r"page|pagination", code, re.I),
    "no cursor pagination found in repository sources",
)
require(
    re.search(r"page[_-]?size|max_limit|per_page", code, re.I),
    "no bounded page size found in repository sources",
)
'''

BUNDLES["cache_headers"] = r'''
code = code_text()
require("cache-control" in code.lower() or "cachecontrol" in code.lower(), "no explicit Cache-Control policy")
require("no-store" in code.lower(), "sensitive responses never set Cache-Control: no-store")
'''

BUNDLES["retry_after"] = r'''
require(
    re.search(r"retry[_-]?after", code_text(), re.I),
    "no Retry-After emission found in repository sources",
)
'''

BUNDLES["compression_limits"] = r'''
code = code_text()
require(
    re.search(r"decompress|content-encoding|gzip|brotli", code, re.I),
    "no decompression/content-encoding handling",
)
require(
    re.search(r"max[_-]?\w*(?:size|bytes|expansion)|limit", code, re.I),
    "compression path has no bounded expansion limit",
)
'''

BUNDLES["body_limits"] = r'''
code = code_text() + config_text()
require(
    re.search(r"body[_-]?limit|max[_-]?body|payload[_-]?limit|client_max_body_size", code, re.I),
    "no request-body size limit",
)
require(
    re.search(r"payload[_-]?too[_-]?large|413|entity too large", code, re.I),
    "oversized bodies are not mapped to a safe client error",
)
'''

BUNDLES["ws_limits"] = r'''
code = code_text()
require(re.search(r"websocket|ws://|upgrade", code, re.I), "no WebSocket transport handling")
require(
    re.search(r"max[_-]?\w*(?:frame|message|size|size_bytes)|limit", code, re.I),
    "WebSocket transport has no frame/message limit",
)
'''

BUNDLES["auth_wired"] = r'''
code = code_text()
require(
    re.search(r"\b(jwt|bearer|oauth|oidc|session|passport)\b", code, re.I),
    "no authentication mechanism found in repository sources",
)
require(
    re.search(r"auth[_-]?middleware|authentication|require[_-]?auth|is[_-]?authenticated", code, re.I),
    "authentication is not wired into a request boundary",
)
'''

BUNDLES["authz"] = r'''
require(
    re.search(
        r"\b(require_role|has_role|check_permission|is_authorized|role_guard|access_control|rbac|abac)\b",
        code_text(),
        re.I,
    ),
    "no authorization/role checks exist in repository sources",
)
'''

BUNDLES["rate_limit"] = r'''
code = code_text()
require(re.search(r"rate[_-]?limit|throttl", code, re.I), "no rate-limit/throttling implementation")
require(re.search(r"429|too[_-]?many[_-]?requests", code, re.I), "no HTTP 429 mapping")
'''

BUNDLES["sanitizer"] = r'''
code = code_text()
require(re.search(r"sanitiz|escape|validate[_-]?input", code, re.I), "no input sanitization found")
require(
    re.search(r"sanitiz\w*\s*\(|sanitize[_-]?\w+\s*\(", code, re.I),
    "sanitizer is not invoked at a request boundary",
)
'''

BUNDLES["secrets"] = r'''
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
'''

BUNDLES["config_single"] = r'''
configs = config_files()
require(configs, "no repository configuration files found")
formats = {path.suffix.lower() for path in configs}
require(len(formats) == 1, f"mixed configuration formats: {sorted(formats)}")
require(
    any(
        "schema" in path.name.lower()
        for path in all_files({".json", ".yaml", ".yml", ".toml"})
    )
    or re.search(r"pydantic|zod|schemars|jsonschema|configschema", manifest_text(), re.I),
    "configuration is not validated against a schema",
)
'''

BUNDLES["config_env"] = r'''
code = code_text()
require(
    re.search(r"std::env::var|process\.env|os\.environ|os\.getenv|ENV\[", code),
    "configuration does not read environment variables",
)
require(
    re.search(r"(?:TORCH_|CONFIG_|INFERENCE_|APP_)[A-Z_]+", code),
    "no namespaced configuration environment variables",
)
'''

BUNDLES["config_reload"] = r'''
require(
    re.search(r"SIGHUP|reload[_-]?config|watch[_-]?config|config[_-]?watch|on[_-]?config[_-]?change", code_text(), re.I),
    "no configuration reload/watch path exists",
)
'''

BUNDLES["operator_controls"] = r'''
code = code_text()
require(re.search(r"redact|mask", code, re.I), "secrets are not redacted from logs or diagnostics")
require(re.search(r"\b(admin|operator)\b", code, re.I), "no operator-only control path for secret configuration")
'''

BUNDLES["db"] = r'''
dependencies = manifest_text().lower()
db = [
    name
    for name in (
        "sqlx",
        "diesel",
        "sea-orm",
        "rusqlite",
        "tokio-postgres",
        "postgres",
        "mysql",
        "mongodb",
        "prisma",
        "typeorm",
        "sequelize",
        "knex",
        "sqlalchemy",
        "alembic",
        "drizzle",
        "gorm",
    )
    if name in dependencies
]
require(db, "no database dependency is selected")
migrations = [path for path in SOURCE.rglob("*") if path.is_dir() and path.name.lower() in {"migrations", "migration"}]
require(migrations, "no migrations directory exists")
'''

BUNDLES["packaging_framework"] = r'''
shell = [str(path.relative_to(SOURCE)) for path in source_files() if path.suffix.lower() in {".sh", ".bash", ".zsh", ".ps1"} and ("packaging" in path.parts or "scripts" in path.parts)]
require(not shell, f"packaging/scripts still rely on platform shell scripts: {shell[:10]}")
require(
    any(src(name).exists() for name in ("ansible", "packaging/ansible", "Taskfile.yml", "Earthfile", "justfile")),
    "no platform-agnostic packaging workflow (ansible/task/earthly/just)",
)
'''

BUNDLES["sbom"] = r'''
require(
    re.search(r"sbom|cyclonedx|syft|spdx", workflow_text(), re.I),
    "release workflow does not generate an SBOM",
)
'''

BUNDLES["release_gates"] = r'''
release = workflow_text()
require(re.search(r"release", release, re.I), "no release workflow exists")
require("needs:" in release, "release jobs have no dependency gates")
require(re.search(r"test|audit|verify|sign", release, re.I), "release workflow does not gate on tests, audit, or signing")
'''

BUNDLES["release_variants"] = r'''
release = workflow_text().lower()
require("engine" in release and "full" in release, "no engine-only and full release variants")
'''

BUNDLES["reproducible"] = r'''
require(lockfiles(), "no dependency lockfile is committed")
release = workflow_text()
require(
    any(token in release for token in ("--locked", "--frozen", "npm ci", "pnpm install --frozen-lockfile", "uv sync --locked")),
    "release builds are not lockfile-pinned",
)
'''

BUNDLES["artifact_integrity"] = r'''
require(
    re.search(r"sha256|checksum|sigstore|cosign|minisign", workflow_text(), re.I),
    "release artifacts have no checksum or signature step",
)
'''

BUNDLES["rollback"] = r'''
require(
    any(src(name).exists() for name in ("docs/DEPLOYMENT.md", "docs/deployment.md", "docs/operations/rollback.md")),
    "no deployment documentation for rollback",
)
rollback_text = read_all(
    [path for path in all_files({".md"}) if path.name.lower() in {"deployment.md", "rollback.md"}]
)
require("rollback" in rollback_text.lower(), "deployment docs do not describe rollback")
'''

BUNDLES["release_versioning"] = r'''
release = workflow_text()
require(re.search(r"v\*\.\*\.\*|tag", release, re.I), "release is not driven by semver tags")
require(
    re.search(r"^version\s*=|version[\"']?\s*[:=]|\"version\"\s*:", manifest_text(), re.M | re.I),
    "no package/application version is declared",
)
'''

BUNDLES["install_upgrade"] = r'''
require(
    any(src(name).exists() for name in ("docs/guides/installation.md", "docs/INSTALL.md", "INSTALL.md")),
    "no installation guide",
)
install_text = read_all(
    [path for path in all_files({".md"}) if path.name.lower() in {"installation.md", "install.md"}]
)
require(re.search(r"upgrade|migration", install_text, re.I), "installation guide has no upgrade or migration path")
'''

BUNDLES["release_security"] = r'''
require(
    re.search(r"cosign|sigstore|gpg|sign", workflow_text(), re.I),
    "release workflow does not sign artifacts",
)
'''

BUNDLES["license"] = r'''
require(src("LICENSE").exists(), "LICENSE is missing")
license_text = read("LICENSE")
require("Apache License" in license_text or "MIT License" in license_text, "LICENSE has no recognized text")
require(
    re.search(r"commercial\s+(use|license|licence|purpose)", license_text, re.I)
    or src("COMMERCIAL_LICENSE.md").exists(),
    "no commercial-use terms accompany the product license",
)
'''

BUNDLES["third_party_notices"] = r'''
require(
    src("NOTICE").exists() or src("THIRD_PARTY_NOTICES.md").exists() or src("third_party").is_dir(),
    "no aggregated third-party notices file",
)
'''

BUNDLES["copyright_headers"] = r'''
missing = [str(path.relative_to(SOURCE)) for path in source_files() if "Copyright" not in read_path(path)[:500]]
require(not missing, f"source files lack copyright headers: {missing[:8]}")
'''

BUNDLES["model_rights"] = r'''
require(
    any(src(name).exists() for name in ("docs/model-licenses.md", "MODEL_LICENSES.md", "docs/models/licenses.md")),
    "no model/dataset/font/media rights record",
)
'''

BUNDLES["license_policy"] = r'''
require(
    any(src(name).exists() for name in ("docs/LICENSE_POLICY.md", "LICENSING.md", "docs/licensing.md")),
    "no license policy or commercial-use record",
)
'''

BUNDLES["model_registry"] = r'''
registries = [path for path in all_files({".json", ".yaml", ".yml", ".toml"}) if "model" in path.name.lower() and "registr" in path.name.lower()]
require(registries, "no model registry file exists")
registry = read_all(registries)
require(re.search(r"hash|sha256|digest", registry, re.I), "model registry records no content hash")
require(re.search(r"version", registry, re.I), "model registry records no version")
'''

BUNDLES["model_checksums"] = r'''
code = code_text()
require("sha256" in code.lower(), "no SHA-256 verification in model handling")
require(re.search(r"verify|checksum", code, re.I), "model integrity is not verified before use")
'''

BUNDLES["model_download_security"] = r'''
code = code_text()
require("https" in code.lower(), "model downloads are not restricted to HTTPS")
require(re.search(r"sha256|checksum|signature", code, re.I), "model downloads do not verify integrity")
'''

BUNDLES["model_cards"] = r'''
require(
    any(path.is_dir() for path in SOURCE.rglob("model-cards"))
    or src("MODEL_CARDS.md").exists(),
    "no model evaluation or release cards exist",
)
'''

BUNDLES["structured_logs"] = r'''
code = code_text()
require(
    re.search(r"tracing|structlog|winston|pino|logrus|zap|serilog|logging\.", code, re.I),
    "no structured logging library is used",
)
require(re.search(r"correlation|request[_-]?id|trace[_-]?id", code, re.I), "no correlation-ID propagation")
'''

BUNDLES["metrics"] = r'''
require(
    re.search(r"prometheus|opentelemetry|metrics|statsd", manifest_text() + code_text(), re.I),
    "no metrics instrumentation is present",
)
require(re.search(r"/metrics|metrics[_-]?endpoint", code_text(), re.I), "no metrics endpoint is exposed")
'''

BUNDLES["health"] = r'''
code = code_text()
require(re.search(r"/health|health[_-]?check|liveness", code, re.I), "no health handler")
require(re.search(r"readiness|ready|startup", code, re.I), "health surface exposes no readiness/liveness distinction")
'''

BUNDLES["graceful"] = r'''
code = code_text()
require(re.search(r"shutdown[_-]?timeout|graceful[_-]?shutdown", code, re.I), "no graceful shutdown timeout")
require(re.search(r"SIGTERM|SIGINT|ctrl_c|signal", code, re.I), "no termination-signal handling")
'''

BUNDLES["resilience"] = r'''
code = code_text()
for primitive in ("bulkhead", "circuit[_-]?breaker", "retry"):
    require(re.search(primitive, code, re.I), f"missing resilience primitive: {primitive}")
'''

BUNDLES["resource_limits"] = r'''
text = config_text() + code_text()
require(re.search(r"max[_-]?\w+", text, re.I), "no bounded resource limits")
require(re.search(r"timeout", text, re.I), "no request/operation timeouts")
'''

BUNDLES["benches"] = r'''
benchmarks = [
    path
    for path in all_files()
    if "bench" in path.name.lower() or "benchmark" in path.name.lower() or "benches" in path.parts
]
require(benchmarks, "no benchmarks exist")
'''

BUNDLES["bench_docs"] = r'''
require(
    any(src(name).exists() for name in ("docs/BENCHMARKS.md", "benches/README.md", "benchmarks/README.md")),
    "no benchmark method or performance-claim documentation",
)
'''

BUNDLES["batch"] = r'''
code = code_text()
require(re.search(r"batch", code, re.I), "no batching implementation")
require(re.search(r"max[_-]?batch|batch[_-]?size", config_text() + code, re.I), "batch size is not bounded")
'''

BUNDLES["gpu_backends"] = r'''
blob = (manifest_text() + code_text()).lower()
for backend in ("cuda", "metal", "vulkan", "rocm", "coreml", "directml"):
    require(backend in blob, f"accelerator backend is not configured: {backend}")
'''

BUNDLES["fallback"] = r'''
require(
    re.search(r"fallback|fall[_-]?back|cpu", code_text(), re.I),
    "accelerator selection has no CPU fallback path",
)
'''

BUNDLES["platform_matrix"] = r'''
ci = workflow_text()
require("ubuntu" in ci or "linux" in ci, "CI does not cover Linux")
require("macos" in ci or "windows" in ci, "CI does not cover a second operating system")
'''

BUNDLES["feature_gates"] = r'''
text = manifest_text()
require(
    re.search(r"\[features\]|optionalDependencies|\[project\.optional-dependencies\]|extras|build[_-]?tags|targets", text, re.I),
    "no optional-capability feature matrix",
)
require(
    re.search(r"cfg\(feature|process\.env\.|import\.meta\.env|#\[cfg|feature[_-]?flag", code_text(), re.I),
    "optional capabilities are not gated by feature flags",
)
'''

BUNDLES["build_profiles"] = r'''
text = manifest_text()
require(
    re.search(r"\[profile\.|scripts|build[_-]?profile|release[_-]?profile", text, re.I),
    "no build profiles or build scripts",
)
'''

BUNDLES["boundaries"] = r'''
leaks = []
for path in source_files():
    if "core" not in path.parts:
        continue
    text = read_path(path)
    if re.search(r"crate::api|from\s+['\"].*api|import\s+.*api|require\(['\"].*api", text, re.I):
        leaks.append(str(path.relative_to(SOURCE)))
require(not leaks, f"core modules depend on the API layer: {leaks}")
'''

BUNDLES["ownership_docs"] = r'''
require(src("docs/ARCHITECTURE.md").exists(), "no architecture documentation")
require(
    any(src(name).exists() for name in ("docs/modules/README.md", "docs/OWNERSHIP.md", "CODEOWNERS", ".github/CODEOWNERS")),
    "no module ownership documentation",
)
'''

BUNDLES["layout_contract"] = r'''
require(
    any((SOURCE / name).is_dir() for name in ("src", "app", "packages", "services", "web")),
    "no main module directory exists",
)
require(
    any(path.is_dir() for path in SOURCE.rglob("*") if path.name.lower() in {"schemas", "contracts", "dto"})
    or any(path.name in {"types.ts", "types.py", "types.rs"} for path in source_files()),
    "API/domain contracts are not isolated from handlers",
)
'''

BUNDLES["test_layout"] = r'''
test_dirs = [path for path in SOURCE.rglob("*") if path.is_dir() and path.name.lower() in {"test", "tests", "spec", "specs", "__tests__"}]
require(len(test_dirs) >= 2, "tests are not categorized into distinct levels")
require(any(path.name.lower() in {"e2e", "integration", "unit", "contract", "playwright", "cypress"} for path in SOURCE.rglob("*") if path.is_dir()), "no named test level/category")
'''

BUNDLES["test_data_layout"] = r'''
require(
    any(path.is_dir() for path in SOURCE.rglob("*") if path.name.lower() in {"fixtures", "testdata", "test-data", "test_data"})
    or any(path.name in {"conftest.py", "helpers.rs", "test-utils.ts"} for path in source_files()),
    "no separated test-data/fixture location",
)
'''

BUNDLES["contract_tests"] = r'''
require(discovered_tests(), "no test files exist")
require(
    re.search(r"openapi|schema|contract", read_all(discovered_tests()), re.I),
    "no OpenAPI/schema contract tests",
)
'''

BUNDLES["security_tests"] = r'''
tests = read_all(discovered_tests())
require(
    re.search(r"proptest!|quickcheck!|fuzz|injection|malformed|property[_-]?based", tests, re.I),
    "no robustness or failure-injection tests",
)
'''

BUNDLES["hardware_tests"] = r'''
require(
    re.search(r"gpu|cuda|metal|vulkan|rocm", workflow_text() + read_all(discovered_tests()), re.I),
    "no hardware/accelerator verification path",
)
'''

BUNDLES["flakiness"] = r'''
tests = read_all(discovered_tests())
require(
    re.search(r"RUST_TEST_THREADS|serial|seed|retry|flake", tests, re.I),
    "tests expose no determinism or flakiness controls",
)
'''

BUNDLES["supply_chain"] = r'''
detected = languages()
required = {
    "rust": "Cargo.lock",
    "typescript": "package-lock.json",
    "javascript": "package-lock.json",
    "python": "uv.lock",
    "go": "go.sum",
}
missing = [lock for language, lock in required.items() if language in detected and not (SOURCE / lock).exists()]
require(not missing, f"missing lockfiles for detected languages: {missing}")
ci = workflow_text()
require(re.search(r"audit|trivy|osv|dependabot|snyk|cargo deny", ci, re.I), "CI has no dependency-policy gate")
'''

BUNDLES["unsafe_audit"] = r'''
rust = lang_files("rust")
require(rust, "no Rust sources exist for the unsafe-code control")
unsafe_count = count(r"\bunsafe\b", language="rust")
safety_count = count(r"// SAFETY:", language="rust")
require(
    unsafe_count <= safety_count,
    f"unsafe blocks lack SAFETY justification: {unsafe_count} unsafe vs {safety_count} comments",
)
'''

BUNDLES["error_types"] = r'''
code = code_text()
require(
    re.search(r"derive\([^)]*Error|class\s+\w*Error|type\s+\w*Error|interface\s+\w*Error|enum\s+\w*Error", code),
    "no explicit error types",
)
require(
    re.search(r"Result<|throws|raise\s+\w*Error|Result\[|error[_-]?type", code),
    "no shared error/result contract",
)
'''

BUNDLES["readability"] = r'''
configs = config_text() + manifest_text()
require(
    any(src(name).exists() for name in ("rustfmt.toml", ".rustfmt.toml", ".prettierrc", "ruff.toml", ".flake8", ".editorconfig"))
    or "[tool.ruff]" in configs
    or "[tool.black]" in configs,
    "no shared readability/format configuration",
)
'''

BUNDLES["function_limits"] = r'''
require(
    re.search(r"too_many_lines|too_many_arguments|max-lines|max-params|complexity", manifest_text() + config_text(), re.I),
    "no function-size/argument/complexity lint limits",
)
'''

BUNDLES["debt_register"] = r'''
require(
    any(src(name).exists() for name in ("docs/TECHNICAL_DEBT.md", "docs/technical-debt.md", "TECHNICAL_DEBT.md")),
    "no tracked technical-debt register",
)
'''

BUNDLES["deprecation"] = r'''
require(
    re.search(r"deprecat|sunset", code_text(), re.I),
    "no API deprecation or sunset mechanism",
)
'''

BUNDLES["versioning"] = r'''
require(
    re.search(r"^version\s*=|version[\"']?\s*[:=]|\"version\"\s*:", manifest_text(), re.M | re.I)
    or any("openapi" in path.name.lower() for path in all_files({".json", ".yaml", ".yml"})),
    "no application or API version is declared",
)
'''

BUNDLES["canvas"] = r'''
data = json.loads(read("canvas/data.json"))
require(bool(data.get("branches")), "canvas blueprint has no branches")
nodes = [node for branch in data["branches"] for node in branch.get("nodes", [])]
require(nodes, "canvas blueprint has no nodes")
require(any(node.get("path") for node in nodes), "canvas nodes do not map to source paths")
'''

BUNDLES["docs_architecture"] = r'''
require(any(src(name).exists() for name in ("docs/ARCHITECTURE.md", "docs/architecture.md")), "no architecture document")
arch = read_all([path for path in all_files({".md"}) if "architecture" in path.name.lower()])
require(re.search(r"mermaid|diagram|component|context", arch, re.I), "architecture document has no views/diagrams")
'''

BUNDLES["docs_engine"] = r'''
engines = [
    name
    for name in (
        "mkdocs.yml",
        "docusaurus.config.js",
        "docusaurus.config.ts",
        "astro.config.mjs",
        "vitepress.config.ts",
        "docs/conf.py",
        "docs/book.toml",
        "nextra.config.js",
    )
    if src(name).exists()
]
require(engines, "no documentation rendering engine is configured")
'''

BUNDLES["adr"] = r'''
require(
    any((SOURCE / name).is_dir() for name in ("docs/adr", "docs/decisions", "adr", "decisions")),
    "no architecture decision records directory",
)
'''

BUNDLES["atomic_components"] = r'''
require(
    any((SOURCE / name).is_dir() for name in ("web/src/components/ui", "src/components/ui", "app/components/ui", "components/ui")),
    "no shared UI component layer",
)
require(
    any((SOURCE / name).is_dir() for name in ("web/src/features", "src/features", "app/features")),
    "no feature-module layer",
)
'''

BUNDLES["accessibility"] = r'''
ui = read_all([path for path in all_files({".tsx", ".jsx", ".vue", ".svelte", ".html"})])
require("aria-" in ui, "no ARIA attributes in the UI")
require(re.search(r"tabindex|onKeyDown|keyboard", ui, re.I), "no keyboard-interaction handling in the UI")
'''

BUNDLES["component_states"] = r'''
ui = read_all([path for path in all_files({".tsx", ".jsx", ".vue", ".svelte"})])
for state in ("loading", "error", "empty"):
    require(state in ui.lower(), f"UI components do not model the {state} state")
'''

BUNDLES["record_evidence"] = r'''
record_path = f"governance/records/{CONTROL.lower()}.json"
require(src(record_path).exists(), f"no governance evidence record exists for {CONTROL}")
record = json.loads(read(record_path))
require(record.get("control") == CONTROL, f"evidence record is for {record.get('control')}, not {CONTROL}")
require(record.get("owner"), f"{CONTROL} evidence record has no accountable owner")
require(record.get("status") in {"approved", "active", "monitored"}, f"{CONTROL} evidence record is not approved or active")
require(record.get("reviewed_at"), f"{CONTROL} evidence record has no review date")
require(str(record.get("artifact", "")).startswith("governance/"), f"{CONTROL} evidence record has no governance artifact")
terms = record.get("required_terms") or []
require(len(terms) >= 3, f"{CONTROL} evidence record does not define enough review terms")
artifact = read(record["artifact"])
missing_terms = [term for term in terms if term.lower() not in artifact.lower()]
require(not missing_terms, f"{CONTROL} evidence artifact is missing: {missing_terms}")

metric = record.get("metric")
require(isinstance(metric, dict), f"{CONTROL} has no measurable control definition")
for field in ("name", "target", "unit", "direction", "source", "window", "method", "measurement_status", "current_value", "last_measured_at"):
    require(field in metric, f"{CONTROL} metric is missing {field}")
for field in ("name", "unit", "source", "window", "method"):
    require(isinstance(metric[field], str) and metric[field].strip(), f"{CONTROL} metric field {field} is empty")
require(metric["direction"] in {"at_least", "at_most"}, f"{CONTROL} metric direction is invalid")
target = metric["target"]
require(isinstance(target, (int, float)) and not isinstance(target, bool) and target > 0, f"{CONTROL} metric target must be a positive number")
require(metric["measurement_status"] in {"measured", "not_yet_measured"}, f"{CONTROL} measurement status is invalid")
if metric["measurement_status"] == "measured":
    current = metric["current_value"]
    require(isinstance(current, (int, float)) and not isinstance(current, bool), f"{CONTROL} measured control has no numeric current value")
    require(metric["last_measured_at"], f"{CONTROL} measured control has no measurement timestamp")
else:
    require(metric["current_value"] is None, f"{CONTROL} unmeasured control must not claim a current value")
    require(metric["last_measured_at"] is None, f"{CONTROL} unmeasured control must not claim a measurement timestamp")
'''

BUNDLES["design_review_evidence"] = BUNDLES["record_evidence"]

BUNDLES["media_assets"] = r'''
require(
    any((SOURCE / name).is_dir() for name in ("media", "marketing", "assets/media", "content/media")),
    "no media/marketing asset area exists in the monorepo",
)
'''

BUNDLES["monorepo"] = r'''
for area in ("services", "web", "docs", "packaging"):
    require((SOURCE / area).is_dir(), f"monorepo area is missing: {area}")
'''

BUNDLES["prometheus_config"] = r'''
prom = read_all([path for path in all_files({".yml", ".yaml"}) if "prometheus" in path.name.lower()])
require("scrape_configs" in prom, "Prometheus has no scrape configuration")
require(
    "rule_files" in prom or any("alert" in path.name.lower() for path in all_files({".yml", ".yaml"})),
    "Prometheus has no alerting rules",
)
'''

BUNDLES["otel"] = r'''
blob = manifest_text() + code_text()
require(re.search(r"opentelemetry|tracing-opentelemetry|otel", blob, re.I), "no OpenTelemetry dependency")
require(re.search(r"TraceContextPropagator|TextMapPropagator|\btraceparent\b", blob, re.I), "no trace-context propagation")
'''

BUNDLES["dashboards"] = r'''
require(
    any((SOURCE / name).is_dir() for name in ("monitoring/grafana", "monitoring/dashboards", "dashboards", "grafana")),
    "no dashboards directory for operator SLOs",
)
'''

BUNDLES["retention"] = r'''
require(
    re.search(r"retention|rotate|max[_-]?size|max[_-]?age", code_text() + config_text(), re.I),
    "no log/metric retention or rotation policy",
)
'''

BUNDLES["secrets_logging"] = r'''
require(
    re.search(r"redact|mask", code_text(), re.I),
    "logging has no secret-redaction path",
)
'''

BUNDLES["service_managers"] = r'''
units = [path for path in all_files() if path.suffix == ".service" or path.name in {"docker-compose.yml", "compose.yaml"}]
require(units, "no service-manager units exist")
'''

BUNDLES["deployment_profiles"] = r'''
compose = read_all([path for path in all_files({".yaml", ".yml"}) if path.name.startswith("compose")])
require("profiles:" in compose, "compose has no deployment profiles")
require(re.search(r"gpu|cpu", compose, re.I), "compose does not distinguish CPU and GPU profiles")
'''

BUNDLES["incident_docs"] = r'''
require(
    any(src(name).exists() for name in ("docs/INCIDENT_RESPONSE.md", "docs/operations/incident-response.md", "INCIDENT_RESPONSE.md")),
    "no incident-response runbook",
)
'''

BUNDLES["capacity_docs"] = r'''
require(
    any(src(name).exists() for name in ("docs/CAPACITY.md", "docs/operations/capacity.md", "CAPACITY.md")),
    "no capacity/readiness documentation",
)
'''

BUNDLES["threat_model_docs"] = r'''
require(
    any(src(name).exists() for name in ("docs/THREAT_MODEL.md", "docs/security/threat-model.md", "THREAT_MODEL.md")),
    "no threat model",
)
'''

BUNDLES["input_limits"] = r'''
text = config_text() + code_text()
require(re.search(r"max[_-]?\w+", text, re.I), "no input size/count limits")
require(re.search(r"validat|sanitiz", text, re.I), "no shared input validation module")
'''

BUNDLES["crypto"] = r'''
blob = manifest_text() + code_text()
require(any(name in blob for name in ("argon2", "bcrypt", "scrypt", "pbkdf2")), "no password-hashing primitive")
require(not re.search(r"\b(md5|sha1)\b", blob, re.I), "weak hash primitive (md5/sha1) is referenced")
'''

BUNDLES["vuln_response"] = r'''
require(src("SECURITY.md").exists(), "no vulnerability-disclosure policy")
require(re.search(r"advis|CVE|response", read("SECURITY.md"), re.I), "security policy has no vulnerability-response process")
'''

BUNDLES["network_security"] = r'''
blob = manifest_text() + code_text() + config_text()
require(re.search(r"tls|https|certificate", blob, re.I), "no TLS or transport-security handling")
require(re.search(r"cors|allowed[_-]?origin|reverse[_-]?proxy", blob, re.I), "no CORS/proxy transport boundary")
'''

BUNDLES["privacy"] = r'''
require(any(src(name).exists() for name in ("docs/PRIVACY.md", "PRIVACY.md", "docs/privacy.md")), "no privacy/data-minimization record")
'''

BUNDLES["secure_defaults"] = r'''
text = config_text()
require(re.search(r"auth[_-]?enabled\s*[:=]\s*true|require[_-]?auth", text, re.I), "authentication is not enabled by default")
require(re.search(r"host\s*[:=]\s*[\"']?127\.0\.0\.1|localhost", text, re.I), "server does not bind loopback by default")
'''

BUNDLES["rules_hierarchy"] = r'''
require((RULES_ROOT / "torviello-enforcer" / "AGENTS.md").exists(), "rule hierarchy/agents file is missing")
require((RULES_ROOT / "torviello-enforcer" / "README.md").exists(), "rule index is missing")
'''

BUNDLES["rules_quality"] = r'''
ids = []
for doc in sorted((RULES_ROOT / "torviello-enforcer").glob("*/*/*.md")):
    text = doc.read_text(encoding="utf-8")
    if doc.parent.name == "trails":
        continue
    ids.extend(re.findall(r"\*\*Control document:\*\* ([A-Z]+-\d+)", text))
require(len(ids) == len(set(ids)), "duplicate control IDs exist in the rule corpus")
'''

BUNDLES["coverage_register"] = r'''
register = RULES_ROOT / "torviello-enforcer" / "governance" / "assurance-register.md"
require(register.exists(), "assurance register is missing")
require("coverage" in register.read_text(encoding="utf-8").lower(), "assurance register has no coverage analysis")
'''

BUNDLES["assurance_register"] = r'''
register = RULES_ROOT / "torviello-enforcer" / "governance" / "assurance-register.md"
require(register.exists(), "assurance register is missing")
text = register.read_text(encoding="utf-8")
require("nonconformance" in text.lower(), "assurance register has no nonconformance process")
'''

BUNDLES["agent_evidence"] = r'''
agents = [RULES_ROOT / "AGENTS.md", RULES_ROOT / "torviello-enforcer" / "AGENTS.md"]
require(any(path.exists() for path in agents), "no agent operating standard exists")
require(
    re.search(
        r"control ID|requirement ID|evidence",
        "\n".join(path.read_text(encoding="utf-8") for path in agents if path.exists()),
        re.I,
    ),
    "agent standard does not require control/requirement/evidence mapping",
)
'''

BUNDLES["ai_oversight"] = r'''
require((RULES_ROOT / "AGENTS.md").exists() or (RULES_ROOT / "torviello-enforcer" / "AGENTS.md").exists(), "no AI-assistance operating policy")
require(
    (RULES_ROOT / "notes" / "manual_review_checks.md").exists()
    or (RULES_ROOT / "docs" / "ai-oversight.md").exists(),
    "no human-oversight record for AI-assisted work",
)
'''

BUNDLES["change_runbook"] = r'''
require(
    any(src(name).exists() for name in ("docs/CONTRIBUTING.md", "CONTRIBUTING.md", "docs/change-management.md")),
    "no contribution/change-execution runbook",
)
'''

BUNDLES["plan_retention"] = BUNDLES["record_evidence"]

BUNDLES["platform_support_docs"] = r'''
require(
    any(src(name).exists() for name in ("docs/SUPPORTED_PLATFORMS.md", "docs/PLATFORM_SUPPORT.md", "SUPPORTED_PLATFORMS.md")),
    "no supported-platform and end-of-life contract",
)
'''

BUNDLES["cross_compile"] = r'''
ci = workflow_text()
cargo_config = read(".cargo/config.toml") if src(".cargo/config.toml").exists() else ""
require(
    re.search(r"\btargets?:|cross-compil|\bcross\b", ci, re.I) or "[target." in cargo_config,
    "no cross-compilation target/ABI verification path",
)
'''

BUNDLES["registry_admin"] = r'''
code = code_text()
require(re.search(r"registry", code, re.I) and re.search(r"delete|update|register", code, re.I), "no administrative registry lifecycle operations")
require(re.search(r"\b(audit|actor|principal)\b", code, re.I), "registry administration has no audit or actor attribution")
'''

BUNDLES["slo"] = r'''
require(
    any(src(name).exists() for name in ("docs/SLO.md", "docs/RELIABILITY.md", "SLO.md"))
    or re.search(r"\bSLO\b|error budget|service level", code_text() + read_all([p for p in all_files({".md"}) if "architecture" in p.name.lower()]), re.I),
    "no service-level objectives or error-budget record",
)
'''

BUNDLES["process_evidence"] = BUNDLES["record_evidence"]



BUNDLES["ddd_artifacts"] = r"""
docs = [
    path
    for path in all_files({".md"})
    if path.name not in {"README.md", "AGENTS.md"}
    and (
        {"domain", "domains", "model"} & {part.lower() for part in path.relative_to(SOURCE).parts}
        or any(
            key in path.name.lower()
            for key in ("glossary", "context-map", "business-rules", "domain-model", "ubiquitous")
        )
    )
]
require(docs, "no domain model, glossary, or business-rule artifacts found (DDD stage)")
text = read_all(docs).lower()
for term in ("bounded context", "entit", "invariant", "business rule"):
    require(term in text, f"DDD artifacts do not state {term}")
"""

BUNDLES["sdd_artifacts"] = r"""
specs = [
    path
    for path in all_files({".md", ".feature", ".yaml", ".yml", ".json"})
    if path.name not in {"README.md", "AGENTS.md"}
    and (
        {"spec", "specs", "specifications"} & {part.lower() for part in path.relative_to(SOURCE).parts}
        or path.suffix.lower() == ".feature"
        or "acceptance" in path.name.lower()
    )
]
require(specs, "no specification or acceptance-criteria artifacts found (SDD stage)")
text = read_all(specs)
require(
    re.search(r"given\b.*when\b.*then\b", text, re.I | re.S) or "acceptance criteria" in text.lower(),
    "specifications contain no Given/When/Then scenario or acceptance criteria",
)
require(re.search(r"\b[A-Z]{2}-\d{3}\b", text), "specifications do not cite stable requirement IDs")
"""

BUNDLES["cdd_artifacts"] = r"""
contracts = [
    path
    for path in all_files({".yaml", ".yml", ".json"})
    if (
        {"contract", "contracts", "schemas", "schema"} & {part.lower() for part in path.relative_to(SOURCE).parts}
        or any(key in path.name.lower() for key in ("openapi", "swagger", "asyncapi", "schema", "contract"))
    )
]
require(contracts, "no machine-readable interface or event contracts found (CDD stage)")
text = read_all(contracts)
require(
    re.search(r"openapi|\$schema|\bcomponents\b|\bproperties\b|\btype\b", text, re.I),
    "contract files contain no schema or interface definition",
)
"""

BUNDLES["tdd_artifacts"] = r"""
tests = discovered_tests()
require(source_files(), "no implementation source found for test-driven development (TDD stage)")
require(tests, "no unit, contract, or integration tests found (TDD stage)")
categories = {
    part
    for path in tests
    for part in path.relative_to(SOURCE).parts
    if part.lower() in {"unit", "contract", "integration", "e2e", "end_to_end"}
}
require(len(categories) >= 2, f"tests are not organized into verifiable categories: {sorted(categories)}")
"""

BUNDLES["edd_artifacts"] = r"""
evals = [
    path
    for path in all_files({".md", ".yaml", ".yml", ".json"})
    if path.name not in {"README.md", "AGENTS.md"}
    and "eval" in " ".join(path.relative_to(SOURCE).parts).lower()
]
require(evals, "no evaluation plan, metrics, or report artifacts found (EDD stage)")
text = read_all(evals).lower()
require("threshold" in text, "evaluation artifacts define no quality thresholds")
require(re.search(r"\b(report|result|metric|pass|fail)\b", text), "evaluation artifacts contain no recorded results")
"""

BUNDLES["traceability"] = r"""
product = code_text() + read_all(discovered_tests())
requirements = set(re.findall(r"\b[A-Z]{2}-\d{3}\b", product))
require(requirements, "implementation and tests cite no requirement IDs")
contracts = [
    path
    for path in all_files({".yaml", ".yml", ".json"})
    if "contract" in path.name.lower() or "openapi" in path.name.lower() or "schema" in path.name.lower()
]
require(contracts, "no contract artifacts exist to trace implementation against")
paths = {str(path.relative_to(SOURCE)) for path in contracts}
require(
    any(path in product or path.rsplit("/", 1)[-1] in product for path in paths),
    "tests or implementation reference no contract artifact",
)
"""

DOMAIN_DEFAULTS: dict[str, list[str]] = {
    "api": ["openapi", "error_status", "rate_limit", "sanitizer"],
    "architecture": ["boundaries", "feature_gates", "docs_architecture"],
    "change-management": ["change_runbook", "process_evidence"],
    "code-quality": ["fmt_lint", "no_dead_code", "file_size", "no_println"],
    "collaboration-and-communication": ["process_evidence"],
    "configuration": ["config_single", "secrets", "config_env"],
    "directory": ["ownership_docs", "layout_contract"],
    "documentation-and-design": ["docs_engine", "atomic_components"],
    "governance": ["assurance_register"],
    "licensing": ["license"],
    "media-production": ["media_assets"],
    "models": ["model_registry", "auth_wired"],
    "monorepo": ["monorepo"],
    "observability": ["structured_logs", "metrics", "health"],
    "operations": ["health", "graceful"],
    "organization": ["process_evidence"],
    "people-and-work": ["process_evidence"],
    "performance": ["benches", "resource_limits"],
    "persistence": ["db"],
    "portability": ["platform_matrix", "feature_gates"],
    "product-discovery-and-delivery": ["process_evidence"],
    "releases": ["packaging_framework", "release_gates"],
    "security": ["auth_wired", "secrets", "sanitizer"],
    "stakeholder-relations": ["process_evidence"],
    "vendor-and-cost": ["process_evidence"],
    "verification": ["tests", "ci"],
}

OVERRIDES: dict[tuple[str, int], list[str]] = {
    ("api", 1): ["openapi", "api_schemas", "openapi_coverage", "error_status", "cdd_artifacts"],
    ("api", 2): ["sanitizer", "body_limits", "ws_limits"],
    ("api", 3): ["error_status", "idempotency", "pagination", "cache_headers", "retry_after", "compression_limits"],
    ("api", 4): ["openapi_coverage", "deprecation", "versioning", "cdd_artifacts"],
    ("api", 5): ["rate_limit", "auth_wired", "authz", "body_limits"],
    ("architecture", 1): ["boundaries", "ownership_docs", "feature_gates", "ddd_artifacts"],
    ("architecture", 2): ["feature_gates", "build_profiles"],
    ("architecture", 3): ["canvas", "docs_architecture"],
    ("architecture", 4): ["resilience", "error_status", "resource_limits"],
    ("architecture", 5): ["adr", "docs_architecture"],
    ("change-management", 6): ["change_runbook"],
    ("product-discovery-and-delivery", 1): ["process_evidence", "sdd_artifacts"],
    ("product-discovery-and-delivery", 2): ["process_evidence", "sdd_artifacts"],
    ("product-discovery-and-delivery", 3): ["process_evidence", "sdd_artifacts"],
    ("product-discovery-and-delivery", 4): ["process_evidence", "sdd_artifacts"],
    ("product-discovery-and-delivery", 5): ["process_evidence", "sdd_artifacts"],
    ("code-quality", 1): ["fmt_lint", "web_lint"],
    ("code-quality", 2): ["no_dead_code", "file_size", "no_println"],
    ("code-quality", 3): ["unsafe_audit", "error_types"],
    ("code-quality", 4): ["supply_chain", "ci"],
    ("code-quality", 5): ["file_size", "debt_register"],
    ("code-quality", 6): ["feature_gates", "benches"],
    ("code-quality", 7): ["boundaries"],
    ("code-quality", 8): ["readability"],
    ("code-quality", 9): ["deprecation", "boundaries"],
    ("code-quality", 10): ["debt_register"],
    ("code-quality", 11): ["function_limits", "readability"],
    ("collaboration-and-communication", 4): ["ai_oversight"],
    ("configuration", 1): ["config_single"],
    ("configuration", 2): ["secrets"],
    ("configuration", 3): ["config_reload"],
    ("configuration", 4): ["config_env"],
    ("configuration", 5): ["secrets", "operator_controls"],
    ("directory", 1): ["ownership_docs"],
    ("directory", 2): ["ownership_docs", "docs_architecture"],
    ("directory", 3): ["layout_contract"],
    ("directory", 4): ["test_data_layout"],
    ("documentation-and-design", 1): ["docs_engine"],
    ("documentation-and-design", 2): ["atomic_components", "accessibility"],
    ("documentation-and-design", 3): ["docs_architecture"],
    ("documentation-and-design", 4): ["accessibility", "component_states"],
    ("documentation-and-design", 5): ["design_review_evidence"],
    ("documentation-and-design", 6): ["docs_engine", "media_assets"],
    ("documentation-and-design", 7): ["atomic_components"],
    ("governance", 1): ["rules_hierarchy"],
    ("governance", 2): ["rules_quality"],
    ("governance", 3): ["coverage_register"],
    ("governance", 4): ["agent_evidence"],
    ("governance", 5): ["assurance_register"],
    ("governance", 6): ["ddd_artifacts", "traceability"],
    ("governance", 7): ["sdd_artifacts", "traceability"],
    ("governance", 8): ["cdd_artifacts", "traceability"],
    ("governance", 9): ["tdd_artifacts", "traceability"],
    ("governance", 10): ["edd_artifacts", "traceability"],
    ("licensing", 1): ["license"],
    ("licensing", 2): ["third_party_notices"],
    ("licensing", 3): ["copyright_headers"],
    ("licensing", 4): ["model_rights"],
    ("licensing", 5): ["license_policy"],
    ("media-production", 1): ["media_assets"],
    ("media-production", 2): ["media_assets"],
    ("media-production", 3): ["media_assets", "design_review_evidence"],
    ("media-production", 4): ["atomic_components", "media_assets"],
    ("models", 1): ["model_registry", "model_checksums"],
    ("models", 2): ["model_download_security"],
    ("models", 3): ["auth_wired", "authz", "registry_admin"],
    ("models", 4): ["model_cards"],
    ("models", 5): ["resource_limits", "resilience"],
    ("models", 6): ["model_checksums", "supply_chain"],
    ("monorepo", 1): ["monorepo", "ownership_docs"],
    ("monorepo", 2): ["release_variants", "monorepo"],
    ("monorepo", 3): ["feature_gates", "build_profiles"],
    ("monorepo", 4): ["ownership_docs", "media_assets"],
    ("observability", 1): ["structured_logs", "no_println"],
    ("observability", 2): ["metrics", "prometheus_config"],
    ("observability", 3): ["otel"],
    ("observability", 4): ["dashboards"],
    ("observability", 5): ["retention", "secrets_logging"],
    ("operations", 1): ["health", "graceful"],
    ("operations", 2): ["resilience", "health", "slo"],
    ("operations", 3): ["service_managers", "deployment_profiles"],
    ("operations", 4): ["incident_docs"],
    ("operations", 5): ["capacity_docs"],
    ("operations", 6): ["process_evidence"],
    ("performance", 1): ["benches", "bench_docs"],
    ("performance", 2): ["resource_limits", "gpu_backends"],
    ("performance", 3): ["resource_limits", "build_profiles"],
    ("performance", 4): ["gpu_backends", "fallback"],
    ("performance", 5): ["batch", "benches"],
    ("portability", 1): ["platform_matrix"],
    ("portability", 2): ["feature_gates", "build_profiles"],
    ("portability", 3): ["platform_support_docs"],
    ("portability", 4): ["packaging_framework"],
    ("portability", 5): ["cross_compile", "build_profiles"],
    ("releases", 1): ["packaging_framework", "reproducible"],
    ("releases", 2): ["sbom", "artifact_integrity"],
    ("releases", 3): ["release_gates", "rollback", "edd_artifacts"],
    ("releases", 4): ["release_versioning"],
    ("releases", 5): ["install_upgrade"],
    ("releases", 6): ["release_security"],
    ("security", 1): ["threat_model_docs"],
    ("security", 2): ["auth_wired", "authz"],
    ("security", 3): ["authz"],
    ("security", 4): ["input_limits", "sanitizer"],
    ("security", 5): ["secrets", "crypto"],
    ("security", 6): ["supply_chain", "model_checksums"],
    ("security", 7): ["vuln_response"],
    ("security", 8): ["network_security"],
    ("security", 9): ["privacy"],
    ("security", 10): ["secure_defaults"],
    ("security", 11): ["tests", "ci", "supply_chain"],
    ("security", 12): ["process_evidence"],
    ("security", 13): ["process_evidence"],
    ("verification", 1): ["tests", "test_layout", "tdd_artifacts"],
    ("verification", 2): ["ci"],
    ("verification", 3): ["test_layout", "contract_tests", "tdd_artifacts"],
    ("verification", 4): ["security_tests"],
    ("verification", 5): ["hardware_tests"],
    ("verification", 6): ["ci", "flakiness"],
}


def control_id(doc: Path) -> str:
    match = re.search(r"\*\*Control document:\*\* ([A-Z]+-\d+)", doc.read_text(encoding="utf-8"))
    return match.group(1) if match else doc.stem


def generate_rule(domain: str, doc: Path) -> None:
    number = int(doc.name[:2])
    bundles = OVERRIDES.get((domain, number), DOMAIN_DEFAULTS[domain])
    name = f"{domain}_{doc.stem}".replace("-", "_")
    body: list[str] = []
    for bundle in bundles:
        body.extend(lines(BUNDLES[bundle]))
        body.append("")
    body_text = "\n".join(body)
    imports = ""
    if "json." in body_text:
        imports += "import json\n"
    header = (
        HEADER.replace("__REL__", f"{domain}/rules/{doc.name}")
        .replace("__CONTROLS__", control_id(doc))
        .replace("__NAME__", name)
        .replace("__IMPORTS__", imports)
    )
    target = RULES / domain / "tests" / f"test_{doc.stem.replace('-', '_')}.py"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(header + "\n".join(body).rstrip() + "\n", encoding="utf-8")


def generate_trail(domain: str, doc: Path) -> None:
    target = RULES / domain / "tests" / f"test_{domain.replace(chr(45), chr(95))}_00_references_trails.py"
    target.write_text(
        f'''"""Reference-trail integrity test for torviello-enforcer/{domain}/trails/00-references-trails.md."""

import re
from pathlib import Path

CONTROL = "__CONTROLS__"
HERE = Path(__file__).resolve()
RULES_ROOT = HERE.parents[3]
DOCUMENT = HERE.parents[1] / "trails" / "00-references-trails.md"
REQUIREMENTS = RULES_ROOT / "requirements"


def test_{domain.replace("-", "_")}_reference_trail_resolves() -> None:
    """Assert every source and requirement reference in the trail resolves."""
    text = DOCUMENT.read_text(encoding="utf-8")
    sources = set(re.findall(r"^### (R\\d+) —", text, re.M))
    cited = set()
    for cell in re.findall(r"\\| R[0-9,]+ \\|", text):
        cited.update(re.findall(r"R\\d+", cell))
    assert cited <= sources, f"undefined sources cited: {{sorted(cited - sources)}}"

    requirement_text = "\\n".join(
        path.read_text(encoding="utf-8") for path in REQUIREMENTS.rglob("*.md")
    )
    ids = set(re.findall(r"\b[A-Z]{{2}}-\\d{{3}}\\b", text))
    missing = sorted(i for i in ids if not re.search(r"\\b" + re.escape(i) + r"\\b", requirement_text))
    assert not missing, f"requirement IDs not found in requirements/: {{missing}}"
''',
        encoding="utf-8",
    )


def main() -> None:
    for domain_dir in sorted(p for p in RULES.iterdir() if p.is_dir()):
        domain = domain_dir.name
        rules_dir = domain_dir / "rules"
        if not rules_dir.is_dir():
            continue
        for doc in sorted(rules_dir.glob("[0-9][0-9]-*.md")):
            generate_rule(domain, doc)
        trail = domain_dir / "trails" / "00-references-trails.md"
        if trail.exists():
            generate_trail(domain, trail)


if __name__ == "__main__":
    main()
