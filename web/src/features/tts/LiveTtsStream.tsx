import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocketStream } from "@/lib/ws-client";
import type { TtsWsMessage } from "./types";

const DEFAULT_SAMPLE_RATE = 24000;

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext ?? null;
}

/**
 * Duplex "Live TTS Stream" panel, ported from playground.html's
 * wsAudioConnect()/wsTtsSpeak() — connects to `GET /audio/ws`, sends
 * `{type:"tts",...}` and schedules the binary PCM f32le frames that come
 * back onto a Web Audio graph as they arrive.
 */
export function LiveTtsStream() {
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState("");
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

  const { data, connected, error, send, close } = useWebSocketStream<TtsWsMessage>("/audio/ws", {
    enabled,
    onBinaryMessage: scheduleChunk,
  });

  useEffect(() => {
    if (!data) return;
    switch (data.type) {
      case "ready":
        setStatus("Connected — ready");
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

  function toggleConnection() {
    if (connected) {
      close();
      setEnabled(false);
      setStatus("Disconnected");
      setSpeaking(false);
    } else {
      setStatus("Connecting…");
      setEnabled(true);
    }
  }

  function speak() {
    const trimmed = text.trim();
    if (!trimmed) {
      setStatus("Enter text first");
      return;
    }
    send(JSON.stringify({ type: "tts", text: trimmed, voice: voice || undefined, speed: speed || 1.0 }));
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
            <CardTitle>Live TTS Stream</CardTitle>
            <CardDescription>
              Low-latency duplex audio via <code>GET /audio/ws</code>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span
              data-testid="tts-ws-status-dot"
              className={`inline-block h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
              aria-hidden="true"
            />
            <span data-testid="tts-ws-status-label" className="text-xs text-muted-foreground">
              {connected ? "connected" : "disconnected"}
            </span>
            <Button size="sm" variant="outline" data-testid="tts-ws-connect-btn" onClick={toggleConnection}>
              {connected ? "Disconnect" : "Connect"}
            </Button>
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
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label htmlFor="ws-tts-voice" className="text-xs font-medium text-muted-foreground">
                Voice / Engine
              </label>
              <input
                id="ws-tts-voice"
                data-testid="tts-ws-voice-input"
                type="text"
                placeholder="af_heart (or blank for default)"
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
              />
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
