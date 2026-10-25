# Copyright (c) 2026 Torviello.
"""GOV-12.07 sync contract: published code twins equal the canonical assets,
consuming units import them instead of forking vector data, and brand svgs
meet the quality standard (structure, budgets, board render parity)."""

from __future__ import annotations

import re
import subprocess
import textwrap
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


# --- SVG quality standard (ticket 0037) -------------------------------------
# Measured brand palette: the gradient ramp sampled from the board pixels
# plus the board label palette and the midnight favicon ground.
ALLOWED_FILLS = {
    "#FA8E5B",
    "#F7734A",
    "#FC6E41",
    "#F5F4F4",
    "#FF855F",
    "#FF683B",
    "#0B1020",
    "#F7F8FA",
}
SIZE_BUDGETS = {"logo-mark.svg": 12_000, "favicon.svg": 3_000}


def test_brand_svgs_meet_the_structural_quality_bar() -> None:
    for name, budget in SIZE_BUDGETS.items():
        path = BRAND / name
        raw = path.read_text(encoding="utf-8")
        assert len(raw) <= budget, f"{name} exceeds its {budget}-byte budget"
        assert 'viewBox="' in raw, f"{name} must declare a viewBox"
        assert "<image" not in raw, f"{name} must not embed rasters"
        for fill in re.findall(r'fill="(#[0-9A-Fa-f]{6})"', raw.upper()):
            assert fill in ALLOWED_FILLS, f"{name} uses off-palette fill {fill}"
    for icon in BRAND.glob("icons/*.svg"):
        raw = icon.read_text(encoding="utf-8")
        assert len(raw.encode("utf-8")) <= 1_500, f"{icon.name} exceeds 1.5KB"
        assert 'viewBox="0 0 24 24"' in raw, f"{icon.name} must use the 24 grid"
        assert "<image" not in raw, f"{icon.name} must not embed rasters"
        assert "currentColor" in raw, f"{icon.name} must inherit currentColor"


def iou(mask_a: bytes, mask_b: bytes) -> float:
    """Binary IoU over the shape pixels (the pipeline delivers shape=black)."""
    a = [v < 128 for v in mask_a]
    b = [v < 128 for v in mask_b]
    assert len(a) == len(b) and a, "parity normalization failed"
    inter = sum(1 for x, y in zip(a, b) if x and y)
    union = sum(1 for x, y in zip(a, b) if x or y)
    return inter / union


def shape_bytes(image: Path, flatten: bool) -> bytes:
    """Rasterize to 400x400, binarize, trim to ink, normalize to 200x200 —
    an aspect- and framing-independent shape signature."""
    cmd = ["magick"]
    if flatten:
        cmd += [str(image), "-background", "#0B1020", "-alpha", "remove", "-alpha", "off"]
    else:
        cmd += [str(image)]
    cmd += [
        "-resize",
        "400x400!",
        "-colorspace",
        "Gray",
        "-threshold",
        "22%",
        "-fuzz",
        "18%",
        "-trim",
        "-resize",
        "200x200!",
        "-depth",
        "8",
        "gray:-",
    ]
    return subprocess.run(cmd, capture_output=True, check=True).stdout


RENDER_SCRIPT = textwrap.dedent(
    """\
    import { chromium } from "playwright-core";
    const browser = await chromium.launch({
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      args: ["--disable-gpu"],
    });
    const page = await browser.newPage({ viewport: { width: 400, height: 400 } });
    await page.goto("file://RENDER_SVG", { waitUntil: "networkidle" });
    await page.screenshot({ path: "RENDER_OUT" });
    await browser.close();
    """
)


def render_svg_via_chrome(svg: Path, out_png: Path, size: int = 400) -> None:
    """Rasterize an svg with Chrome. Prerequisite: the landing toolchain
    (bun + playwright-core + local Chrome) — ImageMagick's internal MSVG
    renderer cannot resolve the potrace transforms, so the parity gate uses
    the same browser as the visual QA driver."""
    import tempfile

    landing_web = ROOT / "torviello-landing" / "web"
    with tempfile.TemporaryDirectory() as tmp:
        _write_and_render(svg, out_png, size, Path(tmp), landing_web)


def _write_and_render(
    svg: Path, out_png: Path, size: int, tmp: Path, landing_web: Path
) -> None:
    html = tmp / ".parity-host.html"
    script = tmp / ".parity-render.ts"
    html.write_text(
        "<!doctype html><html style=\"margin:0\"><body style=\"margin:0;"
        "background:#0B1020\">"
        f'<img src="file://{svg}" style="width:{size}px;height:{size}px;display:block">'
        "</body></html>",
        encoding="utf-8",
    )
    script.write_text(
        RENDER_SCRIPT.replace("RENDER_SVG", str(html)).replace(
            "RENDER_OUT", str(out_png)
        ),
        encoding="utf-8",
    )
    subprocess.run(
        ["bun", "run", str(script), str(out_png)], check=True, cwd=str(landing_web)
    )


def test_render_parity_against_the_board_fixture() -> None:
    rendered = BRAND / ".parity-render.png"
    render_svg_via_chrome(BRAND / "logo-mark.svg", rendered)
    try:
        vector_mask = shape_bytes(rendered, flatten=False)
        board_mask = shape_bytes(BRAND / "logo-mark-reference.png", flatten=True)
        score = iou(vector_mask, board_mask)
    finally:
        rendered.unlink(missing_ok=True)
    assert score >= 0.80, f"render parity {score:.3f} below the 0.80 bar"
