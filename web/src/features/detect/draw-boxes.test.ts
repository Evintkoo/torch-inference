import { describe, expect, it, vi } from "vitest";
import { colorForLabel, drawEnrichedBoxes, type Ctx2DLike } from "./draw-boxes";
import type { EnrichedDetection } from "./types";

function mockCtx(): Ctx2DLike {
  return {
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 42 })),
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
    font: "",
  };
}

describe("colorForLabel", () => {
  it("is deterministic for the same label", () => {
    expect(colorForLabel("person")).toBe(colorForLabel("person"));
  });

  it("only ever returns a color from the supplied palette", () => {
    const palette = ["#111111", "#222222"];
    expect(palette).toContain(colorForLabel("cat", palette));
    expect(palette).toContain(colorForLabel("a very different label", palette));
  });
});

describe("drawEnrichedBoxes", () => {
  const detections: EnrichedDetection[] = [
    {
      class_id: 0,
      class_name: "cat",
      confidence: 0.615,
      bbox: { x1: 5, y1: 5, x2: 55, y2: 65 },
      bbox_rel: { x1: 0, y1: 0, x2: 1, y2: 1 },
      area: 3000,
      confidence_bucket: "medium",
    },
  ];

  it("does not clear the canvas (source image stays under the boxes)", () => {
    const ctx = mockCtx();
    drawEnrichedBoxes(ctx, detections);
    expect(ctx.clearRect).not.toHaveBeenCalled();
  });

  it("draws a box for every detection at its bbox coordinates", () => {
    const ctx = mockCtx();
    drawEnrichedBoxes(ctx, detections);
    expect(ctx.strokeRect).toHaveBeenCalledWith(5, 5, 50, 60);
  });

  it("labels with class_name and rounded confidence percentage", () => {
    const ctx = mockCtx();
    drawEnrichedBoxes(ctx, detections);
    expect(ctx.fillText).toHaveBeenCalledWith("cat 62%", expect.any(Number), expect.any(Number));
  });
});
