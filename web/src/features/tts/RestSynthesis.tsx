import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, apiPostStream } from "@/lib/api-client";
import { EngineVoiceSelect } from "./EngineVoiceSelect";
import { buildWav } from "./wav";

// /tts/stream always returns headerless PCM16-LE at 24kHz mono, regardless
// of the source engine's native rate — matches playground.html's runTTS(),
// which hardcodes the same value when building the WAV container.
const STREAM_SAMPLE_RATE = 24000;

type StatusVariant = "idle" | "stream" | "ok" | "error";

export function RestSynthesis() {
  const [text, setText] = useState("");
  const [engine, setEngine] = useState("");
  const [voice, setVoice] = useState("");
  const [speed, setSpeed] = useState(1.0);
  const [status, setStatus] = useState("—");
  const [statusVariant, setStatusVariant] = useState<StatusVariant>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    },
    [],
  );

  async function runSynthesis() {
    const trimmed = text.trim();
    if (!trimmed) return;

    setBusy(true);
    setStatus("Connecting to /tts/stream…");
    setStatusVariant("stream");

    const controller = new AbortController();
    abortRef.current = controller;
    const chunks: Uint8Array[] = [];

    try {
      const body: Record<string, unknown> = { text: trimmed, speed };
      if (engine) body.engine = engine;
      if (voice) body.voice = voice;

      const resp = await apiPostStream("/tts/stream", body, controller.signal);
      const reader = resp.body?.getReader();
      if (!reader) throw new Error("Streaming is not supported by this response");

      let received = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.byteLength;
          setStatus(`Received ${received} bytes (${chunks.length} chunks)…`);
        }
      }

      const total = chunks.reduce((sum, c) => sum + c.byteLength, 0);
      if (total === 0) {
        setStatus("No audio received — engine may not be loaded.");
        setStatusVariant("error");
        return;
      }
      const pcm = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        pcm.set(chunk, offset);
        offset += chunk.byteLength;
      }

      const wav = buildWav(pcm, STREAM_SAMPLE_RATE, 1);
      // Revoke the previous blob URL before allocating a new one — repeated
      // Synthesise clicks would otherwise leak one Blob URL per call.
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      const url = URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
      audioUrlRef.current = url;
      setAudioUrl(url);
      setStatus(`Done — ${total} bytes, ${chunks.length} chunks. Playing.`);
      setStatusVariant("ok");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("Stopped.");
        setStatusVariant("idle");
      } else if (err instanceof ApiError && /no tts engine available/i.test(JSON.stringify(err.body))) {
        setStatus("No TTS engine loaded. Download a Kokoro TTS model from Models → Download.");
        setStatusVariant("error");
      } else {
        setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
        setStatusVariant("error");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>REST Synthesis</CardTitle>
        <CardDescription>
          One-shot synthesis via <code>POST /tts/stream</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="tts-text" className="text-xs font-medium text-muted-foreground">
            Text
          </label>
          <textarea
            id="tts-text"
            data-testid="tts-text-input"
            rows={4}
            className="w-full resize-y rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            placeholder="Enter text to synthesise…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <EngineVoiceSelect engine={engine} voice={voice} onEngineChange={setEngine} onVoiceChange={setVoice} />
          </div>
          <div className="w-24 space-y-1">
            <label htmlFor="tts-speed" className="text-xs font-medium text-muted-foreground">
              Speed
            </label>
            <input
              id="tts-speed"
              data-testid="tts-speed-input"
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
          <Button data-testid="tts-synthesize-btn" onClick={runSynthesis} disabled={busy || !text.trim()}>
            Synthesise
          </Button>
        </div>
        <p data-testid="tts-status" data-variant={statusVariant} className="text-sm text-muted-foreground">
          {status}
        </p>
        {audioUrl && (
          <div data-testid="tts-audio-wrap">
            <audio ref={audioRef} data-testid="tts-audio" controls autoPlay className="w-full" src={audioUrl} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
