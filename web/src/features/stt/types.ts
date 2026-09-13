export interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface TranscribeResponse {
  text: string;
  language: string | null;
  confidence: number;
  segments: TranscriptSegment[] | null;
}

export interface AudioHealthResponse {
  status: string;
  audio_backend: string;
  supported_formats: string[];
  models_available: string[];
}

/** Text frames sent by the server over `GET /audio/ws` (src/api/ws_audio.rs `ServerMsg`). */
export type WsServerMessage =
  | { type: "ready" }
  | { type: "tts_meta"; sample_rate: number; encoding: string }
  | { type: "tts_done"; duration_ms: number }
  | { type: "transcript"; text: string; confidence: number; is_final: boolean }
  | { type: "error"; msg: string };
