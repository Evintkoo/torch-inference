# Copyright (c) 2026 Torviello.
"""Contract tests for the design tokens sliced from the approved brand board."""

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
CONTRACT = ROOT / "torviello-design" / "contracts" / "design-tokens.json"
STYLESHEET = ROOT / "torviello-landing" / "web" / "src" / "styles" / "tokens.css"


def luminance(hex_color: str) -> float:
    r, g, b = (int(hex_color[i : i + 2], 16) / 255 for i in (1, 3, 5))

    def channel(value: float) -> float:
        return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4

    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


def contrast(a: str, b: str) -> float:
    first, second = sorted((luminance(a), luminance(b)), reverse=True)
    return (first + 0.05) / (second + 0.05)


@pytest.fixture(scope="module")
def tokens() -> dict:
    return json.loads(CONTRACT.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def stylesheet() -> str:
    return STYLESHEET.read_text(encoding="utf-8")


def test_board_primitives_are_present(tokens: dict) -> None:
    primitives = {name: token["$value"] for name, token in tokens["color"].items()}
    assert primitives["midnight"] == "#0b1020"
    assert primitives["orange"] == "#ff683b"
    assert primitives["warm-white"] == "#f7f8fa"
    assert primitives["signal-teal"] == "#22d3c5"


def test_every_token_declares_a_type_and_value(tokens: dict) -> None:
    for group, group_tokens in tokens.items():
        if group.startswith("$"):
            continue
        for name, token in group_tokens.items():
            assert "$type" in token, f"{group}.{name} has no $type"
            assert "$value" in token, f"{group}.{name} has no $value"
            if group in {"color", "semantic"}:
                assert "$description" in token, f"{group}.{name} has no $description"


def test_semantic_aliases_resolve_to_declared_colors(tokens: dict) -> None:
    primitive_values = {token["$value"].lower() for token in tokens["color"].values()}
    for name, token in tokens["semantic"].items():
        value = token["$value"]
        if value.startswith("#"):
            assert value.lower() in primitive_values, (
                f"semantic.{name} hardcodes {value} instead of referencing a primitive"
            )
        else:
            assert value.startswith("rgba("), (
                f"semantic.{name} must reference a primitive or be glass rgba"
            )


def test_board_pairings_meet_wcag_aa(tokens: dict) -> None:
    color = {name: token["$value"].lower() for name, token in tokens["color"].items()}
    assert contrast(color["warm-white"], color["midnight"]) >= 12
    assert contrast(color["orange"], color["midnight"]) >= 4.5
    assert contrast(color["midnight"], color["orange"]) >= 4.5
    assert contrast(color["signal-teal"], color["midnight"]) >= 7
    assert contrast(color["orange-hover"], color["midnight"]) >= 4.5


def test_muted_text_blended_over_base_stays_above_aa(tokens: dict) -> None:
    muted = tokens["semantic"]["text-muted"]["$value"]
    match = re.fullmatch(r"rgba\((\d+), (\d+), (\d+), ([\d.]+)\)", muted)
    assert match, "text-muted must be an rgba over the base surface"
    fg = tuple(int(match.group(i)) for i in (1, 2, 3))
    alpha = float(match.group(4))
    base = (0x0B, 0x10, 0x20)
    blended = "#{:02x}{:02x}{:02x}".format(
        *(round(f * alpha + b * (1 - alpha)) for f, b in zip(fg, base, strict=True))
    )
    assert contrast(blended, "#0b1020") >= 7


def test_stylesheet_mirrors_every_semantic_token(tokens: dict, stylesheet: str) -> None:
    for name in tokens["semantic"]:
        assert f"--tv-{name}" in stylesheet, f"tokens.css is missing --tv-{name}"
    for name in tokens["space"]:
        assert f"--tv-space-{name}" in stylesheet
    for name in tokens["radius"]:
        assert f"--tv-radius-{name}" in stylesheet


def test_stylesheet_values_match_the_contract(tokens: dict, stylesheet: str) -> None:
    for name, token in tokens["semantic"].items():
        if token["$value"].startswith("#"):
            pattern = re.compile(rf"--tv-{re.escape(name)}:\s*([^;]+);")
            found = pattern.search(stylesheet)
            assert found, f"--tv-{name} missing"
            resolved = found.group(1).strip()
            if resolved.startswith("var("):
                continue  # aliasing through a primitive is the documented pattern
            assert resolved.lower() == token["$value"].lower(), (
                f"--tv-{name} drifted from the contract"
            )
