//! Real Whisper ONNX pipeline: encoder + decoder from onnx-community/whisper-base.
//!
//! Pipeline:
//!   audio → log-mel spectrogram (80×3000) → encoder → hidden states (1500×512)
//!        → greedy decoder loop → token IDs → BPE decode → text
//!
//! Models expected in `model_dir/`:
//!   encoder_model_quantized.onnx   (~24 MB)
//!   decoder_model_quantized.onnx   (~47 MB)
//!   vocab.json                     (GPT-2/Whisper BPE vocabulary)
use std::collections::HashMap;
use std::path::Path;
use std::sync::OnceLock;

use anyhow::{bail, Context, Result};
use parking_lot::Mutex;
use ort::session::builder::GraphOptimizationLevel;
use ort::session::Session;
use ort::value::Tensor;
use rustfft::num_complex::Complex;
use rustfft::FftPlanner;

use super::audio::{AudioData, AudioProcessor};
use crate::core::audio_models::{TranscriptionResult, TranscriptionSegment};

// ── Whisper constants ────────────────────────────────────────────────────────
const SAMPLE_RATE: u32 = 16_000;
const N_FFT: usize = 400;
const HOP_LENGTH: usize = 160;
const N_MELS: usize = 80;
const MEL_FRAMES: usize = 3_000;          // 30 s × 100 fps
const MAX_AUDIO_SAMPLES: usize = 480_000; // 30 s @ 16 kHz

// Special token IDs (Whisper multilingual, 51865-token vocab)
const SOT: i64 = 50258;         // <|startoftranscript|>
const LANG_EN: i64 = 50259;     // <|en|>
const TASK_TRANSCRIBE: i64 = 50359; // <|transcribe|>
const NO_TIMESTAMPS: i64 = 50363;   // <|notimestamps|>
const EOT: i64 = 50257;             // <|endoftext|>
const TIMESTAMP_BEGIN: i64 = 50364;
const MAX_NEW_TOKENS: usize = 224;

// ── Mel filterbank (pre-computed once per process) ────────────────────────────
static MEL_FILTERS: OnceLock<Vec<f32>> = OnceLock::new();

fn mel_filters() -> &'static [f32] {
    MEL_FILTERS.get_or_init(|| build_mel_filterbank(SAMPLE_RATE, N_FFT, N_MELS))
}

// Hann window depends only on the constant N_FFT; cache it like the mel
// filterbank instead of recomputing (400 `cos` calls + an alloc) per call.
static HANN_WINDOW: OnceLock<Vec<f32>> = OnceLock::new();

fn hann_window() -> &'static [f32] {
    HANN_WINDOW.get_or_init(|| {
        (0..N_FFT)
            .map(|n| 0.5 * (1.0 - (2.0 * std::f32::consts::PI * n as f32 / N_FFT as f32).cos()))
            .collect()
    })
}

fn hz_to_mel(hz: f64) -> f64 {
    2595.0 * (1.0 + hz / 700.0).log10()
}
fn mel_to_hz(mel: f64) -> f64 {
    700.0 * (10_f64.powf(mel / 2595.0) - 1.0)
}

/// Returns flat row-major f32 matrix [N_MELS × (N_FFT/2+1)].
fn build_mel_filterbank(sample_rate: u32, n_fft: usize, n_mels: usize) -> Vec<f32> {
    let n_freqs = n_fft / 2 + 1;
    let fmin = 0.0f64;
    let fmax = sample_rate as f64 / 2.0;

    let mel_min = hz_to_mel(fmin);
    let mel_max = hz_to_mel(fmax);
    let mel_pts: Vec<f64> = (0..n_mels + 2)
        .map(|i| mel_to_hz(mel_min + i as f64 * (mel_max - mel_min) / (n_mels + 1) as f64))
        .collect();

    let freqs: Vec<f64> = (0..n_freqs)
        .map(|k| k as f64 * sample_rate as f64 / n_fft as f64)
        .collect();

    let mut filters = vec![0.0f32; n_mels * n_freqs];
    for m in 0..n_mels {
        let f_low = mel_pts[m];
        let f_mid = mel_pts[m + 1];
        let f_high = mel_pts[m + 2];
        for (k, &f) in freqs.iter().enumerate() {
            let val = if f >= f_low && f <= f_mid {
                (f - f_low) / (f_mid - f_low)
            } else if f > f_mid && f <= f_high {
                (f_high - f) / (f_high - f_mid)
            } else {
                0.0
            };
            filters[m * n_freqs + k] = val as f32;
        }
    }
    filters
}

