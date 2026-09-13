import { describe, expect, it } from "vitest";
import { streamChatCompletion } from "./chat-stream";

function sseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i < chunks.length) {
        controller.enqueue(encoder.encode(chunks[i]));
        i += 1;
      } else {
        controller.close();
      }
    },
  });
}

async function collect(body: ReadableStream<Uint8Array> | null): Promise<string[]> {
  const out: string[] = [];
  for await (const delta of streamChatCompletion(body)) {
    out.push(delta);
  }
  return out;
}

describe("streamChatCompletion", () => {
  it("yields each delta.content fragment in arrival order", async () => {
    const stream = sseStream([
      'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"lo"}}]}\n\n',
      "data: [DONE]\n\n",
    ]);
    expect(await collect(stream)).toEqual(["Hel", "lo"]);
  });

  it("handles a chunk boundary landing mid-line by buffering the partial line", async () => {
    const stream = sseStream([
      'data: {"choices":[{"delta"',
      ':{"content":"Hi"}}]}\n\n',
      "data: [DONE]\n\n",
    ]);
    expect(await collect(stream)).toEqual(["Hi"]);
  });

  it("stops at the [DONE] marker and ignores anything streamed after it", async () => {
    const stream = sseStream([
      'data: {"choices":[{"delta":{"content":"A"}}]}\n\n',
      "data: [DONE]\n\n",
      'data: {"choices":[{"delta":{"content":"B"}}]}\n\n',
    ]);
    expect(await collect(stream)).toEqual(["A"]);
  });

  it("skips lines that are not JSON instead of throwing", async () => {
    const stream = sseStream([
      "data: not-json\n\n",
      'data: {"choices":[{"delta":{"content":"ok"}}]}\n\n',
      "data: [DONE]\n\n",
    ]);
    expect(await collect(stream)).toEqual(["ok"]);
  });

  it("skips non-data lines (e.g. blank keep-alive lines)", async () => {
    const stream = sseStream([
      "\n",
      'data: {"choices":[{"delta":{"content":"ok"}}]}\n\n',
      "data: [DONE]\n\n",
    ]);
    expect(await collect(stream)).toEqual(["ok"]);
  });

  it("yields nothing and returns when body is null", async () => {
    expect(await collect(null)).toEqual([]);
  });

  it("yields nothing when the stream ends without a [DONE] marker or content", async () => {
    const stream = sseStream([]);
    expect(await collect(stream)).toEqual([]);
  });
});
