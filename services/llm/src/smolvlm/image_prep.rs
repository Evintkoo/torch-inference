//! Single-image preprocessing matching `Idefics3ImageProcessor` with
//! `do_image_splitting=false` (verified against `preprocessor_config.json`):
//! resize so the longest edge is 512px (preserving aspect ratio), pad to a
//! 512x512 square top-left-aligned, rescale [0,255]->[0,1] then normalize
//! with mean=std=0.5 per channel (-> [-1,1]). `pixel_attention_mask` marks
//! which pixels are real image content vs. padding.

use anyhow::{Context, Result};
use image::{imageops::FilterType, GenericImageView};

pub const CANVAS: u32 = 512;

pub struct PreppedImage {
    /// Row-major `[1, 1, 3, 512, 512]` f32, channel-first (CHW), values in
    /// `[-1, 1]`.
    pub pixel_values: Vec<f32>,
    /// Row-major `[1, 1, 512, 512]` bool — true where real (non-pad) pixels
    /// are.
    pub pixel_attention_mask: Vec<bool>,
}

pub fn preprocess(image_bytes: &[u8]) -> Result<PreppedImage> {
    let img = image::load_from_memory(image_bytes).context("decode image")?;
    let (orig_w, orig_h) = img.dimensions();
    if orig_w == 0 || orig_h == 0 {
        anyhow::bail!("image has zero width or height");
    }

    // Uniform scale so the longest edge lands exactly on CANVAS — this
    // preserves aspect ratio by construction (both dims scaled equally),
    // so resize_exact with these pre-computed dims does not distort.
    let longest = orig_w.max(orig_h) as f32;
    let scale = CANVAS as f32 / longest;
    let new_w = ((orig_w as f32) * scale).round().clamp(1.0, CANVAS as f32) as u32;
    let new_h = ((orig_h as f32) * scale).round().clamp(1.0, CANVAS as f32) as u32;
    let resized = img.resize_exact(new_w, new_h, FilterType::Lanczos3).to_rgb8();

    let plane = (CANVAS * CANVAS) as usize;
    let mut pixel_values = vec![0.0f32; 3 * plane];
    let mut pixel_attention_mask = vec![false; plane];

    let (rw, rh) = resized.dimensions();
    for y in 0..rh {
        for x in 0..rw {
            let p = resized.get_pixel(x, y);
            let idx = (y * CANVAS + x) as usize;
            for c in 0..3usize {
                let v = p.0[c] as f32 / 255.0;
                pixel_values[c * plane + idx] = (v - 0.5) / 0.5;
            }
            pixel_attention_mask[idx] = true;
        }
    }

    Ok(PreppedImage { pixel_values, pixel_attention_mask })
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{DynamicImage, ImageBuffer, Rgb};

    fn encode_solid_png(w: u32, h: u32, rgb: [u8; 3]) -> Vec<u8> {
        let img = DynamicImage::ImageRgb8(ImageBuffer::from_pixel(w, h, Rgb(rgb)));
        let mut buf = Vec::new();
        img.write_to(&mut std::io::Cursor::new(&mut buf), image::ImageFormat::Png).unwrap();
        buf
    }

    #[test]
    fn output_tensors_have_expected_lengths() {
        let bytes = encode_solid_png(100, 100, [255, 0, 0]);
        let prepped = preprocess(&bytes).unwrap();
        assert_eq!(prepped.pixel_values.len(), 3 * (CANVAS * CANVAS) as usize);
        assert_eq!(prepped.pixel_attention_mask.len(), (CANVAS * CANVAS) as usize);
    }

    #[test]
    fn square_image_fills_entire_canvas_mask() {
        let bytes = encode_solid_png(200, 200, [0, 255, 0]);
        let prepped = preprocess(&bytes).unwrap();
        assert!(prepped.pixel_attention_mask.iter().all(|&m| m), "square image should fill the whole canvas after resize");
    }

    #[test]
    fn narrow_image_leaves_padding_masked_false() {
        // A very wide image: resized width = CANVAS, resized height < CANVAS,
        // so the bottom rows must be masked false (padding).
        let bytes = encode_solid_png(400, 50, [0, 0, 255]);
        let prepped = preprocess(&bytes).unwrap();
        let plane = (CANVAS * CANVAS) as usize;
        assert_eq!(prepped.pixel_attention_mask.len(), plane);
        // Bottom-right corner pixel must be padding (false) for a wide image.
        let bottom_right = (CANVAS - 1) * CANVAS + (CANVAS - 1);
        assert!(!prepped.pixel_attention_mask[bottom_right as usize]);
        // Top-left corner must be real content (true).
        assert!(prepped.pixel_attention_mask[0]);
    }

    #[test]
    fn pixel_values_are_normalized_into_minus_one_to_one() {
        let bytes = encode_solid_png(200, 200, [255, 255, 255]); // white
        let prepped = preprocess(&bytes).unwrap();
        // white (255) -> 255/255=1.0 -> (1.0-0.5)/0.5 = 1.0
        assert!((prepped.pixel_values[0] - 1.0).abs() < 1e-4);
    }

    #[test]
    fn zero_dimension_image_bytes_error_cleanly() {
        // Not a decodable image at all -> decode error, not a panic.
        let err = preprocess(b"not an image").unwrap_err();
        assert!(err.to_string().contains("decode image"));
    }
}
