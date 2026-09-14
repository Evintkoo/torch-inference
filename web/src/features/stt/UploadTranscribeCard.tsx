import { useCallback, useEffect, useRef, useState } from "react";
import { FileMusic, Mic, Square, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LiveWaveform } from "@/components/ui/live-waveform";
import { cn } from "@/lib/utils";
import { apiPostForm, ApiError } from "@/lib/api-client";
import { recordingToWavFile } from "@/lib/wav";
import type { TranscribeResponse } from "./types";

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext ?? null;
}

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
  const [recordError, setRecordError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Tears down the live-waveform audio graph — used on recorder.onstop AND
  // on unmount, so a stray open mic stream/AudioContext can't outlive the
  // recording (mirrors the cleanup rigor in LiveTtsStream.tsx / use-camera-capture.ts).
  const stopLiveWaveform = useCallback(() => {
    micSourceRef.current?.disconnect();
    micSourceRef.current = null;
    void audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setAnalyser(null);
  }, []);

  useEffect(() => stopLiveWaveform, [stopLiveWaveform]);

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
    setRecordError(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setRecordError("Microphone access requires a secure context (https:// or localhost).");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };

      // Live waveform: tapped straight off the raw mic stream (not the
      // recorder's compressed output) so it reacts in real time. Never
      // connected to ctx.destination — that would route the mic to the
      // speakers and echo the user back to themselves.
      const Ctor = getAudioContextCtor();
      if (Ctor) {
        const ctx = new Ctor();
        // Some browsers (notably Safari) still create a new AudioContext in
        // "suspended" state even from within a user-gesture handler — no
        // processing happens, so the analyser silently reads all-zero data
        // (flat line) even while the mic stream itself has real audio (the
        // MediaRecorder side, tapped separately, keeps working fine, which is
        // what made this look like a rendering bug rather than a stalled
        // graph). Explicitly resuming is a no-op if it was already running.
        void ctx.resume().catch(() => {});
        const source = ctx.createMediaStreamSource(stream);
        const node = ctx.createAnalyser();
        node.fftSize = 2048;
        source.connect(node);
        audioCtxRef.current = ctx;
        micSourceRef.current = source;
        setAnalyser(node);
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        stopLiveWaveform();
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || "audio/webm" });
        try {
          // MediaRecorder's webm/opus output isn't a format the backend's
          // decoder recognizes (wav/mp3/flac/ogg only) — transcode client-side.
          const wavFile = await recordingToWavFile(blob);
          handleFile(wavFile);
          void transcribe(wavFile, timestamps);
        } catch (err) {
          setRecordError(err instanceof Error ? err.message : "Failed to process recording");
        }
      };
      recorder.start(200);
      setRecording(true);
    } catch (err) {
      setRecordError(err instanceof Error ? err.message : "Microphone error");
    }
  }, [handleFile, timestamps, transcribe, stopLiveWaveform]);

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

        <label htmlFor="audio-timestamps" className="flex items-center gap-2 text-sm">
          <Checkbox
            id="audio-timestamps"
            checked={timestamps}
            onCheckedChange={(checked) => setTimestamps(checked === true)}
            data-testid="audio-timestamps-checkbox"
          />
          Include timestamps
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            data-testid="audio-transcribe-button"
            disabled={!file || transcribing}
            onClick={runTranscribe}
          >
            <FileMusic className="size-4" aria-hidden="true" />
            {transcribing ? "Transcribing…" : "Transcribe"}
          </Button>
          <Button
            type="button"
            variant={recording ? "destructive" : "outline"}
            data-testid="audio-record-button"
            disabled={transcribing}
            onClick={toggleRecord}
          >
            {recording ? <Square className="size-4" aria-hidden="true" /> : <Mic className="size-4" aria-hidden="true" />}
            {recording ? "Stop" : "Record"}
          </Button>
        </div>
        {recording && (
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive animate-pulse" aria-hidden="true" />
            <LiveWaveform analyser={analyser} active={recording} data-testid="audio-live-waveform" />
          </div>
        )}
        {recordError && (
          <p className="text-xs text-destructive" data-testid="audio-record-error">
            {recordError}
          </p>
        )}

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
