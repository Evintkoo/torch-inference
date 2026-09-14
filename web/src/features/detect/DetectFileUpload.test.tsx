import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DetectFileUpload } from "./DetectFileUpload";
import { useCameraCapture } from "@/lib/use-camera-capture";
import type { YoloDetectResponse } from "./types";

// DetectFileUpload now sources Model Version/Size availability badges via
// react-query (GET /yolo/info per combo), so it needs a QueryClientProvider
// even though most tests here only care about the detect flow.
function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

// The camera hook's own frame-capture mechanics (canvas/video plumbing) are
// covered by use-camera-capture.test.ts; here we only need to verify how
// DetectFileUpload *orchestrates* the camera → WebSocket flow.
vi.mock("@/lib/use-camera-capture", () => ({
  useCameraCapture: vi.fn(),
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

// Same MockWebSocket pattern as LiveTtsStream.test.tsx.
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

// `socket.sent` mixes the JSON `config` text frame (sent once, as soon as
// the socket connects) with the binary JPEG frames — isolate the frames.
function frameSends(socket: MockWebSocket) {
  return socket.sent.filter((s) => s instanceof Blob);
}

// jsdom does not implement URL.createObjectURL/revokeObjectURL — stub them so the file-select
// path (loadFile builds an <img> preview from the picked File) doesn't throw.
beforeEach(() => {
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:mock"),
    revokeObjectURL: vi.fn(),
  });
  vi.stubGlobal("WebSocket", MockWebSocket);
  MockWebSocket.instances = [];
  mockCamera();
});

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }),
  );
}

function pngFile(name = "sample.png") {
  return new File([new Uint8Array([1, 2, 3, 4])], name, { type: "image/png" });
}

const successResponse: YoloDetectResponse = {
  data: {
    success: true,
    results: {
      detections: [
        {
          class_id: 0,
          class_name: "person",
          confidence: 0.873,
          bbox: { x1: 1, y1: 2, x2: 51, y2: 102 },
          bbox_rel: { x1: 0, y1: 0, x2: 1, y2: 1 },
          area: 5000,
          confidence_bucket: "high",
        },
      ],
      inference_time_ms: 14,
      preprocessing_time_ms: 1,
      postprocessing_time_ms: 1,
      total_time_ms: 16,
    },
    error: null,
  },
  meta: {
    latency_ms: 16,
    model_id: "yolov8n-ort/yolo8n",
    postprocessing_applied: true,
    postprocess_steps: ["confidence_bucketed"],
    warnings: [],
    version: "1.0.0",
    request_id: "req-1",
  },
};

