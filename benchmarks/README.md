# CPU inference benchmarks

Copyright (c) 2026 Torviello.

`classify_bench.py` runs the shipping `POST /classify` path against the
`engine-demo-torchscript` fixture. It starts the release binary with the checked-in
configuration, loads the digest-verified model, applies a fixed warmup, and records
p50/p95/p99 latency, throughput at concurrency 1 and 8, process start and model
load time, idle and peak RSS, idle CPU, artifact and runtime-library size,
dependency count, and a five-case quality check.

## Run

Build the TorchScript profile and run the versioned budget gate:

```sh
just bench
```

The equivalent commands are:

```sh
cargo build --release --locked --no-default-features --features torchscript
uv run python benchmarks/classify_bench.py \
  --requests 1000 \
  --warmup 30 \
  --idle-seconds 3 \
  --budget benchmarks/budgets/classify-cpu.json
```

Set `LIBTORCH` and, when using a libtorch patch version different from the one
expected by `tch`, `LIBTORCH_BYPASS_VERSION_CHECK=1`. The harness records the
binary and model digests, revision, dirty state, environment, command, and the
rate-limit override in `results.json`.

## Evidence

Budgets live in `benchmarks/budgets/` and carry an owner and review date. Dated
raw results and the rendered report are stored under
`torviello-bench/evaluations/reports/`. A run exits non-zero when any budget
check fails. Performance claims must cite that evidence rather than the target
in `docs/SLO.md`.

The process-start measurement runs with a warm OS file cache on the local
machine. It is not a post-reboot cold-start measurement; that limitation is
recorded in the budget and the dated report.
