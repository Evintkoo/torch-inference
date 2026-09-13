import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogFileList } from "./LogFileList";
import type { LoggingInfo } from "./types";

const sampleInfo: LoggingInfo = {
  log_directory: "logs",
  log_level: "info",
  total_log_size_mb: 1.5,
  available_log_files: [
    { name: "server.log", path: "logs/server.log", size_bytes: 1572864, size_mb: 1.5, line_count: 42, modified: "2026-09-13 00:00:00" },
  ],
};

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("LogFileList", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("lists files returned by GET /logs with size and line count", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sampleInfo }),
    );
    renderWithClient(<LogFileList selectedFile={null} onSelect={vi.fn()} onCleared={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("server.log")).toBeInTheDocument());
    expect(screen.getByText("1.50 MB")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText(/Total: 1\.50 MB/)).toBeInTheDocument();
  });

  it("shows an empty state when there are no log files", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ...sampleInfo, available_log_files: [] }),
      }),
    );
    renderWithClient(<LogFileList selectedFile={null} onSelect={vi.fn()} onCleared={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("No log files found.")).toBeInTheDocument());
  });

  it("calls onSelect with the file name when View is clicked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sampleInfo }),
    );
    const onSelect = vi.fn();
    const user = userEvent.setup();
    renderWithClient(<LogFileList selectedFile={null} onSelect={onSelect} onCleared={vi.fn()} />);
    await waitFor(() => expect(screen.getByTestId("logs-view-server.log")).toBeInTheDocument());
    await user.click(screen.getByTestId("logs-view-server.log"));
    expect(onSelect).toHaveBeenCalledWith("server.log");
  });

  it("sends a DELETE to /logs/{file} and calls onCleared after confirming the clear dialog", async () => {
    const fetchMock = vi.fn((_path: string, init?: RequestInit) => {
      if (init?.method === "DELETE") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, message: "cleared", original_size_bytes: 1572864, original_size_mb: 1.5 }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => sampleInfo });
    });
    vi.stubGlobal("fetch", fetchMock);
    const onCleared = vi.fn();
    const user = userEvent.setup();
    renderWithClient(<LogFileList selectedFile={null} onSelect={vi.fn()} onCleared={onCleared} />);
    await waitFor(() => expect(screen.getByTestId("logs-clear-server.log")).toBeInTheDocument());

    await user.click(screen.getByTestId("logs-clear-server.log"));
    const confirmButton = await screen.findByRole("button", { name: "Clear" });
    await user.click(confirmButton);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/logs/server.log",
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
    await waitFor(() => expect(onCleared).toHaveBeenCalledWith("server.log"));
  });
});
