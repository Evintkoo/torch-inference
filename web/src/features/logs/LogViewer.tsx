import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet } from "@/lib/api-client";
import { filterLogRows, formatLogTime, logLevelVariant, parseLogFields, parseLogLines, stripAnsi } from "./log-parser";
import { LOG_LINE_OPTIONS, type LogFileContent, type LogLineOption } from "./types";

export interface LogViewerProps {
  /** File name to view, or null when nothing is selected yet. */
  fileName: string | null;
}

const badgeVariantClass: Record<string, string> = {
  destructive: "",
  warning: "bg-yellow-bg text-yellow-text",
  neutral: "bg-muted text-muted-foreground",
};

export function LogViewer({ fileName }: LogViewerProps) {
  const [lines, setLines] = useState<LogLineOption>(100);
  const [search, setSearch] = useState("");

  const [live, setLive] = useState(true);

  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["logs-content", fileName, lines],
    queryFn: () =>
      apiGet<LogFileContent>(`/logs/${encodeURIComponent(fileName as string)}?lines=${lines}&from_end=true`),
    enabled: fileName != null,
    // Tail the file like `tail -f` while a file is selected, so new lines
    // show up without the user having to keep hitting Refresh.
    refetchInterval: fileName != null && live ? 3_000 : false,
  });

  const rows = useMemo(() => {
    if (!data) return [];
    return parseLogLines(stripAnsi(data.content || ""));
  }, [data]);

  const filteredRows = useMemo(() => filterLogRows(rows, search), [rows, search]);

  const header = !fileName
    ? "Loading current log…"
    : data?.total_lines != null
      ? `${fileName} (showing ${rows.length.toLocaleString()} of ${data.total_lines.toLocaleString()} lines)`
      : fileName;

  return (
    <div className="min-h-[240px] rounded-lg border border-border bg-card p-3" data-testid="logs-viewer">
      <div className="mb-2 flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <span data-testid="logs-viewer-header">{header}</span>
        {fileName && (
          <button
            type="button"
            onClick={() => setLive((l) => !l)}
            data-testid="logs-live-toggle"
            aria-pressed={live}
            title={live ? "Live tailing — click to pause" : "Paused — click to resume live tailing"}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-sans"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${live ? "animate-pulse bg-green" : "bg-text-dim"}`}
              aria-hidden="true"
            />
            {live ? "Live" : "Paused"}
          </button>
        )}
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter rows (time, level, message)…"
          autoComplete="off"
          disabled={!fileName}
          data-testid="logs-search-input"
          className="h-8 min-w-[160px] flex-1 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
        />
        <Select
          value={String(lines)}
          onValueChange={(v) => setLines(Number(v) as LogLineOption)}
          disabled={!fileName}
        >
          <SelectTrigger data-testid="logs-lines-select" size="sm" className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOG_LINE_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                Last {option} lines
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {search.trim() && (
          <span className="self-center text-xs text-muted-foreground">
            {filteredRows.length} / {rows.length} rows
          </span>
        )}
      </div>

      <div className="max-h-[400px] overflow-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Time</TableHead>
              <TableHead className="w-[70px]">Level</TableHead>
              <TableHead className="w-[70px]">Method</TableHead>
              <TableHead>Path</TableHead>
              <TableHead className="w-[70px]">Status</TableHead>
              <TableHead className="w-[90px]">Duration</TableHead>
              <TableHead>Event</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!fileName && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Loading current log…
                </TableCell>
              </TableRow>
            )}
            {fileName && isPending && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {fileName && isError && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-destructive">
                  Failed to load log file.
                </TableCell>
              </TableRow>
            )}
            {fileName && !isPending && !isError && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {rows.length ? "No rows match filter." : "No log lines."}
                </TableCell>
              </TableRow>
            )}
            {filteredRows.map((row, idx) => {
              const variant = logLevelVariant(row.level);
              const parsed = parseLogFields(row.message);
              const status = parsed.fields.status;
              const statusVariant =
                status && Number(status) >= 500
                  ? "destructive"
                  : status && Number(status) >= 400
                    ? "warning"
                    : "neutral";
              return (
                <TableRow key={idx} title={row.raw}>
                  <TableCell
                    className="whitespace-nowrap font-mono text-muted-foreground"
                    title={row.time || "(unparsed line)"}
                  >
                    {formatLogTime(row.time)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={variant === "destructive" ? "destructive" : "outline"}
                      className={badgeVariantClass[variant]}
                    >
                      {row.level || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {parsed.fields.method || "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs break-all">{parsed.fields.path || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {status ? (
                      <Badge
                        variant={statusVariant === "destructive" ? "destructive" : "outline"}
                        className={badgeVariantClass[statusVariant]}
                      >
                        {status}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {parsed.fields.duration_ms !== undefined ? `${parsed.fields.duration_ms}ms` : "—"}
                  </TableCell>
                  <TableCell className="whitespace-pre-wrap font-mono text-xs break-words">
                    {parsed.fields.event ?? parsed.text ?? row.message}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {isFetching && !isPending && (
        <p className="mt-1 text-[11px] text-muted-foreground">Refreshing…</p>
      )}
    </div>
  );
}
