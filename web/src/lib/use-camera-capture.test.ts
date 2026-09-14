import { act, render, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCameraCapture } from "./use-camera-capture";

function fakeStream(): MediaStream {
  const track = { stop: vi.fn() };
  return { getTracks: () => [track] } as unknown as MediaStream;
}

// Mirrors real usage (ImageUploader/DetectFileUpload): the <video> only
// exists in the tree once `active` is true, so videoRef.current is null
// while start()'s getUserMedia call is in flight.
function Harness({ onMount }: { onMount: (api: ReturnType<typeof useCameraCapture>) => void }) {
  const camera = useCameraCapture();
  onMount(camera);
  return camera.active ? createElement("video", { "data-testid": "cam", ref: camera.videoRef }) : null;
}

describe("useCameraCapture", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("attaches the stream to the video element once it mounts (regression: was left black)", async () => {
    const stream = fakeStream();
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    vi.stubGlobal("navigator", { ...navigator, mediaDevices: { getUserMedia } });
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);

    let camera: ReturnType<typeof useCameraCapture> | undefined;
    render(createElement(Harness, { onMount: (api) => (camera = api) }));

    expect(camera!.videoRef.current).toBeNull();

    await act(async () => {
      await camera!.start();
    });

    await waitFor(() => expect(camera!.videoRef.current).not.toBeNull());
    expect(camera!.videoRef.current!.srcObject).toBe(stream);
  });

  it("stops all tracks and clears active state on stop()", async () => {
    const stream = fakeStream();
    vi.stubGlobal("navigator", {
      ...navigator,
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);

    let camera: ReturnType<typeof useCameraCapture> | undefined;
    render(createElement(Harness, { onMount: (api) => (camera = api) }));
    await act(async () => {
      await camera!.start();
    });
    expect(camera!.active).toBe(true);

    act(() => camera!.stop());
    expect(camera!.active).toBe(false);
    expect((stream.getTracks()[0] as { stop: () => void }).stop).toHaveBeenCalled();
  });

  it("surfaces a clear error when getUserMedia is unavailable", async () => {
    vi.stubGlobal("navigator", { ...navigator, mediaDevices: undefined });
    let camera: ReturnType<typeof useCameraCapture> | undefined;
    render(createElement(Harness, { onMount: (api) => (camera = api) }));
    await act(async () => {
      await camera!.start();
    });
    expect(camera!.error).toMatch(/secure context/i);
    expect(camera!.active).toBe(false);
  });

  it("surfaces the getUserMedia rejection message", async () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(new Error("Permission denied")) },
    });
    let camera: ReturnType<typeof useCameraCapture> | undefined;
    render(createElement(Harness, { onMount: (api) => (camera = api) }));
    await act(async () => {
      await camera!.start();
    });
    expect(camera!.error).toBe("Permission denied");
  });

  describe("captureBlob", () => {
    async function startedCamera() {
      const stream = fakeStream();
      vi.stubGlobal("navigator", {
        ...navigator,
        mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
      });
      HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);

      let camera: ReturnType<typeof useCameraCapture> | undefined;
      render(createElement(Harness, { onMount: (api) => (camera = api) }));
      await act(async () => {
        await camera!.start();
      });
      await waitFor(() => expect(camera!.videoRef.current).not.toBeNull());
      return camera!;
    }

    it("resolves null when the video has no frames yet (videoWidth 0)", async () => {
      const camera = await startedCamera();
      expect(camera.videoRef.current!.videoWidth).toBe(0);
      await expect(camera.captureBlob()).resolves.toBeNull();
    });

    it("draws the current frame to a canvas and resolves a JPEG Blob once the video has dimensions", async () => {
      const camera = await startedCamera();
      Object.defineProperty(camera.videoRef.current!, "videoWidth", { value: 320, configurable: true });
      Object.defineProperty(camera.videoRef.current!, "videoHeight", { value: 240, configurable: true });

      const fakeBlob = new Blob(["jpeg-bytes"], { type: "image/jpeg" });
      const toBlob = vi.fn((cb: (b: Blob | null) => void, type?: string) => {
        expect(type).toBe("image/jpeg");
        cb(fakeBlob);
      });
      const drawImage = vi.fn();
      const realCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "canvas") {
          return {
            width: 0,
            height: 0,
            getContext: () => ({ drawImage }),
            toBlob,
          } as unknown as HTMLCanvasElement;
        }
        return realCreateElement(tag);
      });

      const blob = await camera.captureBlob();
      expect(drawImage).toHaveBeenCalled();
      expect(blob).toBe(fakeBlob);
      vi.restoreAllMocks();
    });
  });
});
