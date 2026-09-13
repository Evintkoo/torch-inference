import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEventSource } from "./sse-client";

class MockEventSource {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;
  static instances: MockEventSource[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;
  readyState = MockEventSource.CONNECTING;

  constructor(public url: string) {
    MockEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
    this.readyState = MockEventSource.CLOSED;
  }
}

beforeEach(() => {
  MockEventSource.instances = [];
  vi.stubGlobal("EventSource", MockEventSource);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useEventSource", () => {
  it("starts disconnected with no data", () => {
    const { result } = renderHook(() => useEventSource("/dashboard/stream"));
    expect(result.current).toEqual({ data: null, connected: false, error: null });
  });

  it("marks connected on open and parses onmessage payloads", async () => {
    const { result } = renderHook(() => useEventSource<{ uptime_s: number }>("/dashboard/stream"));
    const source = MockEventSource.instances[0];

    act(() => source.onopen?.());
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() => source.onmessage?.({ data: JSON.stringify({ uptime_s: 42 }) }));
    await waitFor(() => expect(result.current.data).toEqual({ uptime_s: 42 }));
    expect(result.current.error).toBeNull();
  });

  it("marks disconnected on error", async () => {
    const { result } = renderHook(() => useEventSource("/dashboard/stream"));
    const source = MockEventSource.instances[0];

    act(() => source.onopen?.());
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() => source.onerror?.());
    await waitFor(() => expect(result.current.connected).toBe(false));
  });

  it("surfaces a permanent error when the connection has closed", async () => {
    const { result } = renderHook(() => useEventSource("/dashboard/stream"));
    const source = MockEventSource.instances[0];

    act(() => source.onopen?.());
    await waitFor(() => expect(result.current.connected).toBe(true));

    source.readyState = MockEventSource.CLOSED;
    act(() => source.onerror?.());
    await waitFor(() => expect(result.current.error).toBe("connection closed"));
    expect(result.current.connected).toBe(false);
  });

  it("does not set an error for a transient (auto-retrying) error", async () => {
    const { result } = renderHook(() => useEventSource("/dashboard/stream"));
    const source = MockEventSource.instances[0];

    act(() => source.onopen?.());
    await waitFor(() => expect(result.current.connected).toBe(true));

    source.readyState = MockEventSource.CONNECTING;
    act(() => source.onerror?.());
    await waitFor(() => expect(result.current.connected).toBe(false));
    expect(result.current.error).toBeNull();
  });

  it("closes the EventSource on unmount", () => {
    const { unmount } = renderHook(() => useEventSource("/dashboard/stream"));
    const source = MockEventSource.instances[0];
    unmount();
    expect(source.closed).toBe(true);
  });

  it("does not open a connection when enabled is false", () => {
    renderHook(() => useEventSource("/dashboard/stream", false));
    expect(MockEventSource.instances).toHaveLength(0);
  });
});