describe("DetectFileUpload", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("disables Detect until a file is chosen", () => {
    renderWithClient(<DetectFileUpload />);
    expect(screen.getByTestId("detect-btn")).toBeDisabled();
  });

  it("enables Detect once a file is selected", async () => {
    const user = userEvent.setup();
    renderWithClient(<DetectFileUpload />);
    await user.upload(screen.getByLabelText(/click to upload/i), pngFile());
    expect(screen.getByTestId("detect-btn")).toBeEnabled();
  });

  it("posts the file to /yolo/detect and renders the detection summary", async () => {
    const user = userEvent.setup();
    mockFetchOnce(200, successResponse);
    renderWithClient(<DetectFileUpload />);

    await user.upload(screen.getByLabelText(/click to upload/i), pngFile());
    await user.click(screen.getByTestId("detect-btn"));

    await waitFor(() => expect(screen.getByTestId("detect-out")).toHaveTextContent("1 object(s) detected"));
    expect(screen.getByTestId("detect-out")).toHaveTextContent("person");
    expect(screen.getByTestId("detect-out")).toHaveTextContent("87.3%");

    // The Model Version/Size availability badges fire their own GET /yolo/info
    // calls on mount (see useYoloAvailability), so find the detect POST rather
    // than assuming it's the first fetch call.
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.find(
      ([, init]) => init?.method === "POST",
    );
    expect(call?.[0]).toMatch(/^\/yolo\/detect\?model_version=v8&model_size=n&conf_threshold=0\.25/);
    expect(call?.[1].method).toBe("POST");
    expect(call?.[1].body).toBeInstanceOf(FormData);
  });

  it("shows a download hint when the model is not found (404)", async () => {
    const user = userEvent.setup();
    mockFetchOnce(404, { error: "Model not found: yolo8n. Please download it first.", status: 404 });
    renderWithClient(<DetectFileUpload />);

    await user.upload(screen.getByLabelText(/click to upload/i), pngFile());
    await user.click(screen.getByTestId("detect-btn"));

    await waitFor(() => expect(screen.getByTestId("detect-out")).toHaveTextContent(/not downloaded/i));
    expect(screen.getByTestId("detect-out")).toHaveTextContent("yolo8n");
  });

  it("shows 'No objects detected.' when the response has an empty detections array", async () => {
    const user = userEvent.setup();
    mockFetchOnce(200, {
      ...successResponse,
      data: { ...successResponse.data, results: { ...successResponse.data.results!, detections: [] } },
    });
    renderWithClient(<DetectFileUpload />);

    await user.upload(screen.getByLabelText(/click to upload/i), pngFile());
    await user.click(screen.getByTestId("detect-btn"));

    await waitFor(() => expect(screen.getByTestId("detect-out")).toHaveTextContent("No objects detected."));
  });

  describe("camera: Take Photo / Live Cam over GET /ws/detect", () => {
    it("shows two entry buttons up front — no single Camera button, no in-camera mode toggle", () => {
      renderWithClient(<DetectFileUpload />);
      expect(screen.getByTestId("detect-camera-photo-btn")).toBeInTheDocument();
      expect(screen.getByTestId("detect-camera-live-btn")).toBeInTheDocument();
      expect(screen.queryByTestId("detect-camera-btn")).not.toBeInTheDocument();
      expect(screen.queryByTestId("detect-live-toggle")).not.toBeInTheDocument();
    });

    it("Take Photo opens the camera, streams exactly one frame over /ws/detect, renders the result, and closes the camera", async () => {
      const user = userEvent.setup();
      const start = vi.fn();
      const stop = vi.fn();
      const captureBlob = vi.fn().mockResolvedValue(new Blob(["frame"], { type: "image/jpeg" }));
      mockCamera({ active: false, start, stop, captureBlob });
      const { rerender } = renderWithClient(<DetectFileUpload />);

      await user.click(screen.getByTestId("detect-camera-photo-btn"));
      expect(start).toHaveBeenCalledTimes(1);
      expect(MockWebSocket.instances).toHaveLength(1);
      expect(MockWebSocket.instances[0].url).toContain("/ws/detect");

      const socket = connectSocket();
      // Camera turns active a beat after getUserMedia resolves.
      mockCamera({ active: true, start, stop, captureBlob });
      rerender(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <DetectFileUpload />
        </QueryClientProvider>,
      );
      expect(screen.getByTestId("detect-camera-view")).toBeInTheDocument();
      expect(screen.queryByTestId("detect-live-indicator")).not.toBeInTheDocument();

      socket.onmessage?.({ data: JSON.stringify({ type: "ready", task: "detect", frame: 0 }) });
      // Take Photo doesn't auto-send on "ready" — it waits for the user to
      // see themselves in the preview and click Capture.
      expect(captureBlob).not.toHaveBeenCalled();
      expect(screen.getByTestId("detect-camera-capture")).toBeInTheDocument();

      await user.click(screen.getByTestId("detect-camera-capture"));
      await waitFor(() => expect(captureBlob).toHaveBeenCalled());
      await waitFor(() => expect(frameSends(socket)).toHaveLength(1));

      socket.onmessage?.({
        data: JSON.stringify({
          type: "detect",
          frame: 1,
          ms: 12,
          count: 1,
          detections: [{ label: "person", conf: 0.91, bbox: [1, 2, 51, 102] }],
        }),
      });

      await waitFor(() => expect(screen.getByTestId("detect-out")).toHaveTextContent("1 object(s) detected"));
      expect(screen.getByTestId("detect-out")).toHaveTextContent("person");
      expect(screen.getByTestId("detect-out")).toHaveTextContent("91.0%");
      expect(stop).toHaveBeenCalledTimes(1);
    });

    it("Live Cam keeps sending frames as each result comes back, with no fixed interval", async () => {
      const user = userEvent.setup();
      const start = vi.fn();
      const captureBlob = vi.fn().mockResolvedValue(new Blob(["frame"], { type: "image/jpeg" }));
      mockCamera({ active: false, start, captureBlob });
      const { rerender } = renderWithClient(<DetectFileUpload />);

      await user.click(screen.getByTestId("detect-camera-live-btn"));
      expect(start).toHaveBeenCalledTimes(1);

      const socket = connectSocket();
      mockCamera({ active: true, start, captureBlob });
      rerender(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <DetectFileUpload />
        </QueryClientProvider>,
      );
      expect(screen.getByTestId("detect-live-indicator")).toBeInTheDocument();

      socket.onmessage?.({ data: JSON.stringify({ type: "ready", task: "detect", frame: 0 }) });
      await waitFor(() => expect(frameSends(socket)).toHaveLength(1));

      socket.onmessage?.({
        data: JSON.stringify({ type: "detect", frame: 1, ms: 12, count: 0, detections: [] }),
      });
      await waitFor(() => expect(frameSends(socket)).toHaveLength(2));

      socket.onmessage?.({
        data: JSON.stringify({ type: "detect", frame: 2, ms: 12, count: 0, detections: [] }),
      });
      await waitFor(() => expect(frameSends(socket)).toHaveLength(3));
    });

    it("Cancel stops the camera and the WebSocket connection", async () => {
      const user = userEvent.setup();
      const stop = vi.fn();
      mockCamera({ active: true, stop });
      renderWithClient(<DetectFileUpload />);

      await user.click(screen.getByTestId("detect-camera-cancel"));
      expect(stop).toHaveBeenCalledTimes(1);
    });
  });
});
