import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mic, Square, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/api-client";
import { useWebSocketStream } from "@/lib/ws-client";
import {
  TARGET_SAMPLE_RATE,
  computeRms,
  createVadState,
  resamplePcm,
  vadStep,
  type VadState,
} from "./vad";
import type { AudioHealthResponse, WsServerMessage } from "./types";

const PROCESSOR_BUFFER_SIZE = 4096;
const WS_CONNECT_TIMEOUT_MS = 5000;
const WS_CONNECT_POLL_MS = 200;

interface LiveUiState {
  recording: boolean;
  stopPending: boolean;
  label: string;
  error: string | null;
  transcripts: string[];
}

/** Mutable session bookkeeping mirroring playground.html's wsRecording/wsSpeaking/etc globals. */
interface Session {
  recording: boolean;
  stopPending: boolean;
  vad: VadState;
  stream: MediaStream | null;
  ctx: AudioContext | null;
  proc: ScriptProcessorNode | null;
  analyser: AnalyserNode | null;
  deviceRate: number;
  stopTimer: ReturnType<typeof setTimeout> | null;
}

function newSession(): Session {
  return {
    recording: false,
    stopPending: false,
    vad: createVadState(),
    stream: null,
    ctx: null,
    proc: null,
    analyser: null,
    deviceRate: TARGET_SAMPLE_RATE,
    stopTimer: null,
  };
}

/**
 * "Live STT Stream" — bidirectional WebSocket audio transcription over `GET /audio/ws`
 * (see src/api/ws_audio.rs). Ported from playground.html's `wsSttStart`/`wsSttStop` /
 * `wsSttTeardown` (commit fc22201 added the VAD auto-segmentation preserved here): press
 * Record, speech is detected automatically via RMS thresholds (see ./vad.ts), each phrase
 * is streamed and transcribed on its own, and the panel keeps listening for the next one.
 */
