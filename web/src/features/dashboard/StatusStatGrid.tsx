import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api-client";
import type { ComponentHealth, HealthCheck } from "./types";

function CheckStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const variant = normalized === "up" ? "outline" : normalized === "degraded" ? "secondary" : "destructive";
  return (
    <Badge variant={variant} className={normalized === "up" ? "border-success text-success" : undefined}>
      {status}
    </Badge>
  );
}

function formatUptime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function StatCard({ label, value }: { label: string; value: string }) {
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
          Health Checks
        </div>
        {!data && !isError && (
          <p className="text-sm text-muted-foreground" data-testid="health-checks-empty">
            fetching…
          </p>
        )}
        {isError && (
          <p className="text-sm text-destructive" data-testid="health-checks-error">
            failed to fetch
          </p>
        )}
        {data && (
          <div className="divide-y divide-border2 border border-border2" data-testid="health-checks">
            {Object.entries(data.checks ?? {}).map(([name, check]: [string, ComponentHealth]) => (
              <div key={name} className="flex items-center gap-3 px-3.5 py-2.5 text-sm">
                <CheckStatusBadge status={check.status} />
                <span className="font-medium">{name}</span>
                {check.message && (
                  <span className="flex-1 truncate text-muted-foreground">{check.message}</span>
                )}
                <span className="ml-auto shrink-0 font-mono text-xs text-text-dim">
                  {check.latency_ms}ms
                </span>
              </div>
            ))}
            {Object.keys(data.checks ?? {}).length === 0 && (
              <p className="px-3.5 py-2.5 text-sm text-muted-foreground">No component checks reported.</p>
            )}
          </div>
        )}
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
