import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiveTtsStream } from "./LiveTtsStream";

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
  binaryType = "blob";
  readyState = MockWebSocket.CONNECTING;
  closed = false;
  sent: unknown[] = [];

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  send(data: unknown) {
    this.sent.push(data);
  }

  close() {
    this.closed = true;
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code: 1000, reason: "" });
  }
}

function connectSocket() {
  const socket = MockWebSocket.instances[MockWebSocket.instances.length - 1];
  socket.readyState = MockWebSocket.OPEN;
  socket.onopen?.();
  return socket;
}

function renderPanel() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <LiveTtsStream />
    </QueryClientProvider>,
  );
}

describe("LiveTtsStream", () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ engines: [], voices: [] }) }),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("connects to /audio/ws automatically on mount, no manual Connect step", () => {
    renderPanel();
    expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("connecting…");
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toBe(`ws://${location.host}/audio/ws`);
    expect(screen.queryByTestId("tts-ws-connect-btn")).not.toBeInTheDocument();
  });

  it("flips the status label to connected once the socket opens", async () => {
    renderPanel();
    connectSocket();
    await waitFor(() => expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("connected"));
  });

  it("disables Speak until connected and text is entered, then sends a tts message", async () => {
    const user = userEvent.setup();
    renderPanel();

    expect(screen.getByTestId("tts-ws-speak-btn")).toBeDisabled();

    const socket = connectSocket();
    await waitFor(() => expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("connected"));

    expect(screen.getByTestId("tts-ws-speak-btn")).toBeDisabled();
    await user.type(screen.getByTestId("tts-ws-text-input"), "Hello there");
    expect(screen.getByTestId("tts-ws-speak-btn")).toBeEnabled();

    await user.click(screen.getByTestId("tts-ws-speak-btn"));
    expect(socket.sent).toEqual([JSON.stringify({ type: "tts", text: "Hello there", speed: 1 })]);
    await waitFor(() => expect(screen.getByTestId("tts-ws-status")).toHaveTextContent("Synthesising…"));
  });

  it("reacts to tts_meta / tts_done text frames from the server", async () => {
    renderPanel();
    const socket = connectSocket();
    await waitFor(() => expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("connected"));

    socket.onmessage?.({ data: JSON.stringify({ type: "tts_meta", sample_rate: 24000, encoding: "pcm_f32le" }) });
    await waitFor(() =>
      expect(screen.getByTestId("tts-ws-status")).toHaveTextContent("Streaming 24000 Hz pcm_f32le…"),
    );

    socket.onmessage?.({ data: JSON.stringify({ type: "tts_done", duration_ms: 842 }) });
    await waitFor(() => expect(screen.getByTestId("tts-ws-status")).toHaveTextContent("Done (842 ms)"));
    expect(screen.getByTestId("tts-ws-duration")).toHaveTextContent("Duration: 842 ms");
  });

  it("surfaces a server error frame in the status text", async () => {
    renderPanel();
    const socket = connectSocket();
    await waitFor(() => expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("connected"));

    socket.onmessage?.({ data: JSON.stringify({ type: "error", msg: "engine crashed" }) });
    await waitFor(() => expect(screen.getByTestId("tts-ws-status")).toHaveTextContent("Error: engine crashed"));
  });

  it("does not throw on a binary PCM frame when AudioContext is unavailable (jsdom default)", async () => {
    renderPanel();
    const socket = connectSocket();
    await waitFor(() => expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("connected"));

    const frame = new Float32Array([0.1, -0.1, 0.2]).buffer;
    expect(() => socket.onmessage?.({ data: frame })).not.toThrow();
  });

  it("shows a waveform + play button once audio has streamed in, and Play starts replay", async () => {
    const sources: Array<{ start: () => void; stop: () => void }> = [];
    class FakeBufferSource {
      buffer: unknown = null;
      onended: (() => void) | null = null;
      connect = vi.fn();
      start = vi.fn();
      stop = vi.fn(() => this.onended?.());
      constructor() {
        sources.push(this);
      }
    }
    class FakeAudioContext {
      currentTime = 0;
      destination = {};
      state = "running";
      createBuffer = vi.fn(() => ({ duration: 1, copyToChannel: vi.fn() }));
      createBufferSource = vi.fn(() => new FakeBufferSource());
      close = vi.fn().mockResolvedValue(undefined);
    }
    vi.stubGlobal("AudioContext", FakeAudioContext);
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 0));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    const user = userEvent.setup();
    renderPanel();
    const socket = connectSocket();
    await waitFor(() => expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("connected"));

    await user.type(screen.getByTestId("tts-ws-text-input"), "Hello");
    await user.click(screen.getByTestId("tts-ws-speak-btn"));

    const frame = new Float32Array([0.1, -0.2, 0.3]).buffer;
    socket.onmessage?.({ data: frame });
    await waitFor(() => expect(screen.getByTestId("tts-waveform")).toBeInTheDocument());
    // The play button is disabled while still speaking — finish the utterance first.
    socket.onmessage?.({ data: JSON.stringify({ type: "tts_done", duration_ms: 100 }) });
    await waitFor(() => expect(screen.getByTestId("tts-waveform-play-btn")).toBeEnabled());

    const playBtn = screen.getByTestId("tts-waveform-play-btn");
    expect(playBtn).toHaveAccessibleName("Play");
    const sourcesBeforeClick = sources.length;

    await user.click(playBtn);

    await waitFor(() => expect(sources.length).toBe(sourcesBeforeClick + 1));
    expect(sources[sources.length - 1].start).toHaveBeenCalled();
  });

  it("Stop tears down the audio context and resets speaking state", async () => {
    const user = userEvent.setup();
    renderPanel();
    connectSocket();
    await waitFor(() => expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("connected"));

    await user.type(screen.getByTestId("tts-ws-text-input"), "Hello");
    await user.click(screen.getByTestId("tts-ws-speak-btn"));
    expect(screen.getByTestId("tts-ws-stop-btn")).toBeEnabled();

    await user.click(screen.getByTestId("tts-ws-stop-btn"));
    await waitFor(() => expect(screen.getByTestId("tts-ws-status")).toHaveTextContent("Stopped"));
    expect(screen.getByTestId("tts-ws-stop-btn")).toBeDisabled();
  });
});
