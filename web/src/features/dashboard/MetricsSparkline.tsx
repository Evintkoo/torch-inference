import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

export interface MetricsSparklineProps {
  label: string;
  timestamps: number[];
  values: number[];
  /** Formats the current (last) value shown top-right, e.g. "31.5%" or "109.4 MB". */
  formatValue: (v: number) => string;
  "data-testid"?: string;
}

/**
 * One small live trend chart — current value top-right, a compact filled
 * line below. Shared by the three Metrics sparklines (CPU %, Memory %,
 * Process Memory) so they're one component rather than three copies of the
 * uPlot setup; `MetricsPanel.tsx` mounts one of these per series.
 */
export function MetricsSparkline({ label, timestamps, values, formatValue, ...rest }: MetricsSparklineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || timestamps.length === 0) return;

    if (!plotRef.current) {
      // Canvas 2D can't resolve CSS custom properties directly, so resolve
      // the computed color before handing it to uPlot. These tokens are
      // plain hex (see styles/globals.css), so appending an alpha suffix for
      // the fill is safe.
      const stroke = getComputedStyle(container).getPropertyValue("--color-primary").trim() || "#000000";
      const fill = `${stroke}26`;
      plotRef.current = new uPlot(
        {
          width: container.clientWidth,
          height: 90,
          scales: { x: { time: true } },
          axes: [{ show: false }, { show: false }],
          legend: { show: false },
          cursor: { show: false },
          series: [{}, { stroke, width: 1.5, fill }],
        },
        [timestamps, values],
        container,
      );
    } else {
      plotRef.current.setSize({ width: container.clientWidth, height: 90 });
      plotRef.current.setData([timestamps, values]);
    }
  }, [timestamps, values]);

  useEffect(() => {
    return () => {
      plotRef.current?.destroy();
      plotRef.current = null;
    };
  }, []);

  const current = values.at(-1);

  return (
    <div className="border border-border2 bg-card p-3" data-testid={rest["data-testid"]}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] tracking-wide text-text-dim uppercase">{label}</span>
        <span className="font-mono text-sm font-semibold text-foreground">
          {current !== undefined ? formatValue(current) : "—"}
        </span>
      </div>
      {timestamps.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">Waiting for data…</p>
      ) : (
        <div ref={containerRef} />
      )}
    </div>
  );
}
