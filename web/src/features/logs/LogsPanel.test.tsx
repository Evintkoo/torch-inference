import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogsPanel } from "./LogsPanel";
import type { LogFileContent, LoggingInfo } from "./types";

const sampleInfo: LoggingInfo = {
  log_directory: "logs",
  log_level: "info",
  total_log_size_mb: 5.71,
  available_log_files: [
    {
      name: "torch-inference.log.2026-09-13",
      path: "logs/torch-inference.log.2026-09-13",
      size_bytes: 5_000_000,
      size_mb: 4.99,
      line_count: 15_357,
      modified: "2026-09-13T23:59:00Z",
    },
    {
      name: "torch-inference.log.2026-09-14",
      path: "logs/torch-inference.log.2026-09-14",
      size_bytes: 750_000,
      size_mb: 0.72,
      line_count: 2_698,
      modified: "2026-09-14T09:00:00Z",
    },
  ],
};

const sampleContent: LogFileContent = {
  file_name: "torch-inference.log.2026-09-14",
  content: "2026-09-14T09:00:00Z INFO hello from the server\n",
  line_count: 1,
  total_lines: 1,
  from_end: true,
};

function renderPanel() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <LogsPanel />
    </QueryClientProvider>,
  );
}

describe("LogsPanel", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("has no file browser — it auto-tails whichever log file was modified most recently, with no manual selection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((path: string) => {
        const body = path.startsWith("/logs/") ? sampleContent : sampleInfo;
        return Promise.resolve({ ok: true, status: 200, json: async () => body });
      }),
    );
    renderPanel();

    expect(screen.getByRole("heading", { name: "Server Logs" })).toBeInTheDocument();
    expect(screen.queryByTestId("logs-file-list")).not.toBeInTheDocument();
    expect(screen.queryByText(/torch-inference\.log\.2026-09-13/)).not.toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("hello from the server")).toBeInTheDocument());
    // The 09-14 file has the later `modified` timestamp — it's "current",
    // not the larger/older 09-13 file.
    expect(screen.getByTestId("logs-viewer-header")).toHaveTextContent("torch-inference.log.2026-09-14");
  });
});
