/**
 * Voice-activity detection for the Live STT Stream panel, ported 1:1 from the
 * RMS-threshold auto-segmentation in `src/api/playground.html` (`wsSttStart`'s
 * `onaudioprocess` handler — see commit fc22201). Kept as pure functions,
 * independent of Web Audio / the DOM, so the segmentation behavior itself is
 * unit-testable without mocking `AudioContext`.
 *
 * An utterance opens once amplitude clears `VAD_SPEECH_RMS` and closes once
 * amplitude has stayed below `VAD_SILENCE_RMS` for `VAD_SILENCE_HOLD_MS`
 * continuously — the caller then re-arms and listens for the next one.
 */

export const TARGET_SAMPLE_RATE = 16000;
export const VAD_SPEECH_RMS = 0.018;
export const VAD_SILENCE_RMS = 0.012;
export const VAD_SILENCE_HOLD_MS = 250;

export interface VadState {
  /** True while an utterance is open (stt_begin sent, no stt_end yet). */
  speaking: boolean;
  /** performance.now() when trailing silence began, or null. */
  silenceStart: number | null;
}

export function createVadState(): VadState {
  return { speaking: false, silenceStart: null };
}

/**
 * What the caller should do with the current audio frame:
 * - "none": still armed, below the speech threshold — do not send PCM.
 * - "onset": speech just started — send `stt_begin`, then this frame's PCM.
 * - "continue": mid-utterance — send this frame's PCM.
 * - "finalize": sustained silence elapsed — send this frame's PCM, then `stt_end`.
 */
export type VadAction = "none" | "onset" | "continue" | "finalize";

export function vadStep(state: VadState, rms: number, now: number): { state: VadState; action: VadAction } {
  if (!state.speaking) {
    if (rms < VAD_SPEECH_RMS) {
      return { state, action: "none" };
    }
    return { state: { speaking: true, silenceStart: null }, action: "onset" };
  }

  if (rms < VAD_SILENCE_RMS) {
    if (state.silenceStart === null) {
      return { state: { ...state, silenceStart: now }, action: "continue" };
    }
    if (now - state.silenceStart >= VAD_SILENCE_HOLD_MS) {
      return { state: { speaking: false, silenceStart: null }, action: "finalize" };
    }
    return { state, action: "continue" };
  }

  return { state: { ...state, silenceStart: null }, action: "continue" };
}

/** Root-mean-square amplitude of a PCM frame, roughly 0..1 for normalized samples. */
export function computeRms(samples: Float32Array | ArrayLike<number>): number {
  let sumSq = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i];
    sumSq += v * v;
  }
  return samples.length ? Math.sqrt(sumSq / samples.length) : 0;
}

/** Linear-interpolation resample, matching the exact algorithm in playground.html. */
export function resamplePcm(raw: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) {
    return raw.slice();
  }
  const ratio = fromRate / toRate;
  const outLen = Math.round(raw.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, raw.length - 1);
    const frac = pos - lo;
    out[i] = raw[lo] * (1 - frac) + raw[hi] * frac;
  }
  return out;
}
