# Inference benchmark method

## Claim

The engine targets a p95 latency below 250 ms for the demo classifier on a
CPU-only laptop while keeping resident memory below 512 MiB.

## Method

Run the same prompt set against every accelerator backend and the CPU fallback
with a fixed seed, a warm-up pass, and at least 1,000 measured requests. Record
the commit, model checksum, backend, hardware, batch size, and timeout.

## Current result

The latest CPU-only run reported p95 latency of 188 ms and peak resident memory
of 310 MiB. The result is a local verification measurement, not a cross-vendor
benchmark claim. GPU profiles are measured separately and never substituted for
the CPU fallback result.
