import { describe, expect, it } from "vitest";
import {
  filterLogRows,
  formatLogTime,
  logLevelVariant,
  parseLogFields,
  parseLogLines,
  stripAnsi,
} from "./log-parser";

describe("parseLogLines", () => {
  it("parses a well-formed tracing line into time/level/message", () => {
    const text = '2026-09-13T09:39:19.512653Z  INFO ThreadId(02) torch::api: src/api/handlers.rs:32: request served\n';
    const rows = parseLogLines(text);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      time: "2026-09-13T09:39:19.512653Z",
      level: "INFO",
      message: "torch::api: src/api/handlers.rs:32: request served",
    });
  });

  it("parses ERROR and WARN levels without a ThreadId segment", () => {
    const text = "2026-09-13T00:00:00Z ERROR boom\n2026-09-13T00:00:01Z WARN careful\n";
    const rows = parseLogLines(text);
    expect(rows.map((r) => r.level)).toEqual(["ERROR", "WARN"]);
  });

  it("folds an unmatched continuation line into the previous row's message", () => {
    const text = "2026-09-13T00:00:00Z INFO first line\n  continued value\n";
    const rows = parseLogLines(text);
    expect(rows).toHaveLength(1);
    expect(rows[0].message).toBe("first line\n  continued value");
    expect(rows[0].raw).toContain("continued value");
  });

  it("treats a leading unparseable line as its own row with empty time/level", () => {
    const rows = parseLogLines("not a tracing line at all\n");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ time: "", level: "", message: "not a tracing line at all" });
  });

  it("ignores the trailing empty string produced by a final newline", () => {
    const rows = parseLogLines("2026-09-13T00:00:00Z INFO one\n");
    expect(rows).toHaveLength(1);
  });

  it("returns an empty array for empty content", () => {
    expect(parseLogLines("")).toEqual([]);
  });
});

describe("stripAnsi", () => {
  it("removes ANSI color escape sequences", () => {
    expect(stripAnsi("\x1b[31mred text\x1b[0m")).toBe("red text");
  });

  it("leaves plain text untouched", () => {
    expect(stripAnsi("plain")).toBe("plain");
  });
});

describe("formatLogTime", () => {
  it("trims an RFC3339 timestamp to time-of-day with milliseconds", () => {
    expect(formatLogTime("2026-09-13T09:39:19.512653Z")).toBe("09:39:19.512");
  });

  it("returns an em dash for an empty timestamp", () => {
    expect(formatLogTime("")).toBe("—");
  });

  it("returns the input unchanged when there is no 'T' separator", () => {
    expect(formatLogTime("not-a-timestamp")).toBe("not-a-timestamp");
  });
});

describe("logLevelVariant", () => {
  it("maps ERROR to destructive", () => {
    expect(logLevelVariant("ERROR")).toBe("destructive");
  });

  it("maps WARN to warning", () => {
    expect(logLevelVariant("WARN")).toBe("warning");
  });

  it("maps everything else (INFO, DEBUG, TRACE, unparsed) to neutral", () => {
    expect(logLevelVariant("INFO")).toBe("neutral");
    expect(logLevelVariant("DEBUG")).toBe("neutral");
    expect(logLevelVariant("TRACE")).toBe("neutral");
    expect(logLevelVariant("")).toBe("neutral");
  });
});

describe("parseLogFields", () => {
  it("splits target/location prefix from key=value fields", () => {
    const message =
      'torch_inference_server::middleware::request_logger: src/middleware/request_logger.rs:115: correlation_id=abc method=GET path=/health status=200 duration_ms=12 event="request_completed"';
    const parsed = parseLogFields(message);
    expect(parsed.target).toBe("torch_inference_server::middleware::request_logger");
    expect(parsed.fields).toMatchObject({
      correlation_id: "abc",
      method: "GET",
      path: "/health",
      status: "200",
      duration_ms: "12",
      event: "request_completed",
    });
    expect(parsed.text).toBe("");
  });

  it("keeps quoted values with spaces intact", () => {
    const parsed = parseLogFields('svc: src/x.rs:1: user_agent="Mozilla/5.0 (Macintosh)" path=/health');
    expect(parsed.fields.user_agent).toBe("Mozilla/5.0 (Macintosh)");
    expect(parsed.fields.path).toBe("/health");
  });

  it("falls back to freeform text when there are no key=value pairs", () => {
    const parsed = parseLogFields("HRM-Text running in STUB mode — no weights loaded");
    expect(parsed.fields).toEqual({});
    expect(parsed.text).toBe("HRM-Text running in STUB mode — no weights loaded");
  });
});

describe("filterLogRows", () => {
  const rows = parseLogLines(
    "2026-09-13T00:00:00Z INFO hello world\n2026-09-13T00:00:01Z ERROR boom goes the dynamite\n",
  );

  it("returns all rows when the term is blank", () => {
    expect(filterLogRows(rows, "  ")).toHaveLength(2);
  });

  it("filters case-insensitively across the full raw line", () => {
    expect(filterLogRows(rows, "BOOM")).toHaveLength(1);
    expect(filterLogRows(rows, "boom")[0].level).toBe("ERROR");
  });

  it("matches against the level too", () => {
    expect(filterLogRows(rows, "error")).toHaveLength(1);
  });
});
