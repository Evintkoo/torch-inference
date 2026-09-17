import { afterEach, describe, expect, it, vi } from "vitest";
import { apiGet, apiPost, apiPostForm, apiPostStream, ApiError } from "./api-client";

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }),
  );
}

describe("apiGet", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("returns parsed JSON on 200", async () => {
    mockFetchOnce(200, { ok: true });
    const result = await apiGet<{ ok: boolean }>("/system/info");
    expect(result).toEqual({ ok: true });
  });

  it("does not send an Authorization header", async () => {
    mockFetchOnce(200, {});
    await apiGet("/system/info");
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = call[1].headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it("throws ApiError with status and body on non-2xx", async () => {
    mockFetchOnce(503, { error: "unhealthy" });
    await expect(apiGet("/health")).rejects.toMatchObject({
      name: "ApiError",
      status: 503,
      body: { error: "unhealthy" },
    } satisfies Partial<ApiError>);
  });
});

describe("apiPost", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("sends JSON body with Content-Type header and returns parsed response", async () => {
    mockFetchOnce(200, { accepted: true });
    const result = await apiPost<{ accepted: boolean }>("/predict", { x: 1 });
    expect(result).toEqual({ accepted: true });
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].method).toBe("POST");
    expect(call[1].body).toBe(JSON.stringify({ x: 1 }));
    expect((call[1].headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });
});

describe("apiPostForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("sends the FormData body as-is without a Content-Type header", async () => {
    mockFetchOnce(200, { text: "hi" });
    const form = new FormData();
    form.append("audio", new Blob(["x"]), "clip.wav");
    const result = await apiPostForm<{ text: string }>("/audio/transcribe", form);
    expect(result).toEqual({ text: "hi" });
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].method).toBe("POST");
    expect(call[1].body).toBe(form);
    expect((call[1].headers as Record<string, string>)["Content-Type"]).toBeUndefined();
  });

  it("throws ApiError with status and body on non-2xx", async () => {
    mockFetchOnce(400, { error: "bad audio" });
    await expect(apiPostForm("/audio/transcribe", new FormData())).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      body: { error: "bad audio" },
    } satisfies Partial<ApiError>);
  });
});

describe("apiPostStream", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("returns the raw Response instead of parsing JSON, defaulting to text/event-stream Accept", async () => {
    const body = { fake: "readable-stream" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, body }),
    );
    const res = await apiPostStream("/tts/stream", { text: "hi" });
    expect(res.body).toBe(body);
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].method).toBe("POST");
    expect(call[1].body).toBe(JSON.stringify({ text: "hi" }));
    expect((call[1].headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    expect((call[1].headers as Record<string, string>).Accept).toBe("text/event-stream");
  });

  it("honors an overridden Accept header for a binary stream", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, body: null }));
    await apiPostStream("/tts/stream", { text: "hi" }, { accept: "*/*" });
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((call[1].headers as Record<string, string>).Accept).toBe("*/*");
  });

  it("forwards an AbortSignal to fetch", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, body: null }));
    const controller = new AbortController();
    await apiPostStream("/tts/stream", { text: "hi" }, { signal: controller.signal });
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].signal).toBe(controller.signal);
  });

  it("throws ApiError with status and body on non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: "No TTS engine available" }) }),
    );
    await expect(apiPostStream("/tts/stream", { text: "hi" })).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
      body: { error: "No TTS engine available" },
    } satisfies Partial<ApiError>);
  });
});
