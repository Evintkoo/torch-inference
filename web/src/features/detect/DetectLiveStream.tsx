import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError, apiPostForm } from "@/lib/api-client";
import { colorForLabel, drawLiveBoxes } from "./draw-boxes";
import { useDetectSocket } from "./useDetectSocket";
import type { ModelStatus } from "./types";

const FPS_OPTIONS = [5, 10, 15, 24];
const LIVE_VERSIONS = ["v8", "v5", "v10", "v11"];
const LIVE_SIZES: { value: string; label: string }[] = [
  { value: "n", label: "nano" },
  { value: "s", label: "small" },
  { value: "m", label: "medium" },
];

// Tiny 1x1 PNG used only to probe whether a YOLO model is loaded server-side, mirroring
// playground.html's detCheckModel (which built the same thing from a blank <canvas>).
const PROBE_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function probeBlob(): Blob {
  const bytes = Uint8Array.from(atob(PROBE_PNG_BASE64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: "image/png" });
}

const selectClass = "h-8 w-full rounded-md border border-input bg-background px-2 text-xs";

/**
 * Live camera/video-file detection over `GET /ws/detect`. Mirrors playground.html's Live
 * Stream tab (detWsConnect / detStartFrameLoop / detOverlayBoxes and friends) — including the
 * backpressure-gated frame loop from fix/detect-live-stream-backpressure, now owned by
 * useDetectSocket (canSendFrame / beginFrameSend / sendFrame).
 */
