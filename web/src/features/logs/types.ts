export interface LogFileInfo {
  name: string;
  path: string;
  size_bytes: number;
  size_mb: number;
  line_count: number;
  modified: string;
}

export interface LoggingInfo {
  log_directory: string;
  log_level: string;
  available_log_files: LogFileInfo[];
  total_log_size_mb: number;
}

export interface LogFileContent {
  file_name: string;
  content: string;
  line_count: number;
  total_lines: number;
  from_end: boolean;
}

export interface ClearLogResponse {
  success: boolean;
  message: string;
  original_size_bytes: number;
  original_size_mb: number;
}

/** One parsed row out of a tracing-formatted log line (see log-parser.ts). */
export interface LogRow {
  time: string;
  level: string;
  message: string;
  raw: string;
}

/** How many trailing lines to request from `GET /logs/{file}` — mirrors the
 * `<select>` options in playground.html's log viewer. */
export const LOG_LINE_OPTIONS = [100, 500, 2000] as const;
export type LogLineOption = (typeof LOG_LINE_OPTIONS)[number];
