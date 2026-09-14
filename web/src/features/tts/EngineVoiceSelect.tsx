import { useQuery } from "@tanstack/react-query";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select";
import { apiGet } from "@/lib/api-client";
import type { TtsEngine, TtsEnginesResponse, TtsVoice, TtsVoicesResponse } from "./types";

// Radix Select.Item forbids an empty-string value, so "default" (i.e. no
// explicit engine/voice picked) is represented by this sentinel on the wire
// between the dropdown and the empty-string values the rest of the app uses.
const DEFAULT_VALUE = "__default__";

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
 * Engine + voice dropdown pair for the REST TTS form, backed by
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

  // Every engine the backend returns from GET /tts/engines is, by construction,
  // one that finished loading at startup (engines whose model files are
  // missing are skipped and never registered) — so "Loaded" is an accurate
  // status tag, not a guess.
  const engineOptions: SearchableSelectOption[] = [
    { value: DEFAULT_VALUE, label: "default" },
    ...engines.map((e) => ({ value: e.id, label: e.label, badge: "Loaded" })),
  ];
  const voiceOptions: SearchableSelectOption[] = [
    { value: DEFAULT_VALUE, label: "default" },
    ...voices.map((v) => ({ value: v.id, label: v.label })),
  ];

  return (
    <div className="flex gap-3">
      <div className="flex-1 space-y-1">
        <label htmlFor="tts-engine" className="text-xs font-medium text-muted-foreground">
          Engine
        </label>
        <SearchableSelect
          id="tts-engine"
          value={engine || DEFAULT_VALUE}
          onValueChange={(v) => onEngineChange(v === DEFAULT_VALUE ? "" : v)}
          options={engineOptions}
          triggerTestId="tts-engine-select"
          searchPlaceholder="Search engines…"
        />
      </div>
      <div className="flex-1 space-y-1">
        <label htmlFor="tts-voice" className="text-xs font-medium text-muted-foreground">
          Voice
        </label>
        <SearchableSelect
          id="tts-voice"
          value={voice || DEFAULT_VALUE}
          onValueChange={(v) => onVoiceChange(v === DEFAULT_VALUE ? "" : v)}
          options={voiceOptions}
          triggerTestId="tts-voice-select"
          searchPlaceholder="Search voices…"
        />
      </div>
    </div>
  );
}
