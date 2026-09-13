import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api-client";
import type { SystemInfo } from "./types";

export function SystemInfoCard() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["system-info"],
    queryFn: () => apiGet<SystemInfo>("/system/info"),
    refetchInterval: 30_000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>System</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isPending && <Skeleton className="h-20 w-full" />}
        {isError && <p className="text-destructive">Failed to load system info.</p>}
        {data && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
            <dt className="text-muted-foreground">OS</dt>
            <dd>{data.system.os} ({data.system.arch})</dd>
            <dt className="text-muted-foreground">CPU cores</dt>
            <dd>{data.system.cpu_count}</dd>
            <dt className="text-muted-foreground">Memory</dt>
            <dd>{data.system.total_memory_human}</dd>
            <dt className="text-muted-foreground">Runtime</dt>
            <dd>{data.runtime.version}</dd>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
