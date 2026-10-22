# Copyright (c) 2026 Torviello.
set shell := ["bash", "-uc"]

verify:
    cargo fmt --all --check
    cargo clippy --workspace --all-targets -- -D warnings
    cargo test --workspace --locked
    cargo build --locked --no-default-features
    cargo build --locked --features full
    npm ci
    npm run lint
    npm run build
    npm test
    uv sync --locked
    uv run python torviello-engine/contracts/tools/contracts.py check
    uv run python torviello-engine/contracts/tools/status_tester.py
    uv run pytest
    uv run ruff check .

release features="engine":
    cargo build --release --locked --no-default-features --features {{features}}

bench:
    cargo build --release --locked --no-default-features --features torchscript
    uv run python benchmarks/classify_bench.py --requests 1000 --warmup 30 --idle-seconds 3 --budget benchmarks/budgets/classify-cpu.json
