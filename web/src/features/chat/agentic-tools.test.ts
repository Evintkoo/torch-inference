import { afterEach, describe, expect, it, vi } from "vitest";
import { executeToolCalls, hasToolCall, stripToolTags } from "./agentic-tools";

describe("hasToolCall / stripToolTags", () => {
  it("detects a tool tag and strips it from displayed text", () => {
    const text = 'Sure — <tool>{"name":"tts","args":{"text":"hi"}}</tool> done.';
    expect(hasToolCall(text)).toBe(true);
    expect(stripToolTags(text)).toBe("Sure —  done.");
  });

  it("reports no tool call for plain text", () => {
    expect(hasToolCall("just a normal reply")).toBe(false);
    expect(stripToolTags("just a normal reply")).toBe("just a normal reply");
  });
});

describe("executeToolCalls", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("runs a tts call and returns a playable audio result", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new Uint8Array([1, 2, 3, 4]));
            controller.close();
          },
        }),
      }),
    );
    vi.stubGlobal("URL", { ...URL, createObjectURL: vi.fn(() => "blob:mock") });

    const results = await executeToolCalls('<tool>{"name":"tts","args":{"text":"hello"}}</tool>');
    expect(results).toEqual([{ name: "tts", status: "ok", summary: "Speech ready", audioUrl: "blob:mock" }]);
  });

  it("reports a tts error when the endpoint fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const results = await executeToolCalls('<tool>{"name":"tts","args":{"text":"hello"}}</tool>');
    expect(results).toEqual([{ name: "tts", status: "error", summary: "TTS 500" }]);
  });

  it("reports classify/detect as unavailable without an attached image", async () => {
    const results = await executeToolCalls(
      '<tool>{"name":"classify","args":{}}</tool><tool>{"name":"detect","args":{}}</tool>',
    );
    expect(results).toEqual([
      { name: "classify", status: "error", summary: "No image attached." },
      { name: "detect", status: "error", summary: "No image attached." },
    ]);
  });

  it("ignores malformed tool-call JSON instead of throwing", async () => {
    const results = await executeToolCalls("<tool>not json</tool>");
    expect(results).toEqual([]);
  });

  it("returns an empty array when there are no tool calls", async () => {
    expect(await executeToolCalls("just text")).toEqual([]);
  });
});
