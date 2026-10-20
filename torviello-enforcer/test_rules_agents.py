"""Instruction checks for the root and rules-level AGENTS files."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROOT_AGENTS = ROOT / "AGENTS.md"
RULE_AGENTS = ROOT / "torviello-enforcer" / "AGENTS.md"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_instruction_files_exist() -> None:
    assert ROOT_AGENTS.exists(), "repository-root AGENTS.md is missing"
    assert RULE_AGENTS.exists(), "torviello-enforcer/AGENTS.md is missing"


def test_rules_agents_defines_precedence_and_evidence() -> None:
    text = read(RULE_AGENTS)
    assert "Resolve instruction precedence in this order" in text, "no precedence order"
    for level in ("platform and system safety", "user's explicit task", "AGENTS.md", "requirements"):
        assert level in text, f"precedence level is missing: {level}"
    assert "MUST inspect the existing implementation" in text, "no implementation-inspection rule"
    assert "run the relevant verification" in text, "no verification requirement"
    assert "assurance-register.md" in text, "no exception/conformance register requirement"
    assert "Do not add product implementation code under `torviello-enforcer/`" in text, "missing rules boundary"


def test_root_agents_keeps_product_and_rules_boundaries() -> None:
    text = read(ROOT_AGENTS)
    assert "torviello-enforcer/" in text, "root AGENTS.md does not reference torviello-enforcer/"
    assert "Do not commit" in text, "root AGENTS.md lacks a commit-safety boundary"
    assert "requested outcome" in text, "root AGENTS.md lacks scope discipline"
