import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { TtsEngine, TtsEnginesResponse, TtsVoice, TtsVoicesResponse } from "./types";

function normalizeEngine(engine: TtsEngine): { id: string; label: string } {
  if (typeof engine === "string") return { id: engine, label: engine };
  const id = engine.id ?? engine.name ?? "";
  return { id, label: engine.name ?? engine.id ?? id };
}

function normalizeVoice(voice: TtsVoice): { id: string; label: string } {
  if (typeof voice === "string") return { id: voice, label: voice };
  const id = voice.id ?? voice.name ?? "";
  const label = (voice.name ?? voice.id ?? "") + (voice.language ? ` (${voice.language})` : "");
  return { id, label };
}

export interface EngineVoiceSelectProps {
  engine: string;
  voice: string;
  onEngineChange: (engine: string) => void;
  onVoiceChange: (voice: string) => void;
}

/**
 * Engine + voice `<select>` pair for the REST TTS form, backed by
 * `GET /tts/engines` and `GET /tts/engines/:id/voices` — mirrors
 * playground.html's `refreshTtsSelects()` / `loadVoicesForEngine()`.
 */
export function EngineVoiceSelect({ engine, voice, onEngineChange, onVoiceChange }: EngineVoiceSelectProps) {
  const enginesQuery = useQuery({
    queryKey: ["tts-engines"],
    queryFn: () => apiGet<TtsEngine[] | TtsEnginesResponse>("/tts/engines"),
  });
  const engines = (Array.isArray(enginesQuery.data) ? enginesQuery.data : enginesQuery.data?.engines ?? []).map(
    normalizeEngine,
  );

  // playground.html always populates the voice list from the *first* known
  // engine even while "default" (blank) is selected in the engine dropdown —
  // mirror that so the voice select isn't empty until the user picks one.
  const voiceEngineId = engine || engines[0]?.id || "";

  const voicesQuery = useQuery({
    queryKey: ["tts-voices", voiceEngineId],
    queryFn: () =>
      apiGet<TtsVoice[] | TtsVoicesResponse>(`/tts/engines/${encodeURIComponent(voiceEngineId)}/voices`),
    enabled: voiceEngineId !== "",
  });
  const voices = (Array.isArray(voicesQuery.data) ? voicesQuery.data : voicesQuery.data?.voices ?? []).map(
    normalizeVoice,
  );

  return (
    <div className="flex gap-3">
      <div className="flex-1 space-y-1">
        <label htmlFor="tts-engine" className="text-xs font-medium text-muted-foreground">
          Engine
        </label>
        <select
          id="tts-engine"
          data-testid="tts-engine-select"
          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          value={engine}
          onChange={(e) => onEngineChange(e.target.value)}
        >
          <option value="">default</option>
          {engines.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 space-y-1">
        <label htmlFor="tts-voice" className="text-xs font-medium text-muted-foreground">
          Voice
        </label>
        <select
          id="tts-voice"
          data-testid="tts-voice-select"
          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          value={voice}
          onChange={(e) => onVoiceChange(e.target.value)}
        >
          <option value="">default</option>
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
