import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigPanel } from "./ConfigPanel";

const sampleConfig = {
  server: { host: "127.0.0.1", port: 8000, workers: 10, max_connections: 1000 },
  inference: { default_batch_size: 1, max_batch_size: 32, timeout_secs: 30, device: "metal" },
  cache: { enabled: true, ttl_secs: 3600, max_size_mb: 1024 },
};

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("ConfigPanel", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders one card per section with formatted label/value rows", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sampleConfig }),
    );
    renderWithClient(<ConfigPanel />);

    await waitFor(() => expect(screen.getByTestId("config-sections")).toBeInTheDocument());
    expect(screen.getByText("server")).toBeInTheDocument();
    expect(screen.getByText("inference")).toBeInTheDocument();
    expect(screen.getByText("cache")).toBeInTheDocument();
    expect(screen.getByText("Max Connections")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();
    expect(screen.getByText("Device")).toBeInTheDocument();
    expect(screen.getByText("metal")).toBeInTheDocument();
    expect(screen.getByText("Enabled")).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  it("shows an error state when the fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }));
    renderWithClient(<ConfigPanel />);
    await waitFor(() => expect(screen.getByTestId("config-error")).toBeInTheDocument());
  });

  it("copies the full config JSON to the clipboard", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sampleConfig }),
    );
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    renderWithClient(<ConfigPanel />);
    await waitFor(() => expect(screen.getByTestId("config-copy-btn")).toBeEnabled());

    await user.click(screen.getByTestId("config-copy-btn"));
    expect(writeText).toHaveBeenCalledWith(JSON.stringify(sampleConfig, null, 2));
    await waitFor(() => expect(screen.getByTestId("config-copy-btn")).toHaveTextContent("Copied"));
  });
});
