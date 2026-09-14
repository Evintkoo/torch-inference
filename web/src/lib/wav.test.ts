import { afterEach, describe, expect, it, vi } from "vitest";
import { buildWavFile, recordingToWavFile } from "./wav";

function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

describe("buildWavFile", () => {
  it("writes a valid 44-byte RIFF/WAVE header around the given PCM bytes", () => {
    const pcm = new Uint8Array([1, 2, 3, 4]);
    const wav = buildWavFile(pcm, 16000, 1);
    const view = new DataView(wav.buffer);

    expect(wav.length).toBe(44 + pcm.length);
    expect(String.fromCharCode(...wav.slice(0, 4))).toBe("RIFF");
    expect(String.fromCharCode(...wav.slice(8, 12))).toBe("WAVE");
    expect(String.fromCharCode(...wav.slice(36, 40))).toBe("data");
    expect(view.getUint32(24, true)).toBe(16000); // sample rate
    expect(view.getUint16(22, true)).toBe(1); // channels
    expect(view.getUint16(34, true)).toBe(16); // bits per sample
    expect(view.getUint32(40, true)).toBe(pcm.length); // data chunk size
    expect(wav.slice(44)).toEqual(pcm);
  });
});

describe("recordingToWavFile", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("decodes the recording and re-encodes it as a mono PCM16 WAV file", async () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1, -1]);
    const fakeAudioBuffer = {
      numberOfChannels: 1,
      length: samples.length,
      sampleRate: 22050,
      getChannelData: () => samples,
    };
    class FakeAudioContext {
      decodeAudioData = vi.fn().mockResolvedValue(fakeAudioBuffer);
      close = vi.fn().mockResolvedValue(undefined);
    }
    vi.stubGlobal("AudioContext", FakeAudioContext);

    const blob = { arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)) } as unknown as Blob;
    const file = await recordingToWavFile(blob, "clip.wav");

    expect(file.name).toBe("clip.wav");
    expect(file.type).toBe("audio/wav");
    const bytes = new Uint8Array(await readAsArrayBuffer(file));
    expect(bytes.length).toBe(44 + samples.length * 2);
    const view = new DataView(bytes.buffer);
    expect(view.getUint32(24, true)).toBe(22050);
    // First sample is 0 → PCM16 0; second is 0.5 → ~16383
    expect(view.getInt16(44, true)).toBe(0);
    expect(view.getInt16(46, true)).toBeGreaterThan(16000);
  });
});
