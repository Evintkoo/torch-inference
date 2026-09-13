import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatComposer } from "./ChatComposer";
import { ChatMessageList } from "./ChatMessageList";
import { ChatSettingsPanel } from "./ChatSettingsPanel";
import { useChatCompletion } from "./useChatCompletion";

export function ChatPanel() {
  const { messages, settings, setSettings, streaming, error, send, clear } = useChatCompletion();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex h-[70vh] flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Assistant</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-expanded={settingsOpen}
            data-testid="chat-settings-toggle"
          >
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={messages.length === 0}
            data-testid="chat-new-btn"
          >
            New chat
          </Button>
        </div>
      </div>

      {settingsOpen && (
        <ChatSettingsPanel settings={settings} onChange={setSettings} onClose={() => setSettingsOpen(false)} />
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert" data-testid="chat-error">
          {error}
        </p>
      )}

      <ChatMessageList messages={messages} streaming={streaming} />
      <ChatComposer onSend={send} disabled={streaming} />
    </div>
  );
}
