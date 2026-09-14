import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api-client";
import type { SystemInfo } from "./types";

function InfoGrid({ rows }: { rows: Array<[string, string | number | null | undefined]> }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
      {rows.map(([label, value]) => (
        <div key={label} className="col-span-2 grid grid-cols-2">
          <dt className="text-muted-foreground">{label}</dt>
          <dd>{value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function SystemInfoCard() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["system-info"],
    queryFn: () => apiGet<SystemInfo>("/system/info"),
    refetchInterval: 30_000,
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isPending && <Skeleton className="h-24 w-full" />}
          {isError && <p className="text-destructive">Failed to load system info.</p>}
          {data && (
            <InfoGrid
              rows={[
                ["OS", `${data.system.os} (${data.system.arch})`],
                ["Hostname", data.system.hostname],
                ["CPU cores", data.system.cpu_count],
                ["Memory", data.system.total_memory_human],
              ]}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Server</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isPending && <Skeleton className="h-24 w-full" />}
          {isError && <p className="text-destructive">Failed to load system info.</p>}
          {data && (
            <InfoGrid
              rows={[
                ["Version", data.runtime.version],
                ["Build date", data.runtime.build_date],
                ["Rust", data.runtime.rust_version],
                ["Uptime", formatUptime(data.runtime.uptime_secs)],
              ]}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GPU</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm" data-testid="system-info-gpu">
          {isPending && <Skeleton className="h-24 w-full" />}
          {isError && <p className="text-destructive">Failed to load system info.</p>}
          {data && data.gpu.devices.length === 0 && (
            <p className="text-muted-foreground">No GPU detected.</p>
          )}
          {data?.gpu.devices.map((g, i) => (
            <InfoGrid
              key={g.id}
              rows={[
                [data.gpu.devices.length > 1 ? `Device ${i + 1}` : "Device", g.name],
                ["Utilization", g.utilization != null ? `${g.utilization}%` : null],
                ["Temperature", g.temperature != null ? `${g.temperature}°C` : null],
                ["VRAM free", g.free_memory_human],
                ["VRAM total", g.total_memory_human],
              ]}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isPending && <Skeleton className="h-24 w-full" />}
          {isError && <p className="text-destructive">Failed to load system info.</p>}
          {data && (
            <InfoGrid
              rows={[
                ["CUDA", data.features.cuda_enabled ? "enabled" : "disabled"],
                ["ONNX", data.features.onnx_enabled ? "enabled" : "disabled"],
                ["Torch", data.features.torch_enabled ? "enabled" : "disabled"],
                ["Audio processing", data.features.audio_processing ? "enabled" : "disabled"],
                ["Image security", data.features.image_security ? "enabled" : "disabled"],
              ]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
