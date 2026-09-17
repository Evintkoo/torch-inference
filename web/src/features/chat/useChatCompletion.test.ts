import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useChatCompletion } from "./useChatCompletion";

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

describe("useChatCompletion", () => {
  afterEach(() => {
    // Unmount before restoring globals — the hook's own unmount cleanup
    // revokes any outstanding tool-result object URLs via URL.revokeObjectURL,
    // which needs the stub still in place (real jsdom doesn't implement it).
    cleanup();
    vi.unstubAllGlobals();
  });

  it("appends the user message, then streams the assistant reply token by token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: sseStream([
          'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n',
          'data: {"choices":[{"delta":{"content":" there"}}]}\n\n',
          "data: [DONE]\n\n",
        ]),
      }),
    );

    const { result } = renderHook(() => useChatCompletion());

    await act(async () => {
      await result.current.send("hello");
    });

    await waitFor(() => expect(result.current.messages.at(-1)?.content).toBe("Hi there"));
    expect(result.current.messages[0]).toMatchObject({ role: "user", content: "hello" });
    expect(result.current.streaming).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sends prior history plus a system prompt (when set) alongside the new message", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, body: sseStream(["data: [DONE]\n\n"]) });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useChatCompletion());
    act(() => {
      result.current.setSettings({ ...result.current.settings, systemPrompt: "Be terse." });
    });
    await act(async () => {
      await result.current.send("first");
    });
    await act(async () => {
      await result.current.send("second");
    });

    const secondCallBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(secondCallBody.messages[0]).toEqual({ role: "system", content: "Be terse." });
    expect(secondCallBody.messages.at(-1)).toEqual({ role: "user", content: "second" });
    // prior user+assistant turn is carried along as history
    expect(secondCallBody.messages.some((m: { content: string }) => m.content === "first")).toBe(
      true,
    );
  });

  it("surfaces a request error on the assistant bubble instead of throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: "LLM is still loading" }),
      }),
    );

    const { result } = renderHook(() => useChatCompletion());
    await act(async () => {
      await result.current.send("hello");
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.messages.at(-1)?.content).toMatch(/error/i);
    expect(result.current.streaming).toBe(false);
  });

  it("ignores blank input and never calls fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useChatCompletion());
    await act(async () => {
      await result.current.send("   ");
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  it("executes an embedded tool call, strips the tag, and attaches the result", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).includes("/tts/stream")) {
          return {
            ok: true,
            status: 200,
            body: new ReadableStream<Uint8Array>({
              start(controller) {
                controller.enqueue(new Uint8Array([9, 9]));
                controller.close();
              },
            }),
          };
        }
        return {
          ok: true,
          status: 200,
          body: sseStream([
            'data: {"choices":[{"delta":{"content":"Sure — "}}]}\n\n',
            'data: {"choices":[{"delta":{"content":"<tool>{\\"name\\":\\"tts\\",\\"args\\":{\\"text\\":\\"hi\\"}}</tool>"}}]}\n\n',
            "data: [DONE]\n\n",
          ]),
        };
      }),
    );
    vi.stubGlobal("URL", { ...URL, createObjectURL: vi.fn(() => "blob:mock"), revokeObjectURL: vi.fn() });

    const { result } = renderHook(() => useChatCompletion());
    await act(async () => {
      await result.current.send("say hi");
    });

    await waitFor(() => expect(result.current.messages.at(-1)?.toolResults).toBeTruthy());
    const assistant = result.current.messages.at(-1);
    expect(assistant?.content).toBe("Sure —");
    expect(assistant?.toolResults).toEqual([
      { name: "tts", status: "ok", summary: "Speech ready", audioUrl: "blob:mock" },
    ]);
  });

  it("clear() resets history and error state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, body: sseStream(["data: [DONE]\n\n"]) }),
    );
    const { result } = renderHook(() => useChatCompletion());
    await act(async () => {
      await result.current.send("hi");
    });
    expect(result.current.messages.length).toBeGreaterThan(0);

    act(() => result.current.clear());
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });
});
