import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClassifyPanel } from "./ClassifyPanel";
import { useCameraCapture } from "@/lib/use-camera-capture";
import type { ClassifyEnvelope } from "./types";

// Only the camera-flow tests need control over the hook; an always-inactive
// default is harmless for the others (real getUserMedia is unavailable in
// jsdom anyway).
vi.mock("@/lib/use-camera-capture", () => ({
  useCameraCapture: vi.fn(() => ({
    active: false,
    error: null,
    videoRef: { current: null },
    start: vi.fn(),
    stop: vi.fn(),
    captureBlob: vi.fn().mockResolvedValue(null),
  })),
}));

function mockCamera(overrides: Partial<ReturnType<typeof useCameraCapture>> = {}) {
  const base: ReturnType<typeof useCameraCapture> = {
    active: false,
    error: null,
    videoRef: { current: null },
    start: vi.fn(),
    stop: vi.fn(),
    captureBlob: vi.fn().mockResolvedValue(new Blob(["frame"], { type: "image/jpeg" })),
    ...overrides,
  };
  vi.mocked(useCameraCapture).mockReturnValue(base);
  return base;
}

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

function makeFile(name: string, type: string, content = "fake-image-bytes") {
  return new File([content], name, { type });
}

const envelope: ClassifyEnvelope = {
  data: {
    results: [
      [
        { label: "cat", confidence: 0.95, class_id: 0 },
        { label: "dog", confidence: 0.03, class_id: 1 },
      ],
    ],
    batch_size: 1,
  },
  meta: {
    latency_ms: 12.3,
    model_id: "classification-backend",
    postprocessing_applied: true,
    postprocess_steps: ["softmax"],
    warnings: [],
    version: "1.0.0",
    request_id: "req-1",
  },
};

describe("ClassifyPanel", () => {
  beforeEach(() => {
    mockCamera();
    vi.stubGlobal("WebSocket", MockWebSocket);
    MockWebSocket.instances = [];
  });
  afterEach(() => vi.unstubAllGlobals());

  it("renders Upload Image and Predictions side by side, not stacked", () => {
    render(<ClassifyPanel />);
    expect(screen.getByText("Upload Image")).toBeInTheDocument();
    expect(screen.getByText("Predictions")).toBeInTheDocument();
    expect(screen.getByTestId("classify-panel-layout")).toHaveClass("md:grid-cols-2");
  });

  it("disables Classify until an image is loaded, then submits to /classify/batch and renders predictions", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => envelope,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ClassifyPanel />);
    expect(screen.getByTestId("classify-submit")).toBeDisabled();
    expect(screen.getByTestId("classify-waiting")).toHaveTextContent(/waiting for image/i);

    const input = screen.getByTestId("classify-file-input");
    await userEvent.upload(input, makeFile("cat.png", "image/png"));

    await waitFor(() => expect(screen.getByTestId("classify-submit")).not.toBeDisabled());

    await userEvent.click(screen.getByTestId("classify-submit"));

    await waitFor(() => expect(screen.getByText("cat")).toBeInTheDocument());
    expect(screen.getByText("95.00%")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledWith(
      "/classify/batch",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toMatchObject({ top_k: 5, model_width: 224, model_height: 224 });
    expect(body.images).toHaveLength(1);
  });

  it("shows an error message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "images array must not be empty" }),
      }),
    );

    render(<ClassifyPanel />);
    const input = screen.getByTestId("classify-file-input");
    await userEvent.upload(input, makeFile("cat.png", "image/png"));
    await waitFor(() => expect(screen.getByTestId("classify-submit")).not.toBeDisabled());

    await userEvent.click(screen.getByTestId("classify-submit"));

    await waitFor(() =>
      expect(screen.getByTestId("classify-error")).toHaveTextContent("images array must not be empty"),
    );
  });

  it("a camera frame classified over /ws/classify renders predictions without a manual click or a REST call", async () => {
    const user = userEvent.setup();
    const start = vi.fn();
    const captureBlob = vi.fn().mockResolvedValue(new Blob(["frame"], { type: "image/jpeg" }));
    mockCamera({ active: false, start, captureBlob });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { rerender } = render(<ClassifyPanel />);

    await user.click(screen.getByTestId("classify-camera-live-btn"));
    const socket = connectSocket();
    mockCamera({ active: true, start, captureBlob });
    rerender(<ClassifyPanel />);

    socket.onmessage?.({ data: JSON.stringify({ type: "ready", task: "classify", frame: 0 }) });
    await waitFor(() => expect(captureBlob).toHaveBeenCalled());

    socket.onmessage?.({
      data: JSON.stringify({
        type: "classify",
        frame: 1,
        ms: 8.4,
        predictions: [{ label: "cat", confidence: 0.95, class_id: 0 }],
      }),
    });

    await waitFor(() => expect(screen.getByText("cat")).toBeInTheDocument());
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
