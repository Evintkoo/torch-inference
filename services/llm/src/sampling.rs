//! Token sampling shared by every engine (`HrmEngine`, `SmolVlmEngine`).
//! Pure functions — no engine-specific state.

/// Sample one token from `logits` using top-k, top-p, temperature.
/// temperature <= 0 -> greedy argmax.
pub fn sample(logits: &[f32], temperature: f32, top_k: usize, top_p: f32) -> usize {
    if temperature <= 0.0 {
        return logits.iter().enumerate()
            .fold((0usize, f32::NEG_INFINITY), |acc, (i, &v)|
                if v > acc.1 { (i, v) } else { acc }).0;
    }
    let t = temperature.clamp(0.01, 2.0);

    // top-k
    let mut indexed: Vec<(usize, f32)> = logits.iter().enumerate().map(|(i, &v)| (i, v / t)).collect();
    indexed.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    indexed.truncate(top_k.max(1));

    // softmax
    let max = indexed[0].1;
    let mut probs: Vec<f32> = indexed.iter().map(|(_, l)| (l - max).exp()).collect();
    let sum: f32 = probs.iter().sum();
    for p in &mut probs { *p /= sum; }

    // top-p (nucleus): keep smallest prefix with cumulative prob >= top_p
    let mut cum = 0.0_f32;
    let mut keep = probs.len();
    for (i, &p) in probs.iter().enumerate() {
        cum += p;
        if cum >= top_p { keep = i + 1; break; }
    }
    probs.truncate(keep);
    let renorm: f32 = probs.iter().sum();
    for p in &mut probs { *p /= renorm; }

    // weighted choice
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let r: f32 = rng.gen();
    let mut acc = 0.0_f32;
    for (i, &p) in probs.iter().enumerate() {
        acc += p;
        if r <= acc { return indexed[i].0; }
    }
    indexed.last().unwrap().0
}

/// Penalize logits for tokens already present in `history` in place.
/// Standard CTRL/HF-style repetition penalty: divide positive logits,
/// multiply negative ones. See `HrmEngine`'s original doc-comment (moved
/// here) for why this exists — without it, small models can loop forever
/// without ever emitting EOS.
pub fn apply_repetition_penalty(logits: &mut [f32], history: &[i64], penalty: f32) {
    if penalty <= 1.0 {
        return;
    }
    for &id in history {
        if let Some(logit) = logits.get_mut(id as usize) {
            *logit = if *logit > 0.0 { *logit / penalty } else { *logit * penalty };
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greedy_sample_picks_argmax() {
        let logits = vec![0.1, 0.9, 0.05, 0.2];
        assert_eq!(sample(&logits, 0.0, 40, 0.95), 1);
    }

    #[test]
    fn repetition_penalty_reduces_positive_logit() {
        let mut logits = vec![1.0, 2.0, 3.0];
        apply_repetition_penalty(&mut logits, &[1], 2.0);
        assert_eq!(logits[1], 1.0); // 2.0 / 2.0
        assert_eq!(logits[0], 1.0); // untouched
    }

    #[test]
    fn repetition_penalty_noop_when_penalty_leq_one() {
        let mut logits = vec![1.0, 2.0, 3.0];
        apply_repetition_penalty(&mut logits, &[0, 1, 2], 1.0);
        assert_eq!(logits, vec![1.0, 2.0, 3.0]);
    }
}
