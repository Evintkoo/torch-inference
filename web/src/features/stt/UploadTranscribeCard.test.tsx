import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UploadTranscribeCard } from "./UploadTranscribeCard";
import type { TranscribeResponse } from "./types";

function makeFile(name = "clip.wav", type = "audio/wav") {
  return new File(["fake-audio-bytes"], name, { type });
}

describe("UploadTranscribeCard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the empty placeholder and a disabled Transcribe button before a file is chosen", () => {
    render(<UploadTranscribeCard />);
    expect(screen.getByTestId("audio-result-text")).toHaveTextContent(/upload a file to transcribe/i);
    expect(screen.getByTestId("audio-transcribe-button")).toBeDisabled();
  });

  it("enables Transcribe and shows the file name once a file is selected", () => {
    render(<UploadTranscribeCard />);
    const input = document.getElementById("stt-audio-file") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile()] } });

    expect(screen.getByTestId("audio-file-name")).toHaveTextContent("clip.wav");
    expect(screen.getByTestId("audio-transcribe-button")).toBeEnabled();
  });

  it("posts the file as multipart form data to /audio/transcribe and renders the result", async () => {
    const response: TranscribeResponse = {
      text: "hello world",
      language: "en",
      confidence: 0.92,
      segments: [{ text: "hello world", start: 0, end: 1.2, confidence: 0.92 }],
    };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => response });
    vi.stubGlobal("fetch", fetchMock);

    render(<UploadTranscribeCard />);
    const input = document.getElementById("stt-audio-file") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile()] } });
    fireEvent.click(screen.getByTestId("audio-transcribe-button"));

    await waitFor(() => expect(screen.getByTestId("audio-result-text")).toHaveTextContent("hello world"));

    const [path, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(path).toBe("/audio/transcribe");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("audio")).toBeInstanceOf(File);
    expect((init.body as FormData).get("timestamps")).toBe("false");

    expect(screen.getByTestId("audio-meta")).toHaveTextContent(/language: en/i);
    expect(screen.getByTestId("audio-segments")).toHaveTextContent("hello world");
  });

  it("shows an error message when transcription fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: "bad audio" }) }),
    );

    render(<UploadTranscribeCard />);
    const input = document.getElementById("stt-audio-file") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile()] } });
    fireEvent.click(screen.getByTestId("audio-transcribe-button"));

    await waitFor(() => expect(screen.getByTestId("audio-result-text")).toHaveTextContent("bad audio"));
  });

  it("sends timestamps=true once the checkbox is checked", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ text: "ok", language: null, confidence: 1, segments: null }) satisfies TranscribeResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<UploadTranscribeCard />);
    const input = document.getElementById("stt-audio-file") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile()] } });
    fireEvent.click(screen.getByTestId("audio-timestamps-checkbox"));
    fireEvent.click(screen.getByTestId("audio-transcribe-button"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.body as FormData).get("timestamps")).toBe("true");
  });
});
