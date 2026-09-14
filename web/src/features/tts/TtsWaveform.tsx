import { useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { drawWaveformBars, WAVEFORM_CANVAS_CLASS } from "@/components/ui/waveform-canvas";

export interface TtsWaveformProps {
  /** Concatenated mono PCM samples for the last synthesized utterance, or null before anything has played. */
  samples: Float32Array | null;
  /** 0..1 playback position, used to two-tone the bars already played. */
  progress: number;
  playing: boolean;
  onTogglePlay: () => void;
  disabled: boolean;
}

/** Renders `samples` as a static min/max bar waveform (like an audio editor's
 * overview track) and a play/pause button — playground.html had neither; the
 * old "Done (…ms)" status text gave no way to actually hear the result again
 * without re-submitting. Shares its bar-drawing with the live STT waveform
 * (`@/components/ui/live-waveform`) so both read as the same component. */
export function TtsWaveform({ samples, progress, playing, onTogglePlay, disabled }: TtsWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawWaveformBars(canvas, samples ?? new Float32Array(0), progress);
  }, [samples, progress]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        data-testid="tts-waveform-play-btn"
        onClick={onTogglePlay}
        disabled={disabled}
        aria-label={playing ? "Pause" : "Play"}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
      >
        {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
      </button>
      <canvas ref={canvasRef} width={280} height={48} data-testid="tts-waveform" className={WAVEFORM_CANVAS_CLASS} />
    </div>
  );
}
