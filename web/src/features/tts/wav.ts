/**
 * Wrap raw PCM16-LE samples in a minimal 44-byte WAV (RIFF/WAVE) header.
 * Ported 1:1 from playground.html's `buildWav()` — `/tts/stream` returns
 * headerless PCM16-LE audio, and the browser `<audio>` element needs a
 * container format to play it back.
 */
export function buildWav(pcm: Uint8Array, sampleRate: number, channels: number): ArrayBuffer {
  const len = pcm.byteLength;
  const buf = new ArrayBuffer(44 + len);
  const view = new DataView(buf);

  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset + i, s.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + len, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * 2, true); // byte rate
  view.setUint16(32, channels * 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, len, true);

  new Uint8Array(buf, 44).set(pcm);
  return buf;
}
