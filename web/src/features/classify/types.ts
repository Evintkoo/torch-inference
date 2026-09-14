// Mirrors `BatchClassifyRequest`/`BatchClassifyResponse` in `src/api/classify.rs`
// and the `Envelope<T>` wrapper from `src/postprocess.rs`.

export interface ClassifyRequest {
  images: string[];
  top_k: number;
  model_width: number;
  model_height: number;
}

export interface Prediction {
  label: string;
  confidence: number;
  class_id: number;
}

export interface BatchClassifyResponseData {
  /** One `Prediction[]` per submitted image, in submission order. */
  results: Prediction[][];
  batch_size: number;
}

export interface EnvelopeMeta {
  latency_ms: number;
  model_id: string;
  postprocessing_applied: boolean;
  postprocess_steps: string[];
  warnings: string[];
  version: string;
  request_id: string;
}

export interface ClassifyEnvelope {
  data: BatchClassifyResponseData;
  meta: EnvelopeMeta;
}

/** One image the user has loaded, decoded to base64 for the JSON request body. */
export interface LoadedImage {
  name: string;
  /** data: URL — used for the on-screen thumbnail preview. */
  dataUrl: string;
  /** base64 payload only (no `data:image/...;base64,` prefix). */
  base64: string;
}

// ── GET /ws/classify (see src/api/ws_infer.rs for the full protocol) ────────
//
// Despite what ws_infer.rs's doc-comment example shows (`"conf":0.95`), the
// classify WS response reuses the REST `Prediction` struct (src/api/classify.rs)
// verbatim, which serializes the field as `confidence` — unlike detect's
// `DetectionResult`, which is a separate struct defined in ws_infer.rs itself
// and genuinely does use `conf`. Confirmed against the live server: this was
// `conf` here too until real testing showed every camera confidence render
// as "NaN%".

export interface WsPrediction {
  label: string;
  confidence: number;
  class_id: number;
}

export type ClassifyWsMessage =
  | { type: "ready"; task: string; frame: number }
  | { type: "classify"; frame: number; ms: number; predictions: WsPrediction[] }
  | { type: "error"; frame: number; msg: string };
