import type { ChatSettings } from "./types";

const fieldClass =
  "rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground";

export function ChatSettingsPanel({
  settings,
  onChange,
}: {
  settings: ChatSettings;
  onChange: (next: ChatSettings) => void;
}) {
  return (
    <div
      className="flex flex-wrap gap-4 rounded-md border border-border bg-card p-3"
      data-testid="chat-settings-panel"
    >
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-muted-foreground">Model</span>
        <input
          type="text"
          value={settings.model}
          onChange={(e) => onChange({ ...settings, model: e.target.value })}
          placeholder="model name"
          className={`w-48 ${fieldClass}`}
          data-testid="chat-model-input"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-muted-foreground">Temperature</span>
        <input
          type="number"
          min={0}
          max={2}
          step={0.05}
          value={settings.temperature}
          onChange={(e) => onChange({ ...settings, temperature: Number(e.target.value) })}
          className={`w-24 ${fieldClass}`}
          data-testid="chat-temperature-input"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-muted-foreground">Max tokens</span>
        <input
          type="number"
          min={64}
          max={8192}
          step={64}
          value={settings.maxTokens}
          onChange={(e) => onChange({ ...settings, maxTokens: Number(e.target.value) })}
          className={`w-24 ${fieldClass}`}
          data-testid="chat-max-tokens-input"
        />
      </label>
      <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-xs">
        <span className="text-muted-foreground">System prompt</span>
        <textarea
          rows={2}
          value={settings.systemPrompt}
          onChange={(e) => onChange({ ...settings, systemPrompt: e.target.value })}
          className={`resize-y ${fieldClass}`}
          data-testid="chat-system-prompt-input"
        />
      </label>
    </div>
  );
}
