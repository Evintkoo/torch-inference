import type { DashboardEvent } from "./types";

export const MAX_SAMPLES = 120; // 3s tick interval * 120 = 6 minutes of history

export interface MetricsBuffer {
  timestamps: number[];
  cpuPct: number[];
}

export function createMetricsBuffer(): MetricsBuffer {
  return { timestamps: [], cpuPct: [] };
}

export function pushMetricSample(buffer: MetricsBuffer, event: DashboardEvent): MetricsBuffer {
  const timestamps = [...buffer.timestamps, event.metrics.uptime_s];
  const cpuPct = [...buffer.cpuPct, event.metrics.cpu_pct];

  if (timestamps.length > MAX_SAMPLES) {
    timestamps.shift();
    cpuPct.shift();
  }

  return { timestamps, cpuPct };
}
