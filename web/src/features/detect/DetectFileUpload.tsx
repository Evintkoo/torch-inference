import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select";
import { useCameraCapture } from "@/lib/use-camera-capture";
import { useWebSocketStream } from "@/lib/ws-client";
import { ApiError, apiGet, apiPostForm } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { drawEnrichedBoxes, type DrawableDetection } from "./draw-boxes";
import type {
  DetectWsMessage,
  EnrichedDetection,
  ModelSize,
  ModelVersion,
  WsDetection,
  YoloDetectResponse,
} from "./types";

const VERSIONS: ModelVersion[] = ["v8", "v5", "v10", "v11", "v12"];
const SIZES: { value: ModelSize; label: string }[] = [
  { value: "n", label: "nano" },
  { value: "s", label: "small" },
  { value: "m", label: "medium" },
  { value: "l", label: "large" },
  { value: "x", label: "xlarge" },
];

interface YoloInfoResponse {
  available: boolean;
}

/**
 * `GET /yolo/info` reports on-disk availability per (version, size) combo —
 * there's no byte-size tracked for these (unlike the classify SOTA download
 * registry), so the badge is Downloaded/Not downloaded only. Fetched once for
 * the whole version×size grid (25 lightweight requests) and cached, so
 * opening either dropdown is instant.
 */
function useYoloAvailability(): Record<string, boolean> {
  const combos = VERSIONS.flatMap((v) => SIZES.map((s) => ({ v, size: s.value })));
  const results = useQueries({
    queries: combos.map(({ v, size }) => ({
      queryKey: ["yolo-info", v, size],
      queryFn: () => apiGet<YoloInfoResponse>(`/yolo/info?model_version=${v}&model_size=${size}`),
      staleTime: 5 * 60_000,
    })),
  });
  const map: Record<string, boolean> = {};
  combos.forEach(({ v, size }, i) => {
    map[`${v}:${size}`] = results[i].data?.available ?? false;
  });
  return map;
}

function wsDetectionToDrawable(d: WsDetection): DrawableDetection {
  const [x1, y1, x2, y2] = d.bbox;
  return { class_name: d.label, confidence: d.conf, bbox: { x1, y1, x2, y2 } };
}

function buildDetectSummary(detections: DrawableDetection[]): string {
  if (detections.length === 0) {
    return "No objects detected.";
  }
  return detections
    .map((d, i) => {
      const b = d.bbox;
      const pct = ((d.confidence || 0) * 100).toFixed(1);
      return `#${i + 1}  ${d.class_name || "unknown"}  ${pct}%\n     x1=${b.x1.toFixed(0)} y1=${b.y1.toFixed(0)}  x2=${b.x2.toFixed(0)} y2=${b.y2.toFixed(0)}`;
    })
    .join("\n");
}

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
const fieldLabelClass = "text-xs text-muted-foreground";

type CameraMode = "idle" | "photo" | "live";

/**
 * File-upload detection: `POST /yolo/detect` (multipart, `image` field) —
 * unchanged. Camera-sourced detection (both a single photo and continuous
 * Live mode) goes over `GET /ws/detect` instead: one persistent connection,
 * frames sent as fast as results come back, rather than polling the REST
 * endpoint on a fixed interval (laggy, and not actually "streaming").
 */
