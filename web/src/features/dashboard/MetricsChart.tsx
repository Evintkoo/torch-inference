import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useEventSource } from "@/lib/sse-client";
import { createMetricsBuffer, pushMetricSample, type MetricsBuffer } from "./metrics-buffer";
import type { DashboardEvent } from "./types";

export function MetricsChart() {
  const { data } = useEventSource<DashboardEvent>("/dashboard/stream");
  const [buffer, setBuffer] = useState<MetricsBuffer>(createMetricsBuffer());
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);

  useEffect(() => {
    if (data) {
      setBuffer((prev) => pushMetricSample(prev, data));
    }
  }, [data]);

  useEffect(() => {
    if (!containerRef.current || buffer.timestamps.length === 0) {
      return;
    }

    if (!plotRef.current) {
      plotRef.current = new uPlot(
        {
          width: containerRef.current.clientWidth,
          height: 200,
          series: [{}, { label: "CPU %", stroke: "var(--color-primary)" }],
        },
        [buffer.timestamps, buffer.cpuPct],
        containerRef.current,
      );
    } else {
      plotRef.current.setData([buffer.timestamps, buffer.cpuPct]);
    }
  }, [buffer]);

  useEffect(() => {
    return () => {
      plotRef.current?.destroy();
      plotRef.current = null;
    };
  }, []);

  if (buffer.timestamps.length === 0) {
    return <p className="text-muted-foreground text-sm">Waiting for metrics…</p>;
  }

  return <div ref={containerRef} data-testid="metrics-chart" />;
}
