/// Shared Kokoro ONNX backend — loaded once, reused by all engines that lack
/// their own model weights (vits, bark, styletts2, xtts, kokoro-pth).
///
/// The singleton is initialised on first call and kept alive for the
/// lifetime of the process.  If the model files are missing the backend
/// resolves to `None` and the caller must handle the absence gracefully.
use std::sync::{Arc, OnceLock};

use crate::core::kokoro_onnx::KokoroOnnxEngine;

static SHARED_BACKEND: OnceLock<Option<Arc<KokoroOnnxEngine>>> = OnceLock::new();

/// Return the shared Kokoro ONNX engine, initialising it on first call.
///
/// Returns `None` if the model files are not present or could not be loaded.
pub fn get_kokoro_onnx_backend() -> Option<Arc<KokoroOnnxEngine>> {
    SHARED_BACKEND
        .get_or_init(|| {
            let cfg = serde_json::json!({
                "model_dir": "models/kokoro-82m",
                "sample_rate": 24000,
                // Single session for the shared backend; dedicated engines keep their own pool.
                "pool_size": 1
            });
            match KokoroOnnxEngine::new(&cfg) {
                Ok(engine) => {
                    log::info!("Shared Kokoro ONNX backend ready (models/kokoro-82m)");
                    Some(Arc::new(engine))
                }
                Err(e) => {
                    log::warn!("Shared Kokoro ONNX backend unavailable: {}", e);
                    None
                }
            }
        })
        .clone()
}

/// Map an arbitrary engine-specific voice name to a Kokoro voice id.
///
/// Falls back to `"af_bella"` for anything unrecognised. Only 8 voice packs
/// are actually loaded by `KokoroOnnxEngine` (`af_heart` and `bm_lewis` are
/// *not* among them — see the `default_voices` list in kokoro_onnx.rs), so
/// this must never map a request onto one of those two ids: doing so used
/// to make `xtts_v2_en_male`, `styletts2_expressive`, the "af" short id, and
/// any unrecognised voice silently resolve to the wrong (and wrong-gender,
/// for `xtts_v2_en_male`) fallback voice with no error or log anywhere in
/// the pipeline.
pub fn map_voice(engine_voice: Option<&str>) -> &'static str {
    match engine_voice {
        // Kokoro native ids pass straight through — except af_heart/bm_lewis,
        // which are real Kokoro voices this server never loads (see
        // LOADED_VOICES in the tests below); remap them to the closest
        // loaded pack of the same gender instead of letting them fall
        // through to the silent af_bella fallback in kokoro_onnx.rs.
        Some("af_heart") => "af_bella",
        Some("af_bella") => "af_bella",
        Some("af_sarah") => "af_sarah",
        Some("af_nicole") => "af_nicole",
        Some("am_adam") => "am_adam",
        Some("am_michael") => "am_michael",
        Some("bf_emma") => "bf_emma",
        Some("bf_isabella") => "bf_isabella",
        Some("bm_george") => "bm_george",
        Some("bm_lewis") => "bm_george",

        // Kokoro-pth short ids (af / am / bf)
        Some("af") => "af_bella",
        Some("am") => "am_adam",
        Some("bf") => "bf_emma",

        // VITS voices
        Some("vits_en_female") => "af_bella",
        Some("vits_en_male") => "am_adam",

        // StyleTTS2 voices
        Some("styletts2_expressive") => "af_bella",
        Some("styletts2_natural") => "bf_emma",

        // Bark voices
        Some("bark_v2_en_speaker_0") => "bm_george",
        Some("bark_v2_en_speaker_1") => "af_sarah",
        Some("bark_v2_en_speaker_6") => "am_michael",

        // XTTS voices
        Some("xtts_v2_en_female") => "af_nicole",
        Some("xtts_v2_en_male") => "bm_george",
        Some("xtts_v2_multilingual") => "bf_isabella",

        _ => "af_bella",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // The 8 voice packs KokoroOnnxEngine actually loads (see
    // `default_voices` in kokoro_onnx.rs — af_heart and bm_lewis are
    // deliberately excluded).
    const LOADED_VOICES: &[&str] = &[
        "af_bella",
        "af_sarah",
        "af_nicole",
        "am_adam",
        "am_michael",
        "bf_emma",
        "bf_isabella",
        "bm_george",
    ];

    #[test]
    fn map_voice_never_resolves_a_substituted_request_to_an_unloaded_pack() {
        // Requests that have no native/explicit id of their own must land on
        // a voice pack that is actually loaded — regression test for the
        // bug where xtts_v2_en_male / styletts2_expressive / the "af" short
        // id / any unrecognised voice silently resolved to af_heart or
        // bm_lewis, neither of which is ever loaded, and were then
        // silently swapped for af_bella deep in kokoro_onnx.rs with no
        // error or log.
        for voice in [
            "xtts_v2_en_male",
            "styletts2_expressive",
            "af",
            "totally-unrecognised-voice-id",
        ] {
            let mapped = map_voice(Some(voice));
            assert!(
                LOADED_VOICES.contains(&mapped),
                "map_voice({voice:?}) = {mapped:?}, which is not an actually-loaded voice pack"
            );
        }
        assert!(LOADED_VOICES.contains(&map_voice(None)));
    }

    #[test]
    fn map_voice_xtts_male_stays_male() {
        // The original bug also silently changed gender: a male-voice
        // request ended up resolving to af_bella (female).
        assert_eq!(map_voice(Some("xtts_v2_en_male")), "bm_george");
    }

    #[test]
    fn map_voice_never_resolves_a_native_unloaded_id_either() {
        // "af_heart" and "bm_lewis" are real Kokoro voice ids a client could
        // plausibly request directly (they're documented Kokoro voices, just
        // not among the 8 packs this server loads — see LOADED_VOICES above).
        // The previous fix only covered *substituted* requests (xtts_v2_en_male
        // etc.) reaching an unloaded pack; a direct native-id request for
        // "af_heart"/"bm_lewis" was left passing straight through, which then
        // silently falls back to af_bella deep in kokoro_onnx.rs with no
        // error or log — the same failure mode, reachable a different way.
        for voice in ["af_heart", "bm_lewis"] {
            let mapped = map_voice(Some(voice));
            assert!(
                LOADED_VOICES.contains(&mapped),
                "map_voice({voice:?}) = {mapped:?}, which is not an actually-loaded voice pack"
            );
        }
    }

    #[test]
    fn map_voice_bm_lewis_stays_male() {
        // bm_lewis (British Male) must not silently resolve to a female
        // voice — same gender-preservation requirement as xtts_v2_en_male.
        assert_eq!(map_voice(Some("bm_lewis")), "bm_george");
    }
}
