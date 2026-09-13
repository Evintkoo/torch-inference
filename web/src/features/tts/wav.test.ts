import { describe, expect, it } from "vitest";
import { buildWav } from "./wav";

function readAscii(view: DataView, offset: number, length: number): string {
  let s = "";
  for (let i = 0; i < length; i++) s += String.fromCharCode(view.getUint8(offset + i));
  return s;
}

describe("buildWav", () => {
  it("writes a valid 44-byte RIFF/WAVE header followed by the PCM payload", () => {
    const pcm = new Uint8Array([1, 2, 3, 4, 5, 6]);
    const wav = buildWav(pcm, 24000, 1);
    const view = new DataView(wav);

    expect(wav.byteLength).toBe(44 + pcm.byteLength);
    expect(readAscii(view, 0, 4)).toBe("RIFF");
    expect(view.getUint32(4, true)).toBe(36 + pcm.byteLength);
    expect(readAscii(view, 8, 4)).toBe("WAVE");
    expect(readAscii(view, 12, 4)).toBe("fmt ");
    expect(view.getUint32(16, true)).toBe(16);
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(24000); // sample rate
    expect(view.getUint32(28, true)).toBe(24000 * 1 * 2); // byte rate
    expect(view.getUint16(32, true)).toBe(2); // block align
    expect(view.getUint16(34, true)).toBe(16); // bits per sample
    expect(readAscii(view, 36, 4)).toBe("data");
    expect(view.getUint32(40, true)).toBe(pcm.byteLength);
    expect(new Uint8Array(wav, 44)).toEqual(pcm);
  });

  it("scales byte rate and block align with channel count", () => {
    const pcm = new Uint8Array(8);
    const wav = buildWav(pcm, 22050, 2);
    const view = new DataView(wav);
    expect(view.getUint16(22, true)).toBe(2);
    expect(view.getUint32(28, true)).toBe(22050 * 2 * 2);
    expect(view.getUint16(32, true)).toBe(4);
  });

  it("handles empty PCM data", () => {
    const wav = buildWav(new Uint8Array(0), 24000, 1);
    expect(wav.byteLength).toBe(44);
    const view = new DataView(wav);
    expect(view.getUint32(40, true)).toBe(0);
  });
});
