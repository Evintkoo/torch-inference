import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useEventSource } from "@/lib/sse-client";
import { createMetricsBuffer, pushMetricSample, type MetricsBuffer } from "./metrics-buffer";
import type { DashboardEvent } from "./types";

export function MetricsChart() {
  const { data, error } = useEventSource<DashboardEvent>("/dashboard/stream");
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
      // Canvas 2D can't resolve CSS custom properties directly, so resolve
      // the computed color before handing it to uPlot.
      const primaryColor =
        getComputedStyle(containerRef.current).getPropertyValue("--color-primary").trim() ||
        "#000000";
      plotRef.current = new uPlot(
        {
          width: containerRef.current.clientWidth,
          height: 200,
          scales: { x: { time: false } },
          series: [{}, { label: "CPU %", stroke: primaryColor }],
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
    if (error) {
      return <p className="text-muted-foreground text-sm">Unable to load live metrics</p>;
    }
    return <p className="text-muted-foreground text-sm">Waiting for metrics…</p>;
  }

  return <div ref={containerRef} data-testid="metrics-chart" />;
}
