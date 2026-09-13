import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiDelete, apiGet } from "@/lib/api-client";
import type { ClearLogResponse, LoggingInfo } from "./types";

export const LOGS_FILES_QUERY_KEY = ["logs-files"];

export interface LogFileListProps {
  selectedFile: string | null;
  onSelect: (name: string) => void;
  /** Called after a file is cleared, so the viewer can reset if it was showing that file. */
  onCleared: (name: string) => void;
}

export function LogFileList({ selectedFile, onSelect, onCleared }: LogFileListProps) {
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: LOGS_FILES_QUERY_KEY,
    queryFn: () => apiGet<LoggingInfo>("/logs"),
  });

  const files = data?.available_log_files ?? [];

  return (
    <div className="rounded-lg border border-border bg-card p-3" data-testid="logs-file-list">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-sm font-medium">Files</h3>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Refresh log file list"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={isFetching ? "animate-spin" : undefined} />
        </Button>
      </div>

      {isPending && <p className="text-xs text-muted-foreground">Loading…</p>}
      {isError && <p className="text-xs text-destructive">Failed to load log files.</p>}
      {!isPending && !isError && files.length === 0 && (
        <p className="text-xs text-muted-foreground">No log files found.</p>
      )}

      {files.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-right">Lines</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <LogFileRow
                key={file.name}
                name={file.name}
                sizeMb={file.size_mb}
                lineCount={file.line_count}
                selected={file.name === selectedFile}
                onSelect={() => onSelect(file.name)}
                onCleared={() => {
                  queryClient.invalidateQueries({ queryKey: LOGS_FILES_QUERY_KEY });
                  onCleared(file.name);
                }}
              />
            ))}
          </TableBody>
        </Table>
      )}

      {data && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Total: {(data.total_log_size_mb || 0).toFixed(2)} MB · Level: {data.log_level || "—"}
        </p>
      )}
    </div>
  );
}

interface LogFileRowProps {
  name: string;
  sizeMb: number;
  lineCount: number;
  selected: boolean;
  onSelect: () => void;
  onCleared: () => void;
}

function LogFileRow({ name, sizeMb, lineCount, selected, onSelect, onCleared }: LogFileRowProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const clearMutation = useMutation({
    mutationFn: () => apiDelete<ClearLogResponse>(`/logs/${encodeURIComponent(name)}`),
    onSuccess: () => {
      setDialogOpen(false);
      onCleared();
    },
  });

  return (
    <TableRow data-state={selected ? "selected" : undefined}>
      <TableCell className="max-w-[160px] truncate font-medium" title={name}>
        {name}
      </TableCell>
      <TableCell className="text-right text-muted-foreground">{sizeMb.toFixed(2)} MB</TableCell>
      <TableCell className="text-right text-muted-foreground">{lineCount.toLocaleString()}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="xs" onClick={onSelect} data-testid={`logs-view-${name}`}>
            View
          </Button>
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Clear ${name}`}
                className="text-destructive hover:text-destructive"
                data-testid={`logs-clear-${name}`}
              >
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear log file?</AlertDialogTitle>
                <AlertDialogDescription>
                  This truncates &ldquo;{name}&rdquo; on the server. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {clearMutation.isError && (
                <p className="text-sm text-destructive">Clear failed. Try again.</p>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(event) => {
                    event.preventDefault();
                    clearMutation.mutate();
                  }}
                  disabled={clearMutation.isPending}
                >
                  {clearMutation.isPending ? "Clearing…" : "Clear"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