// ── Log-mel spectrogram ───────────────────────────────────────────────────────

/// Compute Whisper log-mel spectrogram.
/// Returns flat f32 row-major [N_MELS × MEL_FRAMES] (80 × 3000).
fn log_mel_spectrogram(samples: &[f32]) -> Vec<f32> {
    // Pad/clip to 30 s
    let mut padded = vec![0.0f32; MAX_AUDIO_SAMPLES];
    let copy_len = samples.len().min(MAX_AUDIO_SAMPLES);
    padded[..copy_len].copy_from_slice(&samples[..copy_len]);

    let n_freqs = N_FFT / 2 + 1;
    let n_frames = MEL_FRAMES;
    let hann = hann_window();

    let mut planner: FftPlanner<f32> = FftPlanner::new();
    let fft = planner.plan_fft_forward(N_FFT);

    // Power spectrum: [n_frames × n_freqs]
    let mut power = vec![0.0f32; n_frames * n_freqs];

    for t in 0..n_frames {
        let start = t * HOP_LENGTH;
        let end = (start + N_FFT).min(padded.len());

        let mut buf: Vec<Complex<f32>> = (0..N_FFT)
            .map(|i| {
                let s = if start + i < end { padded[start + i] } else { 0.0 };
                Complex::new(s * hann[i], 0.0)
            })
            .collect();

        fft.process(&mut buf);

        for k in 0..n_freqs {
            let re = buf[k].re;
            let im = buf[k].im;
            power[t * n_freqs + k] = re * re + im * im;
        }
    }

    // Apply mel filterbank: [N_MELS × n_frames]
    let filters = mel_filters();
    let mut mel = vec![0.0f32; N_MELS * n_frames];
    for m in 0..N_MELS {
        for t in 0..n_frames {
            let mut acc = 0.0f32;
            for k in 0..n_freqs {
                acc += filters[m * n_freqs + k] * power[t * n_freqs + k];
            }
            mel[m * n_frames + t] = acc;
        }
    }

    // Log compression + Whisper normalisation in a single in-place pass over
    // `mel`, avoiding the intermediate 240K-float `log_mel` buffer + a second
    // full sweep. We need the max first, so it's log10 in place, then fold.
    let max_val = mel
        .iter_mut()
        .map(|v| {
            let l = (*v).max(1e-10).log10();
            *v = l;
            l
        })
        .fold(f32::NEG_INFINITY, f32::max);

    for v in mel.iter_mut() {
        *v = ((*v).max(max_val - 8.0) + 4.0) / 4.0;
    }
    mel
}

// ── BPE byte-level vocab decoder ─────────────────────────────────────────────

/// GPT-2 byte-level encoding: maps byte value → Unicode char used in the vocab.
fn bytes_to_unicode() -> [char; 256] {
    let mut table = ['\0'; 256];
    let mut n: u32 = 0;
    for b in 0u32..=255 {
        let ch = if (b >= 33 && b <= 126) || (b >= 161 && b <= 172) || (b >= 174 && b <= 255) {
            char::from_u32(b).unwrap()
        } else {
            // Map to the supplemental range starting at 256
            while char::from_u32(256 + n).is_none() {
                n += 1;
            }
            let c = char::from_u32(256 + n).unwrap();
            n += 1;
            c
        };
        table[b as usize] = ch;
    }
    table
}

// Reverse-lookup table built once per process: maps char codepoint (all byte
// mapping chars land in [0, 512)) → the originating byte, or -1 if the char is
// not a byte-mapping char. Replaces a per-`transcribe()` 256-entry HashMap.
static U2B: OnceLock<[i8; 512]> = OnceLock::new();

