//! SmolVLM's real chat template (from `tokenizer_config.json`) and the
//! image-token expansion Idefics3's real processor performs before
//! tokenization (`_prompt_single_image` in HF `transformers`'
//! `processing_idefics3.py`, for the non-tiled/single-image case this
//! service uses).

pub const IMAGE_TOKEN: &str = "<image>";
pub const FAKE_IMAGE_TOKEN: &str = "<fake_token_around_image>";
pub const GLOBAL_IMG_TOKEN: &str = "<global-img>";

/// Verified two independent ways: `vision_encoder_int8.onnx`'s
/// `image_features` output is `[N, 64, 576]`, and the documented formula
/// `(image_size/patch_size)² / scale_factor²` = `(512/16)² / 4²` = 64.
pub const IMAGE_SEQ_LEN: usize = 64;

/// `<fake_token_around_image><global-img>` + `<image>` * 64 + `<fake_token_around_image>` —
/// exactly what `_prompt_single_image` emits for one non-split image.
pub fn image_expansion_block() -> String {
    let mut s = String::with_capacity(
        FAKE_IMAGE_TOKEN.len() * 2 + GLOBAL_IMG_TOKEN.len() + IMAGE_TOKEN.len() * IMAGE_SEQ_LEN,
    );
    s.push_str(FAKE_IMAGE_TOKEN);
    s.push_str(GLOBAL_IMG_TOKEN);
    for _ in 0..IMAGE_SEQ_LEN {
        s.push_str(IMAGE_TOKEN);
    }
    s.push_str(FAKE_IMAGE_TOKEN);
    s
}

fn capitalize(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
    }
}

/// Build the full prompt from `tokenizer_config.json`'s chat_template:
/// `<|im_start|>{Role}: {content}<end_of_utterance>\n...Assistant:`.
/// Any image expansion block must already be spliced into the relevant
/// message's text by the caller (mirrors how `handler.rs` already prepends
/// the HRM caption-bridge text into the last user message — see
/// `smolvlm::SmolVlmEngine::chat`).
pub fn build_prompt(messages: &[(String, String)]) -> String {
    let mut out = String::from("<|im_start|>");
    for (role, content) in messages {
        out.push_str(&capitalize(role));
        out.push_str(": ");
        out.push_str(content);
        out.push_str("<end_of_utterance>\n");
    }
    out.push_str("Assistant:");
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn image_expansion_block_has_exactly_64_image_tokens() {
        let block = image_expansion_block();
        assert_eq!(block.matches(IMAGE_TOKEN).count(), IMAGE_SEQ_LEN);
    }

    #[test]
    fn image_expansion_block_wraps_with_fake_token_and_global_img() {
        let block = image_expansion_block();
        assert!(block.starts_with(&format!("{FAKE_IMAGE_TOKEN}{GLOBAL_IMG_TOKEN}")));
        assert!(block.ends_with(FAKE_IMAGE_TOKEN));
    }

    #[test]
    fn build_prompt_formats_single_turn() {
        let messages = vec![("user".to_string(), "hello".to_string())];
        let p = build_prompt(&messages);
        assert_eq!(p, "<|im_start|>User: hello<end_of_utterance>\nAssistant:");
    }

    #[test]
    fn build_prompt_formats_multi_turn() {
        let messages = vec![
            ("system".to_string(), "be terse".to_string()),
            ("user".to_string(), "hi".to_string()),
            ("assistant".to_string(), "hey".to_string()),
        ];
        let p = build_prompt(&messages);
        assert_eq!(
            p,
            "<|im_start|>System: be terse<end_of_utterance>\n\
             User: hi<end_of_utterance>\n\
             Assistant: hey<end_of_utterance>\n\
             Assistant:"
        );
    }

    #[test]
    fn build_prompt_embeds_image_expansion_block_verbatim() {
        let messages = vec![(
            "user".to_string(),
            format!("{}\nwhat is this?", image_expansion_block()),
        )];
        let p = build_prompt(&messages);
        assert!(p.contains(FAKE_IMAGE_TOKEN));
        assert!(p.contains("what is this?"));
        assert_eq!(p.matches(IMAGE_TOKEN).count(), IMAGE_SEQ_LEN);
    }
}
