/**
 * Shared min/max bar-waveform renderer — used by both the static TTS
 * waveform (`TtsWaveform.tsx`, draws a finished utterance once) and the live
 * STT waveform (`live-waveform.tsx`, redraws every animation frame from the
 * mic). Keeping this in one place is what makes the two look like the same
 * component family rather than two independently-drawn waveforms.
 */
export function drawWaveformBars(canvas: HTMLCanvasElement, samples: Float32Array, progress: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  if (!samples || samples.length === 0) {
    return;
  }

  const style = getComputedStyle(canvas);
  const playedColor = style.getPropertyValue("--color-foreground").trim() || "#000";
  const unplayedColor = style.getPropertyValue("--color-border2").trim() || "#ccc";

  const barCount = Math.min(120, width);
  const samplesPerBar = Math.max(1, Math.floor(samples.length / barCount));
  const mid = height / 2;
  const barGap = 1;
  const barWidth = Math.max(1, width / barCount - barGap);

  for (let i = 0; i < barCount; i++) {
    let min = 0;
    let max = 0;
    const start = i * samplesPerBar;
    const end = Math.min(start + samplesPerBar, samples.length);
    for (let j = start; j < end; j++) {
      const v = samples[j];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const barHeight = Math.max(1, (max - min) * mid * 0.95);
    const y = mid - Math.max(max * mid * 0.95, barHeight / 2);
    ctx.fillStyle = i / barCount <= progress ? playedColor : unplayedColor;
    ctx.fillRect(i * (barWidth + barGap), y, barWidth, barHeight);
  }
}

/** Same canvas sizing/border/background every waveform in the app uses. */
export const WAVEFORM_CANVAS_CLASS = "h-12 flex-1 rounded-md border border-border bg-background";
