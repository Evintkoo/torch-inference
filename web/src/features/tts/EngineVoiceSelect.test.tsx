import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EngineVoiceSelect } from "./EngineVoiceSelect";

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

function mockFetchRouter(routes: Record<string, unknown>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      for (const [path, body] of Object.entries(routes)) {
        if (url.includes(path)) {
          return { ok: true, status: 200, json: async () => body };
        }
      }
      return { ok: false, status: 404, json: async () => ({}) };
    }),
  );
}

describe("EngineVoiceSelect", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("populates the engine dropdown from GET /tts/engines", async () => {
    const user = userEvent.setup();
    mockFetchRouter({
      "/tts/engines/": { voices: [] },
      "/tts/engines": { engines: [{ id: "kokoro", name: "Kokoro" }, { id: "bark", name: "Bark" }] },
    });
    renderWithClient(
      <EngineVoiceSelect engine="" voice="" onEngineChange={vi.fn()} onVoiceChange={vi.fn()} />,
    );
    await user.click(screen.getByTestId("tts-engine-select"));
    await waitFor(() => expect(screen.getByRole("option", { name: "Kokoro" })).toBeInTheDocument());
    expect(screen.getByRole("option", { name: "Bark" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "default" })).toBeInTheDocument();
  });

  it("accepts a bare string array response from /tts/engines", async () => {
    const user = userEvent.setup();
    mockFetchRouter({ "/tts/engines/": { voices: [] }, "/tts/engines": ["kokoro"] });
    renderWithClient(
      <EngineVoiceSelect engine="" voice="" onEngineChange={vi.fn()} onVoiceChange={vi.fn()} />,
    );
    await user.click(screen.getByTestId("tts-engine-select"));
    await waitFor(() => expect(screen.getByRole("option", { name: "kokoro" })).toBeInTheDocument());
  });

  it("fetches voices for the first engine even while the engine select is on default", async () => {
    const user = userEvent.setup();
    mockFetchRouter({
      "/tts/engines/kokoro/voices": { voices: [{ id: "af_heart", name: "af_heart", language: "en-US" }] },
      "/tts/engines": { engines: [{ id: "kokoro", name: "Kokoro" }] },
    });
    renderWithClient(
      <EngineVoiceSelect engine="" voice="" onEngineChange={vi.fn()} onVoiceChange={vi.fn()} />,
    );
    await user.click(screen.getByTestId("tts-voice-select"));
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "af_heart (en-US)" })).toBeInTheDocument(),
    );
  });

  it("calls onEngineChange when a different engine is picked", async () => {
    const user = userEvent.setup();
    const onEngineChange = vi.fn();
    mockFetchRouter({
      "/tts/engines/": { voices: [] },
      "/tts/engines": { engines: [{ id: "kokoro", name: "Kokoro" }, { id: "bark", name: "Bark" }] },
    });
    renderWithClient(
      <EngineVoiceSelect engine="" voice="" onEngineChange={onEngineChange} onVoiceChange={vi.fn()} />,
    );
    await user.click(screen.getByTestId("tts-engine-select"));
    const option = await screen.findByRole("option", { name: "Bark" });
    await user.click(option);
    expect(onEngineChange).toHaveBeenCalledWith("bark");
  });
});
