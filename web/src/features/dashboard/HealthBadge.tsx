import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api-client";
import type { HealthCheck } from "./types";

export function HealthBadge() {
  const { data, isError } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiGet<HealthCheck>("/health"),
    refetchInterval: 10_000,
  });

  if (isError) {
    return <Badge variant="destructive">unreachable</Badge>;
  }
  if (!data) {
    return <Badge variant="secondary">checking…</Badge>;
  }
  return (
    <Badge variant={data.status === "healthy" ? "default" : "destructive"}>{data.status}</Badge>
  );
}
