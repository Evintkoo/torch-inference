import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DetectLiveStream } from "./DetectLiveStream";

class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  static instances: MockWebSocket[] = [];

  readyState = MockWebSocket.CONNECTING;
  binaryType = "";
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  send() {}

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }
}

function mockFetchOnce(status: number, body: unknown = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, json: async () => body }),
  );
}

describe("DetectLiveStream", () => {
  beforeEach(() => {
    // jsdom does not implement URL.createObjectURL/revokeObjectURL, needed by the video-file
    // source path.
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    MockWebSocket.instances = [];
  });

  it("probes model availability on mount and reports it loaded on a 200", async () => {
    vi.stubGlobal("WebSocket", MockWebSocket);
    mockFetchOnce(200, { data: { success: true } });
    render(<DetectLiveStream />);

    await waitFor(() => expect(screen.getByTestId("det-model-label")).toHaveTextContent(/model loaded/i));
  });

  it("reports the model missing on a 404 probe response", async () => {
    vi.stubGlobal("WebSocket", MockWebSocket);
    mockFetchOnce(404, { error: "not found", status: 404 });
    render(<DetectLiveStream />);

    await waitFor(() => expect(screen.getByTestId("det-model-label")).toHaveTextContent(/no model loaded/i));
  });

  it("treats a 500 probe response as the model being loaded (rejected the tiny probe input, not missing)", async () => {
    vi.stubGlobal("WebSocket", MockWebSocket);
    mockFetchOnce(500, { error: "boom", status: 500 });
    render(<DetectLiveStream />);

    await waitFor(() => expect(screen.getByTestId("det-model-label")).toHaveTextContent(/model loaded/i));
  });

  it("toggles the WebSocket connect/disconnect button and status label", async () => {
    vi.stubGlobal("WebSocket", MockWebSocket);
    mockFetchOnce(200, { data: { success: true } });
    const user = userEvent.setup();
    render(<DetectLiveStream />);

    expect(screen.getByTestId("det-ws-label")).toHaveTextContent("disconnected");
    await user.click(screen.getByTestId("det-ws-btn"));

    const ws = MockWebSocket.instances[0];
    expect(ws).toBeDefined();
    act(() => ws.open());

    await waitFor(() => expect(screen.getByTestId("det-ws-label")).toHaveTextContent("connected"));
    expect(screen.getByTestId("det-ws-btn")).toHaveTextContent("Disconnect");
  });

  it("shows the idle placeholder before any source is started", async () => {
    vi.stubGlobal("WebSocket", MockWebSocket);
    mockFetchOnce(200, { data: { success: true } });
    render(<DetectLiveStream />);
    expect(screen.getByTestId("det-live-placeholder")).toBeInTheDocument();
    expect(screen.queryByTestId("det-stop-src-btn")).not.toBeInTheDocument();
  });
});
