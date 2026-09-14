import { useQuery } from "@tanstack/react-query";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select";
import { apiGet } from "@/lib/api-client";
import type { ChatSettings } from "./types";

interface LlmModelsResponse {
  data?: Array<{ id: string; multimodal?: boolean }>;
}

const fieldClass =
  "rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function ChatSettingsPanel({
  settings,
  onChange,
  onClose,
}: {
  settings: ChatSettings;
  onChange: (next: ChatSettings) => void;
  onClose: () => void;
}) {
  // Sourced from the LLM microservice itself (proxied) rather than hardcoded,
  // so the picker never drifts from what's actually loaded server-side.
  const modelsQuery = useQuery({
    queryKey: ["llm-models"],
    queryFn: () => apiGet<LlmModelsResponse>("/llm/v1/models"),
    staleTime: 60_000,
  });
  const availableModels = modelsQuery.data?.data ?? [];
  // Keep whatever is currently selected in the list even if the live model
  // list hasn't loaded yet (or no longer includes it) so the trigger never
  // renders blank.
  const modelOptions: SearchableSelectOption[] = availableModels.some((m) => m.id === settings.model)
    ? availableModels.map((m) => ({
        value: m.id,
        label: m.id,
        badge: m.multimodal ? "multimodal" : undefined,
      }))
    : [
        { value: settings.model, label: settings.model },
        ...availableModels.map((m) => ({
          value: m.id,
          label: m.id,
          badge: m.multimodal ? "multimodal" : undefined,
        })),
      ];

  return (
    <>
      {/* Backdrop — click to dismiss, matches the drawer pattern used elsewhere. */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        data-testid="chat-settings-backdrop"
        aria-hidden="true"
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[90vw] flex-col gap-4 overflow-y-auto border-l border-border bg-card p-5 shadow-[-2px_0_20px_rgba(0,0,0,0.1)]"
        data-testid="chat-settings-panel"
        role="dialog"
        aria-label="Assistant settings"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close settings"
            data-testid="chat-settings-close"
          >
            <i className="ri-close-line text-lg" aria-hidden="true" />
          </button>
        </div>

        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">Model</span>
          <SearchableSelect
            value={settings.model}
            onValueChange={(model) => onChange({ ...settings, model })}
            options={modelOptions}
            triggerTestId="chat-model-input"
            searchPlaceholder="Search models…"
            emptyText="No models found."
          />
        </label>
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Temperature</span>
            <input
              type="number"
              min={0}
              max={2}
              step={0.05}
              value={settings.temperature}
              onChange={(e) => onChange({ ...settings, temperature: Number(e.target.value) })}
              className={fieldClass}
              data-testid="chat-temperature-input"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Max tokens</span>
            <input
              type="number"
              min={64}
              max={8192}
              step={64}
              value={settings.maxTokens}
              onChange={(e) => onChange({ ...settings, maxTokens: Number(e.target.value) })}
              className={fieldClass}
              data-testid="chat-max-tokens-input"
            />
          </label>
        </div>
        <label className="flex flex-1 flex-col gap-1 text-xs">
          <span className="text-muted-foreground">System prompt</span>
          <textarea
            rows={6}
            value={settings.systemPrompt}
            onChange={(e) => onChange({ ...settings, systemPrompt: e.target.value })}
            className={`resize-y ${fieldClass}`}
            data-testid="chat-system-prompt-input"
          />
        </label>
      </aside>
    </>
  );
}
