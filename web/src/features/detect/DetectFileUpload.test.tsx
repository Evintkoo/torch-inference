import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DetectFileUpload } from "./DetectFileUpload";
import type { YoloDetectResponse } from "./types";

// jsdom does not implement URL.createObjectURL/revokeObjectURL — stub them so the file-select
// path (loadFile builds an <img> preview from the picked File) doesn't throw.
beforeEach(() => {
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:mock"),
    revokeObjectURL: vi.fn(),
  });
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
    render(<DetectFileUpload />);
    expect(screen.getByTestId("detect-btn")).toBeDisabled();
  });

  it("enables Detect once a file is selected", async () => {
    const user = userEvent.setup();
    render(<DetectFileUpload />);
    await user.upload(screen.getByLabelText(/click to upload/i), pngFile());
    expect(screen.getByTestId("detect-btn")).toBeEnabled();
  });

  it("posts the file to /yolo/detect and renders the detection summary", async () => {
    const user = userEvent.setup();
    mockFetchOnce(200, successResponse);
    render(<DetectFileUpload />);

    await user.upload(screen.getByLabelText(/click to upload/i), pngFile());
    await user.click(screen.getByTestId("detect-btn"));

    await waitFor(() => expect(screen.getByTestId("detect-out")).toHaveTextContent("1 object(s) detected"));
    expect(screen.getByTestId("detect-out")).toHaveTextContent("person");
    expect(screen.getByTestId("detect-out")).toHaveTextContent("87.3%");

    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toMatch(/^\/yolo\/detect\?model_version=v8&model_size=n&conf_threshold=0\.25/);
    expect(call[1].method).toBe("POST");
    expect(call[1].body).toBeInstanceOf(FormData);
  });

  it("shows a download hint when the model is not found (404)", async () => {
    const user = userEvent.setup();
    mockFetchOnce(404, { error: "Model not found: yolo8n. Please download it first.", status: 404 });
    render(<DetectFileUpload />);

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
    render(<DetectFileUpload />);

    await user.upload(screen.getByLabelText(/click to upload/i), pngFile());
    await user.click(screen.getByTestId("detect-btn"));

    await waitFor(() => expect(screen.getByTestId("detect-out")).toHaveTextContent("No objects detected."));
  });
});