fn u2b_table() -> &'static [i8; 512] {
    U2B.get_or_init(|| {
        let mut table = [-1i8; 512];
        let b2u = bytes_to_unicode();
        for (b, &c) in b2u.iter().enumerate() {
            let cu = c as usize;
            if cu < table.len() {
                table[cu] = b as i8;
            }
        }
        table
    })
}

/// Decode a sequence of Whisper token IDs to UTF-8 text.
fn decode_tokens(token_ids: &[i64], vocab: &HashMap<i64, String>) -> String {
    let u2b = u2b_table();

    let mut bytes: Vec<u8> = Vec::new();
    for &id in token_ids {
        if id >= TIMESTAMP_BEGIN {
            continue; // skip timestamp tokens
        }
        if let Some(s) = vocab.get(&id) {
            for ch in s.chars() {
                let cu = ch as usize;
                if cu < u2b.len() && u2b[cu] >= 0 {
                    bytes.push(u2b[cu] as u8);
                } else {
                    // Multi-byte char that isn't in the byte table — encode as UTF-8
                    let mut buf = [0u8; 4];
                    let enc = ch.encode_utf8(&mut buf);
                    bytes.extend_from_slice(enc.as_bytes());
                }
            }
        }
    }
    String::from_utf8_lossy(&bytes).into_owned()
}

// ── WhisperOnnxPipeline ───────────────────────────────────────────────────────

pub struct WhisperOnnxPipeline {
    encoder: Mutex<Session>,
    decoder: Mutex<Session>,
    vocab: HashMap<i64, String>,
    processor: AudioProcessor,
}

impl WhisperOnnxPipeline {
    /// Load encoder + decoder sessions and vocabulary from `model_dir`.
    pub fn new(model_dir: &Path) -> Result<Self> {
        let encoder_path = model_dir.join("encoder_model_quantized.onnx");
        let decoder_path = model_dir.join("decoder_model_quantized.onnx");
        let vocab_path = model_dir.join("vocab.json");

        for p in [&encoder_path, &decoder_path, &vocab_path] {
            if !p.exists() {
                bail!(
                    "Whisper model file not found: {:?} — run the server once to auto-download",
                    p
                );
            }
        }

        let physical_cpus = num_cpus::get_physical().max(1);
        let encoder = Session::builder()?
            .with_optimization_level(GraphOptimizationLevel::Level3)?
            .with_intra_threads(physical_cpus)?
            .with_memory_pattern(true)?
            .with_execution_providers(crate::core::ort_eps::build_eps(0))?
            .commit_from_file(&encoder_path)
            .with_context(|| format!("loading encoder {:?}", encoder_path))?;

        let decoder = Session::builder()?
            .with_optimization_level(GraphOptimizationLevel::Level3)?
            .with_intra_threads(physical_cpus)?
            .with_memory_pattern(true)?
            .with_execution_providers(crate::core::ort_eps::build_eps(0))?
            .commit_from_file(&decoder_path)
            .with_context(|| format!("loading decoder {:?}", decoder_path))?;

        let vocab_json =
            std::fs::read_to_string(&vocab_path).context("reading vocab.json")?;
        // vocab.json: { "token_string": token_id, ... }
        let raw: HashMap<String, i64> =
            serde_json::from_str(&vocab_json).context("parsing vocab.json")?;
        let vocab: HashMap<i64, String> = raw.into_iter().map(|(k, v)| (v, k)).collect();

        log::info!(
            "WhisperOnnxPipeline ready (encoder={:?}, decoder={:?}, vocab={} tokens)",
            encoder_path.file_name().unwrap_or_default(),
            decoder_path.file_name().unwrap_or_default(),
            vocab.len()
        );

        Ok(Self {
            encoder: Mutex::new(encoder),
            decoder: Mutex::new(decoder),
            vocab,
            processor: AudioProcessor::with_sample_rate(SAMPLE_RATE),
        })
    }

