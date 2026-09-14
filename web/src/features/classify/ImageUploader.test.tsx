import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImageUploader, type ImageUploaderProps } from "./ImageUploader";
import { useCameraCapture } from "@/lib/use-camera-capture";
import type { LoadedImage } from "./types";

function makeFile(name: string, type: string, content = "fake-image-bytes") {
  return new File([content], name, { type });
}

// The camera hook's own frame-capture mechanics (canvas/video plumbing) are
// covered by use-camera-capture.test.ts; here we only verify how
// ImageUploader *orchestrates* the camera → WebSocket flow.
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

function frameSends(socket: MockWebSocket) {
  return socket.sent.filter((s) => s instanceof Blob);
}

const defaultConfig = { topK: 5, width: 224, height: 224 };

function renderUploader(props: Partial<ImageUploaderProps> = {}) {
  const merged: ImageUploaderProps = {
    images: [],
    onImagesLoaded: vi.fn(),
    classifyConfig: defaultConfig,
    onCameraResult: vi.fn(),
    onCameraFrame: vi.fn(),
    ...props,
  };
  const result = render(<ImageUploader {...merged} />);
  return { ...result, props: merged };
}

describe("ImageUploader", () => {
  beforeEach(() => {
    mockCamera();
    vi.stubGlobal("WebSocket", MockWebSocket);
    MockWebSocket.instances = [];
    // jsdom does not implement URL.createObjectURL/revokeObjectURL — the
    // Take Photo capture path uses it to surface the captured frame image.
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
  });
  afterEach(() => {
    // Unmount before restoring globals — ImageUploader's own unmount cleanup
    // calls URL.revokeObjectURL, which needs the stub still in place (real
    // jsdom doesn't implement it).
    cleanup();
    vi.unstubAllGlobals();
  });

  it("reads a single selected file to base64 and shows a preview", async () => {
    const onImagesLoaded = vi.fn<(images: LoadedImage[]) => void>();
    renderUploader({ onImagesLoaded });

    const input = screen.getByTestId("classify-file-input");
    const file = makeFile("cat.png", "image/png");
    await userEvent.upload(input, file);

    await waitFor(() => expect(onImagesLoaded).toHaveBeenCalledTimes(1));
    const [loaded] = onImagesLoaded.mock.calls[0][0];
    expect(loaded.name).toBe("cat.png");
    expect(loaded.base64.length).toBeGreaterThan(0);
    expect(loaded.dataUrl.startsWith("data:")).toBe(true);
  });

  it("reads multiple selected files and reports each of them", async () => {
    const onImagesLoaded = vi.fn<(images: LoadedImage[]) => void>();
    renderUploader({ onImagesLoaded });

    const input = screen.getByTestId("classify-file-input");
    await userEvent.upload(input, [makeFile("a.jpg", "image/jpeg"), makeFile("b.png", "image/png")]);

    await waitFor(() => expect(onImagesLoaded).toHaveBeenCalledTimes(1));
    const loaded = onImagesLoaded.mock.calls[0][0];
    expect(loaded.map((img) => img.name)).toEqual(["a.jpg", "b.png"]);
  });

  it("shows a single large preview only when exactly one image is loaded", () => {
    const single: LoadedImage[] = [{ name: "a.png", dataUrl: "data:image/png;base64,AAA", base64: "AAA" }];
    renderUploader({ images: single });
    expect(screen.getByTestId("classify-preview")).toBeInTheDocument();
  });

  it("shows an image count instead of a preview when multiple images are loaded", () => {
    const multi: LoadedImage[] = [
      { name: "a.png", dataUrl: "data:image/png;base64,AAA", base64: "AAA" },
      { name: "b.png", dataUrl: "data:image/png;base64,BBB", base64: "BBB" },
    ];
    renderUploader({ images: multi });
    expect(screen.queryByTestId("classify-preview")).not.toBeInTheDocument();
    expect(screen.getByTestId("classify-preview-count")).toHaveTextContent("2 images loaded");
  });

  describe("camera: Take Photo / Live Cam over GET /ws/classify", () => {
    it("shows two entry buttons up front — no single Camera button, no in-camera mode toggle", () => {
      renderUploader();
      expect(screen.getByTestId("classify-camera-photo-btn")).toBeInTheDocument();
      expect(screen.getByTestId("classify-camera-live-btn")).toBeInTheDocument();
      expect(screen.queryByTestId("classify-camera-btn")).not.toBeInTheDocument();
      expect(screen.queryByTestId("classify-live-toggle")).not.toBeInTheDocument();
    });

    it("Take Photo streams one frame over /ws/classify, reports the result, and closes the camera", async () => {
      const user = userEvent.setup();
      const start = vi.fn();
      const stop = vi.fn();
      const captureBlob = vi.fn().mockResolvedValue(new Blob(["frame"], { type: "image/jpeg" }));
      mockCamera({ active: false, start, stop, captureBlob });
      const onCameraResult = vi.fn();
      const { rerender, props } = renderUploader({ onCameraResult });

      await user.click(screen.getByTestId("classify-camera-photo-btn"));
      expect(start).toHaveBeenCalledTimes(1);
      expect(MockWebSocket.instances).toHaveLength(1);
      expect(MockWebSocket.instances[0].url).toContain("/ws/classify");

      const socket = connectSocket();
      mockCamera({ active: true, start, stop, captureBlob });
      rerender(<ImageUploader {...props} />);
      expect(screen.getByTestId("classify-camera-view")).toBeInTheDocument();

      socket.onmessage?.({ data: JSON.stringify({ type: "ready", task: "classify", frame: 0 }) });
      // Take Photo doesn't auto-send on "ready" — it waits for the user to
      // see themselves in the preview and click Capture.
      expect(captureBlob).not.toHaveBeenCalled();
      expect(screen.getByTestId("classify-camera-capture")).toBeInTheDocument();

      await user.click(screen.getByTestId("classify-camera-capture"));
      await waitFor(() => expect(frameSends(socket)).toHaveLength(1));

      socket.onmessage?.({
        data: JSON.stringify({
          type: "classify",
          frame: 1,
          ms: 8.4,
          predictions: [{ label: "cat", confidence: 0.95, class_id: 0 }],
        }),
      });

      await waitFor(() => expect(onCameraResult).toHaveBeenCalledWith([{ label: "cat", confidence: 0.95, class_id: 0 }], 8.4));
      expect(stop).toHaveBeenCalledTimes(1);
    });

    it("Live Cam keeps sending frames as each result comes back", async () => {
      const user = userEvent.setup();
      const start = vi.fn();
      const captureBlob = vi.fn().mockResolvedValue(new Blob(["frame"], { type: "image/jpeg" }));
      mockCamera({ active: false, start, captureBlob });
      const onCameraResult = vi.fn();
      const { rerender, props } = renderUploader({ onCameraResult });

      await user.click(screen.getByTestId("classify-camera-live-btn"));
      const socket = connectSocket();
      mockCamera({ active: true, start, captureBlob });
      rerender(<ImageUploader {...props} />);
      expect(screen.getByTestId("classify-live-indicator")).toBeInTheDocument();

      socket.onmessage?.({ data: JSON.stringify({ type: "ready", task: "classify", frame: 0 }) });
      await waitFor(() => expect(frameSends(socket)).toHaveLength(1));

      socket.onmessage?.({
        data: JSON.stringify({ type: "classify", frame: 1, ms: 8, predictions: [] }),
      });
      await waitFor(() => expect(frameSends(socket)).toHaveLength(2));
      expect(onCameraResult).toHaveBeenCalledTimes(1);
    });

    it("Cancel stops the camera", async () => {
      const user = userEvent.setup();
      const stop = vi.fn();
      mockCamera({ active: true, stop });
      renderUploader();

      await user.click(screen.getByTestId("classify-camera-cancel"));
      expect(stop).toHaveBeenCalledTimes(1);
    });
  });
});
