import { buildWavFile } from "@/lib/wav";
import type { ChatToolResult } from "./types";

// Assistant replies can embed `<tool>{"name":"tts","args":{...}}</tool>` calls
// per the DEFAULT_CHAT_SETTINGS system prompt — ported from playground.html's
// `hasAgenticToolCall` / `processAgenticTools` (a lightweight text-embedded
// protocol, not the OpenAI `tool_calls` API, since HRM-Text doesn't support that).
const TOOL_TAG_RE = /<tool>([\s\S]*?)<\/tool>/g;

export function hasToolCall(text: string): boolean {
  TOOL_TAG_RE.lastIndex = 0;
  return TOOL_TAG_RE.test(text);
}

/** Remove `<tool>...</tool>` markup so it never renders as visible chat text. */
export function stripToolTags(text: string): string {
  return text.replace(TOOL_TAG_RE, "").trim();
}

interface ParsedToolCall {
  name: string;
  args: Record<string, unknown>;
}

function extractToolCalls(text: string): ParsedToolCall[] {
  const calls: ParsedToolCall[] = [];
  TOOL_TAG_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOOL_TAG_RE.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (parsed && typeof parsed.name === "string") {
        calls.push({ name: parsed.name.toLowerCase(), args: parsed.args ?? {} });
      }
    } catch {
      // malformed tool-call JSON from the model — skip it rather than throw
    }
  }
  return calls;
}

async function runTts(text: string, voice: string | undefined): Promise<ChatToolResult> {
  // TTS engines produce silence/corrupt audio on emoji codepoints.
  const cleanText = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
  if (!cleanText) {
    return { name: "tts", status: "error", summary: "No speakable text after emoji removal." };
  }
  try {
    const res = await fetch("/tts/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: cleanText, voice: voice || "af_heart", speed: 1.0 }),
    });
    if (!res.ok || !res.body) {
      throw new Error(`TTS ${res.status}`);
    }
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const total = chunks.reduce((sum, c) => sum + c.byteLength, 0);
    const pcm = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      pcm.set(chunk, offset);
      offset += chunk.byteLength;
    }
    // The stream has no sample-rate header; 24000/mono mirrors playground.html's
    // same hardcoded assumption for /tts/stream's raw PCM16LE output.
    const wav = buildWavFile(pcm, 24000, 1);
    const audioUrl = URL.createObjectURL(new Blob([wav.buffer as ArrayBuffer], { type: "audio/wav" }));
    return { name: "tts", status: "ok", summary: "Speech ready", audioUrl };
  } catch (err) {
    return { name: "tts", status: "error", summary: err instanceof Error ? err.message : "TTS failed" };
  }
}

// Classify/detect tool calls only make sense with an attached image, which
// the chat panel doesn't yet support — report the same graceful fallback
// playground.html showed when no image was attached, rather than silently
// dropping the call.
function runClassify(): ChatToolResult {
  return { name: "classify", status: "error", summary: "No image attached." };
}

function runDetect(): ChatToolResult {
  return { name: "detect", status: "error", summary: "No image attached." };
}

/** Execute every `<tool>` call embedded in an assistant reply's raw text. */
export async function executeToolCalls(rawText: string): Promise<ChatToolResult[]> {
  const calls = extractToolCalls(rawText);
  const results: ChatToolResult[] = [];
  for (const call of calls) {
    if (call.name === "tts") {
      const args = call.args as { text?: string; voice?: string };
      results.push(await runTts(String(args.text ?? rawText), args.voice));
    } else if (call.name === "classify") {
      results.push(runClassify());
    } else if (call.name === "detect") {
      results.push(runDetect());
    }
  }
  return results;
}
