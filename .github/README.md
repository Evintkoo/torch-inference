# GitHub automation

This directory contains repository automation configuration. Workflows in `workflows/` run read-only checks on pull requests and pushes to `main`. Local contributors run the same locked enforcer suite with `uv sync --locked` and `uv run --locked pytest`.
