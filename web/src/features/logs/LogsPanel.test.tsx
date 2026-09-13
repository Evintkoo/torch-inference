import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogsPanel } from "./LogsPanel";
import type { LogFileContent, LoggingInfo } from "./types";

const sampleInfo: LoggingInfo = {
  log_directory: "logs",
  log_level: "info",
  total_log_size_mb: 0.01,
  available_log_files: [
    { name: "server.log", path: "logs/server.log", size_bytes: 100, size_mb: 0.01, line_count: 1, modified: "2026-09-13 00:00:00" },
  ],
};

const sampleContent: LogFileContent = {
  file_name: "server.log",
  content: "2026-09-13T00:00:00Z INFO hello from the server\n",
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

  it("selects a file from the list and shows its parsed content in the viewer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((path: string) => {
        const body = path.startsWith("/logs/") ? sampleContent : sampleInfo;
        return Promise.resolve({ ok: true, status: 200, json: async () => body });
      }),
    );
    const user = userEvent.setup();
    renderPanel();

    await waitFor(() => expect(screen.getByText("server.log")).toBeInTheDocument());
    await user.click(screen.getByTestId("logs-view-server.log"));

    await waitFor(() => expect(screen.getByText("hello from the server")).toBeInTheDocument());
    expect(screen.getByTestId("logs-viewer-header")).toHaveTextContent("server.log");
  });
});
