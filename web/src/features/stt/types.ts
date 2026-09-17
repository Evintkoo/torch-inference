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