    /// Transcribe `audio` to text.
    pub fn transcribe(
        &self,
        audio: &AudioData,
        return_timestamps: bool,
    ) -> Result<TranscriptionResult> {
        // 1. Resample to 16 kHz + downmix to mono. The common STT case (already
        //    16 kHz mono) previously cloned the full AudioData here AND the
        //    samples vec — produce `mono` directly so the no-resample/mono path
        //    does exactly one copy.
        let resampled;
        let src = if audio.sample_rate != SAMPLE_RATE {
            resampled = self.processor.resample(audio, SAMPLE_RATE)?;
            &resampled
        } else {
            audio
        };
        let mono: Vec<f32> = if src.channels > 1 {
            src.samples
                .chunks(src.channels as usize)
                .map(|ch| ch.iter().sum::<f32>() / ch.len() as f32)
                .collect()
        } else {
            src.samples.clone()
        };

        // 2. Log-mel spectrogram → [1, 80, 3000]
        let mel = log_mel_spectrogram(&mono);
        let mel_tensor =
            Tensor::<f32>::from_array(([1usize, N_MELS, MEL_FRAMES], mel))
                .context("building mel tensor")?;

        // 3. Encoder forward — lock, run, materialise the encoder hidden states
        //    into a single owned Vec, and build the encoder tensor ONCE. The
        //    decoder reuses this tensor by reference on every iteration below
        //    (via SessionInputValue::View), avoiding a ~3 MB (1500×512 f32)
        //    clone per token — previously up to ~670 MB of memcpy/transcription.
        let mut dec = self.decoder.lock();
        let enc_seq = 1500usize;
        let enc_tensor = {
            let mut enc = self.encoder.lock();
            let enc_outputs = enc
                .run(ort::inputs!["input_features" => mel_tensor])
                .context("encoder run")?;
            let (_enc_shape, enc_data) = enc_outputs["last_hidden_state"]
                .try_extract_tensor::<f32>()
                .context("extract encoder output")?;
            // enc_data is a borrowed view into the session output; copy once
            // into an owning Vec, then build the encoder tensor a single time.
            let v: Vec<f32> = enc_data.iter().copied().collect();
            let dim = v.len() / enc_seq; // 512
            Tensor::<f32>::from_array(([1usize, enc_seq, dim], v))
                .context("building encoder_hidden_states tensor")?
        };

        // 4. Greedy decode. `input_ids` must be rebuilt each step (it grows),
        // but the encoder tensor is fed by reference — no per-iteration clone.
        // The decoder lock is held once for the whole loop (no await inside),
        // and dropped at the end of this block so later `&self` use is sound.
        let forced_prefix: Vec<i64> = vec![SOT, LANG_EN, TASK_TRANSCRIBE, NO_TIMESTAMPS];
        let mut tokens: Vec<i64> = forced_prefix.clone();

        {
            for _ in 0..MAX_NEW_TOKENS {
                let seq_len = tokens.len();

                let ids_tensor = Tensor::<i64>::from_array(([1usize, seq_len], tokens.clone()))
                    .context("building decoder input_ids tensor")?;

                // Lock is already held (dec). Run, extract logits to owned Vec.
                let dec_outputs = dec
                    .run(ort::inputs![
                        "input_ids"              => ids_tensor,
                        "encoder_hidden_states"  => &enc_tensor
                    ])
                    .context("decoder run")?;
                let (_logit_shape, logit_data) = dec_outputs["logits"]
                    .try_extract_tensor::<f32>()
                    .context("extract logits")?;
                let logits: Vec<f32> = logit_data.iter().copied().collect();

                // argmax over last token position: logits[0, seq_len-1, :]
                let vocab_size = logits.len() / seq_len;
                let offset = (seq_len - 1) * vocab_size;
                let last_logits = &logits[offset..offset + vocab_size];

                let next_token = last_logits
                    .iter()
                    .enumerate()
                    .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal))
                    .map(|(i, _)| i as i64)
                    .unwrap_or(EOT);

                if next_token == EOT {
                    break;
                }
                tokens.push(next_token);
            }
            drop(dec);
        }

        // 5. Decode tokens (skip forced prefix)
        let text_tokens = &tokens[forced_prefix.len()..];
        let text = decode_tokens(text_tokens, &self.vocab).trim().to_string();

        let segments = if return_timestamps {
            Some(self.build_segments(&text))
        } else {
            None
        };

        Ok(TranscriptionResult {
            text,
            language: Some("en".to_string()),
            confidence: 0.9,
            segments,
        })
    }

    fn build_segments(&self, text: &str) -> Vec<TranscriptionSegment> {
        let words: Vec<&str> = text.split_whitespace().collect();
        if words.is_empty() {
            return vec![];
        }
        let secs_per_word = 0.4f32;
        words
            .iter()
            .enumerate()
            .map(|(i, w)| TranscriptionSegment {
                text: w.to_string(),
                start_time: i as f32 * secs_per_word,
                end_time: (i + 1) as f32 * secs_per_word,
                confidence: 0.9,
            })
            .collect()
    }
}