export function DetectFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState<ModelVersion>("v8");
  const [size, setSize] = useState<ModelSize>("n");
  const [conf, setConf] = useState(0.25);
  const [detecting, setDetecting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("Upload an image to detect objects.");

  const [mode, setModeState] = useState<CameraMode>("idle");
  const modeRef = useRef<CameraMode>("idle");
  const setMode = useCallback((m: CameraMode) => {
    modeRef.current = m;
    setModeState(m);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const drawImageToCanvas = useCallback((img: HTMLImageElement) => {
    imageRef.current = img;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d")?.drawImage(img, 0, 0);
  }, []);

  const loadFile = useCallback(
    (f: File) => {
      setFile(f);
      setStatus("idle");
      setMessage("Image loaded — click Detect.");
      const img = new Image();
      img.onload = () => drawImageToCanvas(img);
      img.src = URL.createObjectURL(f);
    },
    [drawImageToCanvas],
  );

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  };

  // Renders a detection result (from either transport) onto the shared
  // Result canvas + summary text — one render path for REST and WS.
  const applyDetections = useCallback((detections: DrawableDetection[]) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && img) {
      ctx.drawImage(img, 0, 0);
      drawEnrichedBoxes(ctx, detections);
    }
    setMessage(`${detections.length} object(s) detected\n\n${buildDetectSummary(detections)}`);
    setStatus("ok");
  }, []);

  const camera = useCameraCapture();
  const availability = useYoloAvailability();
  const versionOptions: SearchableSelectOption[] = VERSIONS.map((v) => ({
    value: v,
    label: v,
    badge: availability[`${v}:${size}`] ? "Downloaded" : "Not downloaded",
    badgeVariant: availability[`${v}:${size}`] ? "secondary" : "outline",
  }));
  const sizeOptions: SearchableSelectOption[] = SIZES.map((s) => ({
    value: s.value,
    label: s.label,
    badge: availability[`${version}:${s.value}`] ? "Downloaded" : "Not downloaded",
    badgeVariant: availability[`${version}:${s.value}`] ? "secondary" : "outline",
  }));

  // getUserMedia failing (permission denied, no camera, insecure context)
  // shouldn't leave a WS connection open with nothing ever feeding it.
  useEffect(() => {
    if (camera.error) setMode("idle");
  }, [camera.error, setMode]);

  const runDetect = useCallback(async () => {
    if (!file) return;
    setDetecting(true);
    setStatus("idle");
    setMessage("Detecting…");
    try {
      const form = new FormData();
      form.append("image", file);
      const url = `/yolo/detect?model_version=${encodeURIComponent(version)}&model_size=${encodeURIComponent(size)}&conf_threshold=${conf}&iou_threshold=0.45`;
      const res = await apiPostForm<YoloDetectResponse>(url, form);
      if (!res.data.success) {
        throw new ApiError(res.data.error ?? "detection failed", 200, res);
      }
      const detections: EnrichedDetection[] = res.data.results?.detections ?? [];
      applyDetections(detections);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || /not found/i.test(e.message))) {
        const modelName = `yolo${version.replace("v", "")}${size}`;
        setMessage(`Model "${modelName}" not downloaded.\n\nGo to Models to download it first.`);
      } else {
        setMessage(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
      setStatus("error");
    } finally {
      setDetecting(false);
    }
  }, [file, version, size, conf, applyDetections]);

  // ── Camera path: GET /ws/detect ─────────────────────────────────────────
  const { data: wsData, connected: wsConnected, send: wsSend } = useWebSocketStream<DetectWsMessage>(
    "/ws/detect",
    { enabled: mode !== "idle" },
  );

  // Reconfigure the running session whenever the model/threshold controls
  // change — the protocol accepts a fresh `config` frame at any time.
  useEffect(() => {
    if (!wsConnected) return;
    wsSend(JSON.stringify({ type: "config", version, size, conf, iou: 0.45 }));
  }, [wsConnected, version, size, conf, wsSend]);

  const cameraActiveRef = useRef(camera.active);
  useEffect(() => {
    cameraActiveRef.current = camera.active;
  }, [camera.active]);
  const captureBlobRef = useRef(camera.captureBlob);
  useEffect(() => {
    captureBlobRef.current = camera.captureBlob;
  });

  const lastFrameUrlRef = useRef<string | null>(null);

  const sendNextFrame = useCallback(() => {
    if (modeRef.current === "idle" || !cameraActiveRef.current) return;
    void captureBlobRef.current().then((blob) => {
      if (!blob) {
        // Video not ready yet (brief window right after the camera opens) —
        // try again next frame instead of stalling the stream forever.
        if (modeRef.current !== "idle" && cameraActiveRef.current) {
          requestAnimationFrame(sendNextFrame);
        }
        return;
      }
      // Draw the captured frame as the Result panel's base image so the
      // detection overlay lands on the frame it was actually computed from
      // — in Live mode this is what makes the Result panel read as a live
      // feed rather than a single stale photo.
      if (lastFrameUrlRef.current) URL.revokeObjectURL(lastFrameUrlRef.current);
      const url = URL.createObjectURL(blob);
      lastFrameUrlRef.current = url;
      const img = new Image();
      img.onload = () => drawImageToCanvas(img);
      img.src = url;
      wsSend(blob);
    });
  }, [wsSend, drawImageToCanvas]);

  const [capturing, setCapturing] = useState(false);

  // Drives the camera→WS loop. Live Cam auto-streams: the first frame goes
  // out as soon as the socket says "ready", and every result immediately
  // queues the next frame, bounded only by how fast the server responds.
  // Take Photo is manual: opening the camera does NOT send a frame — the
  // user needs to see themselves in the preview and click Capture; only that
  // click (capturePhoto below) sends the one frame this mode ever sends.
  useEffect(() => {
    if (mode === "idle" || !camera.active || !wsData) return;
    if (wsData.type === "ready") {
      if (mode === "live") sendNextFrame();
      return;
    }
    if (wsData.type === "detect") {
      applyDetections(wsData.detections.map(wsDetectionToDrawable));
    } else if (wsData.type === "error") {
      setMessage(`Error: ${wsData.msg}`);
      setStatus("error");
    }
    if (mode === "photo") {
      setCapturing(false);
      setMode("idle");
      camera.stop();
    } else {
      sendNextFrame();
    }
    // camera.stop/applyDetections are stable-enough (useCallback); re-running
    // this only on a genuinely new wsData/mode/camera.active is the point.
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
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {camera.active ? (
            <div className="space-y-2" data-testid="detect-camera-view">
              <div className="relative">
                <video
                  ref={camera.videoRef}
                  className="max-h-64 w-full rounded-md border border-border bg-black object-contain"
                  muted
                  playsInline
                />
                {mode === "live" && (
                  <span
                    data-testid="detect-live-indicator"
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
                    data-testid="detect-camera-capture"
                    disabled={capturing}
                    onClick={capturePhoto}
                  >
                    {capturing ? "Capturing…" : "Capture"}
                  </Button>
                )}
                <Button type="button" variant="outline" data-testid="detect-camera-cancel" onClick={cancelCamera}>
                  Stop
                </Button>
              </div>
            </div>
          ) : (
            <>
              <label
                data-testid="detect-dropzone"
                htmlFor="detect-file"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="flex cursor-pointer flex-col items-center gap-1 rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground transition-colors hover:bg-accent/40"
              >
                <span>Click to upload or drag &amp; drop</span>
                <span className="text-xs">JPEG / PNG</span>
                <input
                  id="detect-file"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="sr-only"
                  onChange={onFileInputChange}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="detect-camera-photo-btn"
                  onClick={() => startCamera("photo")}
                >
                  <i className="ri-camera-line" aria-hidden="true" /> Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="detect-camera-live-btn"
                  onClick={() => startCamera("live")}
                >
                  <i className="ri-live-line" aria-hidden="true" /> Live Cam
                </Button>
              </div>
              {camera.error && (
                <p className="text-xs text-destructive" data-testid="detect-camera-error">
                  {camera.error}
                </p>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="detect-version" className={fieldLabelClass}>
                Model Version
              </label>
              <SearchableSelect
                id="detect-version"
                value={version}
                onValueChange={(v) => setVersion(v as ModelVersion)}
                options={versionOptions}
                triggerTestId="detect-version"
                searchPlaceholder="Search versions…"
                className="h-8"
                hideTriggerBadge
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="detect-size" className={fieldLabelClass}>
                Model Size
              </label>
              <SearchableSelect
                id="detect-size"
                value={size}
                onValueChange={(v) => setSize(v as ModelSize)}
                options={sizeOptions}
                triggerTestId="detect-size"
                searchPlaceholder="Search sizes…"
                className="h-8"
                hideTriggerBadge
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="detect-conf" className={fieldLabelClass}>
              Confidence Threshold
            </label>
            <input
              id="detect-conf"
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={conf}
              onChange={(e) => setConf(parseFloat(e.target.value) || 0)}
              className={selectClass}
            />
          </div>

          <Button
            type="button"
            id="detect-btn"
            data-testid="detect-btn"
            disabled={!file || detecting}
            onClick={runDetect}
          >
            {detecting ? "Detecting…" : "Detect"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <canvas
            ref={canvasRef}
            data-testid="detect-canvas"
            className="max-w-full rounded-md border border-border"
          />
          <pre
            data-testid="detect-out"
            className={cn(
              "whitespace-pre-wrap rounded-md border border-border p-2 text-xs",
              status === "error" ? "text-destructive" : "text-foreground",
            )}
          >
            {message}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
