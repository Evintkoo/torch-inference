/** A pixel-space bounding box as returned by `POST /yolo/detect` (`EnrichedDetection.bbox`). */
export interface DetectionBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** One detection from the REST `/yolo/detect` response, after server-side postprocessing. */
export interface EnrichedDetection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: DetectionBox;
  bbox_rel: DetectionBox;
  area: number;
  confidence_bucket: string;
}

export interface YoloDetectResults {
  detections: EnrichedDetection[];
  inference_time_ms: number;
  preprocessing_time_ms: number;
  postprocessing_time_ms: number;
  total_time_ms: number;
}

export interface YoloDetectData {
  success: boolean;
  results: YoloDetectResults | null;
  error: string | null;
}

/** The `Envelope<EnrichedYoloDetectResponse>` shape `POST /yolo/detect` responds with. */
export interface YoloDetectResponse {
  data: YoloDetectData;
  meta: {
    latency_ms: number;
    model_id: string;
    postprocessing_applied: boolean;
    postprocess_steps: string[];
    warnings: string[];
    version: string;
    request_id: string;
  };
}

export type ModelVersion = "v5" | "v8" | "v10" | "v11" | "v12";
export type ModelSize = "n" | "s" | "m" | "l" | "x";

// ── GET /ws/detect (see src/api/ws_infer.rs for the full protocol) ──────────

export interface WsDetection {
  label: string;
  conf: number;
  /** [x1, y1, x2, y2] in pixels, original image coordinates. */
  bbox: [number, number, number, number];
}

export type DetectWsMessage =
  | { type: "ready"; task: string; frame: number }
  | { type: "detect"; frame: number; ms: number; count: number; detections: WsDetection[] }
  | { type: "error"; frame: number; msg: string };
