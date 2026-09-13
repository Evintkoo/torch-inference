import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDetectSocket } from "./useDetectSocket";

class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  static instances: MockWebSocket[] = [];

  readyState = MockWebSocket.CONNECTING;
  binaryType = "";
  sent: Array<string | ArrayBuffer> = [];
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((ev: { data: string | ArrayBuffer }) => void) | null = null;

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  send(data: string | ArrayBuffer) {
    this.sent.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  message(data: unknown) {
    this.onmessage?.({ data: typeof data === "string" ? data : JSON.stringify(data) });
  }
}

function fakeBlob(bytes: ArrayBuffer = new ArrayBuffer(4)): Blob {
  return { arrayBuffer: () => Promise.resolve(bytes) } as unknown as Blob;
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", MockWebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("useDetectSocket connection lifecycle", () => {
  it("starts disconnected", () => {
    const { result } = renderHook(() => useDetectSocket());
    expect(result.current.connected).toBe(false);
    expect(result.current.isConnected()).toBe(false);
  });

  it("connects to /ws/detect and marks connected on open", async () => {
    const { result } = renderHook(() => useDetectSocket());
    act(() => result.current.connect());
    const ws = MockWebSocket.instances[0];
    expect(ws.url).toMatch(/\/ws\/detect$/);

    act(() => ws.open());
    await waitFor(() => expect(result.current.connected).toBe(true));
    expect(result.current.isConnected()).toBe(true);
  });

  it("marks disconnected on close and does not reconnect on its own", async () => {
    const { result } = renderHook(() => useDetectSocket());
    act(() => result.current.connect());
    const ws = MockWebSocket.instances[0];
    act(() => ws.open());
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() => ws.close());
    await waitFor(() => expect(result.current.connected).toBe(false));
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("does not open a second socket if already connected", () => {
    const { result } = renderHook(() => useDetectSocket());
    act(() => result.current.connect());
    act(() => MockWebSocket.instances[0].open());
    act(() => result.current.connect());
    expect(MockWebSocket.instances).toHaveLength(1);
  });
});

