import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCameraCapture } from "@/lib/use-camera-capture";
import { useWebSocketStream } from "@/lib/ws-client";
import type { ClassifyOptionsValue } from "./ClassifyOptions";
import type { ClassifyWsMessage, LoadedImage, Prediction } from "./types";

function readAsLoadedImage(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] ?? "";
      resolve({ name: file.name, dataUrl, base64 });
    };
    reader.onerror = () => reject(reader.error ?? new Error("failed to read file"));
    reader.readAsDataURL(file);
  });
}

export interface ImageUploaderProps {
  images: LoadedImage[];
  onImagesLoaded: (images: LoadedImage[]) => void;
  disabled?: boolean;
  /** Top-K / width / height sent as the `/ws/classify` session config. */
  classifyConfig: ClassifyOptionsValue;
  /** Called with each classification result the camera stream produces. */
  onCameraResult: (predictions: Prediction[], ms: number) => void;
  /** Called with an object URL of each captured frame, so the caller can show what was actually classified. */
  onCameraFrame: (url: string) => void;
}

type CameraMode = "idle" | "photo" | "live";

/**
 * Drag/drop + click-to-upload image picker. Mirrors playground.html's
 * `#dropzone` / `handleFile()` / `handleDrop()`: reads every selected file
 * as a data URL client-side (via FileReader), keeps the base64 payload for
 * the `/classify/batch` request body, and shows a single large preview when
 * exactly one image is loaded.
 *
 * The camera offers two upfront entry points — "Take Photo" (single frame)
 * and "Live Cam" (continuous) — both streamed over `GET /ws/classify`
 * rather than the REST endpoint: one persistent connection, next frame sent
 * as soon as the previous result comes back, instead of polling on a fixed
 * interval.
 */
