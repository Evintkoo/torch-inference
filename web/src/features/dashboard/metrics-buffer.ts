import type { DashboardEvent } from "./types";

export const MAX_SAMPLES = 300; // 1s tick interval (see dashboard.rs) * 300 = 5 minutes of history

export interface MetricsBuffer {
  timestamps: number[];
  cpuPct: number[];
  memPct: number[];
  processMemMb: number[];
}

export function createMetricsBuffer(): MetricsBuffer {
  return { timestamps: [], cpuPct: [], memPct: [], processMemMb: [] };
}

/**
 * Sample x-values are wall-clock Unix seconds (uPlot's `time: true` scale
 * expects seconds, not ms) captured when the sample arrives — NOT
 * `uptime_s`. Server uptime resets to 0 on every restart and only has
 * whole-second resolution, which rendered as a meaningless bare counter
 * (e.g. "89, 90, 91…") instead of a real time axis.
 */
export function pushMetricSample(
  buffer: MetricsBuffer,
  event: DashboardEvent,
  now: () => number = Date.now,
): MetricsBuffer {
  const timestamps = [...buffer.timestamps, now() / 1000];
  const cpuPct = [...buffer.cpuPct, event.metrics.cpu_pct];
  const memPct = [
    ...buffer.memPct,
    event.metrics.mem_total_mb > 0
      ? (event.metrics.mem_used_mb / event.metrics.mem_total_mb) * 100
      : 0,
  ];
  const processMemMb = [...buffer.processMemMb, event.metrics.process_mem_mb];

  if (timestamps.length > MAX_SAMPLES) {
    timestamps.shift();
    cpuPct.shift();
    memPct.shift();
    processMemMb.shift();
  }

  return { timestamps, cpuPct, memPct, processMemMb };
}