export function DetectLiveStream() {
  const socket = useDetectSocket();
  const [source, setSource] = useState<"none" | "camera" | "video">("none");
  const [fps, setFps] = useState(10);
  const [liveVersion, setLiveVersion] = useState("v8");
  const [liveSize, setLiveSize] = useState("n");
  const [liveConf, setLiveConf] = useState(0.5);
  const [modelStatus, setModelStatus] = useState<ModelStatus>("checking");
  const [sourceError, setSourceError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastDetectionsRef = useRef(socket.detections);
  const videoUrlRef = useRef<string | null>(null);

  // Redraw the overlay the instant a new detection reply arrives (not just on the next capture
  // tick) and keep the ref other callbacks read in sync — mirrors detOverlayBoxes.
  useEffect(() => {
    lastDetectionsRef.current = socket.detections;
    const overlay = overlayRef.current;
    if (overlay && overlay.width && overlay.height) {
      const ctx = overlay.getContext("2d");
      if (ctx) drawLiveBoxes(ctx, overlay.width, overlay.height, socket.detections);
    }
  }, [socket.detections]);

  const checkModel = useCallback(async () => {
    setModelStatus("checking");
    try {
      const form = new FormData();
      form.append("image", probeBlob(), "probe.png");
      await apiPostForm("/yolo/detect?model_version=v8&model_size=n", form);
      setModelStatus("loaded");
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 404 || e.status === 503) {
          setModelStatus("missing");
        } else if (e.status === 400 || e.status === 422 || e.status === 500) {
          // Model loaded but rejected/errored on the tiny probe input — acceptable.
          setModelStatus("loaded");
        } else {
          setModelStatus("unknown");
        }
      } else {
        setModelStatus("unreachable");
      }
    }
  }, []);

  useEffect(() => {
    checkModel();
  }, [checkModel]);

  useEffect(() => {
    if (socket.isConnected()) {
      socket.sendConfig({ version: liveVersion, size: liveSize, conf: liveConf, iou: 0.45 });
    }
    // socket.connected (not just the identity of socket) is what should re-trigger this on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket.connected, liveVersion, liveSize, liveConf]);

  /** Waits for the detect WS to be open, auto-connecting if needed. Mirrors detEnsureWs. */
  const ensureSocket = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (socket.isConnected()) {
        resolve(true);
        return;
      }
      socket.connect();
      let tries = 0;
      const iv = setInterval(() => {
        if (socket.isConnected()) {
          clearInterval(iv);
          resolve(true);
        } else if (++tries > 25) {
          clearInterval(iv);
          resolve(false);
        }
      }, 200);
    });
  }, [socket]);

  const stopFrameLoop = useCallback(() => {
    if (frameTimerRef.current !== null) {
      clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }
  }, []);

  const startFrameLoop = useCallback(() => {
    stopFrameLoop();
    if (!captureCanvasRef.current) {
      captureCanvasRef.current = document.createElement("canvas");
    }
    const cap = captureCanvasRef.current;
    const capCtx = cap.getContext("2d");

    frameTimerRef.current = setInterval(() => {
      // Backpressure: skip this tick entirely while the previous frame is still in flight, so
      // capture/encode never outpaces the server's reply rate.
      if (!socket.canSendFrame()) return;
      const vid = videoRef.current;
      if (!vid || vid.readyState < 2) return;

      const w = vid.videoWidth || 640;
      const h = vid.videoHeight || 480;
      cap.width = w;
      cap.height = h;
      capCtx?.drawImage(vid, 0, 0, w, h);

      const overlay = overlayRef.current;
      if (overlay) {
        if (overlay.width !== w || overlay.height !== h) {
          overlay.width = w;
          overlay.height = h;
        }
        const octx = overlay.getContext("2d");
        // Redraw the last known boxes every tick so they don't disappear while waiting for the
        // next detection result (which may arrive well under the capture fps).
        if (octx) drawLiveBoxes(octx, w, h, lastDetectionsRef.current);
      }

      socket.beginFrameSend();
      cap.toBlob((blob) => socket.sendFrame(blob), "image/jpeg", 0.8);
    }, Math.round(1000 / fps));
  }, [fps, socket, stopFrameLoop]);

  const stopSource = useCallback(() => {
    stopFrameLoop();
    const vid = videoRef.current;
    if (vid) {
      const stream = vid.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      vid.srcObject = null;
      vid.src = "";
    }
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = null;
    }
    const overlay = overlayRef.current;
    overlay?.getContext("2d")?.clearRect(0, 0, overlay.width, overlay.height);
    setSource("none");
    socket.disconnect();
  }, [stopFrameLoop, socket]);

  const startCamera = useCallback(async () => {
    setSourceError(null);
    if (!window.isSecureContext || !navigator.mediaDevices) {
      setSourceError("Camera access requires a secure context. Open this page via https:// or http://localhost.");
      return;
    }
    try {
      const ok = await ensureSocket();
      if (!ok) {
        setSourceError("Could not connect to detection WebSocket. Is the server running?");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const vid = videoRef.current;
      if (vid) {
        vid.srcObject = stream;
        vid.play().catch(() => {});
      }
      setSource("camera");
      startFrameLoop();
    } catch (e) {
      setSourceError(`Camera error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [ensureSocket, startFrameLoop]);

  const openVideoFile = useCallback(
    async (file: File) => {
      setSourceError(null);
      const ok = await ensureSocket();
      if (!ok) {
        setSourceError("Could not connect to detection WebSocket. Is the server running?");
        return;
      }
      const vid = videoRef.current;
      if (vid) {
        const url = URL.createObjectURL(file);
        videoUrlRef.current = url;
        vid.src = url;
        vid.loop = true;
        vid.play().catch(() => {});
      }
      setSource("video");
      startFrameLoop();
    },
    [ensureSocket, startFrameLoop],
  );

  const onVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) openVideoFile(f);
  };

  // Tear everything down on unmount: stop the capture timer, release the camera/video source,
  // close the socket. Deliberately mount-only (refs are stable; socket methods are ref-based).
  useEffect(() => {
    return () => {
      stopFrameLoop();
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modelDotClass =
    modelStatus === "loaded"
      ? "bg-[#2EA043]"
      : modelStatus === "missing"
        ? "bg-destructive"
        : modelStatus === "checking"
          ? "bg-muted-foreground"
          : "bg-amber-500";

  const modelLabel: Record<ModelStatus, string> = {
    checking: "checking model…",
    loaded: "Model loaded ✓",
    missing: "No model loaded",
    unreachable: "Server unreachable",
    unknown: "Model status unknown",
  };

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Live Detection Stream</div>
          <div className="text-xs text-muted-foreground">
            WebSocket <code>GET /ws/detect</code> — JPEG frames → bounding boxes
          </div>
          <div className="mt-1 flex items-center gap-1.5" data-testid="det-model-badge">
            <span className={`inline-block size-2 rounded-full ${modelDotClass}`} />
            <span data-testid="det-model-label" className="text-xs text-muted-foreground">
              {modelLabel[modelStatus]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            data-testid="det-ws-dot"
            className={`inline-block size-2.5 rounded-full ${socket.connected ? "bg-[#2EA043]" : "bg-muted-foreground"}`}
          />
          <span data-testid="det-ws-label" className="text-xs text-muted-foreground">
            {socket.connected ? "connected" : "disconnected"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            id="det-ws-btn"
            data-testid="det-ws-btn"
            onClick={() => (socket.connected ? socket.disconnect() : socket.connect())}
          >
            {socket.connected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <div>
          <div className="relative min-h-60 overflow-hidden rounded-md border border-border bg-muted">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              data-testid="det-video"
              className={source === "none" ? "hidden" : "w-full"}
            />
            <canvas ref={overlayRef} data-testid="det-live-canvas" className="pointer-events-none absolute inset-0 h-full w-full" />
            {source === "none" && (
              <div
                data-testid="det-live-placeholder"
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <span>Start camera or open a video file</span>
              </div>
            )}
          </div>
          {sourceError && <p className="mt-2 text-xs text-destructive">{sourceError}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" id="det-cam-btn" data-testid="det-cam-btn" onClick={startCamera}>
              Camera
            </Button>
            <label
              htmlFor="det-vid-file"
              id="det-vid-btn"
              data-testid="det-vid-btn"
              className={buttonVariants({ variant: "outline", size: "sm" }) + " cursor-pointer"}
            >
              Video File
            </label>
            <input
              id="det-vid-file"
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={onVideoFileChange}
            />
            {source !== "none" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                id="det-stop-src-btn"
                data-testid="det-stop-src-btn"
                onClick={stopSource}
              >
                Stop
              </Button>
            )}
            <div className="ml-auto flex items-center gap-1 text-xs">
              <label htmlFor="det-fps">FPS cap</label>
              <select
                id="det-fps"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="h-7 rounded-md border border-input bg-background px-1"
              >
                {FPS_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f} fps
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="mb-1 font-semibold text-muted-foreground">Config</div>
            <div className="space-y-1">
              <label htmlFor="det-live-version">Version</label>
              <select
                id="det-live-version"
                value={liveVersion}
                onChange={(e) => setLiveVersion(e.target.value)}
                className={selectClass}
              >
                {LIVE_VERSIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-1 space-y-1">
              <label htmlFor="det-live-size">Size</label>
              <select
                id="det-live-size"
                value={liveSize}
                onChange={(e) => setLiveSize(e.target.value)}
                className={selectClass}
              >
                {LIVE_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-1 space-y-1">
              <label htmlFor="det-live-conf">Confidence</label>
              <input
                id="det-live-conf"
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={liveConf}
                onChange={(e) => setLiveConf(parseFloat(e.target.value) || 0)}
                className={selectClass}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-muted-foreground">Stats</div>
            <div className="space-y-0.5">
              <div>
                Frame: <strong data-testid="det-stat-frame">{socket.stats.frame}</strong>
              </div>
              <div>
                Latency:{" "}
                <strong data-testid="det-stat-ms">
                  {socket.stats.ms === null
                    ? "—"
                    : typeof socket.stats.ms === "number"
                      ? socket.stats.ms.toFixed(1)
                      : socket.stats.ms}
                </strong>{" "}
                ms
              </div>
              <div>
                Objects: <strong data-testid="det-stat-count">{socket.stats.count}</strong>
              </div>
              <div>
                FPS: <strong data-testid="det-stat-fps">{socket.stats.fps || "—"}</strong>
              </div>
            </div>
          </div>
          <div data-testid="det-live-labels" className="max-h-32 space-y-0.5 overflow-y-auto">
            {socket.detections.map((d, i) => (
              <div key={i} style={{ color: colorForLabel(d.label) }}>
                ● {d.label} {((d.conf || 0) * 100).toFixed(0)}%
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
