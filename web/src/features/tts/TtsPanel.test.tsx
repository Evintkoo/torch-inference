import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TtsPanel } from "./TtsPanel";

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  binaryType = "blob";
  readyState = 0;
  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }
  send() {}
  close() {}
}

describe("TtsPanel", () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ engines: [] }) }),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("renders the merged Speak card, auto-connected", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TtsPanel />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: "TTS" })).toBeInTheDocument();
    expect(screen.getByTestId("tts-ws-speak-btn")).toBeInTheDocument();
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("shows an online health badge from GET /tts/health", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url === "/tts/health") {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ status: "healthy", engines_loaded: 2 }),
          });
        }
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ engines: [] }) });
      }),
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TtsPanel />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("tts-health-badge")).toHaveTextContent(/online/i));
  });

  it("shows an unavailable badge when the health endpoint errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url === "/tts/health") {
          return Promise.resolve({ ok: false, status: 503, json: async () => ({}) });
        }
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ engines: [] }) });
      }),
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TtsPanel />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("tts-health-badge")).toHaveTextContent(/unavailable/i));
  });
});
