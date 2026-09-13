import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWebSocketStream } from "./ws-client";

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
  binaryType: string = "blob";
  readyState = MockWebSocket.CONNECTING;
  closed = false;
  sent: unknown[] = [];

  constructor(
    public url: string,
    public protocols?: string | string[],
  ) {
    MockWebSocket.instances.push(this);
  }

  send(data: unknown) {
    this.sent.push(data);
  }

  close() {
    this.closed = true;
    this.readyState = MockWebSocket.CLOSED;
  }
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", MockWebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("useWebSocketStream", () => {
  it("starts disconnected with no data", () => {
    const { result } = renderHook(() => useWebSocketStream("/audio/ws"));
    expect(result.current.data).toBeNull();
    expect(result.current.connected).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.reconnectAttempt).toBe(0);
  });

  it("resolves a relative path against location and opens a socket", () => {
    renderHook(() => useWebSocketStream("/audio/ws"));
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toBe(`ws://${location.host}/audio/ws`);
  });

  it("does not open a connection when enabled is false", () => {
    renderHook(() => useWebSocketStream("/audio/ws", { enabled: false }));
    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it("marks connected on open", async () => {
    const { result } = renderHook(() => useWebSocketStream("/audio/ws"));
    const socket = MockWebSocket.instances[0];

    act(() => socket.onopen?.());
    await waitFor(() => expect(result.current.connected).toBe(true));
    expect(result.current.error).toBeNull();
  });

  it("parses JSON text frames into data", async () => {
    const { result } = renderHook(() => useWebSocketStream<{ type: string; text: string }>("/audio/ws"));
    const socket = MockWebSocket.instances[0];

    act(() => socket.onopen?.());
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() => socket.onmessage?.({ data: JSON.stringify({ type: "transcript", text: "hello" }) }));
    await waitFor(() =>
      expect(result.current.data).toEqual({ type: "transcript", text: "hello" }),
    );
  });

  it("surfaces a parse error for malformed text frames", async () => {
    const { result } = renderHook(() => useWebSocketStream("/audio/ws"));
    const socket = MockWebSocket.instances[0];

    act(() => socket.onmessage?.({ data: "not json" }));
    await waitFor(() => expect(result.current.error).toBe("failed to parse websocket payload"));
  });

  it("routes binary frames to onBinaryMessage instead of data", async () => {
    const onBinaryMessage = vi.fn();
    const { result } = renderHook(() => useWebSocketStream("/audio/ws", { onBinaryMessage }));
    const socket = MockWebSocket.instances[0];

    const buf = new ArrayBuffer(4);
    act(() => socket.onmessage?.({ data: buf }));

    expect(onBinaryMessage).toHaveBeenCalledWith(buf);
    expect(result.current.data).toBeNull();
  });

  it("sends frames only while the socket is open", async () => {
    const { result } = renderHook(() => useWebSocketStream("/audio/ws"));
    const socket = MockWebSocket.instances[0];

    act(() => result.current.send("too-early"));
    expect(socket.sent).toHaveLength(0);

    socket.readyState = MockWebSocket.OPEN;
    act(() => socket.onopen?.());
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() => result.current.send("hi"));
    expect(socket.sent).toEqual(["hi"]);
  });

  it("reconnects with exponential backoff after an unexpected close", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useWebSocketStream("/audio/ws", { baseDelayMs: 100, maxDelayMs: 10_000 }),
    );
    const first = MockWebSocket.instances[0];

    act(() => first.onclose?.({ code: 1006, reason: "" }));
    expect(result.current.connected).toBe(false);
    expect(result.current.reconnectAttempt).toBe(1);
    expect(MockWebSocket.instances).toHaveLength(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(MockWebSocket.instances).toHaveLength(2);

    const second = MockWebSocket.instances[1];
    act(() => second.onclose?.({ code: 1006, reason: "" }));
    expect(result.current.reconnectAttempt).toBe(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(MockWebSocket.instances).toHaveLength(3);
  });

  it("resets the reconnect attempt counter after a successful reopen", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWebSocketStream("/audio/ws", { baseDelayMs: 50 }));
    const first = MockWebSocket.instances[0];

    act(() => first.onclose?.({ code: 1006, reason: "" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    const second = MockWebSocket.instances[1];
    act(() => second.onopen?.());
    expect(result.current.connected).toBe(true);
    expect(result.current.reconnectAttempt).toBe(0);
  });

  it("does not reconnect when reconnect is disabled", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWebSocketStream("/audio/ws", { reconnect: false, baseDelayMs: 50 }));
    const first = MockWebSocket.instances[0];

    act(() => first.onclose?.({ code: 1006, reason: "" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(result.current.connected).toBe(false);
  });

  it("stops reconnecting once maxReconnectAttempts is exhausted", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useWebSocketStream("/audio/ws", { baseDelayMs: 10, maxDelayMs: 10, maxReconnectAttempts: 1 }),
    );
    const first = MockWebSocket.instances[0];

    act(() => first.onclose?.({ code: 1006, reason: "" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(MockWebSocket.instances).toHaveLength(2);

    const second = MockWebSocket.instances[1];
    act(() => second.onclose?.({ code: 1006, reason: "" }));
    expect(result.current.error).toBe("max reconnect attempts reached");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it("sets a transient error on socket error events", async () => {
    const { result } = renderHook(() => useWebSocketStream("/audio/ws"));
    const socket = MockWebSocket.instances[0];

    act(() => socket.onerror?.());
    await waitFor(() => expect(result.current.error).toBe("connection error"));
  });

  it("closes the socket and cancels pending reconnects on unmount", async () => {
    vi.useFakeTimers();
    const { unmount } = renderHook(() => useWebSocketStream("/audio/ws", { baseDelayMs: 50 }));
    const first = MockWebSocket.instances[0];

    // Server closed the connection; a reconnect is now pending.
    act(() => first.onclose?.({ code: 1006, reason: "" }));
    unmount();

    // The pending reconnect must be cancelled by the unmount, not fired later.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("close() tears down the socket without reconnecting", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWebSocketStream("/audio/ws", { baseDelayMs: 50 }));
    const first = MockWebSocket.instances[0];

    act(() => result.current.close());
    expect(first.closed).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(MockWebSocket.instances).toHaveLength(1);
  });
});
