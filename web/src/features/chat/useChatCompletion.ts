import { useCallback, useState } from "react";
import { ApiError, apiPostStream } from "@/lib/api-client";
import { executeToolCalls, hasToolCall, stripToolTags } from "./agentic-tools";
import { streamChatCompletion } from "./chat-stream";
import { DEFAULT_CHAT_SETTINGS, type ChatMessage, type ChatSettings } from "./types";

const CHAT_COMPLETIONS_PATH = "/llm/v1/chat/completions";

let nextMessageId = 0;
function makeId(prefix: string): string {
  nextMessageId += 1;
  return `${prefix}-${nextMessageId}`;
}

export interface UseChatCompletion {
  messages: ChatMessage[];
  settings: ChatSettings;
  setSettings: (settings: ChatSettings) => void;
  streaming: boolean;
  error: string | null;
  send: (text: string) => Promise<void>;
  clear: () => void;
}

/**
 * Drives the assistant panel: holds message history + request settings,
 * POSTs to the OpenAI-compatible chat-completions proxy with `stream: true`,
 * and applies each decoded token to the in-progress assistant message as it
 * arrives — the React equivalent of playground.html's `sendChat()`.
 */
export function useChatCompletion(): UseChatCompletion {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_CHAT_SETTINGS);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) {
        return;
      }

      setError(null);
      const userMessage: ChatMessage = { id: makeId("user"), role: "user", content: trimmed };
      const priorHistory = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));

      const assistantId = makeId("assistant");
      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setStreaming(true);

      const payloadMessages: Array<{ role: ChatMessage["role"]; content: string }> = [];
      const systemPrompt = settings.systemPrompt.trim();
      if (systemPrompt) {
        payloadMessages.push({ role: "system", content: systemPrompt });
      }
      payloadMessages.push(...priorHistory, { role: "user", content: trimmed });

      try {
        const res = await apiPostStream(CHAT_COMPLETIONS_PATH, {
          model: settings.model.trim() || DEFAULT_CHAT_SETTINGS.model,
          messages: payloadMessages,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          stream: true,
        });

        let accumulated = "";
        for await (const delta of streamChatCompletion(res.body)) {
          accumulated += delta;
          const snapshot = accumulated;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: snapshot } : m)),
          );
        }

        if (hasToolCall(accumulated)) {
          const toolResults = await executeToolCalls(accumulated);
          const displayed = stripToolTags(accumulated);
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: displayed, toolResults } : m)),
          );
        }
      } catch (e) {
        const message =
          e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Unknown error";
        setError(message);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: `Error: ${message}` } : m)),
        );
      } finally {
        setStreaming(false);
      }
    },
    [messages, settings, streaming],
  );

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, settings, setSettings, streaming, error, send, clear };
}
