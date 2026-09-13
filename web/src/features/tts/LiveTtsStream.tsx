import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocketStream } from "@/lib/ws-client";
import { EngineVoiceSelect } from "./EngineVoiceSelect";
import type { TtsWsMessage } from "./types";

const DEFAULT_SAMPLE_RATE = 24000;

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext ?? null;
}

/**
 * Text-to-speech: one form (engine/voice + text + speed), one Speak button.
 * Streams low-latency PCM over `GET /audio/ws` and schedules it onto a Web
 * Audio graph as it arrives — playback starts before the full utterance has
 * even finished synthesising. The connection is managed automatically (no
 * manual "Connect" step); this used to be two separate panels (a duplex WS
 * "Live Stream" card and a REST "one-shot" card offering the same "speak
 * this text" outcome through two different transports) — merged into one,
 * keeping the lower-latency streaming path.
 */
export function LiveTtsStream() {
  const [text, setText] = useState("");
  const [engine, setEngine] = useState("");
  const [voice, setVoice] = useState("");
  const [speed, setSpeed] = useState(1.0);
  const [status, setStatus] = useState("—");
  const [speaking, setSpeaking] = useState(false);
  const [durationMs, setDurationMs] = useState<number | null>(null);

  const sampleRateRef = useRef(DEFAULT_SAMPLE_RATE);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextPlayAtRef = useRef(0);

  const ensureAudioCtx = () => {
    const Ctor = getAudioContextCtor();
    if (!Ctor) return null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") return audioCtxRef.current;
    const ctx = new Ctor();
    audioCtxRef.current = ctx;
    nextPlayAtRef.current = 0;
    return ctx;
  };

  const scheduleChunk = (payload: ArrayBuffer | Blob) => {
    if (!(payload instanceof ArrayBuffer)) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const f32 = new Float32Array(payload);
    if (!f32.length) return;
    const buf = ctx.createBuffer(1, f32.length, sampleRateRef.current);
    buf.copyToChannel(f32, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    const now = ctx.currentTime;
    const start = Math.max(now + 0.05, nextPlayAtRef.current);
    src.start(start);
    nextPlayAtRef.current = start + buf.duration;
  };

  // Connects automatically on mount — no manual "Connect" step.
  const { data, connected, error, send } = useWebSocketStream<TtsWsMessage>("/audio/ws", {
    enabled: true,
    onBinaryMessage: scheduleChunk,
  });

  useEffect(() => {
    if (!data) return;
    switch (data.type) {
      case "ready":
        setStatus((s) => (s === "—" ? "Ready" : s));
        break;
      case "tts_meta":
        sampleRateRef.current = data.sample_rate ?? DEFAULT_SAMPLE_RATE;
        setStatus(`Streaming ${data.sample_rate ?? "?"} Hz ${data.encoding ?? "pcm_f32le"}…`);
        nextPlayAtRef.current = 0;
        ensureAudioCtx();
        break;
      case "tts_done":
        setStatus(`Done (${data.duration_ms ?? 0} ms)`);
        setDurationMs(data.duration_ms ?? null);
        setSpeaking(false);
        break;
      case "error":
        setStatus(`Error: ${data.msg ?? "unknown"}`);
        setSpeaking(false);
        break;
      default:
        break;
      // "transcript" belongs to the STT panel's own /audio/ws connection and
      // never arrives on this one, since this component never sends a mic
      // recording message.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(
    () => () => {
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    },
    [],
  );

  function speak() {
    const trimmed = text.trim();
    if (!trimmed) {
      setStatus("Enter text first");
      return;
    }
    send(JSON.stringify({ type: "tts", text: trimmed, voice: voice || engine || undefined, speed: speed || 1.0 }));
    setStatus("Synthesising…");
    setSpeaking(true);
    setDurationMs(null);
    ensureAudioCtx();
    nextPlayAtRef.current = 0;
  }

  function stop() {
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setStatus("Stopped");
    setSpeaking(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Speak</CardTitle>
            <CardDescription>
              Low-latency streaming synthesis via <code>GET /audio/ws</code>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span
              data-testid="tts-ws-status-dot"
              className={`inline-block h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
              aria-hidden="true"
              title={connected ? "connected" : "connecting…"}
            />
            <span data-testid="tts-ws-status-label" className="text-xs text-muted-foreground">
              {connected ? "connected" : "connecting…"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="ws-tts-text" className="text-xs font-medium text-muted-foreground">
              Text to speak
            </label>
            <textarea
              id="ws-tts-text"
              data-testid="tts-ws-text-input"
              rows={4}
              className="w-full resize-y rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              placeholder="Enter text…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[240px] flex-1">
              <EngineVoiceSelect engine={engine} voice={voice} onEngineChange={setEngine} onVoiceChange={setVoice} />
            </div>
            <div className="w-24 space-y-1">
              <label htmlFor="ws-tts-speed" className="text-xs font-medium text-muted-foreground">
                Speed
              </label>
              <input
                id="ws-tts-speed"
                data-testid="tts-ws-speed-input"
                type="number"
                min={0.25}
                max={4.0}
                step={0.05}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value) || 1.0)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button data-testid="tts-ws-speak-btn" onClick={speak} disabled={!connected || !text.trim()}>
              Speak
            </Button>
            <Button variant="ghost" data-testid="tts-ws-stop-btn" onClick={stop} disabled={!speaking}>
              Stop
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Status</div>
          <p data-testid="tts-ws-status" className="text-sm text-muted-foreground">
            {status}
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {durationMs !== null && (
            <p data-testid="tts-ws-duration" className="text-xs text-muted-foreground">
              Duration: {durationMs} ms
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
