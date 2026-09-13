import { useCallback, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, apiPostForm } from "@/lib/api-client";
import { drawEnrichedBoxes } from "./draw-boxes";
import type { EnrichedDetection, ModelSize, ModelVersion, YoloDetectResponse } from "./types";

const VERSIONS: ModelVersion[] = ["v8", "v5", "v10", "v11", "v12"];
const SIZES: { value: ModelSize; label: string }[] = [
  { value: "n", label: "nano" },
  { value: "s", label: "small" },
  { value: "m", label: "medium" },
  { value: "l", label: "large" },
  { value: "x", label: "xlarge" },
];

const selectClass = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";
const fieldLabelClass = "text-xs text-muted-foreground";

/**
 * File-upload detection: `POST /yolo/detect` (multipart, `image` field). Mirrors
 * playground.html's `runDetect` / `handleDetectFile` / `drawDetections`.
 */
export function DetectFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState<ModelVersion>("v8");
  const [size, setSize] = useState<ModelSize>("n");
  const [conf, setConf] = useState(0.25);
  const [detecting, setDetecting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("Upload an image to detect objects.");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const loadFile = useCallback((f: File) => {
    setFile(f);
    setStatus("idle");
    setMessage("Image loaded — click Detect.");
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
    };
    img.src = URL.createObjectURL(f);
  }, []);

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  };

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
      const canvas = canvasRef.current;
      const img = imageRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && img) {
        ctx.drawImage(img, 0, 0);
        drawEnrichedBoxes(ctx, detections);
      }

      const summary =
        detections.length === 0
          ? "No objects detected."
          : detections
              .map((d, i) => {
                const b = d.bbox;
                const pct = ((d.confidence || 0) * 100).toFixed(1);
                return `#${i + 1}  ${d.class_name || "unknown"}  ${pct}%\n     x1=${b.x1.toFixed(0)} y1=${b.y1.toFixed(0)}  x2=${b.x2.toFixed(0)} y2=${b.y2.toFixed(0)}`;
              })
              .join("\n");
      setMessage(`${detections.length} object(s) detected\n\n${summary}`);
      setStatus("ok");
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || /not found/i.test(e.message))) {
        const modelName = `yolo${version.replace("v", "")}${size}`;
        setMessage(
          `Model "${modelName}" not downloaded.\n\nGo to Models to download it first.`,
        );
      } else {
        setMessage(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
      setStatus("error");
    } finally {
      setDetecting(false);
    }
  }, [file, version, size, conf]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="detect-version" className={fieldLabelClass}>
                Model Version
              </label>
              <select
                id="detect-version"
                value={version}
                onChange={(e) => setVersion(e.target.value as ModelVersion)}
                className={selectClass}
              >
                {VERSIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="detect-size" className={fieldLabelClass}>
                Model Size
              </label>
              <select
                id="detect-size"
                value={size}
                onChange={(e) => setSize(e.target.value as ModelSize)}
                className={selectClass}
              >
                {SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
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
            className={`whitespace-pre-wrap rounded-md border border-border p-2 text-xs ${
              status === "error" ? "text-destructive" : "text-foreground"
            }`}
          >
            {message}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
