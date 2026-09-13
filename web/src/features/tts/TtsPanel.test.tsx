import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
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

  it("renders the Live TTS Stream and REST Synthesis cards", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TtsPanel />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: "TTS" })).toBeInTheDocument();
    expect(screen.getByText("Live TTS Stream")).toBeInTheDocument();
    expect(screen.getByText("REST Synthesis")).toBeInTheDocument();
    expect(screen.getByTestId("tts-synthesize-btn")).toBeInTheDocument();
    expect(screen.getByTestId("tts-ws-connect-btn")).toBeInTheDocument();
  });
});
