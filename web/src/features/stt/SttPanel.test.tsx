import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SttPanel } from "./SttPanel";
import type { AudioHealthResponse } from "./types";

const healthyStt: AudioHealthResponse = {
  status: "ok",
  audio_backend: "onnx",
  supported_formats: ["wav", "mp3"],
  models_available: ["STT:whisper-base"],
};

describe("SttPanel", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders the STT heading, health badge, upload card, and live stream card together", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => healthyStt }),
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <SttPanel />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: "STT" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("stt-health-badge")).toHaveTextContent(/online/i));
    expect(screen.getByTestId("upload-transcribe-card")).toBeInTheDocument();
    expect(screen.getByTestId("live-stt-stream")).toBeInTheDocument();
  });

  it("shows an unavailable badge when the health endpoint errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <SttPanel />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("stt-health-badge")).toHaveTextContent(/unavailable/i));
  });
});