describe("useDetectSocket backpressure gate (fix/detect-live-stream-backpressure)", () => {
  it("canSendFrame is false until connected", () => {
    const { result } = renderHook(() => useDetectSocket());
    expect(result.current.canSendFrame()).toBe(false);
  });

  it("blocks a second frame while one is still in flight", async () => {
    const { result } = renderHook(() => useDetectSocket());
    act(() => result.current.connect());
    act(() => MockWebSocket.instances[0].open());
    await waitFor(() => expect(result.current.connected).toBe(true));

    expect(result.current.canSendFrame()).toBe(true);
    act(() => result.current.beginFrameSend());
    // The gate is shut the instant a frame starts — this is what stops a fixed-rate capture
    // timer from queuing an unbounded backlog against a slow backend.
    expect(result.current.canSendFrame()).toBe(false);
  });

  it("does not clear the gate on send — it waits for the server's reply", async () => {
    const { result } = renderHook(() => useDetectSocket());
    act(() => result.current.connect());
    const ws = MockWebSocket.instances[0];
    act(() => ws.open());
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() => result.current.beginFrameSend());
    await act(async () => {
      result.current.sendFrame(fakeBlob());
      await Promise.resolve();
    });
    expect(ws.sent).toHaveLength(1);
    // Still gated — a reply hasn't arrived yet.
    expect(result.current.canSendFrame()).toBe(false);
  });

  it("clears the gate once a 'detect' reply arrives, allowing the next frame", async () => {
    const { result } = renderHook(() => useDetectSocket());
    act(() => result.current.connect());
    const ws = MockWebSocket.instances[0];
    act(() => ws.open());
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() => result.current.beginFrameSend());
    expect(result.current.canSendFrame()).toBe(false);

    act(() => ws.message({ type: "detect", frame: 1, ms: 12.3, count: 2, detections: [] }));
    expect(result.current.canSendFrame()).toBe(true);
    expect(result.current.stats.frame).toBe(1);
    expect(result.current.stats.count).toBe(2);
  });

  it("clears the gate on an 'error' reply too", async () => {
    const { result } = renderHook(() => useDetectSocket());
    act(() => result.current.connect());
    const ws = MockWebSocket.instances[0];
    act(() => ws.open());
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() => result.current.beginFrameSend());
    act(() => ws.message({ type: "error", frame: 1, msg: "model not loaded" }));
    expect(result.current.canSendFrame()).toBe(true);
    expect(result.current.stats.ms).toBe("err");
  });

  it("never leaves the gate stuck shut: the watchdog clears it after a lost reply", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDetectSocket());
    act(() => result.current.connect());
    act(() => MockWebSocket.instances[0].open());
    expect(result.current.connected).toBe(true);

    act(() => result.current.beginFrameSend());
    expect(result.current.canSendFrame()).toBe(false);

    act(() => vi.advanceTimersByTime(4000));
    expect(result.current.canSendFrame()).toBe(true);
  });

  it("clears the gate on ws close/error so a dropped connection doesn't wedge future frames", async () => {
    const { result } = renderHook(() => useDetectSocket());
    act(() => result.current.connect());
    const ws = MockWebSocket.instances[0];
    act(() => ws.open());
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() => result.current.beginFrameSend());
    act(() => ws.close());
    await waitFor(() => expect(result.current.connected).toBe(false));
    // Reconnect and confirm the gate came back clean.
    act(() => result.current.connect());
    act(() => MockWebSocket.instances[1].open());
    await waitFor(() => expect(result.current.connected).toBe(true));
    expect(result.current.canSendFrame()).toBe(true);
  });

  it("sendFrame is a no-op (and clears the gate) when the blob is null", async () => {
    const { result } = renderHook(() => useDetectSocket());
    act(() => result.current.connect());
    const ws = MockWebSocket.instances[0];
    act(() => ws.open());
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() => result.current.beginFrameSend());
    act(() => result.current.sendFrame(null));
    expect(ws.sent).toHaveLength(0);
    expect(result.current.canSendFrame()).toBe(true);
  });
});

describe("useDetectSocket config and detections", () => {
  it("sendConfig sends a config message only while connected", async () => {
    const { result } = renderHook(() => useDetectSocket());
    act(() => result.current.connect());
    const ws = MockWebSocket.instances[0];

    result.current.sendConfig({ version: "v8", size: "n", conf: 0.5, iou: 0.45 });
    expect(ws.sent).toHaveLength(0);

    act(() => ws.open());
    await waitFor(() => expect(result.current.connected).toBe(true));
    act(() => result.current.sendConfig({ version: "v8", size: "n", conf: 0.5, iou: 0.45 }));
    expect(ws.sent).toEqual([JSON.stringify({ type: "config", version: "v8", size: "n", conf: 0.5, iou: 0.45 })]);
  });

  it("stores the detections from a detect reply", async () => {
    const { result } = renderHook(() => useDetectSocket());
    act(() => result.current.connect());
    const ws = MockWebSocket.instances[0];
    act(() => ws.open());
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() =>
      ws.message({
        type: "detect",
        frame: 3,
        ms: 9.1,
        count: 1,
        detections: [{ label: "cat", conf: 0.9, bbox: [0, 0, 10, 10] }],
      }),
    );
    expect(result.current.detections).toEqual([{ label: "cat", conf: 0.9, bbox: [0, 0, 10, 10] }]);
  });

  it("closes the socket on unmount", async () => {
    const { result, unmount } = renderHook(() => useDetectSocket());
    act(() => result.current.connect());
    const ws = MockWebSocket.instances[0];
    act(() => ws.open());
    await waitFor(() => expect(result.current.connected).toBe(true));

    unmount();
    expect(ws.readyState).toBe(MockWebSocket.CLOSED);
  });
});
