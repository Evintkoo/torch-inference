# Copyright (c) 2026 Torviello.
set shell := ["bash", "-uc"]

verify:
    cargo fmt --all --check
    cargo clippy --workspace --all-targets -- -D warnings
    cargo test --workspace --locked
    npm ci
    npm run lint
    npm run build
    npm test
    uv sync --locked
    uv run pytest
    uv run ruff check .

release profile="engine":
    cargo build --release --locked --features {{profile}}