export function LiveSttStream() {
  const [enabled, setEnabled] = useState(false);
  const [ui, setUi] = useState<LiveUiState>({
    recording: false,
    stopPending: false,
    label: "idle",
    error: null,
    transcripts: [],
  });

  const { data: health, isPending: healthPending, isError: healthError } = useQuery({
    queryKey: ["stt-health"],
    queryFn: () => apiGet<AudioHealthResponse>("/stt/health"),
    refetchInterval: 15_000,
    retry: false,
  });
  const modelAvailable = (health?.models_available ?? []).some((m) => m.startsWith("STT:"));

  const ws = useWebSocketStream<WsServerMessage>("/audio/ws", {
    enabled,
    binaryType: "arraybuffer",
  });

  const sessionRef = useRef<Session>(newSession());
  const connectedRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    connectedRef.current = ws.connected;
  }, [ws.connected]);

  const setLabel = useCallback((label: string) => {
    setUi((prev) => (prev.label === label ? prev : { ...prev, label }));
  }, []);

  const stopDraw = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const teardown = useCallback(() => {
    const s = sessionRef.current;
    if (s.stopTimer) {
      clearTimeout(s.stopTimer);
      s.stopTimer = null;
    }
    s.stopPending = false;
    s.recording = false;
    s.vad = createVadState();
    if (s.stream) {
      s.stream.getTracks().forEach((t) => t.stop());
      s.stream = null;
    }
    if (s.proc) {
      s.proc.disconnect();
      s.proc.onaudioprocess = null;
      s.proc = null;
    }
    if (s.ctx) {
      s.ctx.close().catch(() => {});
      s.ctx = null;
    }
    s.analyser = null;
    stopDraw();
    setEnabled(false);
    setUi((prev) => ({ ...prev, recording: false, stopPending: false, label: "idle" }));
  }, [stopDraw]);

  // Server pushed a transcript or error frame.
  useEffect(() => {
    const msg = ws.data;
    if (!msg) return;
    const s = sessionRef.current;
    if (msg.type === "transcript") {
      setUi((prev) => ({ ...prev, transcripts: [...prev.transcripts, msg.text || "(empty)"] }));
      if (s.stopPending) {
        teardown();
      } else if (s.recording) {
        setLabel("listening…");
      }
    } else if (msg.type === "error") {
      const wasActive = s.recording || s.stopPending;
      if (wasActive) {
        teardown();
        setUi((prev) => ({ ...prev, error: `STT error: ${msg.msg || "unknown"}` }));
      }
    }
  }, [ws.data, teardown, setLabel]);

  // The socket dropped out from under an active/pending session — nothing more will
  // arrive, so tear down instead of waiting on the 4s stop-fallback timer for nothing.
  useEffect(() => {
    if (!ws.connected && (sessionRef.current.recording || sessionRef.current.stopPending)) {
      teardown();
    }
  }, [ws.connected, teardown]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = sessionRef.current.analyser;
    if (!canvas || !analyser) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const w = canvas.width;
    const h = canvas.height;

    const tick = () => {
      if (!sessionRef.current.analyser) return;
      analyser.getByteTimeDomainData(data);
      ctx2d.clearRect(0, 0, w, h);
      ctx2d.lineWidth = 1.5;
      ctx2d.strokeStyle = "currentColor";
      ctx2d.beginPath();
      const step = w / data.length;
      let x = 0;
      for (let i = 0; i < data.length; i++, x += step) {
        const y = (data[i] / 128.0) * (h / 2);
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
      }
      ctx2d.stroke();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const ensureConnected = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (connectedRef.current) {
        resolve(true);
        return;
      }
      setEnabled(true);
      let tries = 0;
      const iv = setInterval(() => {
        if (connectedRef.current) {
          clearInterval(iv);
          resolve(true);
        } else if (++tries * WS_CONNECT_POLL_MS > WS_CONNECT_TIMEOUT_MS) {
          clearInterval(iv);
          resolve(false);
        }
      }, WS_CONNECT_POLL_MS);
    });
  }, []);

  const startListening = useCallback(async () => {
    if (!window.isSecureContext || !navigator.mediaDevices) {
      setUi((prev) => ({
        ...prev,
        error: "Microphone access requires a secure context (https:// or localhost).",
      }));
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 }, video: false });
    } catch (err) {
      setUi((prev) => ({ ...prev, error: `Microphone error: ${(err as Error).message}` }));
      return;
    }

    const s = sessionRef.current;
    s.stream = stream;
    s.vad = createVadState();
    s.recording = true;

    const AudioCtxCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtxCtor({ sampleRate: TARGET_SAMPLE_RATE });
    s.deviceRate = ctx.sampleRate;

    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);

    const proc = ctx.createScriptProcessor(PROCESSOR_BUFFER_SIZE, 1, 1);
    proc.onaudioprocess = (e: AudioProcessingEvent) => {
      if (!sessionRef.current.recording) return;
      const raw = e.inputBuffer.getChannelData(0);
      const rms = computeRms(raw);
      const now = performance.now();
      const { state: nextVad, action } = vadStep(sessionRef.current.vad, rms, now);
      sessionRef.current.vad = nextVad;

      if (action === "none") {
        setLabel("listening…");
        return;
      }

      if (action === "onset") {
        ws.send(JSON.stringify({ type: "stt_begin", sample_rate: TARGET_SAMPLE_RATE }));
        setLabel("speech detected");
      }

      const pcm =
        sessionRef.current.deviceRate === TARGET_SAMPLE_RATE
          ? raw.slice()
          : resamplePcm(raw, sessionRef.current.deviceRate, TARGET_SAMPLE_RATE);
      ws.send(pcm.buffer as ArrayBuffer);

      if (action === "finalize") {
        ws.send(JSON.stringify({ type: "stt_end" }));
        setLabel("transcribing…");
      } else if (rms >= 0) {
        // "continue" while still above the silence threshold: keep the speaking label.
        if (nextVad.silenceStart === null) setLabel("speech detected");
      }
    };
    src.connect(proc);
    proc.connect(ctx.destination);

    s.ctx = ctx;
    s.proc = proc;
    s.analyser = analyser;

    setUi((prev) => ({ ...prev, recording: true, stopPending: false, label: "listening…", transcripts: [], error: null }));
    drawWaveform();
  }, [drawWaveform, setLabel, ws]);

  const stopListening = useCallback(() => {
    const s = sessionRef.current;
    if (!s.recording && !s.stopPending) return;

    s.recording = false;

    if (s.vad.speaking) {
      s.vad = { ...s.vad, speaking: false, silenceStart: null };
      s.stopPending = true;
      ws.send(JSON.stringify({ type: "stt_end" }));
      setLabel("transcribing…");
      setUi((prev) => ({ ...prev, recording: false, stopPending: true }));
      if (s.stopTimer) clearTimeout(s.stopTimer);
      s.stopTimer = setTimeout(() => teardown(), 4000);
    } else {
      s.stopPending = false;
      teardown();
    }
  }, [ws, setLabel, teardown]);

  const handleRecordClick = useCallback(async () => {
    const s = sessionRef.current;
    if (s.recording || s.stopPending) {
      stopListening();
      return;
    }
    if (!modelAvailable) {
      setUi((prev) => ({
        ...prev,
        error: "STT model not loaded. Download a Whisper model from the Models page and restart the server.",
      }));
      return;
    }
    setUi((prev) => ({ ...prev, error: null }));
    const ok = await ensureConnected();
    if (!ok) {
      setUi((prev) => ({ ...prev, error: "Could not connect to audio WebSocket." }));
      return;
    }
    await startListening();
  }, [modelAvailable, ensureConnected, startListening, stopListening]);

  useEffect(() => () => teardown(), [teardown]);

  const modelStatusLabel = healthPending
    ? "Checking STT model…"
    : modelAvailable
      ? "STT model loaded ✓"
      : healthError
        ? "Server unreachable"
        : "STT model not loaded — download a Whisper model from the Models page";

  const isActive = ui.recording || ui.stopPending;
  const recordDisabled = !isActive && (!modelAvailable || healthPending);

  return (
    <Card data-testid="live-stt-stream">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wifi className="size-4 text-primary" aria-hidden="true" />
              Live STT Stream
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Low-latency duplex audio via <code className="text-[11px]">GET /audio/ws</code>
            </p>
          </div>
          <span
            data-testid="stt-ws-status-dot"
            className={cn("size-2.5 rounded-full", ws.connected ? "bg-emerald-500" : "bg-muted-foreground/40")}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <span
          data-testid="stt-model-status"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px]",
            modelAvailable ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground",
          )}
        >
          {modelStatusLabel}
        </span>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Press Record to start listening. Speech is detected automatically — each phrase is streamed and
              transcribed on its own, and the panel keeps listening for the next one. Press Stop to end the session.
            </p>
            <div className="flex items-center gap-2">
              <Button
                data-testid="stt-record-button"
                type="button"
                disabled={recordDisabled}
                onClick={handleRecordClick}
              >
                {isActive ? (
                  <>
                    <Square className="size-4" aria-hidden="true" /> Stop
                  </>
                ) : (
                  <>
                    <Mic className="size-4" aria-hidden="true" /> Record
                  </>
                )}
              </Button>
              <span
                data-testid="stt-vad-dot"
                className={cn(
                  "size-2 rounded-full",
                  ui.label === "speech detected"
                    ? "bg-red-500"
                    : ui.label === "transcribing…"
                      ? "bg-emerald-500"
                      : ui.label === "listening…"
                        ? "bg-amber-500"
                        : "bg-muted-foreground/40",
                )}
              />
              <span className="text-xs text-muted-foreground" data-testid="stt-vad-label">
                {ui.label}
              </span>
            </div>
            {ui.error && (
              <p className="text-xs text-destructive" data-testid="stt-live-error">
                {ui.error}
              </p>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Mic waveform</p>
            <canvas
              ref={canvasRef}
              width={320}
              height={80}
              className="w-full rounded-md border bg-background"
              data-testid="stt-waveform"
            />
            <p className="mt-3 mb-1 text-xs font-medium text-muted-foreground">Transcript</p>
            <div
              className="min-h-[60px] space-y-1 rounded-md border bg-muted/30 p-2 text-sm"
              data-testid="stt-transcript"
            >
              {ui.transcripts.length === 0
                ? "Transcript appears here."
                : ui.transcripts.map((t, i) => <div key={i}>{t}</div>)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
