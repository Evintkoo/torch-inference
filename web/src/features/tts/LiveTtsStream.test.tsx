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

describe("LiveTtsStream", () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("starts disconnected with the Connect button visible", () => {
    render(<LiveTtsStream />);
    expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("disconnected");
    expect(screen.getByTestId("tts-ws-connect-btn")).toHaveTextContent("Connect");
    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it("opens a connection to /audio/ws on Connect and flips the status label", async () => {
    const user = userEvent.setup();
    render(<LiveTtsStream />);

    await user.click(screen.getByTestId("tts-ws-connect-btn"));
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toBe(`ws://${location.host}/audio/ws`);

    connectSocket();
    await waitFor(() => expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("connected"));
    expect(screen.getByTestId("tts-ws-connect-btn")).toHaveTextContent("Disconnect");
  });

  it("disables Speak until connected and text is entered, then sends a tts message", async () => {
    const user = userEvent.setup();
    render(<LiveTtsStream />);

    expect(screen.getByTestId("tts-ws-speak-btn")).toBeDisabled();

    await user.click(screen.getByTestId("tts-ws-connect-btn"));
    const socket = connectSocket();
    await waitFor(() => expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("connected"));

    expect(screen.getByTestId("tts-ws-speak-btn")).toBeDisabled();
    await user.type(screen.getByTestId("tts-ws-text-input"), "Hello there");
    await user.type(screen.getByTestId("tts-ws-voice-input"), "af_heart");
    expect(screen.getByTestId("tts-ws-speak-btn")).toBeEnabled();

    await user.click(screen.getByTestId("tts-ws-speak-btn"));
    expect(socket.sent).toEqual([
      JSON.stringify({ type: "tts", text: "Hello there", voice: "af_heart", speed: 1 }),
    ]);
    await waitFor(() => expect(screen.getByTestId("tts-ws-status")).toHaveTextContent("Synthesising…"));
  });

  it("reacts to tts_meta / tts_done text frames from the server", async () => {
    const user = userEvent.setup();
    render(<LiveTtsStream />);
    await user.click(screen.getByTestId("tts-ws-connect-btn"));
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
    const user = userEvent.setup();
    render(<LiveTtsStream />);
    await user.click(screen.getByTestId("tts-ws-connect-btn"));
    const socket = connectSocket();
    await waitFor(() => expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("connected"));

    socket.onmessage?.({ data: JSON.stringify({ type: "error", msg: "engine crashed" }) });
    await waitFor(() => expect(screen.getByTestId("tts-ws-status")).toHaveTextContent("Error: engine crashed"));
  });

  it("does not throw on a binary PCM frame when AudioContext is unavailable (jsdom default)", async () => {
    const user = userEvent.setup();
    render(<LiveTtsStream />);
    await user.click(screen.getByTestId("tts-ws-connect-btn"));
    const socket = connectSocket();
    await waitFor(() => expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("connected"));

    const frame = new Float32Array([0.1, -0.1, 0.2]).buffer;
    expect(() => socket.onmessage?.({ data: frame })).not.toThrow();
  });

  it("Disconnect closes the socket and resets the status label", async () => {
    const user = userEvent.setup();
    render(<LiveTtsStream />);
    await user.click(screen.getByTestId("tts-ws-connect-btn"));
    const socket = connectSocket();
    await waitFor(() => expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("connected"));

    await user.click(screen.getByTestId("tts-ws-connect-btn"));
    expect(socket.closed).toBe(true);
    await waitFor(() => expect(screen.getByTestId("tts-ws-status-label")).toHaveTextContent("disconnected"));
  });
});
