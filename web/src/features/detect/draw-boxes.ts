import type { DetectionBox } from "./types";

/**
 * Minimal shape `drawEnrichedBoxes` actually needs to draw a box + label.
 * `EnrichedDetection` (REST `/yolo/detect`) satisfies this structurally, and
 * so does a WS `/ws/detect` frame mapped via `wsDetectionToDrawable` in
 * DetectFileUpload.tsx — one draw path for both transports.
 */
export interface DrawableDetection {
  class_name: string;
  confidence: number;
  bbox: DetectionBox;
}

/** Same palette playground.html used for both the file-upload and live-stream detect panels. */
export const PALETTE = ["#FF3131", "#333333", "#3ABC3F", "#FFA931", "#CC27CC", "#27CCCC", "#CC7027", "#666666"];

/** Deterministic label → color, so a given class always draws in the same color across frames. */
export function colorForLabel(label: string, palette: string[] = PALETTE): string {
  const hash = [...label].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

/**
 * The subset of CanvasRenderingContext2D these helpers use — narrowed so tests can pass a plain
 * mock object instead of needing a real canvas (jsdom does not implement 2D canvas rendering).
 */
export interface Ctx2DLike {
  clearRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  fillText(text: string, x: number, y: number): void;
  measureText(text: string): { width: number };
  strokeStyle: string | CanvasGradient | CanvasPattern;
  fillStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  font: string;
}

/**
 * Draws REST `/yolo/detect` results on top of an already-drawn source image (does not clear —
 * caller redraws the source image first). Mirrors playground.html's `drawDetections`.
 */
export function drawEnrichedBoxes(ctx: Ctx2DLike, detections: DrawableDetection[]): void {
  for (const d of detections) {
    const b = d.bbox;
    const color = colorForLabel(d.class_name);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x1, b.y1, b.x2 - b.x1, b.y2 - b.y1);
    const label = `${d.class_name} ${((d.confidence || 0) * 100).toFixed(0)}%`;
    ctx.font = "bold 13px sans-serif";
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = color;
    ctx.fillRect(b.x1, b.y1 - 18, tw + 8, 18);
    ctx.fillStyle = "#fff";
    ctx.fillText(label, b.x1 + 4, b.y1 - 4);
  }
}
