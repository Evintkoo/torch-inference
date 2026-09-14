import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { LogViewer } from "./LogViewer";
import type { LoggingInfo } from "./types";

/**
 * Server Logs — a live tail of whatever log file the currently running
 * server is actively writing to, with no file browser. Rotation is daily
 * (`torch-inference.log.YYYY-MM-DD`), so "current" just means the most
 * recently modified file in `GET /logs`'s list; this re-checks that on the
 * same interval LogViewer polls on, so a rollover picks up the new file
 * automatically instead of getting stuck tailing yesterday's now-frozen one.
 */
export function LogsPanel() {
  const { data } = useQuery({
    queryKey: ["logs-files"],
    queryFn: () => apiGet<LoggingInfo>("/logs"),
    refetchInterval: 30_000,
  });

  const files = data?.available_log_files ?? [];
  const currentFile =
    files.length === 0
      ? null
      : [...files].sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())[0].name;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-medium">Server Logs</h2>
        <p className="text-sm text-muted-foreground">
          Live log from the currently running server via <code className="font-mono text-xs">GET /logs</code>.
        </p>
      </div>
      <LogViewer fileName={currentFile} />
    </div>
  );
}
