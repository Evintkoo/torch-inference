import { StatCard } from "./StatusStatGrid";
import { formatUptime } from "./SystemInfoCard";
import { MetricsSparkline } from "./MetricsSparkline";
import { useMetricsStream } from "./MetricsStreamContext";

const pct = (v: number) => `${v.toFixed(1)}%`;
const mb = (v: number) => `${v.toFixed(0)} MB`;

/**
 * Richer than the single CPU-only chart this used to be — a row of stat
 * tiles (mirroring StatusStatGrid's StatCard) plus three live sparklines
 * (CPU %, Memory %, Process Memory). The underlying SSE connection + buffer
 * live in `MetricsStreamProvider` at the app root (see that file for why) —
 * this panel just renders whatever's already accumulated there.
 */
export function MetricsPanel() {
  const { data, error, buffer } = useMetricsStream();

  const m = data?.metrics;
  const memFreeMb = m ? Math.max(0, m.mem_total_mb - m.mem_used_mb) : undefined;
  const memPct = m && m.mem_total_mb > 0 ? (m.mem_used_mb / m.mem_total_mb) * 100 : undefined;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-lg font-semibold">Metrics</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Live CPU/memory over <code className="text-xs">GET /dashboard/stream</code>.
        </p>
      </div>

      {!data && !error && (
        <p className="text-sm text-muted-foreground" data-testid="metrics-waiting">
          Waiting for metrics…
        </p>
      )}
      {error && !data && (
        <p className="text-sm text-muted-foreground" data-testid="metrics-error">
          Unable to load live metrics
        </p>
      )}

      {m && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7" data-testid="metrics-stat-grid">
            <StatCard label="CPU Usage" value={pct(m.cpu_pct)} />
            <StatCard label="Mem Usage" value={memPct !== undefined ? pct(memPct) : "—"} />
            <StatCard label="Mem Used" value={mb(m.mem_used_mb)} />
            <StatCard label="Mem Free" value={memFreeMb !== undefined ? mb(memFreeMb) : "—"} />
            <StatCard label="Process Mem" value={mb(m.process_mem_mb)} />
            <StatCard label="Process CPU" value={pct(m.process_cpu_pct)} />
            <StatCard label="Uptime" value={formatUptime(m.uptime_s)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3" data-testid="metrics-sparklines">
            <MetricsSparkline
              label="CPU %"
              timestamps={buffer.timestamps}
              values={buffer.cpuPct}
              formatValue={pct}
              data-testid="metrics-sparkline-cpu"
            />
            <MetricsSparkline
              label="Memory %"
              timestamps={buffer.timestamps}
              values={buffer.memPct}
              formatValue={pct}
              data-testid="metrics-sparkline-memory"
            />
            <MetricsSparkline
              label="Process Memory"
              timestamps={buffer.timestamps}
              values={buffer.processMemMb}
              formatValue={mb}
              data-testid="metrics-sparkline-process-memory"
            />
          </div>
        </>
      )}
    </div>
  );
}