export function ImageUploader({
  images,
  onImagesLoaded,
  disabled,
  classifyConfig,
  onCameraResult,
  onCameraFrame,
}: ImageUploaderProps) {
  const [isOver, setIsOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [mode, setModeState] = useState<CameraMode>("idle");
  const modeRef = useRef<CameraMode>("idle");
  const setMode = useCallback((m: CameraMode) => {
    modeRef.current = m;
    setModeState(m);
  }, []);

  const loadFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) {
        return;
      }
      Promise.all(Array.from(fileList).map(readAsLoadedImage))
        .then(onImagesLoaded)
        .catch(() => {
          // A file failed to read (corrupt/unsupported); leave the previous
          // selection in place rather than clobbering it with a partial one.
        });
    },
    [onImagesLoaded],
  );

  const camera = useCameraCapture();

  useEffect(() => {
    if (camera.error) setMode("idle");
  }, [camera.error, setMode]);

  const { data: wsData, connected: wsConnected, send: wsSend } = useWebSocketStream<ClassifyWsMessage>(
    "/ws/classify",
    { enabled: mode !== "idle" },
  );

  useEffect(() => {
    if (!wsConnected) return;
    wsSend(
      JSON.stringify({
        type: "config",
        top_k: classifyConfig.topK,
        width: classifyConfig.width,
        height: classifyConfig.height,
      }),
    );
  }, [wsConnected, classifyConfig.topK, classifyConfig.width, classifyConfig.height, wsSend]);

  const cameraActiveRef = useRef(camera.active);
  useEffect(() => {
    cameraActiveRef.current = camera.active;
  }, [camera.active]);
  const captureBlobRef = useRef(camera.captureBlob);
  useEffect(() => {
    captureBlobRef.current = camera.captureBlob;
  });

  // Only Take Photo needs the captured frame surfaced as an image (the
  // caller shows it next to the predictions) — Live Cam already has its own
  // live video feed on screen, so it deliberately does not report frames
  // here; nothing about the Live view changes.
  const lastFrameUrlRef = useRef<string | null>(null);
  const sendNextFrame = useCallback(() => {
    if (modeRef.current === "idle" || !cameraActiveRef.current) return;
    void captureBlobRef.current().then((blob) => {
      if (!blob) {
        if (modeRef.current !== "idle" && cameraActiveRef.current) {
          requestAnimationFrame(sendNextFrame);
        }
        return;
      }
      if (modeRef.current === "photo") {
        if (lastFrameUrlRef.current) URL.revokeObjectURL(lastFrameUrlRef.current);
        const url = URL.createObjectURL(blob);
        lastFrameUrlRef.current = url;
        onCameraFrame(url);
      }
      wsSend(blob);
    });
  }, [wsSend, onCameraFrame]);

  useEffect(
    () => () => {
      if (lastFrameUrlRef.current) URL.revokeObjectURL(lastFrameUrlRef.current);
    },
    [],
  );

  const [capturing, setCapturing] = useState(false);

  // Drives the camera→WS loop. Live Cam auto-streams (first frame on
  // "ready", next frame as soon as each result comes back). Take Photo is
  // manual: opening the camera sends nothing — the user needs to see
  // themselves in the preview and click Capture (capturePhoto below); that
  // click is the only frame this mode ever sends.
  useEffect(() => {
    if (mode === "idle" || !camera.active || !wsData) return;
    if (wsData.type === "ready") {
      if (mode === "live") sendNextFrame();
      return;
    }
    if (wsData.type === "classify") {
      onCameraResult(
        wsData.predictions.map((p) => ({ label: p.label, confidence: p.confidence, class_id: p.class_id })),
        wsData.ms,
      );
    }
    if (mode === "photo") {
      setCapturing(false);
      setMode("idle");
      camera.stop();
    } else {
      sendNextFrame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsData, mode, camera.active]);

  const startCamera = useCallback(
    (nextMode: CameraMode) => {
      setMode(nextMode);
      void camera.start();
    },
    [camera, setMode],
  );

  const capturePhoto = useCallback(() => {
    setCapturing(true);
    sendNextFrame();
  }, [sendNextFrame]);

  const cancelCamera = useCallback(() => {
    setCapturing(false);
    setMode("idle");
    camera.stop();
  }, [camera, setMode]);

  return (
    <div className="space-y-3">
      {camera.active ? (
        <div className="space-y-2" data-testid="classify-camera-view">
          <div className="relative">
            <video
              ref={camera.videoRef}
              className="max-h-64 w-full rounded-md border border-border bg-black object-contain"
              muted
              playsInline
            />
            {mode === "live" && (
              <span
                data-testid="classify-live-indicator"
                className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2 py-0.5 text-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" aria-hidden="true" />
                Live
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {mode === "photo" && (
              <Button
                type="button"
                data-testid="classify-camera-capture"
                disabled={capturing}
                onClick={capturePhoto}
              >
                {capturing ? "Capturing…" : "Capture"}
              </Button>
            )}
            <Button type="button" variant="outline" data-testid="classify-camera-cancel" onClick={cancelCamera}>
              Stop
            </Button>
          </div>
        </div>
      ) : (
        <>
          <label
            htmlFor="classify-file-input"
            data-testid="classify-dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsOver(true);
            }}
            onDragLeave={() => setIsOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsOver(false);
              loadFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border px-4 py-8 text-center text-sm transition-colors",
              isOver ? "border-primary bg-accent" : "hover:bg-accent/50",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <div>Click to upload or drag &amp; drop</div>
            <div className="text-xs text-muted-foreground">JPEG / PNG</div>
            <input
              ref={inputRef}
              id="classify-file-input"
              data-testid="classify-file-input"
              type="file"
              accept="image/jpeg,image/png"
              multiple
              disabled={disabled}
              className="sr-only"
              onChange={(e) => loadFiles(e.target.files)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="classify-camera-photo-btn"
              disabled={disabled}
              onClick={() => startCamera("photo")}
            >
              <i className="ri-camera-line" aria-hidden="true" /> Take Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="classify-camera-live-btn"
              disabled={disabled}
              onClick={() => startCamera("live")}
            >
              <i className="ri-live-line" aria-hidden="true" /> Live Cam
            </Button>
          </div>
          {camera.error && (
            <p className="text-xs text-destructive" data-testid="classify-camera-error">
              {camera.error}
            </p>
          )}
        </>
      )}

      {images.length === 1 && (
        <img
          src={images[0].dataUrl}
          alt="preview"
          data-testid="classify-preview"
          className="max-h-48 rounded-md border border-border object-contain"
        />
      )}
      {images.length > 1 && (
        <p className="text-sm text-muted-foreground" data-testid="classify-preview-count">
          {images.length} images loaded
        </p>
      )}
    </div>
  );
}
