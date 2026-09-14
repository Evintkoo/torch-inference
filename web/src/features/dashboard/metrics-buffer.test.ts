import { describe, expect, it } from "vitest";
import { createMetricsBuffer, pushMetricSample, MAX_SAMPLES } from "./metrics-buffer";
import type { DashboardEvent } from "./types";

function makeEvent(
  cpu: number,
  uptimeSec: number,
  overrides: Partial<DashboardEvent["metrics"]> = {},
): DashboardEvent {
  return {
    metrics: {
      uptime_s: uptimeSec,
      active_req: 0,
      total_req: 0,
      avg_latency_ms: 0,
      error_rate: 0,
      throughput_per_s: 0,
      cpu_pct: cpu,
      mem_used_mb: 0,
      mem_total_mb: 0,
      process_mem_mb: 0,
      process_cpu_pct: 0,
      ...overrides,
    },
    gpu: [],
    downloads: [],
  };
}

describe("pushMetricSample", () => {
  it("appends a [wallClockSeconds, cpuPct] pair using the injected clock", () => {
    const buffer = createMetricsBuffer();
    const next = pushMetricSample(buffer, makeEvent(42, 1), () => 1_700_000_000_000);
    expect(next.timestamps).toEqual([1_700_000_000]);
    expect(next.cpuPct).toEqual([42]);
  });

  it("defaults to the real clock (Date.now), not uptime_s", () => {
    const buffer = createMetricsBuffer();
    const before = Date.now() / 1000;
    const next = pushMetricSample(buffer, makeEvent(42, 999));
    expect(next.timestamps[0]).toBeGreaterThanOrEqual(before);
    expect(next.timestamps[0]).not.toBe(999);
  });

  it("caps the buffer at MAX_SAMPLES, dropping the oldest sample", () => {
    let buffer = createMetricsBuffer();
    for (let i = 0; i < MAX_SAMPLES + 5; i++) {
      buffer = pushMetricSample(buffer, makeEvent(i, i), () => i * 1000);
    }
    expect(buffer.timestamps).toHaveLength(MAX_SAMPLES);
    expect(buffer.cpuPct[0]).toBe(5); // first 5 samples evicted
    expect(buffer.cpuPct.at(-1)).toBe(MAX_SAMPLES + 4);
    expect(buffer.memPct).toHaveLength(MAX_SAMPLES);
    expect(buffer.processMemMb).toHaveLength(MAX_SAMPLES);
  });

  it("derives memPct from mem_used_mb / mem_total_mb and tracks processMemMb", () => {
    const buffer = createMetricsBuffer();
    const next = pushMetricSample(
      buffer,
      makeEvent(0, 1, { mem_used_mb: 2048, mem_total_mb: 8192, process_mem_mb: 96.5 }),
      () => 1_700_000_000_000,
    );
    expect(next.memPct).toEqual([25]);
    expect(next.processMemMb).toEqual([96.5]);
  });

  it("memPct is 0 when mem_total_mb is 0 (avoids division by zero)", () => {
    const buffer = createMetricsBuffer();
    const next = pushMetricSample(buffer, makeEvent(0, 1, { mem_total_mb: 0 }), () => 1);
    expect(next.memPct).toEqual([0]);
  });
});
