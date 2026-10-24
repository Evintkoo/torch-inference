# Copyright (c) 2026 Torviello.
"""GOV-12.07 sync contract: published code twins equal the canonical assets,
and consuming units import them instead of forking vector data."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BRAND = ROOT / "torviello-design" / "brand"
LANDING_SRC = ROOT / "torviello-landing" / "web" / "src"

ICON_NAMES = [
    "zap",
    "layers",
    "sliders",
    "users",
    "box",
    "package",
    "github",
    "arrow-right",
    "book-open",
]


def canonical_svg(name: str) -> str:
    text = (BRAND / "icons" / f"{name}.svg").read_text(encoding="utf-8")
    return text.split("-->", 1)[-1].strip()


def published_value(module: str, name: str) -> str:
    source = (BRAND / module).read_text(encoding="utf-8")
    match = re.search(rf"[\"']{name}[\"']\s*:\s*[\"'](.*?)[\"'],\n", source, re.S)
    if match is None:
        match = re.search(
            rf"(?:[\"']{name}[\"']\s*:\s*|const\s+{name}\s*=\s*)`(.*?)`",
            source,
            re.S,
        )
    assert match, f"{module} does not publish {name}"
    return match.group(1)


def test_icon_code_twins_equal_the_canonical_assets() -> None:
    for name in ICON_NAMES:
        assert (BRAND / "icons" / f"{name}.svg").exists(), name
        assert published_value("icons.ts", name) == canonical_svg(name), name


def test_logo_mark_code_twin_equals_the_canonical_asset() -> None:
    asset = (BRAND / "logo-mark.svg").read_text(encoding="utf-8")
    canonical = asset.split("-->", 1)[-1].strip()
    assert published_value("logo-mark.ts", "logoMark") == canonical


def test_favicon_lives_in_the_design_unit() -> None:
    assert (BRAND / "favicon.svg").exists()
    assert not (ROOT / "torviello-landing" / "web" / "public" / "favicon.svg").exists()


def test_consuming_units_do_not_fork_canonical_vector_data() -> None:
    canonical = [canonical_svg(name) for name in ICON_NAMES]
    canonical.append((BRAND / "logo-mark.svg").read_text(encoding="utf-8"))
    needles = set()
    for svg in canonical:
        for path in re.findall(r'd="([^"]{24,})"', svg):
            needles.add(path)
    assert needles, "canonical assets must carry path data"
    forked = [
        path
        for path in LANDING_SRC.rglob("*")
        if path.suffix in {".svelte", ".ts"}
        for needle in needles
        if needle in path.read_text(encoding="utf-8")
    ]
    assert not forked, f"vector data forked into consuming unit: {forked}"
