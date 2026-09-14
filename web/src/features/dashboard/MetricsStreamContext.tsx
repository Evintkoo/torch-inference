import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useEventSource } from "@/lib/sse-client";
import { createMetricsBuffer, pushMetricSample, type MetricsBuffer } from "./metrics-buffer";
import type { DashboardEvent } from "./types";

interface MetricsStreamValue {
  data: DashboardEvent | null;
  error: string | null;
  buffer: MetricsBuffer;
}

const MetricsStreamContext = createContext<MetricsStreamValue | null>(null);

/**
 * Owns the `/dashboard/stream` SSE connection and the rolling metrics buffer
 * at the app root, so both keep running for as long as the app is open —
 * not just while the Metrics tab happens to be the active one. Before this,
 * `MetricsPanel` opened/closed the connection and reset its buffer on every
 * mount/unmount (Radix `TabsContent` unmounts inactive tabs), so navigating
 * away and back always restarted the sparklines from empty instead of
 * showing accumulated history.
 */
export function MetricsStreamProvider({ children }: { children: ReactNode }) {
  const { data, error } = useEventSource<DashboardEvent>("/dashboard/stream");
  const [buffer, setBuffer] = useState<MetricsBuffer>(createMetricsBuffer());

  useEffect(() => {
    if (data) {
      setBuffer((prev) => pushMetricSample(prev, data));
    }
  }, [data]);

  return (
    <MetricsStreamContext.Provider value={{ data, error, buffer }}>{children}</MetricsStreamContext.Provider>
  );
}

export function useMetricsStream(): MetricsStreamValue {
  const ctx = useContext(MetricsStreamContext);
  if (!ctx) {
    throw new Error("useMetricsStream must be used within a MetricsStreamProvider");
  }
  return ctx;
}
