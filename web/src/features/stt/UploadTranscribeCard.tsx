import { useCallback, useRef, useState } from "react";
import { FileMusic, Mic2, Square, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { apiPostForm, ApiError } from "@/lib/api-client";
import type { TranscribeResponse } from "./types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

/**
 * File-upload transcription — `POST /audio/transcribe` (multipart: `audio`, `timestamps`),
 * ported from playground.html's `runAudio()`/`handleAudioFile()`/`toggleAudioRecord()`.
 */
export function UploadTranscribeCard() {
  const [file, setFile] = useState<File | null>(null);
  const [timestamps, setTimestamps] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [result, setResult] = useState<TranscribeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [recording, setRecording] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const transcribe = useCallback(async (toTranscribe: File, withTimestamps: boolean) => {
    setTranscribing(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("audio", toTranscribe);
      form.append("timestamps", withTimestamps ? "true" : "false");
      const data = await apiPostForm<TranscribeResponse>("/audio/transcribe", form);
      setResult(data);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? String((err.body as { error?: string; message?: string } | null)?.error ?? err.message)
          : (err as Error).message;
      setError(message);
      setResult(null);
    } finally {
      setTranscribing(false);
    }
  }, []);

  const handleFile = useCallback((f: File | undefined | null) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragOver(false);
      handleFile(e.dataTransfer?.files?.[0]);
    },
    [handleFile],
  );

  const runTranscribe = useCallback(() => {
    if (!file) return;
    void transcribe(file, timestamps);
  }, [file, timestamps, transcribe]);

  const toggleRecord = useCallback(async () => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
      return;
    }
    if (!window.isSecureContext || !navigator.mediaDevices) {
      setError("Microphone access requires a secure context (https:// or localhost).");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || "audio/webm" });
        const recorded = new File([blob], "recording.webm", { type: blob.type });
        handleFile(recorded);
        void transcribe(recorded, timestamps);
      };
      recorder.start(200);
      recorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      setError(`Microphone error: ${(err as Error).message}`);
    }
  }, [handleFile, transcribe, timestamps]);

  return (
    <Card data-testid="upload-transcribe-card">
      <CardHeader>
        <CardTitle className="text-base">Input</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label
          data-testid="audio-dropzone"
          htmlFor="stt-audio-file"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-1 rounded-md border border-dashed p-6 text-center text-sm transition-colors",
            dragOver || file ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          <UploadCloud className="size-5 text-muted-foreground" aria-hidden="true" />
          <span>Click to upload or drag &amp; drop</span>
          <span className="text-xs text-muted-foreground">WAV · MP3 · OGG · FLAC · M4A</span>
          <input
            id="stt-audio-file"
            type="file"
            accept="audio/*"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
        {file && (
          <p className="text-xs text-muted-foreground" data-testid="audio-file-name">
            {file.name} ({formatBytes(file.size)})
          </p>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={timestamps}
            onChange={(e) => setTimestamps(e.target.checked)}
            data-testid="audio-timestamps-checkbox"
          />
          Include timestamps
        </label>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            data-testid="audio-transcribe-button"
            disabled={!file || transcribing}
            onClick={runTranscribe}
          >
            <FileMusic className="size-4" aria-hidden="true" />
            {transcribing ? "Transcribing…" : "Transcribe"}
          </Button>
          <Button type="button" variant="ghost" data-testid="audio-record-button" onClick={() => void toggleRecord()}>
            {recording ? (
              <>
                <Square className="size-4" aria-hidden="true" /> Stop
              </>
            ) : (
              <>
                <Mic2 className="size-4" aria-hidden="true" /> Record
              </>
            )}
          </Button>
        </div>

        <div className="min-h-[80px] rounded-md border bg-muted/30 p-2 text-sm" data-testid="audio-result-text">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : transcribing ? (
            "Transcribing…"
          ) : result ? (
            result.text || "(empty)"
          ) : (
            "Upload a file to transcribe."
          )}
        </div>

        {result && (result.language || result.confidence != null) && (
          <p className="text-xs text-muted-foreground" data-testid="audio-meta">
            {result.language ? `Language: ${result.language}` : null}
            {result.language && result.confidence != null ? " · " : null}
            {result.confidence != null ? `Confidence: ${(result.confidence * 100).toFixed(1)}%` : null}
          </p>
        )}

        {result?.segments && result.segments.length > 0 && (
          <div data-testid="audio-segments">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Segments</p>
            <div className="space-y-1">
              {result.segments.map((seg, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-primary">
                    {seg.start.toFixed(2)}s–{seg.end.toFixed(2)}s
                  </span>
                  <span>{seg.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
