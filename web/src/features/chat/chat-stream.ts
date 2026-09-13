import type { ChatCompletionChunk } from "./types";

/**
 * Reads an OpenAI-compatible SSE chat-completion body and yields each
 * `delta.content` fragment as it arrives.
 *
 * Mirrors playground.html's `sendChat()` reader loop exactly: decode chunks
 * with a streaming `TextDecoder`, split on newlines while keeping the
 * trailing partial line buffered for the next read, ignore any line that
 * isn't prefixed `data:`, stop as soon as the `[DONE]` marker is seen, and
 * silently skip a line that fails to parse as JSON (upstream sometimes
 * emits keep-alive/comment lines).
 */
export async function* streamChatCompletion(
  body: ReadableStream<Uint8Array> | null,
): AsyncGenerator<string, void, unknown> {
  if (!body) {
    return;
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) {
        continue;
      }
      const data = line.slice(5).trim();
      if (data === "[DONE]") {
        return;
      }
      try {
        const chunk = JSON.parse(data) as ChatCompletionChunk;
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) {
          yield delta;
        }
      } catch {
        // Malformed or partial JSON on this line — ignore and keep reading.
      }
    }
  }
}