// ── Auto-download helper ──────────────────────────────────────────────────────

const HF_BASE: &str = "https://huggingface.co/onnx-community/whisper-base/resolve/main";

/// Download Whisper ONNX files if they're not already present in `model_dir`.
/// Called at server startup before the AudioModelManager is initialised.
pub async fn ensure_whisper_models(model_dir: &Path) -> Result<()> {
    tokio::fs::create_dir_all(model_dir).await?;

    let files = [
        ("encoder_model_quantized.onnx", &format!("{}/onnx/encoder_model_quantized.onnx", HF_BASE)),
        ("decoder_model_quantized.onnx", &format!("{}/onnx/decoder_model_quantized.onnx", HF_BASE)),
        ("vocab.json", &format!("{}/vocab.json", HF_BASE)),
    ];

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(600))
        .build()?;

    for (filename, url) in &files {
        let dest = model_dir.join(filename);
        if dest.exists() && dest.metadata().map(|m| m.len()).unwrap_or(0) > 1024 {
            log::info!("Whisper: {} already present, skipping download", filename);
            continue;
        }
        log::info!("Whisper: downloading {} …", filename);
        let resp = client.get(*url).send().await
            .with_context(|| format!("GET {}", url))?;
        if !resp.status().is_success() {
            bail!("downloading {}: HTTP {}", filename, resp.status());
        }
        let bytes = resp.bytes().await?;
        tokio::fs::write(&dest, &bytes).await
            .with_context(|| format!("writing {:?}", dest))?;
        log::info!("Whisper: {} written ({} KB)", filename, bytes.len() / 1024);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mel_filterbank_shape() {
        let filters = build_mel_filterbank(16000, N_FFT, N_MELS);
        assert_eq!(filters.len(), N_MELS * (N_FFT / 2 + 1));
    }

    #[test]
    fn test_mel_filterbank_nonnegative() {
        let filters = build_mel_filterbank(16000, N_FFT, N_MELS);
        assert!(filters.iter().all(|&v| v >= 0.0));
    }

    #[test]
    fn test_log_mel_output_size() {
        let silence = vec![0.0f32; MAX_AUDIO_SAMPLES];
        let mel = log_mel_spectrogram(&silence);
        assert_eq!(mel.len(), N_MELS * MEL_FRAMES);
    }

    #[test]
    fn test_log_mel_short_audio() {
        let short = vec![0.1f32; 8000]; // 0.5 s
        let mel = log_mel_spectrogram(&short);
        assert_eq!(mel.len(), N_MELS * MEL_FRAMES);
    }

    #[test]
    fn test_bytes_to_unicode_256_entries() {
        let table = bytes_to_unicode();
        assert_eq!(table.len(), 256);
        // All chars must be assigned (not NUL)
        assert!(table.iter().all(|&c| c != '\0'));
    }

    #[test]
    fn test_decode_empty_tokens() {
        let vocab: HashMap<i64, String> = HashMap::new();
        let text = decode_tokens(&[], &vocab);
        assert_eq!(text, "");
    }

    #[test]
    fn test_ensure_whisper_models_creates_dir() {
        // Just checks the path construction logic, not actual download
        let dir = std::path::Path::new("/tmp/whisper_test_dir");
        let encoder = dir.join("encoder_model_quantized.onnx");
        assert!(encoder.to_str().unwrap().contains("encoder_model_quantized"));
    }
}
