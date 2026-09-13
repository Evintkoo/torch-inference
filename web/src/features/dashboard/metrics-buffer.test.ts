import { describe, expect, it } from "vitest";
import { createMetricsBuffer, pushMetricSample, MAX_SAMPLES } from "./metrics-buffer";
import type { DashboardEvent } from "./types";

function makeEvent(cpu: number, uptimeSec: number): DashboardEvent {
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
    },
    gpu: [],
    downloads: [],
  };
}

describe("pushMetricSample", () => {
  it("appends a [uptime_s, cpuPct] pair", () => {
    const buffer = createMetricsBuffer();
    const next = pushMetricSample(buffer, makeEvent(42, 1));
    expect(next.timestamps).toEqual([1]);
    expect(next.cpuPct).toEqual([42]);
  });

  it("caps the buffer at MAX_SAMPLES, dropping the oldest sample", () => {
    let buffer = createMetricsBuffer();
    for (let i = 0; i < MAX_SAMPLES + 5; i++) {
      buffer = pushMetricSample(buffer, makeEvent(i, i));
    }
    expect(buffer.timestamps).toHaveLength(MAX_SAMPLES);
    expect(buffer.cpuPct[0]).toBe(5); // first 5 samples evicted
    expect(buffer.cpuPct.at(-1)).toBe(MAX_SAMPLES + 4);
  });
});
