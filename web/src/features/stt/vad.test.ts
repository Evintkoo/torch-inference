import { describe, expect, it } from "vitest";
import {
  VAD_SILENCE_HOLD_MS,
  VAD_SILENCE_RMS,
  VAD_SPEECH_RMS,
  computeRms,
  createVadState,
  resamplePcm,
  vadStep,
} from "./vad";

describe("computeRms", () => {
  it("is 0 for silence", () => {
    expect(computeRms(new Float32Array(256))).toBe(0);
  });

  it("is 0 for an empty frame", () => {
    expect(computeRms(new Float32Array(0))).toBe(0);
  });

  it("computes root-mean-square amplitude", () => {
    // constant amplitude 0.5 → rms is exactly 0.5
    const frame = new Float32Array(100).fill(0.5);
    expect(computeRms(frame)).toBeCloseTo(0.5, 10);
  });
});

describe("resamplePcm", () => {
  it("passes through unchanged (as a copy) when rates match", () => {
    const raw = new Float32Array([0.1, 0.2, 0.3]);
    const out = resamplePcm(raw, 16000, 16000);
    expect(Array.from(out)).toEqual(Array.from(raw));
    expect(out).not.toBe(raw);
  });

  it("downsamples by linear interpolation", () => {
    // 48kHz -> 16kHz is a 3:1 ratio
    const raw = new Float32Array(9).map((_, i) => i / 8); // 0 .. 1 ramp
    const out = resamplePcm(raw, 48000, 16000);
    expect(out.length).toBe(3);
    expect(out[0]).toBeCloseTo(0, 5);
  });
});

describe("vadStep", () => {
  it("stays armed (none) while quiet and not yet speaking", () => {
    const state = createVadState();
    const { state: next, action } = vadStep(state, VAD_SPEECH_RMS - 0.001, 1000);
    expect(action).toBe("none");
    expect(next.speaking).toBe(false);
  });

  it("opens an utterance (onset) once amplitude clears the speech threshold", () => {
    const state = createVadState();
    const { state: next, action } = vadStep(state, VAD_SPEECH_RMS + 0.001, 1000);
    expect(action).toBe("onset");
    expect(next.speaking).toBe(true);
    expect(next.silenceStart).toBeNull();
  });

  it("keeps streaming (continue) while speaking and loud", () => {
    let state = createVadState();
    state = vadStep(state, VAD_SPEECH_RMS + 0.01, 1000).state;
    const { state: next, action } = vadStep(state, VAD_SPEECH_RMS + 0.01, 1256);
    expect(action).toBe("continue");
    expect(next.speaking).toBe(true);
    expect(next.silenceStart).toBeNull();
  });

  it("starts a silence timer (continue) the first quiet frame after speech", () => {
    let state = createVadState();
    state = vadStep(state, VAD_SPEECH_RMS + 0.01, 1000).state;
    const { state: next, action } = vadStep(state, VAD_SILENCE_RMS - 0.001, 1200);
    expect(action).toBe("continue");
    expect(next.speaking).toBe(true);
    expect(next.silenceStart).toBe(1200);
  });

  it("does not finalize before the silence hold elapses", () => {
    let state = createVadState();
    state = vadStep(state, VAD_SPEECH_RMS + 0.01, 0).state;
    state = vadStep(state, VAD_SILENCE_RMS - 0.001, 100).state;
    const { action } = vadStep(state, VAD_SILENCE_RMS - 0.001, 100 + VAD_SILENCE_HOLD_MS - 1);
    expect(action).toBe("continue");
  });

  it("finalizes once sustained silence reaches the hold duration", () => {
    let state = createVadState();
    state = vadStep(state, VAD_SPEECH_RMS + 0.01, 0).state;
    state = vadStep(state, VAD_SILENCE_RMS - 0.001, 100).state;
    const { state: next, action } = vadStep(state, VAD_SILENCE_RMS - 0.001, 100 + VAD_SILENCE_HOLD_MS);
    expect(action).toBe("finalize");
    expect(next.speaking).toBe(false);
    expect(next.silenceStart).toBeNull();
  });

  it("resets the silence timer if speech resumes before the hold elapses", () => {
    let state = createVadState();
    state = vadStep(state, VAD_SPEECH_RMS + 0.01, 0).state;
    state = vadStep(state, VAD_SILENCE_RMS - 0.001, 100).state;
    expect(state.silenceStart).toBe(100);
    const { state: next, action } = vadStep(state, VAD_SPEECH_RMS + 0.01, 150);
    expect(action).toBe("continue");
    expect(next.silenceStart).toBeNull();
  });

  it("re-arms for the next utterance after finalizing", () => {
    let state = createVadState();
    state = vadStep(state, VAD_SPEECH_RMS + 0.01, 0).state;
    state = vadStep(state, VAD_SILENCE_RMS - 0.001, 100).state;
    state = vadStep(state, VAD_SILENCE_RMS - 0.001, 100 + VAD_SILENCE_HOLD_MS).state;
    const { action } = vadStep(state, VAD_SPEECH_RMS + 0.01, 5000);
    expect(action).toBe("onset");
  });
});
