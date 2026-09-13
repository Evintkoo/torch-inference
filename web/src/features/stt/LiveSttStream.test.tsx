import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiveSttStream } from "./LiveSttStream";
import type { AudioHealthResponse } from "./types";

const noModelHealth: AudioHealthResponse = {
  status: "ok",
  audio_backend: "onnx",
  supported_formats: ["wav"],
  models_available: [],
};

const withModelHealth: AudioHealthResponse = {
  status: "ok",
  audio_backend: "onnx",
  supported_formats: ["wav"],
  models_available: ["STT:whisper-base"],
};

class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  static instances: MockWebSocket[] = [];

  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;
  binaryType = "arraybuffer";
  readyState = MockWebSocket.CONNECTING;
  sent: unknown[] = [];

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  send(data: unknown) {
    this.sent.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
  }
}

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

function mockHealthFetch(body: AudioHealthResponse) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body }),
  );
}

describe("LiveSttStream", () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("shows a checking state before the STT health check resolves", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    renderWithClient(<LiveSttStream />);
    expect(screen.getByTestId("stt-model-status")).toHaveTextContent(/checking stt model/i);
    expect(screen.getByTestId("stt-record-button")).toBeDisabled();
  });

  it("disables Record and reports no model loaded when the Whisper model is missing", async () => {
    mockHealthFetch(noModelHealth);
    renderWithClient(<LiveSttStream />);
    await waitFor(() =>
      expect(screen.getByTestId("stt-model-status")).toHaveTextContent(/not loaded/i),
    );
    expect(screen.getByTestId("stt-record-button")).toBeDisabled();
  });

  it("enables Record once a Whisper STT model is available", async () => {
    mockHealthFetch(withModelHealth);
    renderWithClient(<LiveSttStream />);
    await waitFor(() =>
      expect(screen.getByTestId("stt-model-status")).toHaveTextContent(/loaded ✓/),
    );
    expect(screen.getByTestId("stt-record-button")).toBeEnabled();
  });

  it("starts idle with an empty transcript and a disconnected status dot", async () => {
    mockHealthFetch(withModelHealth);
    renderWithClient(<LiveSttStream />);
    expect(screen.getByTestId("stt-transcript")).toHaveTextContent(/transcript appears here/i);
    expect(screen.getByTestId("stt-vad-label")).toHaveTextContent("idle");
    expect(screen.getByTestId("stt-ws-status-dot").className).toContain("bg-muted-foreground");
  });

  it("connects the audio websocket on Record and surfaces a mic error when getUserMedia is unavailable", async () => {
    vi.useFakeTimers();
    mockHealthFetch(withModelHealth);
    vi.stubGlobal("WebSocket", MockWebSocket);
    // jsdom does not implement navigator.mediaDevices; the component should
    // surface that as a friendly error instead of throwing.
    Object.defineProperty(navigator, "mediaDevices", { value: undefined, configurable: true });

    renderWithClient(<LiveSttStream />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    await vi.waitFor(() => expect(screen.getByTestId("stt-record-button")).toBeEnabled());

    fireEvent.click(screen.getByTestId("stt-record-button"));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(MockWebSocket.instances).toHaveLength(1);

    act(() => {
      MockWebSocket.instances[0].readyState = MockWebSocket.OPEN;
      MockWebSocket.instances[0].onopen?.();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    await vi.waitFor(() =>
      expect(screen.getByTestId("stt-live-error")).toHaveTextContent(/secure context/i),
    );
  });
});
