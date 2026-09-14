import { useEffect, useRef } from "react";
import { drawWaveformBars, WAVEFORM_CANVAS_CLASS } from "./waveform-canvas";

export interface LiveWaveformProps {
  /** The analyser tapping a live audio source (e.g. the mic during recording); null/`active=false` clears the canvas. */
  analyser: AnalyserNode | null;
  active: boolean;
  className?: string;
  "data-testid"?: string;
}

/**
 * Same bar-waveform look as `TtsWaveform`, but redrawn every animation frame
 * from a live `AnalyserNode` instead of a static, already-known sample
 * array — a real-time meter (reacts as you speak) rather than a scrubbable
 * recording of a finished utterance.
 */
export function LiveWaveform({ analyser, active, className, ...rest }: LiveWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || !analyser) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const byteData = new Uint8Array(analyser.fftSize);
    const floatData = new Float32Array(analyser.fftSize);

    const tick = () => {
      analyser.getByteTimeDomainData(byteData);
      // Centered byte samples (128 == silence) -> -1..1 float range, same
      // domain drawWaveformBars expects for PCM samples.
      for (let i = 0; i < byteData.length; i++) {
        floatData[i] = (byteData[i] - 128) / 128;
      }
      const canvas = canvasRef.current;
      if (canvas) drawWaveformBars(canvas, floatData, 0);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [active, analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={48}
      className={className ?? WAVEFORM_CANVAS_CLASS}
      {...rest}
    />
  );
}
