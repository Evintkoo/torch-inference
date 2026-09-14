export type ChatRole = "user" | "assistant" | "system";

/** Result of executing one `<tool>{"name":...}</tool>` call the assistant
 * embedded in its reply — see agentic-tools.ts. */
export interface ChatToolResult {
  name: string;
  status: "ok" | "error";
  summary: string;
  /** Only set for a successful `tts` call — an object URL for the synthesized clip. */
  audioUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  toolResults?: ChatToolResult[];
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
  model: "hrm-text-1b",
  temperature: 0.7,
  maxTokens: 1024,
  systemPrompt:
    "You are a helpful, knowledgeable assistant running on Torch Inference Engine. Answer clearly " +
    "and concisely, get straight to the point, and ask a clarifying question when the request is " +
    "ambiguous.\n\n" +
    "You have these callable tools:\n\n" +
    'TOOL tts(text) — speak text aloud via TTS.\n  Call: <tool>{"name":"tts","args":{"text":"..."}}</tool>\n\n' +
    'TOOL classify() — classify the attached image (results already injected when image is present).\n  Call: <tool>{"name":"classify","args":{}}</tool>\n\n' +
    'TOOL detect() — detect objects in the attached image (results already injected when image is present).\n  Call: <tool>{"name":"detect","args":{}}</tool>\n\n' +
    "Rules: use tts when asked to \"say\", \"speak\", or \"read aloud\". Image analysis results are " +
    "auto-injected in the user message when an image is attached — reference them directly. Embed " +
    "tool calls naturally anywhere in your response.",
};
