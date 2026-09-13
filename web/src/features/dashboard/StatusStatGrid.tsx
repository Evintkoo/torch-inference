import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { HealthCheck } from "./types";

function formatUptime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border2 bg-card px-4 py-3.5">
      <div className="mb-1 text-[11px] tracking-wide text-text-dim uppercase">{label}</div>
      <div className="font-mono text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}

export function StatusStatGrid() {
  const { data, isError, refetch, isFetching } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiGet<HealthCheck>("/health"),
    refetchInterval: 10_000,
  });

  return (
    <div className="space-y-5" data-testid="status-panel">
      <div>
        <h2 className="font-serif text-lg font-semibold">System Status</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">Live health and runtime metrics.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Status" value={isError ? "error" : (data?.status ?? "—")} />
        <StatCard label="Uptime" value={data ? formatUptime(data.uptime_seconds) : "—"} />
        <StatCard label="Active Req" value={data?.active_requests !== undefined ? String(data.active_requests) : "—"} />
        <StatCard label="Total Req" value={data?.total_requests !== undefined ? String(data.total_requests) : "—"} />
        <StatCard
          label="Avg Latency"
          value={data?.avg_latency_ms !== undefined ? `${data.avg_latency_ms.toFixed(2)}ms` : "—"}
        />
        <StatCard
          label="Error Rate"
          value={data?.error_rate !== undefined ? `${(data.error_rate * 100).toFixed(2)}%` : "—"}
        />
      </div>

      <div className="border border-border2 bg-card p-5">
        <div className="mb-3.5 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
          Raw Health JSON
        </div>
        <pre
          className="max-h-[340px] overflow-y-auto border border-border2 bg-[#F1F3F4] p-3.5 font-mono text-[12.5px] leading-[1.7] whitespace-pre-wrap text-foreground dark:bg-[#1a1a1a]"
          data-testid="health-raw"
        >
          {data ? JSON.stringify(data, null, 2) : isError ? "failed to fetch" : "fetching…"}
        </pre>
      </div>

      <button
        type="button"
        onClick={() => refetch()}
        disabled={isFetching}
        className="inline-flex h-9 w-fit items-center gap-1.5 self-start border border-[#E4E7E9] bg-white px-3.5 text-sm font-medium text-[#0D0E0F] transition-colors hover:bg-[#F8F9F9] disabled:opacity-65 dark:border-border dark:bg-secondary dark:text-foreground"
      >
        <i className="ri-refresh-line" aria-hidden="true" /> Refresh
      </button>
    </div>
  );
}
