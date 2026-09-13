import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet } from "@/lib/api-client";
import { filterLogRows, formatLogTime, logLevelVariant, parseLogLines, stripAnsi } from "./log-parser";
import { LOG_LINE_OPTIONS, type LogFileContent, type LogLineOption } from "./types";

export interface LogViewerProps {
  /** File name to view, or null when nothing is selected yet. */
  fileName: string | null;
}

const badgeVariantClass: Record<string, string> = {
  destructive: "",
  warning: "bg-[#fef3c7] text-[#92400e] dark:bg-[#78350f]/40 dark:text-[#fbbf24]",
  neutral: "bg-muted text-muted-foreground",
};

export function LogViewer({ fileName }: LogViewerProps) {
  const [lines, setLines] = useState<LogLineOption>(100);
  const [search, setSearch] = useState("");

  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["logs-content", fileName, lines],
    queryFn: () =>
      apiGet<LogFileContent>(`/logs/${encodeURIComponent(fileName as string)}?lines=${lines}&from_end=true`),
    enabled: fileName != null,
  });

  const rows = useMemo(() => {
    if (!data) return [];
    return parseLogLines(stripAnsi(data.content || ""));
  }, [data]);

  const filteredRows = useMemo(() => filterLogRows(rows, search), [rows, search]);

  const header = !fileName
    ? "Select a file to view"
    : data?.total_lines != null
      ? `${fileName} (showing ${rows.length.toLocaleString()} of ${data.total_lines.toLocaleString()} lines)`
      : fileName;

  return (
    <div className="min-h-[240px] rounded-lg border border-border bg-card p-3" data-testid="logs-viewer">
      <div className="mb-2 font-mono text-xs text-muted-foreground" data-testid="logs-viewer-header">
        {header}
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
        <select
          value={lines}
          onChange={(event) => setLines(Number(event.target.value) as LogLineOption)}
          disabled={!fileName}
          data-testid="logs-lines-select"
          className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none disabled:opacity-50"
        >
          {LOG_LINE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              Last {option} lines
            </option>
          ))}
        </select>
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
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!fileName && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Select a file to view
                </TableCell>
              </TableRow>
            )}
            {fileName && isPending && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {fileName && isError && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-destructive">
                  Failed to load log file.
                </TableCell>
              </TableRow>
            )}
            {fileName && !isPending && !isError && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  {rows.length ? "No rows match filter." : "No log lines."}
                </TableCell>
              </TableRow>
            )}
            {filteredRows.map((row, idx) => {
              const variant = logLevelVariant(row.level);
              return (
                <TableRow key={idx}>
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
                  <TableCell className="whitespace-pre-wrap font-mono text-xs break-words">
                    {row.message}
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
