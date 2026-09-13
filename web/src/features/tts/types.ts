export interface TtsEngineObj {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

export type TtsEngine = string | TtsEngineObj;

export interface TtsVoiceObj {
  id?: string;
  name?: string;
  language?: string;
  [key: string]: unknown;
}

export type TtsVoice = string | TtsVoiceObj;

export interface TtsEnginesResponse {
  engines?: TtsEngine[];
}

export interface TtsVoicesResponse {
  voices?: TtsVoice[];
}

export interface TtsHealth {
  engines_loaded?: number;
  [key: string]: unknown;
}

/** Text frames sent over `GET /audio/ws` while streaming a `{type:"tts",...}` request. */
export interface TtsWsMessage {
  type: "ready" | "tts_meta" | "tts_done" | "error" | "transcript";
  sample_rate?: number;
  encoding?: string;
  duration_ms?: number;
  msg?: string;
  text?: string;
}
