export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

/** One SSE chunk from the OpenAI-compatible `/llm/v1/chat/completions` stream. */
export interface ChatCompletionChunk {
  choices?: Array<{ delta?: { content?: string } }>;
}

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  model: "smolvlm-256m",
  temperature: 0.7,
  maxTokens: 1024,
  systemPrompt: "",
};
