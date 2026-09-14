/** Build a WAV file's bytes around raw little-endian PCM16 sample bytes. */
export function buildWavFile(pcm16le: Uint8Array, sampleRate: number, channels: number): Uint8Array {
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + pcm16le.length);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + pcm16le.length, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeStr(36, "data");
  view.setUint32(40, pcm16le.length, true);
  new Uint8Array(buffer, 44).set(pcm16le);
  return new Uint8Array(buffer);
}

/**
 * Decode a recorded clip (MediaRecorder's webm/opus output, which the
 * backend's decoder doesn't recognize — only WAV/MP3/FLAC/OGG) via the Web
 * Audio API and re-encode it as a mono PCM16 WAV `File` the backend accepts.
 */
export async function recordingToWavFile(blob: Blob, name = "recording.wav"): Promise<File> {
  const AudioContextCtor =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioContextCtor();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const frames = audioBuffer.length;
    // Downmix to mono — the STT backend doesn't need stereo, and it halves upload size.
    const mono = new Float32Array(frames);
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const data = audioBuffer.getChannelData(ch);
      for (let i = 0; i < frames; i++) mono[i] += data[i] / audioBuffer.numberOfChannels;
    }
    const pcm = new Uint8Array(frames * 2);
    const view = new DataView(pcm.buffer);
    for (let i = 0; i < frames; i++) {
      const s = Math.max(-1, Math.min(1, mono[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const wav = buildWavFile(pcm, audioBuffer.sampleRate, 1);
    return new File([wav.buffer as ArrayBuffer], name, { type: "audio/wav" });
  } finally {
    void ctx.close();
  }
}
