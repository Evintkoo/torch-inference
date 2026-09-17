import { useCallback, useEffect, useRef, useState } from "react";
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

  // Tracks whether the component using this hook is still mounted, so a
  // response that keeps streaming after the Chat tab is switched away from
  // (Radix `TabsContent` unmounts inactive panels — see MetricsStreamContext.tsx
  // for the same issue elsewhere) doesn't call setState on an unmounted
  // component. The in-flight request itself is also aborted on unmount so
  // the browser/server stop doing pointless work for a reply nobody will see.
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  // Object URLs handed back by the `tts` tool (see agentic-tools.ts) — these
  // are never revoked automatically, so track every one created and release
  // them on `clear()`/unmount rather than leaking a blob per TTS tool call.
  const audioUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      audioUrlsRef.current.clear();
    };
  }, []);

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

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await apiPostStream(
          CHAT_COMPLETIONS_PATH,
          {
            model: settings.model.trim() || DEFAULT_CHAT_SETTINGS.model,
            messages: payloadMessages,
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            stream: true,
          },
          { signal: controller.signal },
        );

        let accumulated = "";
        for await (const delta of streamChatCompletion(res.body)) {
          accumulated += delta;
          const snapshot = accumulated;
          if (!mountedRef.current) return;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: snapshot } : m)),
          );
        }

        if (hasToolCall(accumulated)) {
          const toolResults = await executeToolCalls(accumulated);
          if (!mountedRef.current) {
            // Nobody can see these anymore — release the blobs immediately
            // instead of leaving them for the (already-run) unmount cleanup.
            toolResults.forEach((r) => r.audioUrl && URL.revokeObjectURL(r.audioUrl));
            return;
          }
          toolResults.forEach((r) => r.audioUrl && audioUrlsRef.current.add(r.audioUrl));
          const displayed = stripToolTags(accumulated);
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: displayed, toolResults } : m)),
          );
        }
      } catch (e) {
        if (controller.signal.aborted) {
          // Unmounted mid-stream — nothing left to surface an error to.
          return;
        }
        const message =
          e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Unknown error";
        if (!mountedRef.current) return;
        setError(message);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: `Error: ${message}` } : m)),
        );
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        if (mountedRef.current) {
          setStreaming(false);
        }
      }
    },
    [messages, settings, streaming],
  );

  const clear = useCallback(() => {
    audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    audioUrlsRef.current.clear();
    setMessages([]);
    setError(null);
  }, []);

  return { messages, settings, setSettings, streaming, error, send, clear };
}
