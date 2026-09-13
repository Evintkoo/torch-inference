import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogViewer } from "./LogViewer";
import type { LogFileContent } from "./types";

const sampleContent: LogFileContent = {
  file_name: "server.log",
  content:
    "2026-09-13T09:39:19.512653Z  INFO ThreadId(02) request served\n" +
    "2026-09-13T09:39:20.000000Z ERROR ThreadId(03) request failed\n",
  line_count: 2,
  total_lines: 2,
  from_end: true,
};

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("LogViewer", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("shows a placeholder and does not fetch when no file is selected", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderWithClient(<LogViewer fileName={null} />);
    expect(screen.getByTestId("logs-viewer-header")).toHaveTextContent("Select a file to view");
    expect(screen.getAllByText("Select a file to view")).toHaveLength(2);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches and renders parsed rows for the selected file", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sampleContent });
    vi.stubGlobal("fetch", fetchMock);
    renderWithClient(<LogViewer fileName="server.log" />);

    await waitFor(() => expect(screen.getByText("request served")).toBeInTheDocument());
    expect(screen.getByText("request failed")).toBeInTheDocument();
    expect(screen.getByText("INFO")).toBeInTheDocument();
    expect(screen.getByText("ERROR")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/logs/server.log?lines=100&from_end=true",
      expect.anything(),
    );
    expect(screen.getByTestId("logs-viewer-header")).toHaveTextContent("showing 2 of 2 lines");
  });

  it("filters rendered rows as the user types in the search box", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sampleContent }),
    );
    const user = userEvent.setup();
    renderWithClient(<LogViewer fileName="server.log" />);
    await waitFor(() => expect(screen.getByText("request served")).toBeInTheDocument());

    await user.type(screen.getByTestId("logs-search-input"), "failed");

    expect(screen.queryByText("request served")).not.toBeInTheDocument();
    expect(screen.getByText("request failed")).toBeInTheDocument();
    expect(screen.getByText("1 / 2 rows")).toBeInTheDocument();
  });

  it("re-fetches with the new line count when the lines select changes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sampleContent });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithClient(<LogViewer fileName="server.log" />);
    await waitFor(() => expect(screen.getByText("request served")).toBeInTheDocument());

    await user.selectOptions(screen.getByTestId("logs-lines-select"), "500");

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/logs/server.log?lines=500&from_end=true",
        expect.anything(),
      ),
    );
  });
});
