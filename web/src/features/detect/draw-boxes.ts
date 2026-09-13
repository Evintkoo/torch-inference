import type { EnrichedDetection, LiveDetection } from "./types";

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
 * Draws live-stream detections onto a transparent overlay canvas (clears first — the video
 * element shows through behind it). Mirrors playground.html's `detDrawBoxes`.
 */
export function drawLiveBoxes(ctx: Ctx2DLike, width: number, height: number, detections: LiveDetection[]): void {
  ctx.clearRect(0, 0, width, height);
  for (const d of detections) {
    const [x1, y1, x2, y2] = d.bbox;
    const bw = x2 - x1;
    const bh = y2 - y1;
    if (bw <= 0 || bh <= 0) continue;
    const color = colorForLabel(d.label);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, y1, bw, bh);
    const label = `${d.label} ${((d.conf || 0) * 100).toFixed(0)}%`;
    ctx.font = "bold 12px sans-serif";
    const tw = ctx.measureText(label).width;
    const ly = y1 > 20 ? y1 : y1 + bh + 18;
    ctx.fillStyle = color;
    ctx.fillRect(x1, ly - 18, tw + 8, 18);
    ctx.fillStyle = "#fff";
    ctx.fillText(label, x1 + 4, ly - 4);
  }
}

/**
 * Draws REST `/yolo/detect` results on top of an already-drawn source image (does not clear —
 * caller redraws the source image first). Mirrors playground.html's `drawDetections`.
 */
export function drawEnrichedBoxes(ctx: Ctx2DLike, detections: EnrichedDetection[]): void {
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
