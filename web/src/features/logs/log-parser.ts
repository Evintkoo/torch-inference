import type { LogRow } from "./types";

// Log lines look like:
//   2026-09-13T09:39:19.512653Z  INFO ThreadId(02) target::path: src/file.rs:32: key=val key2="val 2"
// Capture the RFC3339 timestamp and level; everything else (span name, target,
// source location, and the space-separated fields) is kept together as the
// message so nothing is lost even though it isn't broken out field-by-field.
// Ported verbatim from playground.html's `LOG_LINE_RE` / `parseLogLines`.
const LOG_LINE_RE = /^(\S+)\s+(TRACE|DEBUG|INFO|WARN|ERROR)\s+(?:ThreadId\(\d+\)\s+)?(.*)$/;

/** Parse raw log-file content into rows, folding unmatched continuation lines
 * (wrapped/multi-line field values) into the previous row's message. */
export function parseLogLines(text: string): LogRow[] {
  const rows: LogRow[] = [];
  text.split("\n").forEach((raw) => {
    if (raw === "") return; // trailing newline from split
    const m = raw.match(LOG_LINE_RE);
    if (m) {
      rows.push({ time: m[1], level: m[2], message: m[3], raw });
    } else if (rows.length) {
      const prev = rows[rows.length - 1];
      prev.message += "\n" + raw;
      prev.raw += "\n" + raw;
    } else {
      rows.push({ time: "", level: "", message: raw, raw });
    }
  });
  return rows;
}

/** Strip ANSI color escape codes some log lines carry over from terminal output. */
export function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

/** Trim an RFC3339 timestamp down to `HH:MM:SS.mmm` for compact display. */
export function formatLogTime(iso: string): string {
  if (!iso) return "—";
  const t = iso.indexOf("T");
  if (t === -1) return iso;
  let timePart = iso.slice(t + 1).replace(/Z$/, "");
  const dot = timePart.indexOf(".");
  if (dot !== -1) timePart = timePart.slice(0, dot + 4); // trim to milliseconds
  return timePart;
}

export type LogLevelVariant = "destructive" | "warning" | "neutral";

export function logLevelVariant(level: string): LogLevelVariant {
  if (level === "ERROR") return "destructive";
  if (level === "WARN") return "warning";
  return "neutral"; // INFO, DEBUG, TRACE, or unparsed lines all read as neutral
}

/** Case-insensitive filter over the full raw line, matching the old panel's
 * `#log-search` behavior (matches time/level/message together). */
export function filterLogRows(rows: LogRow[], term: string): LogRow[] {
  const trimmed = term.trim().toLowerCase();
  if (!trimmed) return rows;
  return rows.filter((row) => row.raw.toLowerCase().includes(trimmed));
}
