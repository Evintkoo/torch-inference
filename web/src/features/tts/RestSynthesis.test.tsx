import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RestSynthesis } from "./RestSynthesis";

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

function pcmChunkResponse(chunks: Uint8Array[]) {
  let i = 0;
  return {
    ok: true,
    status: 200,
    body: {
      getReader() {
        return {
          async read() {
            if (i < chunks.length) {
              return { done: false, value: chunks[i++] };
            }
            return { done: true, value: undefined };
          },
        };
      },
    },
  };
}

function mockFetchRouter(handler: (url: string, init?: RequestInit) => unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => handler(String(input), init)),
  );
}

describe("RestSynthesis", () => {
  beforeEach(() => {
    // jsdom doesn't implement Blob URLs — define stubbable no-ops first so
    // vi.spyOn has something to wrap regardless of jsdom version.
    if (!("createObjectURL" in URL)) {
      Object.defineProperty(URL, "createObjectURL", { value: () => "", writable: true, configurable: true });
    }
    if (!("revokeObjectURL" in URL)) {
      Object.defineProperty(URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    }
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("streams /tts/stream chunks, wraps them as a WAV blob, and plays the result", async () => {
    const user = userEvent.setup();
    mockFetchRouter((url) => {
      if (url.includes("/tts/engines/")) return { ok: true, status: 200, json: async () => ({ voices: [] }) };
      if (url.includes("/tts/engines")) return { ok: true, status: 200, json: async () => ({ engines: [] }) };
      if (url === "/tts/stream") return pcmChunkResponse([new Uint8Array([1, 2]), new Uint8Array([3, 4])]);
      return { ok: false, status: 404, json: async () => ({}) };
    });

    renderWithClient(<RestSynthesis />);

    await user.type(screen.getByTestId("tts-text-input"), "Hello world");
    await user.click(screen.getByTestId("tts-synthesize-btn"));

    await waitFor(() =>
      expect(screen.getByTestId("tts-status")).toHaveTextContent(/Done — 4 bytes, 2 chunks\. Playing\./),
    );
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(screen.getByTestId("tts-audio")).toHaveAttribute("src", "blob:mock-url");

    const streamCall = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === "/tts/stream",
    );
    expect(streamCall).toBeDefined();
    expect(JSON.parse(streamCall![1].body as string)).toEqual({ text: "Hello world", speed: 1 });
  });

  it("shows an error status and no audio when zero bytes are received", async () => {
    const user = userEvent.setup();
    mockFetchRouter((url) => {
      if (url.includes("/tts/engines/")) return { ok: true, status: 200, json: async () => ({ voices: [] }) };
      if (url.includes("/tts/engines")) return { ok: true, status: 200, json: async () => ({ engines: [] }) };
      if (url === "/tts/stream") return pcmChunkResponse([]);
      return { ok: false, status: 404, json: async () => ({}) };
    });

    renderWithClient(<RestSynthesis />);
    await user.type(screen.getByTestId("tts-text-input"), "Hi");
    await user.click(screen.getByTestId("tts-synthesize-btn"));

    await waitFor(() =>
      expect(screen.getByTestId("tts-status")).toHaveTextContent(/No audio received/),
    );
    expect(screen.queryByTestId("tts-audio")).not.toBeInTheDocument();
  });

  it("surfaces the no-engine-loaded message from a 500 ApiError", async () => {
    const user = userEvent.setup();
    mockFetchRouter((url) => {
      if (url.includes("/tts/engines/")) return { ok: true, status: 200, json: async () => ({ voices: [] }) };
      if (url.includes("/tts/engines")) return { ok: true, status: 200, json: async () => ({ engines: [] }) };
      if (url === "/tts/stream") {
        return { ok: false, status: 500, json: async () => ({ error: "No TTS engine available" }) };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    });

    renderWithClient(<RestSynthesis />);
    await user.type(screen.getByTestId("tts-text-input"), "Hi");
    await user.click(screen.getByTestId("tts-synthesize-btn"));

    await waitFor(() =>
      expect(screen.getByTestId("tts-status")).toHaveTextContent(/No TTS engine loaded/),
    );
  });

  it("disables the Synthesise button while text is blank", async () => {
    mockFetchRouter((url) => {
      if (url.includes("/tts/engines")) return { ok: true, status: 200, json: async () => ({ engines: [] }) };
      return { ok: false, status: 404, json: async () => ({}) };
    });
    renderWithClient(<RestSynthesis />);
    expect(screen.getByTestId("tts-synthesize-btn")).toBeDisabled();
  });
});
